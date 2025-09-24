-- Create enum types
CREATE TYPE public.pizza_size AS ENUM ('broto', 'media', 'big', 'gigante');
CREATE TYPE public.product_category AS ENUM ('pizza', 'bebida', 'combo', 'entrada');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pizza sizes table
CREATE TABLE public.pizza_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  size_enum pizza_size NOT NULL UNIQUE,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_flavors INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flavors table
CREATE TABLE public.flavors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  additional_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table (beverages, combos, etc)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category product_category NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  pizza_size_id UUID REFERENCES public.pizza_sizes(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order item flavors junction table
CREATE TABLE public.order_item_flavors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  flavor_id UUID NOT NULL REFERENCES public.flavors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_item_id, flavor_id)
);

-- Create delivery zones table for CEP validation
CREATE TABLE public.delivery_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  postal_code_prefix TEXT NOT NULL,
  area_name TEXT NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_time_minutes INTEGER NOT NULL DEFAULT 45,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for public read access (menu items)
CREATE POLICY "Anyone can view pizza sizes" ON public.pizza_sizes FOR SELECT USING (true);
CREATE POLICY "Anyone can view flavors" ON public.flavors FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can view delivery zones" ON public.delivery_zones FOR SELECT USING (true);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can view their own order item flavors" ON public.order_item_flavors FOR SELECT USING (EXISTS (SELECT 1 FROM public.order_items JOIN public.orders ON orders.id = order_items.order_id WHERE order_items.id = order_item_flavors.order_item_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create their own order item flavors" ON public.order_item_flavors FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.order_items JOIN public.orders ON orders.id = order_items.order_id WHERE order_items.id = order_item_flavors.order_item_id AND orders.user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pizza_sizes_updated_at BEFORE UPDATE ON public.pizza_sizes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flavors_updated_at BEFORE UPDATE ON public.flavors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON public.delivery_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default pizza sizes
INSERT INTO public.pizza_sizes (name, size_enum, base_price, max_flavors) VALUES
('Broto', 'broto', 25.00, 2),
('Média', 'media', 35.00, 2),
('Big', 'big', 45.00, 3),
('Gigante', 'gigante', 55.00, 4);

-- Insert sample flavors
INSERT INTO public.flavors (name, description, additional_price) VALUES
('Margherita', 'Molho de tomate, mussarela, manjericão', 0.00),
('Pepperoni', 'Molho de tomate, mussarela, pepperoni', 2.00),
('Portuguesa', 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitona', 3.00),
('Calabresa', 'Molho de tomate, mussarela, calabresa, cebola', 1.00),
('Frango com Catupiry', 'Molho de tomate, mussarela, frango, catupiry', 4.00),
('Quatro Queijos', 'Molho de tomate, mussarela, gorgonzola, parmesão, catupiry', 5.00),
('Chocolate', 'Chocolate ao leite', 3.00),
('Brigadeiro', 'Chocolate, granulado', 4.00);

-- Insert sample beverages
INSERT INTO public.products (name, description, price, category) VALUES
('Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 15.00, 'bebida'),
('Coca-Cola Lata', 'Refrigerante Coca-Cola 350ml', 6.00, 'bebida'),
('Guaraná Antarctica 2L', 'Refrigerante Guaraná Antarctica 2 litros', 14.00, 'bebida'),
('Fanta Laranja 2L', 'Refrigerante Fanta Laranja 2 litros', 14.00, 'bebida'),
('Água Mineral', 'Água mineral 500ml', 4.00, 'bebida');

-- Insert sample delivery zones
INSERT INTO public.delivery_zones (postal_code_prefix, area_name, delivery_fee, delivery_time_minutes) VALUES
('83', 'Almirante Tamandaré - Centro', 5.00, 30),
('832', 'Almirante Tamandaré - Região Norte', 8.00, 35),
('833', 'Almirante Tamandaré - Região Sul', 10.00, 40),
('834', 'Almirante Tamandaré - Região Leste', 12.00, 45),
('835', 'Almirante Tamandaré - Região Oeste', 15.00, 50);