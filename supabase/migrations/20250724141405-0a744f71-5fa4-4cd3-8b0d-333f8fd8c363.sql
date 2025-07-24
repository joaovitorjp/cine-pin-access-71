-- Fix function search path security issues
-- Update existing functions with proper search_path settings

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix validate_pin_secure function with proper search path
CREATE OR REPLACE FUNCTION public.validate_pin_secure(
  p_pin_code TEXT,
  p_client_identifier TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pin_record public.pin_access%ROWTYPE;
  v_attempt_record public.auth_attempts%ROWTYPE;
  v_session_id TEXT;
BEGIN
  -- Check rate limiting
  SELECT * INTO v_attempt_record 
  FROM public.auth_attempts 
  WHERE client_identifier = p_client_identifier 
    AND attempt_type = 'pin';
    
  IF v_attempt_record.id IS NOT NULL THEN
    -- Check if still blocked
    IF v_attempt_record.blocked_until > NOW() THEN
      RETURN json_build_object(
        'success', FALSE,
        'error', 'rate_limited',
        'blocked_until', v_attempt_record.blocked_until
      );
    END IF;
    
    -- Reset if window expired (15 minutes)
    IF v_attempt_record.last_attempt < NOW() - INTERVAL '15 minutes' THEN
      UPDATE public.auth_attempts 
      SET attempt_count = 0, blocked_until = NULL
      WHERE id = v_attempt_record.id;
    END IF;
  END IF;
  
  -- Validate PIN
  SELECT * INTO v_pin_record 
  FROM public.pin_access 
  WHERE pin_code = UPPER(p_pin_code) 
    AND is_active = TRUE 
    AND expiry_date > NOW();
    
  IF v_pin_record.id IS NOT NULL THEN
    -- PIN is valid, generate session
    v_session_id := encode(gen_random_bytes(32), 'hex');
    
    -- Update PIN with session info
    UPDATE public.pin_access 
    SET session_id = v_session_id, last_login = NOW()
    WHERE id = v_pin_record.id;
    
    -- Reset rate limiting on success
    DELETE FROM public.auth_attempts 
    WHERE client_identifier = p_client_identifier AND attempt_type = 'pin';
    
    RETURN json_build_object(
      'success', TRUE,
      'pin_data', json_build_object(
        'id', v_pin_record.id,
        'client_name', v_pin_record.client_name,
        'expiry_date', v_pin_record.expiry_date,
        'session_id', v_session_id
      )
    );
  ELSE
    -- PIN invalid, record attempt
    INSERT INTO public.auth_attempts (client_identifier, attempt_type, attempt_count, last_attempt)
    VALUES (p_client_identifier, 'pin', 1, NOW())
    ON CONFLICT (client_identifier, attempt_type) 
    DO UPDATE SET 
      attempt_count = public.auth_attempts.attempt_count + 1,
      last_attempt = NOW(),
      blocked_until = CASE 
        WHEN public.auth_attempts.attempt_count >= 4 THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END;
      
    RETURN json_build_object(
      'success', FALSE,
      'error', 'invalid_pin'
    );
  END IF;
END;
$$;

-- Create additional security functions for PIN management
CREATE OR REPLACE FUNCTION public.create_pin_secure(
  p_pin_code TEXT,
  p_client_name TEXT,
  p_days_valid INTEGER,
  p_created_by UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_expiry_date TIMESTAMP WITH TIME ZONE;
  v_pin_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = p_created_by AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'unauthorized'
    );
  END IF;
  
  -- Validate PIN format
  IF NOT (p_pin_code ~ '^[A-Z0-9]{6,12}$') THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'invalid_format'
    );
  END IF;
  
  -- Check if PIN already exists
  IF EXISTS (
    SELECT 1 FROM public.pin_access 
    WHERE pin_code = UPPER(p_pin_code) AND is_active = TRUE
  ) THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'pin_exists'
    );
  END IF;
  
  -- Calculate expiry date
  v_expiry_date := NOW() + (p_days_valid || ' days')::INTERVAL;
  
  -- Insert new PIN
  INSERT INTO public.pin_access (
    pin_code, client_name, days_valid, expiry_date, created_by
  ) VALUES (
    UPPER(p_pin_code), p_client_name, p_days_valid, v_expiry_date, p_created_by
  ) RETURNING id INTO v_pin_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'pin_id', v_pin_id,
    'expiry_date', v_expiry_date
  );
END;
$$;

-- Create function to validate session
CREATE OR REPLACE FUNCTION public.validate_session_secure(
  p_pin_code TEXT,
  p_session_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pin_access 
    WHERE pin_code = UPPER(p_pin_code) 
      AND session_id = p_session_id
      AND is_active = TRUE 
      AND expiry_date > NOW()
  );
END;
$$;