
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
  _account_type text;
BEGIN
  -- Insert profile with phone
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');

  -- Determine role from metadata
  _account_type := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  
  IF _account_type = 'agent' THEN
    _role := 'agent';
  ELSIF _account_type = 'agency' THEN
    _role := 'agency';
  ELSE
    _role := 'user';
  END IF;

  -- Insert role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  -- Create agent profile if agent
  IF _role = 'agent' THEN
    INSERT INTO public.agent_profiles (user_id, license_number)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'license_number');
  END IF;

  -- Create agency if agency
  IF _role = 'agency' THEN
    INSERT INTO public.agencies (owner_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'agency_name', 'My Agency'));
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists (drop and recreate to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
