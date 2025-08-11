BEGIN;
  -- 1) Remove all order items first (breaks FKs to backlinks and pedidos)
  DELETE FROM public.order_items;

  -- 2) Remove all orders
  DELETE FROM public.pedidos;

  -- 3) Now remove all backlinks as initially requested
  DELETE FROM public.backlinks;
COMMIT;