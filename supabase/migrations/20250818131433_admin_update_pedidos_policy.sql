create policy "Admins can update all pedidos"
on public.pedidos for update
to authenticated
using (has_role(auth.uid(), 'admin'::app_role))
with check (has_role(auth.uid(), 'admin'::app_role));
