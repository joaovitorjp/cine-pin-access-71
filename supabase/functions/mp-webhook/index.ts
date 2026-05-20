import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const FIREBASE_DB = 'https://niloatacadista-54052-default-rtdb.firebaseio.com';

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    console.log('MP webhook received:', { query: Object.fromEntries(url.searchParams), body });

    // Mercado Pago sends: { action, type, data: { id } } or query ?type=payment&data.id=
    const paymentId =
      body?.data?.id ||
      url.searchParams.get('data.id') ||
      url.searchParams.get('id');
    const type = body?.type || url.searchParams.get('type') || body?.topic;

    if (!paymentId || (type && type !== 'payment')) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const MP_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!;
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_TOKEN}` },
    });
    const mpPayment = await mpRes.json();
    if (!mpRes.ok) throw new Error(`MP fetch failed: ${JSON.stringify(mpPayment)}`);

    const externalRef = mpPayment.external_reference;
    const status = mpPayment.status;
    if (!externalRef) {
      return new Response(JSON.stringify({ ok: true, no_ref: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: payment } = await supabase
      .from('payments').select('*').eq('id', externalRef).maybeSingle();

    if (!payment) {
      return new Response(JSON.stringify({ ok: true, not_found: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (payment.generated_pin) {
      return new Response(JSON.stringify({ ok: true, already_processed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updates: Record<string, unknown> = {
      mp_payment_id: String(paymentId),
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved') {
      // Generate PIN and write to Firebase
      const pin = generatePin();
      const days = payment.plan_days as number;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);

      const pinObj = {
        pin,
        expiryDate: expiry.toISOString(),
        createdAt: new Date().toISOString(),
        daysValid: days,
        isActive: true,
        clientName: `Cliente MP ${String(paymentId).slice(-6)}`,
        createdBy: 'mercado-pago',
      };

      const fbRes = await fetch(`${FIREBASE_DB}/pins.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pinObj),
      });
      if (!fbRes.ok) {
        const txt = await fbRes.text();
        throw new Error(`Firebase write failed: ${txt}`);
      }

      updates.generated_pin = pin;
    }

    await supabase.from('payments').update(updates).eq('id', externalRef);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('mp-webhook error:', e);
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
