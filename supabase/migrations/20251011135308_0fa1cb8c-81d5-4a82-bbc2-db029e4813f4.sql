-- Tornar o usuário atual (wellyntonjeronimo@outlook.com) admin
-- User ID: e1d9a5df-69ea-48eb-ad93-1ef3c2093b80

INSERT INTO public.user_roles (user_id, role)
VALUES ('e1d9a5df-69ea-48eb-ad93-1ef3c2093b80', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Garantir que o usuário root admin também tenha a role
-- User ID: 3ab174e2-9cc6-4595-8d67-8f2aafb0a065

INSERT INTO public.user_roles (user_id, role)
VALUES ('3ab174e2-9cc6-4595-8d67-8f2aafb0a065', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;