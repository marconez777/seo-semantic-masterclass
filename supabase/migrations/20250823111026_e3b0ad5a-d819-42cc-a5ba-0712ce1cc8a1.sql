-- ============================================================================
-- CHECKOUT LEGACY BACKUP & QUARANTINE MIGRATION
-- Date: 2025-01-23
-- Purpose: Complete backup and quarantine of legacy checkout system
-- ============================================================================

-- 1. Create migration log table to track all actions
CREATE TABLE IF NOT EXISTS public.checkout_migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  artifact_type TEXT NOT NULL, -- 'table', 'function', 'policy', 'trigger', 'edge_function'
  artifact_name TEXT NOT NULL,
  original_name TEXT,
  backup_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Log the start of migration
INSERT INTO public.checkout_migration_log (action_type, artifact_type, artifact_name, details) 
VALUES ('migration_start', 'system', 'checkout_legacy_quarantine', jsonb_build_object('migration_id', gen_random_uuid()));

-- 2. Export data from legacy tables before quarantine
-- First, let's check what legacy checkout tables exist
DO $$
DECLARE
    table_record RECORD;
    backup_query TEXT;
BEGIN
    -- Log existing tables that will be quarantined
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name ~ '(pedidos|order_items)(?!.*_legacy)' 
    LOOP
        INSERT INTO public.checkout_migration_log 
        (action_type, artifact_type, artifact_name, original_name, backup_name, status) 
        VALUES (
            'table_backup', 
            'table', 
            table_record.table_name,
            table_record.table_name,
            table_record.table_name || '_legacy',
            'pending'
        );
    END LOOP;
END $$;

-- 3. Rename legacy tables to *_legacy format
-- Pedidos table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedidos') THEN
        -- First, drop all dependent objects
        DROP POLICY IF EXISTS "Users can select own pedidos" ON public.pedidos;
        DROP POLICY IF EXISTS "Users can insert own pedidos" ON public.pedidos;
        DROP POLICY IF EXISTS "Users can update own pedidos" ON public.pedidos;
        DROP POLICY IF EXISTS "Users can delete own pedidos" ON public.pedidos;
        DROP POLICY IF EXISTS "Admins can manage all pedidos" ON public.pedidos;
        
        -- Drop triggers
        DROP TRIGGER IF EXISTS update_pedidos_updated_at ON public.pedidos;
        DROP TRIGGER IF EXISTS set_paid_timestamps_trigger ON public.pedidos;
        
        -- Disable RLS
        ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
        
        -- Rename table
        ALTER TABLE public.pedidos RENAME TO pedidos_legacy;
        
        -- Update log
        UPDATE public.checkout_migration_log 
        SET status = 'completed', completed_at = now()
        WHERE artifact_name = 'pedidos' AND action_type = 'table_backup';
        
        RAISE NOTICE 'Table pedidos renamed to pedidos_legacy';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        UPDATE public.checkout_migration_log 
        SET status = 'failed', details = jsonb_build_object('error', SQLERRM)
        WHERE artifact_name = 'pedidos' AND action_type = 'table_backup';
        RAISE NOTICE 'Failed to rename pedidos: %', SQLERRM;
END $$;

-- Order items table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        -- Drop all dependent objects
        DROP POLICY IF EXISTS "Users can select own order_items" ON public.order_items;
        DROP POLICY IF EXISTS "Users can insert own order_items" ON public.order_items;
        DROP POLICY IF EXISTS "Users can update own order_items" ON public.order_items;
        DROP POLICY IF EXISTS "Users can delete own order_items" ON public.order_items;
        
        -- Drop triggers
        DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;
        
        -- Disable RLS
        ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
        
        -- Rename table
        ALTER TABLE public.order_items RENAME TO order_items_legacy;
        
        -- Update log
        UPDATE public.checkout_migration_log 
        SET status = 'completed', completed_at = now()
        WHERE artifact_name = 'order_items' AND action_type = 'table_backup';
        
        RAISE NOTICE 'Table order_items renamed to order_items_legacy';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        UPDATE public.checkout_migration_log 
        SET status = 'failed', details = jsonb_build_object('error', SQLERRM)
        WHERE artifact_name = 'order_items' AND action_type = 'table_backup';
        RAISE NOTICE 'Failed to rename order_items: %', SQLERRM;
END $$;

-- PII tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedidos_pii') THEN
        -- Drop policies and triggers
        DROP POLICY IF EXISTS "Admins manage pedidos_pii" ON public.pedidos_pii;
        DROP POLICY IF EXISTS "Users can select own pedidos_pii" ON public.pedidos_pii;
        DROP POLICY IF EXISTS "Users can insert own pedidos_pii" ON public.pedidos_pii;
        DROP POLICY IF EXISTS "Users can update own pedidos_pii" ON public.pedidos_pii;
        DROP TRIGGER IF EXISTS trg_pedidos_pii_updated_at ON public.pedidos_pii;
        DROP TRIGGER IF EXISTS trg_pedidos_pii_masked_iu ON public.pedidos_pii;
        
        ALTER TABLE public.pedidos_pii DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.pedidos_pii RENAME TO pedidos_pii_legacy;
        
        INSERT INTO public.checkout_migration_log 
        (action_type, artifact_type, artifact_name, original_name, backup_name, status, completed_at) 
        VALUES ('table_backup', 'table', 'pedidos_pii', 'pedidos_pii', 'pedidos_pii_legacy', 'completed', now());
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedidos_pii_masked') THEN
        DROP POLICY IF EXISTS "Admins can view masked PII" ON public.pedidos_pii_masked;
        DROP TRIGGER IF EXISTS trg_pedidos_pii_masked_del ON public.pedidos_pii_masked;
        
        ALTER TABLE public.pedidos_pii_masked DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.pedidos_pii_masked RENAME TO pedidos_pii_masked_legacy;
        
        INSERT INTO public.checkout_migration_log 
        (action_type, artifact_type, artifact_name, original_name, backup_name, status, completed_at) 
        VALUES ('table_backup', 'table', 'pedidos_pii_masked', 'pedidos_pii_masked', 'pedidos_pii_masked_legacy', 'completed', now());
    END IF;
END $$;

-- 4. Drop checkout-related database functions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Log and drop PII encryption functions
    FOR func_record IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name ~ '(pii|pedidos|checkout|payment|order)' 
    LOOP
        INSERT INTO public.checkout_migration_log 
        (action_type, artifact_type, artifact_name, status) 
        VALUES ('function_removal', 'database_function', func_record.routine_name, 'pending');
        
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS public.%I CASCADE', func_record.routine_name);
            
            UPDATE public.checkout_migration_log 
            SET status = 'completed', completed_at = now()
            WHERE artifact_name = func_record.routine_name AND action_type = 'function_removal';
            
            RAISE NOTICE 'Dropped function: %', func_record.routine_name;
        EXCEPTION 
            WHEN OTHERS THEN
                UPDATE public.checkout_migration_log 
                SET status = 'failed', details = jsonb_build_object('error', SQLERRM)
                WHERE artifact_name = func_record.routine_name AND action_type = 'function_removal';
                RAISE NOTICE 'Failed to drop function %: %', func_record.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5. Log edge functions that need to be removed
INSERT INTO public.checkout_migration_log 
(action_type, artifact_type, artifact_name, status, details) 
VALUES 
('edge_function_removal', 'edge_function', 'manual-create-order', 'pending', 
 jsonb_build_object('note', 'Edge function will be removed in separate deployment')),
('edge_function_removal', 'edge_function', 'test-create-order', 'pending', 
 jsonb_build_object('note', 'Edge function will be removed in separate deployment'));

-- 6. Create summary report
CREATE VIEW IF NOT EXISTS public.checkout_migration_summary AS
SELECT 
    action_type,
    artifact_type,
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_items,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_items,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_items
FROM public.checkout_migration_log
GROUP BY action_type, artifact_type
ORDER BY action_type, artifact_type;

-- Log completion
INSERT INTO public.checkout_migration_log (action_type, artifact_type, artifact_name, status, completed_at, details) 
VALUES ('migration_complete', 'system', 'checkout_legacy_quarantine', 'completed', now(), 
        jsonb_build_object('total_tables_quarantined', 
            (SELECT COUNT(*) FROM public.checkout_migration_log WHERE action_type = 'table_backup' AND status = 'completed')));

COMMENT ON TABLE public.checkout_migration_log IS 'Log of all actions taken during checkout legacy system quarantine';
COMMENT ON VIEW public.checkout_migration_summary IS 'Summary view of checkout migration progress and status';