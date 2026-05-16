-- ============================================================
-- INTRUN — Tablas adicionales para aprendizaje y push
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Baselines personales por usuario
CREATE TABLE IF NOT EXISTS public.user_baselines (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Promedios móviles (EMA) de vitales
  avg_hrv       numeric DEFAULT 0,
  avg_sleep     numeric DEFAULT 0,
  avg_hr        numeric DEFAULT 70,
  avg_stress    numeric DEFAULT 50,
  avg_steps     numeric DEFAULT 0,
  -- Desviaciones estándar personales
  std_hrv       numeric DEFAULT 5,
  std_sleep     numeric DEFAULT 0.5,
  std_hr        numeric DEFAULT 8,
  std_stress    numeric DEFAULT 10,
  -- Firma pre-crisis (vitales promedio 24h antes de cada crisis)
  pre_crisis_hrv    numeric,
  pre_crisis_sleep  numeric,
  pre_crisis_stress numeric,
  pre_crisis_hr     numeric,
  -- Metadatos
  samples       integer DEFAULT 0,
  crisis_count  integer DEFAULT 0,
  last_alert_at timestamptz,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_baselines_own" ON public.user_baselines
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Subscripciones push por usuario
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL,
  p256dh     text,
  auth_key   text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subs_own" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
