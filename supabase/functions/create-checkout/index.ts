import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

// Map fixed packs: priceId -> coin amount
const PACK_COINS: Record<string, number> = {
  coins_pack_5: 5,
  coins_pack_10: 10,
  coins_pack_25: 25,
  coins_pack_50: 50,
  coins_pack_100: 100,
};

interface Body {
  mode: "pack" | "custom";
  priceId?: string;
  coins?: number; // for custom
  returnUrl: string;
  environment: StripeEnv;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const body: Body = await req.json();
    if (!body.returnUrl || !body.environment) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient(body.environment);

    let lineItem: any;
    let coins: number;
    let description: string;

    if (body.mode === "pack") {
      if (!body.priceId || !/^[a-zA-Z0-9_-]+$/.test(body.priceId) || !(body.priceId in PACK_COINS)) {
        return new Response(JSON.stringify({ error: "Invalid priceId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const prices = await stripe.prices.list({ lookup_keys: [body.priceId] });
      if (!prices.data.length) {
        return new Response(JSON.stringify({ error: "Price not found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      lineItem = { price: prices.data[0].id, quantity: 1 };
      coins = PACK_COINS[body.priceId];
      description = `${coins} Moedas CINE FLEX`;
    } else if (body.mode === "custom") {
      const n = Math.floor(Number(body.coins) || 0);
      if (n < 1 || n > 1000) {
        return new Response(JSON.stringify({ error: "Quantidade entre 1 e 1000" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      coins = n;
      description = `${coins} Moedas CINE FLEX`;
      lineItem = {
        price_data: {
          currency: "brl",
          product_data: { name: description },
          unit_amount: 100, // R$ 1,00 per coin
        },
        quantity: coins,
      };
    } else {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [lineItem],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: body.returnUrl,
      customer_email: user.email ?? undefined,
      payment_intent_data: { description },
      metadata: {
        userId: user.id,
        coins: String(coins),
      },
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("create-checkout error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
