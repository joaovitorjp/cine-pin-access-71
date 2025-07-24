import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PinValidationRequest {
  pin_code: string;
  client_identifier: string;
}

interface AdminAuthRequest {
  password: string;
  client_identifier: string;
}

interface SessionValidationRequest {
  pin_code: string;
  session_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'validate-pin') {
      const { pin_code, client_identifier }: PinValidationRequest = await req.json();

      if (!pin_code || !client_identifier) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Call the secure database function
      const { data, error } = await supabase.rpc('validate_pin_secure', {
        p_pin_code: pin_code,
        p_client_identifier: client_identifier
      });

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Internal server error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'validate-admin') {
      const { password, client_identifier }: AdminAuthRequest = await req.json();

      if (!password || !client_identifier) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get admin password from environment variable
      const adminPassword = Deno.env.get('ADMIN_PASSWORD');
      if (!adminPassword) {
        console.error('Admin password not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Server configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check rate limiting for admin attempts
      const { data: attemptData } = await supabase
        .from('auth_attempts')
        .select('*')
        .eq('client_identifier', client_identifier)
        .eq('attempt_type', 'admin')
        .single();

      if (attemptData?.blocked_until && new Date(attemptData.blocked_until) > new Date()) {
        const remainingTime = Math.ceil((new Date(attemptData.blocked_until).getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'rate_limited',
            remaining_time: remainingTime
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate password
      if (password === adminPassword) {
        // Reset rate limiting on success
        await supabase
          .from('auth_attempts')
          .delete()
          .eq('client_identifier', client_identifier)
          .eq('attempt_type', 'admin');

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Record failed attempt
        await supabase
          .from('auth_attempts')
          .upsert({
            client_identifier,
            attempt_type: 'admin',
            attempt_count: (attemptData?.attempt_count || 0) + 1,
            last_attempt: new Date().toISOString(),
            blocked_until: (attemptData?.attempt_count || 0) >= 2 
              ? new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes
              : null
          }, {
            onConflict: 'client_identifier,attempt_type'
          });

        return new Response(
          JSON.stringify({ success: false, error: 'invalid_password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'validate-session') {
      const { pin_code, session_id }: SessionValidationRequest = await req.json();

      if (!pin_code || !session_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Call the secure database function
      const { data, error } = await supabase.rpc('validate_session_secure', {
        p_pin_code: pin_code,
        p_session_id: session_id
      });

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ success: false }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});