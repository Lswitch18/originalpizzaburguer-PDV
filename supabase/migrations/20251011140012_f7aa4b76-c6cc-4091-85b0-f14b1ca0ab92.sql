-- Atualizar o enum order_status para incluir todos os status do fluxo
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'preparing';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';

-- Adicionar categoria 'pastel' ao enum product_category se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'product_category' AND e.enumlabel = 'pastel') THEN
    ALTER TYPE product_category ADD VALUE 'pastel';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'product_category' AND e.enumlabel = 'porcao') THEN
    ALTER TYPE product_category ADD VALUE 'porcao';
  END IF;
END $$;