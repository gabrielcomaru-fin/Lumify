ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS whatsapp_phone text UNIQUE;
