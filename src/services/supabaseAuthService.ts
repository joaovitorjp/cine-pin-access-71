import { supabase } from "@/integrations/supabase/client";
import { getClientIdentifier } from "@/lib/security";

interface PinValidationResponse {
  success: boolean;
  pin_data?: {
    id: string;
    client_name: string;
    expiry_date: string;
    session_id: string;
  };
  error?: string;
  blocked_until?: string;
}

interface AdminAuthResponse {
  success: boolean;
  error?: string;
  remaining_time?: number;
}

interface SessionValidationResponse {
  success: boolean;
}

/**
 * Secure PIN validation using server-side Edge Function
 */
export const validatePinSecure = async (pinCode: string): Promise<PinValidationResponse> => {
  const clientId = getClientIdentifier();
  
  try {
    const { data, error } = await supabase.functions.invoke('secure-auth', {
      body: {
        pin_code: pinCode,
        client_identifier: clientId
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: 'Server error during validation' };
    }

    return data;
  } catch (error) {
    console.error('PIN validation error:', error);
    return { success: false, error: 'Failed to validate PIN' };
  }
};

/**
 * Secure admin authentication using server-side Edge Function
 */
export const validateAdminSecure = async (password: string): Promise<AdminAuthResponse> => {
  const clientId = getClientIdentifier();
  
  try {
    const { data, error } = await supabase.functions.invoke('secure-auth', {
      body: {
        password,
        client_identifier: clientId
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: 'Server error during authentication' };
    }

    return data;
  } catch (error) {
    console.error('Admin validation error:', error);
    return { success: false, error: 'Failed to authenticate admin' };
  }
};

/**
 * Secure session validation using server-side Edge Function
 */
export const validateSessionSecure = async (pinCode: string, sessionId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('secure-auth', {
      body: {
        pin_code: pinCode,
        session_id: sessionId
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return false;
    }

    return data?.success || false;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

/**
 * Create PIN using secure server-side Edge Function (admin only)
 */
export const createPinSecure = async (
  clientName: string, 
  daysValid: number, 
  customPin?: string
): Promise<{ success: boolean; pin_code?: string; error?: string }> => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.functions.invoke('admin-pin-management', {
      body: {
        client_name: clientName,
        days_valid: daysValid,
        pin_code: customPin,
        custom_pin: !!customPin
      },
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: 'Server error during PIN creation' };
    }

    return data;
  } catch (error) {
    console.error('PIN creation error:', error);
    return { success: false, error: 'Failed to create PIN' };
  }
};

/**
 * Get all PINs (admin only)
 */
export const getAllPinsSecure = async (): Promise<{ success: boolean; pins?: any[]; error?: string }> => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.functions.invoke('admin-pin-management', {
      body: {},
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: 'Server error during PIN fetch' };
    }

    return { success: true, pins: data.pins };
  } catch (error) {
    console.error('PIN fetch error:', error);
    return { success: false, error: 'Failed to fetch PINs' };
  }
};

/**
 * Deactivate PIN (admin only)
 */
export const deactivatePinSecure = async (pinId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.functions.invoke('admin-pin-management', {
      body: { pin_id: pinId },
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: 'Server error during PIN deactivation' };
    }

    return data;
  } catch (error) {
    console.error('PIN deactivation error:', error);
    return { success: false, error: 'Failed to deactivate PIN' };
  }
};