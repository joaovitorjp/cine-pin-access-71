import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const PLANS: Record<string, { days: number; amount: number; title: string }> = {
  '7': { days: 7, amount: 5.99, title: 'CINE FLEX - Token 7 dias' },
  '15': { days: 15, amount: 11.99, title: 'CINE FLEX - Token 15 dias' },
  '30': { days: 30, amount: 21.99, title: 'CINE FLEX - Token 30 dias' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { plan, origin } = await req.json();
    const planInfo = PLANS[String(plan)];
    if (!planInfo) {
      return new Response(JSON.stringify({ error: 'Plano inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const MP_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!MP_TOKEN) throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({ plan_days: planInfo.days, amount: planInfo.amount, status: 'pending' })
      .select()
      .single();
    if (error) throw error;

    const baseOrigin = origin || req.headers.get('origin') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

    const prefBody = {
      items: [{
        title: planInfo.title,
        quantity: 1,
        unit_price: planInfo.amount,
        currency_id: 'BRL',
      }],
      external_reference: payment.id,
      notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
      back_urls: {
        success: `${baseOrigin}/?payment_id=${payment.id}`,
        failure: `${baseOrigin}/?payment_id=${payment.id}`,
        pending: `${baseOrigin}/?payment_id=${payment.id}`,
      },
      auto_return: 'approved',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prefBody),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      console.error('MP error:', mpData);
      throw new Error(`Mercado Pago: ${JSON.stringify(mpData)}`);
    }

    await supabase.from('payments').update({ mp_preference_id: mpData.id }).eq('id', payment.id);

    return new Response(JSON.stringify({
      payment_id: payment.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('create-mp-payment error:', e);
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
