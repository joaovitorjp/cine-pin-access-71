-- Create authentication and PIN management tables in Supabase
-- This will replace the client-side Firebase authentication with secure server-side management

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create PIN management table
CREATE TABLE public.pin_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_code TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  days_valid INTEGER NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  session_id TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Add constraint to ensure PIN format
  CONSTRAINT valid_pin_format CHECK (pin_code ~ '^[A-Z0-9]{6,12}$')
);

-- Create authentication attempts table for rate limiting
CREATE TABLE public.auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_identifier TEXT NOT NULL,
  attempt_type TEXT NOT NULL, -- 'pin' or 'admin'
  attempt_count INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(client_identifier, attempt_type)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for PIN access
CREATE POLICY "Only admins can manage PINs"
  ON public.pin_access FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "PIN validation is public for active PINs"
  ON public.pin_access FOR SELECT
  USING (is_active = TRUE);

-- RLS Policies for auth attempts (only system can manage)
CREATE POLICY "Only system can manage auth attempts"
  ON public.auth_attempts FOR ALL
  USING (FALSE); -- Only accessible via security definer functions

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for secure PIN validation with rate limiting
CREATE OR REPLACE FUNCTION public.validate_pin_secure(
  p_pin_code TEXT,
  p_client_identifier TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pin_record public.pin_access%ROWTYPE;
  v_attempt_record public.auth_attempts%ROWTYPE;
  v_session_id TEXT;
  v_result JSON;
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
      attempt_count = auth_attempts.attempt_count + 1,
      last_attempt = NOW(),
      blocked_until = CASE 
        WHEN auth_attempts.attempt_count >= 4 THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END;
      
    RETURN json_build_object(
      'success', FALSE,
      'error', 'invalid_pin'
    );
  END IF;
END;
$$;