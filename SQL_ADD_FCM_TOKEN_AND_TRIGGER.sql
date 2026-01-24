-- 1. Add FCM Token to Drivers Table
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS fcm_token text;

-- 2. Create Trigger Function to Send Push Notification
create or replace function public.handle_status_update_notification()
returns trigger
language plpgsql
security definer
as $$
declare
  user_token text;
  driver_token text;
  project_url text := 'https://xikzjnuaalzsmqmzcxgu.supabase.co/functions/v1/push';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3pqbnVhYWx6c21xbXpjeGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNzAxNzMsImV4cCI6MjA4Mzc0NjE3M30.Nh5tlwWVbZ7v-DfoDML_OLu85Ylc6uDITy2VzQbKs3w';
  payload jsonb;
  request_id bigint;
begin
  payload := null;

  -- CASE 1: Notify User when Status changes
  if (TG_OP = 'UPDATE' and old.status <> new.status) then
      if (new.status = 'cooking') then
          payload := jsonb_build_object(
              'userId', new.user_id,
              'title', '¡Tu pedido se está preparando! 👨‍🍳',
              'body', 'Hemos empezado a cocinar tu pedido. ¡Pronto estará en camino!',
              'openUrl', '/#orders'
          );
      elsif (new.status = 'ready') then
          payload := jsonb_build_object(
              'userId', new.user_id,
              'title', '¡Tu pedido está listo! 🛵',
              'body', 'Tu pedido ha salido de la cocina y está esperando repartidor.',
              'openUrl', '/#orders'
          );
      elsif (new.status = 'completed') then
           payload := jsonb_build_object(
              'userId', new.user_id,
              'title', '¡Pedido Entregado! 🎉',
              'body', 'Gracias por elegirnos. ¡Buen provecho!',
              'openUrl', '/#orders'
          );
      end if;
  end if;

  -- CASE 2: Notify Driver when Assigned
  if (TG_OP = 'UPDATE' and (old.driver_id is distinct from new.driver_id) and new.driver_id is not null) then
      -- Fetch Driver Token locally
      select fcm_token into driver_token from public.drivers where id = new.driver_id;
      
      if (driver_token is not null) then
           payload := jsonb_build_object(
              'token', driver_token,
              'title', '¡Nuevo Pedido Asignado! 🛵',
              'body', 'Tienes un nuevo pedido para entregar. Revisa tu app.',
              'openUrl', '/rider'
          );
      end if;
  end if;

  -- SEND REQUEST if payload exists
  if (payload is not null) then
      select net.http_post(
          url := project_url,
          headers := jsonb_build_object(
              'Content-Type', 'application/json', 
              'Authorization', 'Bearer ' || anon_key
          ),
          body := payload
      ) into request_id;
  end if;

  return new;
end;
$$;

-- 3. Create Trigger (Avoid duplicates)
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;

CREATE TRIGGER on_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_status_update_notification();
