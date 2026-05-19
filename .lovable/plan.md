## Parte 1 — Auditoria de segurança (CINE FLEX)

Arquitetura atual: SPA React (Vite) hospedada na Lovable. Backend híbrido: Firebase (filmes, séries, TV ao vivo, PINs de cliente) + Lovable Cloud/Supabase (validação do token admin via RPC `validate_admin_token`). Não existe servidor próprio nem edge functions custom — portanto categorias inteiras de risco (SSRF, SQLi via app, upload de arquivos, versionamento de API, ambientes de teste) **não se aplicam diretamente** ao seu código.

### Achados por categoria

**Riscos REAIS (precisam de ação)**

1. **Broken Access Control / autenticação fraca no Firebase Realtime Database e Firestore**
   - `src/lib/firebase.ts` aponta para um RTDB público. Toda a regra de quem pode ler/escrever filmes, séries, TV, PINs e sessões está nas *Firebase Security Rules*, não no app. Se as regras estiverem `".read": true, ".write": true`, qualquer pessoa com o `databaseURL` (que está no bundle JS, é público por natureza no Firebase Web) pode listar/alterar/excluir tudo, inclusive PINs.
   - **Ação recomendada (manual no Firebase Console):** bloquear escrita pública e exigir autenticação admin server-side (ou migrar PINs/conteúdo para o Lovable Cloud com RLS).

2. **Admin "logado" apenas no localStorage** (`AuthContext.tsx`)
   - O estado `isAdmin: true` é gravado em `localStorage.authState`. Qualquer pessoa pode abrir DevTools e setar manualmente; o app trata como admin. As checagens no `AdminPage.tsx` (`if (!isLoggedIn || !isAdmin) navigate("/")`) são puramente client-side.
   - O token admin protege apenas a UI; as operações de escrita reais (criar/excluir filme, PIN etc.) acontecem direto contra o Firebase do navegador. Sem Firebase Rules adequadas, falsificar `isAdmin` permite executar todas as ações administrativas.
   - **Ação:** mover as operações sensíveis para o Lovable Cloud (RLS + função `has_role` server-side), ou exigir Firebase Auth com custom claims antes de qualquer escrita.

3. **Token admin armazenado em texto plano**
   - Tabela `admin_tokens` guarda `36040102` em claro. Como a RPC é `SECURITY DEFINER` e a tabela tem RLS sem políticas (ninguém lê direto), o risco é apenas no backup/cópia. Aceitável, mas ideal é guardar hash (ex.: `crypt(token, gen_salt('bf'))`) e comparar via `pgcrypto`.

4. **Sem rate-limit / proteção contra brute force**
   - RPC `validate_admin_token` aceita tentativas ilimitadas. Token de 8 dígitos numéricos ≈ 100 milhões de combinações — força bruta viável a milhares de tentativas/segundo.
   - **Ação:** adicionar tabela `admin_login_attempts` (IP/ua + timestamp) e bloquear no RPC após N falhas, **ou** trocar para token de 32+ caracteres aleatórios.

5. **Enumeração de PIN de cliente**
   - `validatePin` no Firebase responde rápido para PINs válidos vs inválidos. PIN curto + sem rate-limit = enumerável.
   - **Ação:** introduzir delay/backoff e logging server-side; preferencialmente migrar para Cloud com RPC similar ao admin.

6. **Single-device check via polling de 30s**
   - Janela de 30s permite dois dispositivos simultâneos. Aceitável para o uso atual, mas documente o limite.

7. **Headers HTTP / CSP**
   - Lovable hosting não permite configurar headers customizados (sem `_headers`/`netlify.toml`). Sem CSP, X-Frame-Options, etc. Pouco crítico para SPA estática, mas considere adicionar `<meta http-equiv>` mínimos no `index.html` (CSP, referrer).

8. **XSS via conteúdo do admin**
   - Descrições de filme/série são renderizadas como texto JSX (escape automático), mas iframes do player recebem `src={videoUrl}` direto do Firebase. Um admin malicioso (ou DB comprometido) pode injetar `javascript:` URL.
   - **Ação:** validar que `videoUrl` começa com `https://` em `VideoPlayer.tsx`.

9. **Logs com dados sensíveis**
   - `console.error` espalhados imprimem objetos de erro; verifique que não inclui PIN/token.

**Riscos NÃO aplicáveis ou já mitigados**
- SQL Injection: não há SQL escrito pelo cliente; RPCs são parametrizadas.
- SSRF/upload: não há endpoint próprio que aceite URLs/arquivos.
- CSRF: Supabase usa Bearer JWT no header (não cookie), imune a CSRF clássico. Firebase Web SDK idem.
- CORS: configurado pelo Supabase/Firebase, não pelo seu código.
- `.env`: contém apenas keys públicas (`VITE_SUPABASE_PUBLISHABLE_KEY`, URL, project ID) — corretas de expor.
- Rotas de documentação/admin "ocultas" da API: não há API própria; só RPCs nomeadas no Supabase.
- Dependências: rodarei `dependency_scan` para checar vulnerabilidades conhecidas.

### Plano de ação prioritário (ordem)
A. Revisar Firebase Rules (você precisa fazer no console — eu não tenho acesso).
B. Validar `videoUrl` no `VideoPlayer.tsx` (https only).
C. Hash do token admin + rate-limit por IP no Lovable Cloud (próxima iteração, requer migração).
D. Migração futura PINs → Lovable Cloud com RLS (grande refactor, fora deste escopo).

---

## Parte 2 — Separar painéis (admin via link secreto)

### Comportamento desejado
- Remover totalmente o **ícone de cadeado** do footer (`Layout.tsx`) e o `AdminModal` desse fluxo.
- O painel admin permanece em `/admin` com **toda a UI atual intacta**, mas só é acessível abrindo um **link específico que já contém o token** como query string (ex.: `https://seu-app/admin-access?k=36040102`).
- Sem esse link, **nenhum botão, link, modal ou rota** revela a existência do admin para usuários comuns.
- O painel do usuário (PIN) continua igual, sem qualquer referência visual ao admin.

### Implementação

1. **Nova rota oculta `/admin-access`** (`src/pages/AdminAccess.tsx`)
   - Lê `?k=<token>` da URL.
   - Chama `loginAsAdmin(token)` automaticamente.
   - Sucesso → `navigate("/admin", { replace: true })` e limpa o token da URL.
   - Falha → `navigate("/", { replace: true })` silenciosamente (não revela existência).
   - Sem token na URL → redireciona para `/`.

2. **`Layout.tsx`**
   - Remover o `<Button>` com `<Lock />` e a importação de `Lock` e `AdminModal`.
   - Remover `showAdminModal`, `setShowAdminModal`, `handleSuccessfulAdminLogin`.
   - Manter o link "Admin" no header **apenas se `isAdmin === true`** (já é o caso) — fica invisível para usuário comum.

3. **`App.tsx`**
   - Adicionar `<Route path="/admin-access" element={<AdminAccess />} />`.

4. **`AdminModal.tsx`** — deixado no codebase mas não importado em lugar nenhum (sem referências). Pode ser deletado se preferir; vou deletar para reduzir superfície.

5. **Link admin final**
   - `https://cine-pin-access-71.lovable.app/admin-access?k=36040102`
   - Você compartilha apenas com quem precisa. Trocar token = update na tabela `admin_tokens` no Cloud.

### Observação importante
Esse esquema é **"segurança por obscuridade" no frontend** — o token na URL pode vazar via histórico/referrer. A proteção real continua sendo o RPC `validate_admin_token`. Recomendo combinar com o item C (hash + rate-limit) numa próxima rodada.

---

## Detalhes técnicos (arquivos tocados)

```
+ src/pages/AdminAccess.tsx        (novo)
~ src/App.tsx                      (rota nova)
~ src/components/Layout.tsx        (remove cadeado + modal)
~ src/components/VideoPlayer.tsx   (valida URL https)
- src/components/AdminModal.tsx    (deletado)
```

Nenhuma migração de banco nesta etapa. Auditoria completa será entregue como resumo após implementação.
