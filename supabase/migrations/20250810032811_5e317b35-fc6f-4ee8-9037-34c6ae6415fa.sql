-- Seed marketplace backlinks
-- Ensure table exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'backlinks'
  ) THEN
    RAISE EXCEPTION 'Table public.backlinks does not exist';
  END IF;
END $$;

-- Insert exemplo1.com.br if not present
INSERT INTO public.backlinks (
  site_url, site_name, dr, da, traffic, category, price_cents, is_active
)
SELECT
  'https://exemplo1.com.br', 'exemplo1.com.br', 50, 50, 1000000, 'Construção', 1000000, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.backlinks b
  WHERE b.site_url = 'https://exemplo1.com.br' OR b.site_name = 'exemplo1.com.br'
);

-- Insert exemplo2.com.br if not present
INSERT INTO public.backlinks (
  site_url, site_name, dr, da, traffic, category, price_cents, is_active
)
SELECT
  'https://exemplo2.com.br', 'exemplo2.com.br', 50, 50, 1000000, 'Saude', 1000000, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.backlinks b
  WHERE b.site_url = 'https://exemplo2.com.br' OR b.site_name = 'exemplo2.com.br'
);
