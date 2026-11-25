-- ADR-008 (video 00:57:41): el estado de la mesa se guarda al registrar el acta, no se calcula en cada consulta.

ALTER TABLE public.jrv
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'PENDIENTE'
  CHECK (estado IN ('PENDIENTE', 'PARCIAL', 'COMPLETA', 'OBSERVADA'));

CREATE OR REPLACE FUNCTION public.recalcular_estado_jrv()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_observadas INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE estado = 'OBSERVADA')
  INTO v_total, v_observadas
  FROM public.actas
  WHERE jrv_id = NEW.jrv_id;

  UPDATE public.jrv
  SET estado = CASE
    WHEN v_total = 0 THEN 'PENDIENTE'
    WHEN v_observadas > 0 THEN 'OBSERVADA'
    WHEN v_total >= 2 THEN 'COMPLETA'
    ELSE 'PARCIAL'
  END
  WHERE id = NEW.jrv_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalcular_estado_jrv ON public.actas;
CREATE TRIGGER trg_recalcular_estado_jrv
AFTER INSERT OR UPDATE OF estado ON public.actas
FOR EACH ROW
EXECUTE FUNCTION public.recalcular_estado_jrv();

UPDATE public.jrv j
SET estado = CASE
  WHEN s.total = 0 THEN 'PENDIENTE'
  WHEN s.observadas > 0 THEN 'OBSERVADA'
  WHEN s.total >= 2 THEN 'COMPLETA'
  ELSE 'PARCIAL'
END
FROM (
  SELECT jj.id, COUNT(a.id) AS total, COUNT(a.id) FILTER (WHERE a.estado = 'OBSERVADA') AS observadas
  FROM public.jrv jj
  LEFT JOIN public.actas a ON a.jrv_id = jj.id
  GROUP BY jj.id
) s
WHERE s.id = j.id;

CREATE OR REPLACE VIEW public.mesas_estado
WITH (security_invoker = true) AS
SELECT
  j.id,
  j.recinto_id,
  j.numero,
  j.veedor_id,
  p.nombres AS veedor_nombres,
  p.apellidos AS veedor_apellidos,
  COUNT(a.id)::INTEGER AS actas_registradas,
  j.estado
FROM public.jrv j
LEFT JOIN public.perfiles p ON p.id = j.veedor_id
LEFT JOIN public.actas a ON a.jrv_id = j.id
GROUP BY j.id, j.recinto_id, j.numero, j.veedor_id, p.nombres, p.apellidos, j.estado;

CREATE INDEX IF NOT EXISTS idx_jrv_estado ON public.jrv (estado);
