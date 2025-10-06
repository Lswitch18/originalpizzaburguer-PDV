-- Criar função para tornar o primeiro usuário admin automaticamente
CREATE OR REPLACE FUNCTION public.auto_assign_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Contar quantos admins já existem
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  -- Se não houver nenhum admin, tornar este usuário admin
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após inserção na tabela profiles
DROP TRIGGER IF EXISTS auto_assign_first_admin_trigger ON public.profiles;
CREATE TRIGGER auto_assign_first_admin_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_first_admin();