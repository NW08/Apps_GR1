-- Esquema, RLS, Storage, RPC y vistas (ADR-008, ADR-009). Basado en el SQL de referencia del equipo.

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- 1. TABLAS PRINCIPALES (ADR-008)

CREATE TABLE IF NOT EXISTS public.recintos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provincia TEXT NOT NULL,
  canton TEXT NOT NULL,
  parroquia TEXT NOT NULL,
  nombre TEXT NOT NULL,
  num_jrv INTEGER NOT NULL CHECK (num_jrv > 0 AND num_jrv <= 200),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (canton, parroquia, nombre)
);

CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  cedula TEXT NOT NULL UNIQUE CHECK (cedula ~ '^\d{10}$'),
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rol TEXT NOT NULL CHECK (rol IN ('provincial', 'recinto', 'veedor')),
  recinto_id UUID REFERENCES public.recintos (id) ON DELETE SET NULL,
  creado_por UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  debe_cambiar_clave BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jrv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recinto_id UUID NOT NULL REFERENCES public.recintos (id) ON DELETE CASCADE,
  numero INTEGER NOT NULL CHECK (numero > 0),
  veedor_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  UNIQUE (recinto_id, numero)
);

CREATE TABLE IF NOT EXISTS public.organizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  lista TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.candidaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES public.organizaciones (id) ON DELETE CASCADE,
  dignidad TEXT NOT NULL CHECK (dignidad IN ('alcalde', 'prefecto')),
  nombre TEXT NOT NULL,
  UNIQUE (organizacion_id, dignidad)
);

CREATE TABLE IF NOT EXISTS public.actas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jrv_id UUID NOT NULL REFERENCES public.jrv (id) ON DELETE CASCADE,
  dignidad TEXT NOT NULL CHECK (dignidad IN ('alcalde', 'prefecto')),
  nulos INTEGER NOT NULL CHECK (nulos >= 0),
  blancos INTEGER NOT NULL CHECK (blancos >= 0),
  total_sufragantes INTEGER NOT NULL CHECK (total_sufragantes >= 0),
  foto_path TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  precision_m DOUBLE PRECISION,
  capturado_en TIMESTAMPTZ,
  ubicacion_comprobable BOOLEAN NOT NULL DEFAULT TRUE,
  estado TEXT NOT NULL DEFAULT 'VALIDADA' CHECK (estado IN ('VALIDADA', 'OBSERVADA', 'CORREGIDA')),
  observacion TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  client_uuid UUID UNIQUE,
  actualizado_por UUID NOT NULL REFERENCES auth.users (id),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (jrv_id, dignidad),
  CONSTRAINT chk_observacion_si_observada CHECK (
    estado <> 'OBSERVADA' OR (observacion IS NOT NULL AND length(trim(observacion)) >= 10)
  )
);

CREATE TABLE IF NOT EXISTS public.acta_votos (
  acta_id UUID NOT NULL REFERENCES public.actas (id) ON DELETE CASCADE,
  candidatura_id UUID NOT NULL REFERENCES public.candidaturas (id) ON DELETE RESTRICT,
  votos INTEGER NOT NULL CHECK (votos >= 0),
  PRIMARY KEY (acta_id, candidatura_id)
);

CREATE TABLE IF NOT EXISTS public.acta_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acta_id UUID NOT NULL REFERENCES public.actas (id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  modificado_por UUID NOT NULL REFERENCES auth.users (id),
  modificado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jrv_recinto ON public.jrv (recinto_id);
CREATE INDEX IF NOT EXISTS idx_jrv_veedor ON public.jrv (veedor_id);
CREATE INDEX IF NOT EXISTS idx_actas_jrv ON public.actas (jrv_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_recinto ON public.perfiles (recinto_id);
CREATE INDEX IF NOT EXISTS idx_actas_estado ON public.actas (estado);
CREATE INDEX IF NOT EXISTS idx_candidaturas_organizacion ON public.candidaturas (organizacion_id);


-- 2. TRIGGER: CREAR JRVs AUTOMATICAMENTE AL CREAR UN RECINTO (R1 / R4)

CREATE OR REPLACE FUNCTION public.crear_jrvs_recinto()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.jrv (recinto_id, numero)
  SELECT NEW.id, gs
  FROM generate_series(1, NEW.num_jrv) AS gs
  ON CONFLICT (recinto_id, numero) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crear_jrvs_recinto ON public.recintos;
CREATE TRIGGER trg_crear_jrvs_recinto
AFTER INSERT ON public.recintos
FOR EACH ROW
EXECUTE FUNCTION public.crear_jrvs_recinto();


-- 3. FUNCIONES AUXILIARES DE SEGURIDAD Y AUTENTICACION (ADR-002)

CREATE OR REPLACE FUNCTION public.auth_rol()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.auth_recinto_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT recinto_id FROM public.perfiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.auth_clave_actualizada()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT NOT debe_cambiar_clave FROM public.perfiles WHERE id = auth.uid()), FALSE);
$$;

-- RPC pública (anon) para iniciar sesión usando cédula como identificador visible (R3)
CREATE OR REPLACE FUNCTION public.email_por_cedula(p_cedula TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.perfiles WHERE cedula = trim(p_cedula) LIMIT 1;
$$;

-- RPC segura para marcar el cambio obligatorio de contraseña completado (R3)
CREATE OR REPLACE FUNCTION public.marcar_clave_cambiada()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  UPDATE public.perfiles
  SET debe_cambiar_clave = FALSE
  WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.email_por_cedula(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_por_cedula(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.marcar_clave_cambiada() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marcar_clave_cambiada() TO authenticated;


-- 4. INTEGRIDAD EN BD (TRIGGER DIFERIDO) Y RPC TRANSACCIONAL guardar_acta

CREATE OR REPLACE FUNCTION public.validar_totales_acta_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_suma_votos INTEGER;
  v_total_calculado INTEGER;
BEGIN
  -- Las actas marcadas como OBSERVADA permiten inconsistencia física con observación obligatoria (ADR-005 / ADR-009)
  IF NEW.estado = 'OBSERVADA' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(votos), 0) INTO v_suma_votos
  FROM public.acta_votos
  WHERE acta_id = NEW.id;

  v_total_calculado := v_suma_votos + NEW.nulos + NEW.blancos;

  IF v_total_calculado <> NEW.total_sufragantes THEN
    RAISE EXCEPTION 'TOTALES_INCONSISTENTES: suma(%) <> total_sufragantes(%)', v_total_calculado, NEW.total_sufragantes;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_totales_acta ON public.actas;
CREATE CONSTRAINT TRIGGER trg_validar_totales_acta
AFTER INSERT OR UPDATE ON public.actas
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.validar_totales_acta_trigger();

-- RPC transaccional para registrar/corregir un acta + sus votos + historial + control de versión (ADR-006 / ADR-008)
CREATE OR REPLACE FUNCTION public.guardar_acta(
  p_jrv_id UUID,
  p_dignidad TEXT,
  p_votos JSONB,
  p_nulos INTEGER,
  p_blancos INTEGER,
  p_total_sufragantes INTEGER,
  p_foto_path TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_precision_m DOUBLE PRECISION,
  p_capturado_en TIMESTAMPTZ,
  p_ubicacion_comprobable BOOLEAN,
  p_es_inconsistente BOOLEAN,
  p_observacion TEXT,
  p_client_uuid UUID,
  p_version_base INTEGER DEFAULT NULL
)
RETURNS public.actas
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_existente public.actas;
  v_resultado public.actas;
  v_suma_votos INTEGER := 0;
  v_estado TEXT;
  v_item JSONB;
  v_votos_anteriores JSONB;
BEGIN
  IF NOT public.auth_clave_actualizada() THEN
    RAISE EXCEPTION 'DEBE_CAMBIAR_CLAVE';
  END IF;

  -- Idempotencia por client_uuid (R10 / ADR-006)
  IF p_client_uuid IS NOT NULL THEN
    SELECT * INTO v_existente FROM public.actas WHERE client_uuid = p_client_uuid;
    IF FOUND THEN
      RETURN v_existente;
    END IF;
  END IF;

  -- Validar suma de votos
  SELECT COALESCE(SUM((elem->>'votos')::INTEGER), 0)
  INTO v_suma_votos
  FROM jsonb_array_elements(p_votos) AS elem;

  IF (v_suma_votos + p_nulos + p_blancos) <> p_total_sufragantes THEN
    IF NOT COALESCE(p_es_inconsistente, FALSE) OR length(trim(COALESCE(p_observacion, ''))) < 10 THEN
      RAISE EXCEPTION 'TOTALES_INCONSISTENTES';
    END IF;
    v_estado := 'OBSERVADA';
  ELSE
    v_estado := 'VALIDADA';
  END IF;

  SELECT * INTO v_existente
  FROM public.actas
  WHERE jrv_id = p_jrv_id AND dignidad = p_dignidad;

  IF FOUND THEN
    -- Control optimista de concurrencia (R10 / ADR-006)
    IF p_version_base IS NOT NULL AND v_existente.version > p_version_base THEN
      RAISE EXCEPTION 'CONFLICTO_VERSION: servidor=% base=%', v_existente.version, p_version_base;
    END IF;

    -- Guardar versión anterior en historial (ADR-005)
    SELECT COALESCE(jsonb_agg(jsonb_build_object('candidatura_id', candidatura_id, 'votos', votos)), '[]'::jsonb)
    INTO v_votos_anteriores
    FROM public.acta_votos
    WHERE acta_id = v_existente.id;

    INSERT INTO public.acta_historial (acta_id, version, snapshot, modificado_por)
    VALUES (
      v_existente.id,
      v_existente.version,
      jsonb_build_object(
        'nulos', v_existente.nulos,
        'blancos', v_existente.blancos,
        'total_sufragantes', v_existente.total_sufragantes,
        'foto_path', v_existente.foto_path,
        'estado', v_existente.estado,
        'observacion', v_existente.observacion,
        'votos', v_votos_anteriores
      ),
      auth.uid()
    );

    IF v_estado = 'VALIDADA' THEN
      v_estado := 'CORREGIDA';
    END IF;

    UPDATE public.actas
    SET
      nulos = p_nulos,
      blancos = p_blancos,
      total_sufragantes = p_total_sufragantes,
      foto_path = p_foto_path,
      lat = p_lat,
      lng = p_lng,
      precision_m = p_precision_m,
      capturado_en = p_capturado_en,
      ubicacion_comprobable = COALESCE(p_ubicacion_comprobable, TRUE),
      estado = v_estado,
      observacion = NULLIF(trim(COALESCE(p_observacion, '')), ''),
      version = v_existente.version + 1,
      client_uuid = COALESCE(p_client_uuid, v_existente.client_uuid),
      actualizado_por = auth.uid(),
      actualizado_en = now()
    WHERE id = v_existente.id
    RETURNING * INTO v_resultado;

    DELETE FROM public.acta_votos WHERE acta_id = v_resultado.id;
  ELSE
    INSERT INTO public.actas (
      jrv_id, dignidad, nulos, blancos, total_sufragantes, foto_path,
      lat, lng, precision_m, capturado_en, ubicacion_comprobable,
      estado, observacion, version, client_uuid, actualizado_por
    )
    VALUES (
      p_jrv_id, p_dignidad, p_nulos, p_blancos, p_total_sufragantes, p_foto_path,
      p_lat, p_lng, p_precision_m, p_capturado_en, COALESCE(p_ubicacion_comprobable, TRUE),
      v_estado, NULLIF(trim(COALESCE(p_observacion, '')), ''), 1, p_client_uuid, auth.uid()
    )
    RETURNING * INTO v_resultado;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_votos)
  LOOP
    INSERT INTO public.acta_votos (acta_id, candidatura_id, votos)
    VALUES (
      v_resultado.id,
      (v_item->>'candidatura_id')::UUID,
      (v_item->>'votos')::INTEGER
    );
  END LOOP;

  RETURN v_resultado;
END;
$$;

GRANT EXECUTE ON FUNCTION public.guardar_acta(
  UUID, TEXT, JSONB, INTEGER, INTEGER, INTEGER, TEXT,
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TIMESTAMPTZ,
  BOOLEAN, BOOLEAN, TEXT, UUID, INTEGER
) TO authenticated;


-- 5. POLITICAS ROW LEVEL SECURITY (RLS) POR ROL Y PERTENENCIA (R8 / ADR-002 / ADR-008)

ALTER TABLE public.recintos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jrv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acta_votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acta_historial ENABLE ROW LEVEL SECURITY;

-- PERFILES: siempre puede leer su propio perfil (para saber si debe_cambiar_clave)
DROP POLICY IF EXISTS "perfiles_select_propio" ON public.perfiles;
CREATE POLICY "perfiles_select_propio" ON public.perfiles
FOR SELECT TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "perfiles_select_provincial" ON public.perfiles;
CREATE POLICY "perfiles_select_provincial" ON public.perfiles
FOR SELECT TO authenticated
USING (public.auth_clave_actualizada() AND public.auth_rol() = 'provincial');

DROP POLICY IF EXISTS "perfiles_select_recinto" ON public.perfiles;
CREATE POLICY "perfiles_select_recinto" ON public.perfiles
FOR SELECT TO authenticated
USING (
  public.auth_clave_actualizada()
  AND public.auth_rol() = 'recinto'
  AND recinto_id = public.auth_recinto_id()
);

-- Provincial puede asignar recinto_id a coordinadores de recinto
DROP POLICY IF EXISTS "perfiles_update_provincial" ON public.perfiles;
CREATE POLICY "perfiles_update_provincial" ON public.perfiles
FOR UPDATE TO authenticated
USING (public.auth_clave_actualizada() AND public.auth_rol() = 'provincial' AND rol = 'recinto')
WITH CHECK (public.auth_clave_actualizada() AND public.auth_rol() = 'provincial' AND rol = 'recinto');

-- RECINTOS
DROP POLICY IF EXISTS "recintos_select_rol" ON public.recintos;
CREATE POLICY "recintos_select_rol" ON public.recintos
FOR SELECT TO authenticated
USING (
  public.auth_clave_actualizada()
  AND (
    public.auth_rol() = 'provincial'
    OR id = public.auth_recinto_id()
  )
);

DROP POLICY IF EXISTS "recintos_insert_provincial" ON public.recintos;
CREATE POLICY "recintos_insert_provincial" ON public.recintos
FOR INSERT TO authenticated
WITH CHECK (public.auth_clave_actualizada() AND public.auth_rol() = 'provincial');

DROP POLICY IF EXISTS "recintos_update_provincial" ON public.recintos;
CREATE POLICY "recintos_update_provincial" ON public.recintos
FOR UPDATE TO authenticated
USING (public.auth_clave_actualizada() AND public.auth_rol() = 'provincial')
WITH CHECK (public.auth_clave_actualizada() AND public.auth_rol() = 'provincial');

-- ORGANIZACIONES Y CANDIDATURAS (solo lectura para usuarios activos)
DROP POLICY IF EXISTS "organizaciones_select" ON public.organizaciones;
CREATE POLICY "organizaciones_select" ON public.organizaciones
FOR SELECT TO authenticated
USING (public.auth_clave_actualizada());

DROP POLICY IF EXISTS "candidaturas_select" ON public.candidaturas;
CREATE POLICY "candidaturas_select" ON public.candidaturas
FOR SELECT TO authenticated
USING (public.auth_clave_actualizada());

-- JRV (un veedor SOLO ve mesas asignadas a él)
DROP POLICY IF EXISTS "jrv_select_rol" ON public.jrv;
CREATE POLICY "jrv_select_rol" ON public.jrv
FOR SELECT TO authenticated
USING (
  public.auth_clave_actualizada()
  AND (
    public.auth_rol() = 'provincial'
    OR (public.auth_rol() = 'recinto' AND recinto_id = public.auth_recinto_id())
    OR (public.auth_rol() = 'veedor' AND veedor_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "jrv_update_recinto" ON public.jrv;
CREATE POLICY "jrv_update_recinto" ON public.jrv
FOR UPDATE TO authenticated
USING (
  public.auth_clave_actualizada()
  AND public.auth_rol() = 'recinto'
  AND recinto_id = public.auth_recinto_id()
)
WITH CHECK (
  public.auth_clave_actualizada()
  AND public.auth_rol() = 'recinto'
  AND recinto_id = public.auth_recinto_id()
  AND (
    veedor_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.perfiles p
      WHERE p.id = jrv.veedor_id AND p.rol = 'veedor' AND p.recinto_id = jrv.recinto_id
    )
  )
);

-- ACTAS (aislamiento estricto por veedor y recinto)
DROP POLICY IF EXISTS "actas_select_rol" ON public.actas;
CREATE POLICY "actas_select_rol" ON public.actas
FOR SELECT TO authenticated
USING (
  public.auth_clave_actualizada()
  AND (
    public.auth_rol() = 'provincial'
    OR EXISTS (
      SELECT 1 FROM public.jrv j
      WHERE j.id = actas.jrv_id
        AND (
          (public.auth_rol() = 'recinto' AND j.recinto_id = public.auth_recinto_id())
          OR (public.auth_rol() = 'veedor' AND j.veedor_id = auth.uid())
        )
    )
  )
);

DROP POLICY IF EXISTS "actas_insert_rol" ON public.actas;
CREATE POLICY "actas_insert_rol" ON public.actas
FOR INSERT TO authenticated
WITH CHECK (
  public.auth_clave_actualizada()
  AND EXISTS (
    SELECT 1 FROM public.jrv j
    WHERE j.id = actas.jrv_id
      AND (
        (public.auth_rol() = 'recinto' AND j.recinto_id = public.auth_recinto_id())
        OR (public.auth_rol() = 'veedor' AND j.veedor_id = auth.uid())
      )
  )
);

DROP POLICY IF EXISTS "actas_update_rol" ON public.actas;
CREATE POLICY "actas_update_rol" ON public.actas
FOR UPDATE TO authenticated
USING (
  public.auth_clave_actualizada()
  AND EXISTS (
    SELECT 1 FROM public.jrv j
    WHERE j.id = actas.jrv_id
      AND (
        (public.auth_rol() = 'recinto' AND j.recinto_id = public.auth_recinto_id())
        OR (public.auth_rol() = 'veedor' AND j.veedor_id = auth.uid())
      )
  )
)
WITH CHECK (
  public.auth_clave_actualizada()
  AND EXISTS (
    SELECT 1 FROM public.jrv j
    WHERE j.id = actas.jrv_id
      AND (
        (public.auth_rol() = 'recinto' AND j.recinto_id = public.auth_recinto_id())
        OR (public.auth_rol() = 'veedor' AND j.veedor_id = auth.uid())
      )
  )
);

-- ACTA_VOTOS (hereda aislamiento desde actas)
DROP POLICY IF EXISTS "acta_votos_select_rol" ON public.acta_votos;
CREATE POLICY "acta_votos_select_rol" ON public.acta_votos
FOR SELECT TO authenticated
USING (
  public.auth_clave_actualizada()
  AND EXISTS (SELECT 1 FROM public.actas a WHERE a.id = acta_votos.acta_id)
);

DROP POLICY IF EXISTS "acta_votos_write_rol" ON public.acta_votos;
CREATE POLICY "acta_votos_write_rol" ON public.acta_votos
FOR ALL TO authenticated
USING (
  public.auth_clave_actualizada()
  AND EXISTS (
    SELECT 1 FROM public.actas a
    JOIN public.jrv j ON j.id = a.jrv_id
    WHERE a.id = acta_votos.acta_id
      AND (
        (public.auth_rol() = 'recinto' AND j.recinto_id = public.auth_recinto_id())
        OR (public.auth_rol() = 'veedor' AND j.veedor_id = auth.uid())
      )
  )
)
WITH CHECK (
  public.auth_clave_actualizada()
  AND EXISTS (
    SELECT 1 FROM public.actas a
    JOIN public.jrv j ON j.id = a.jrv_id
    WHERE a.id = acta_votos.acta_id
      AND (
        (public.auth_rol() = 'recinto' AND j.recinto_id = public.auth_recinto_id())
        OR (public.auth_rol() = 'veedor' AND j.veedor_id = auth.uid())
      )
  )
);

-- ACTA_HISTORIAL
DROP POLICY IF EXISTS "acta_historial_select" ON public.acta_historial;
CREATE POLICY "acta_historial_select" ON public.acta_historial
FOR SELECT TO authenticated
USING (
  public.auth_clave_actualizada()
  AND EXISTS (SELECT 1 FROM public.actas a WHERE a.id = acta_historial.acta_id)
);

DROP POLICY IF EXISTS "acta_historial_insert" ON public.acta_historial;
CREATE POLICY "acta_historial_insert" ON public.acta_historial
FOR INSERT TO authenticated
WITH CHECK (
  public.auth_clave_actualizada()
  AND EXISTS (
    SELECT 1 FROM public.actas a
    JOIN public.jrv j ON j.id = a.jrv_id
    WHERE a.id = acta_historial.acta_id
      AND (
        (public.auth_rol() = 'recinto' AND j.recinto_id = public.auth_recinto_id())
        OR (public.auth_rol() = 'veedor' AND j.veedor_id = auth.uid())
      )
  )
);


-- 6. BUCKET PRIVADO DE FOTOS 'actas' Y POLITICAS STORAGE (ADR-008 / R7 / R8)

INSERT INTO storage.buckets (id, name, public)
VALUES ('actas', 'actas', FALSE)
ON CONFLICT (id) DO UPDATE SET public = FALSE;

DROP POLICY IF EXISTS "storage_actas_select" ON storage.objects;
CREATE POLICY "storage_actas_select" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'actas'
  AND public.auth_clave_actualizada()
  AND (
    public.auth_rol() = 'provincial'
    OR (public.auth_rol() = 'recinto' AND (storage.foldername(name))[1] = public.auth_recinto_id()::TEXT)
    OR (
      public.auth_rol() = 'veedor'
      AND EXISTS (
        SELECT 1 FROM public.jrv j
        WHERE j.id::TEXT = (storage.foldername(name))[2]
          AND j.veedor_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "storage_actas_write" ON storage.objects;
CREATE POLICY "storage_actas_write" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'actas'
  AND public.auth_clave_actualizada()
  AND (
    (public.auth_rol() = 'recinto' AND (storage.foldername(name))[1] = public.auth_recinto_id()::TEXT)
    OR (
      public.auth_rol() = 'veedor'
      AND EXISTS (
        SELECT 1 FROM public.jrv j
        WHERE j.id::TEXT = (storage.foldername(name))[2]
          AND j.veedor_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "storage_actas_update" ON storage.objects;
CREATE POLICY "storage_actas_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'actas'
  AND public.auth_clave_actualizada()
  AND (
    (public.auth_rol() = 'recinto' AND (storage.foldername(name))[1] = public.auth_recinto_id()::TEXT)
    OR (
      public.auth_rol() = 'veedor'
      AND EXISTS (
        SELECT 1 FROM public.jrv j
        WHERE j.id::TEXT = (storage.foldername(name))[2]
          AND j.veedor_id = auth.uid()
      )
    )
  )
);


-- 7. VISTAS SQL PARA DASHBOARD CON security_invoker = true (ADR-009 / R4)

CREATE OR REPLACE VIEW public.resultados_por_candidato_recinto
WITH (security_invoker = true) AS
SELECT
  j.recinto_id,
  r.nombre AS recinto_nombre,
  c.dignidad,
  c.id AS candidatura_id,
  c.nombre AS candidatura_nombre,
  o.nombre AS organizacion_nombre,
  o.lista AS organizacion_lista,
  COALESCE(SUM(av.votos), 0)::INTEGER AS votos_totales,
  COALESCE(SUM(av.votos) FILTER (WHERE a.estado <> 'OBSERVADA'), 0)::INTEGER AS votos_sin_observadas,
  COALESCE(SUM(av.votos) FILTER (WHERE a.estado = 'OBSERVADA'), 0)::INTEGER AS votos_observados
FROM public.acta_votos av
JOIN public.actas a ON a.id = av.acta_id
JOIN public.jrv j ON j.id = a.jrv_id
JOIN public.recintos r ON r.id = j.recinto_id
JOIN public.candidaturas c ON c.id = av.candidatura_id
JOIN public.organizaciones o ON o.id = c.organizacion_id
GROUP BY j.recinto_id, r.nombre, c.dignidad, c.id, c.nombre, o.nombre, o.lista;

CREATE OR REPLACE VIEW public.resultados_blancos_nulos_recinto
WITH (security_invoker = true) AS
SELECT
  j.recinto_id,
  a.dignidad,
  COALESCE(SUM(a.blancos), 0)::INTEGER AS blancos_totales,
  COALESCE(SUM(a.nulos), 0)::INTEGER AS nulos_totales,
  COALESCE(SUM(a.total_sufragantes), 0)::INTEGER AS sufragantes_totales,
  COALESCE(SUM(a.blancos) FILTER (WHERE a.estado <> 'OBSERVADA'), 0)::INTEGER AS blancos_sin_observadas,
  COALESCE(SUM(a.nulos) FILTER (WHERE a.estado <> 'OBSERVADA'), 0)::INTEGER AS nulos_sin_observadas,
  COALESCE(SUM(a.total_sufragantes) FILTER (WHERE a.estado <> 'OBSERVADA'), 0)::INTEGER AS sufragantes_sin_observadas,
  COUNT(*) FILTER (WHERE a.estado = 'OBSERVADA')::INTEGER AS actas_observadas
FROM public.actas a
JOIN public.jrv j ON j.id = a.jrv_id
GROUP BY j.recinto_id, a.dignidad;

CREATE OR REPLACE VIEW public.avance_actas_recinto
WITH (security_invoker = true) AS
SELECT
  r.id AS recinto_id,
  r.canton,
  r.parroquia,
  r.nombre AS recinto_nombre,
  r.num_jrv AS total_jrv,
  COUNT(a.id) FILTER (WHERE a.dignidad = 'alcalde')::INTEGER AS actas_alcalde,
  COUNT(a.id) FILTER (WHERE a.dignidad = 'prefecto')::INTEGER AS actas_prefecto,
  COUNT(a.id) FILTER (WHERE a.estado = 'OBSERVADA')::INTEGER AS actas_observadas,
  COUNT(a.id) FILTER (WHERE NOT a.ubicacion_comprobable)::INTEGER AS actas_sin_ubicacion
FROM public.recintos r
LEFT JOIN public.jrv j ON j.recinto_id = r.id
LEFT JOIN public.actas a ON a.jrv_id = j.id
GROUP BY r.id, r.canton, r.parroquia, r.nombre, r.num_jrv;

-- Estado de cada mesa derivado de sus actas (ADR-008: vistas en lugar de triggers)
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
  CASE
    WHEN COUNT(a.id) = 0 THEN 'PENDIENTE'
    WHEN COUNT(a.id) FILTER (WHERE a.estado = 'OBSERVADA') > 0 THEN 'OBSERVADA'
    WHEN COUNT(a.id) >= 2 THEN 'COMPLETA'
    ELSE 'PARCIAL'
  END AS estado
FROM public.jrv j
LEFT JOIN public.perfiles p ON p.id = j.veedor_id
LEFT JOIN public.actas a ON a.jrv_id = j.id
GROUP BY j.id, j.recinto_id, j.numero, j.veedor_id, p.nombres, p.apellidos;

-- Permisos explícitos para el rol authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.resultados_por_candidato_recinto TO authenticated;
GRANT SELECT ON public.resultados_blancos_nulos_recinto TO authenticated;
GRANT SELECT ON public.avance_actas_recinto TO authenticated;
GRANT SELECT ON public.mesas_estado TO authenticated;
