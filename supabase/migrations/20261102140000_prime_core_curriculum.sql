-- PRIME Core Curriculum Schema, Constraints, Indexes & RLS Policies
-- Establishes the authoritative curriculum layer (curricula, stages, items, dependencies).
-- Does NOT duplicate problems; references canonical public.problems(id).

BEGIN;

-- 1. Curricula (Generic, versioned curriculum definition)
CREATE TABLE IF NOT EXISTS public.curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '2026.1',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  estimated_problem_count INTEGER NOT NULL DEFAULT 180 CHECK (estimated_problem_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Curriculum Stages (Structured stages within a curriculum)
CREATE TABLE IF NOT EXISTS public.curriculum_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES public.curricula(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sequence INTEGER NOT NULL CHECK (sequence > 0),
  estimated_problem_count INTEGER NOT NULL DEFAULT 0 CHECK (estimated_problem_count >= 0),
  estimated_minutes INTEGER NOT NULL DEFAULT 0 CHECK (estimated_minutes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_curriculum_stage_slug UNIQUE (curriculum_id, slug),
  CONSTRAINT unique_curriculum_stage_sequence UNIQUE (curriculum_id, sequence)
);

CREATE INDEX IF NOT EXISTS curriculum_stages_curriculum_seq_idx 
  ON public.curriculum_stages(curriculum_id, sequence);

-- 3. Curriculum Items (Problems assigned to curriculum stages)
CREATE TABLE IF NOT EXISTS public.curriculum_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES public.curricula(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.curriculum_stages(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE RESTRICT,
  sequence INTEGER NOT NULL CHECK (sequence > 0),
  priority TEXT NOT NULL DEFAULT 'P1' CHECK (priority IN ('P0', 'P1', 'P2')),
  recommended_minutes INTEGER NOT NULL DEFAULT 30 CHECK (recommended_minutes > 0),
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_checkpoint BOOLEAN NOT NULL DEFAULT false,
  selection_reason TEXT NOT NULL CHECK (length(trim(selection_reason)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_curriculum_problem UNIQUE (curriculum_id, problem_id),
  CONSTRAINT unique_curriculum_sequence UNIQUE (curriculum_id, sequence)
);

CREATE INDEX IF NOT EXISTS curriculum_items_stage_seq_idx 
  ON public.curriculum_items(stage_id, sequence);
CREATE INDEX IF NOT EXISTS curriculum_items_problem_idx 
  ON public.curriculum_items(problem_id);
CREATE INDEX IF NOT EXISTS curriculum_items_curriculum_seq_idx 
  ON public.curriculum_items(curriculum_id, sequence);

-- 4. Curriculum Dependencies (Prerequisite DAG edges between curriculum items)
CREATE TABLE IF NOT EXISTS public.curriculum_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES public.curricula(id) ON DELETE CASCADE,
  prerequisite_item_id UUID NOT NULL REFERENCES public.curriculum_items(id) ON DELETE CASCADE,
  dependent_item_id UUID NOT NULL REFERENCES public.curriculum_items(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'recommended' CHECK (dependency_type IN ('required', 'recommended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_curriculum_prerequisite UNIQUE (curriculum_id, prerequisite_item_id, dependent_item_id),
  CONSTRAINT check_no_self_curriculum_dependency CHECK (prerequisite_item_id <> dependent_item_id)
);

CREATE INDEX IF NOT EXISTS curriculum_deps_prereq_idx 
  ON public.curriculum_dependencies(prerequisite_item_id);
CREATE INDEX IF NOT EXISTS curriculum_deps_dep_idx 
  ON public.curriculum_dependencies(dependent_item_id);

-- 5. Updated_at Triggers
CREATE TRIGGER set_curricula_updated_at
  BEFORE UPDATE ON public.curricula
  FOR EACH ROW EXECUTE FUNCTION public.dsa_touch_updated_at();

CREATE TRIGGER set_curriculum_stages_updated_at
  BEFORE UPDATE ON public.curriculum_stages
  FOR EACH ROW EXECUTE FUNCTION public.dsa_touch_updated_at();

CREATE TRIGGER set_curriculum_items_updated_at
  BEFORE UPDATE ON public.curriculum_items
  FOR EACH ROW EXECUTE FUNCTION public.dsa_touch_updated_at();

-- 6. Row Level Security Policies
ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_dependencies ENABLE ROW LEVEL SECURITY;

-- 6.1 Curricula: Read published curricula
CREATE POLICY "Public read access for published curricula"
  ON public.curricula
  FOR SELECT
  TO authenticated, anon
  USING (status = 'published');

-- 6.2 Curriculum Stages: Read published stages
CREATE POLICY "Public read access for published curriculum stages"
  ON public.curriculum_stages
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.curricula c
      WHERE c.id = curriculum_id AND c.status = 'published'
    )
  );

-- 6.3 Curriculum Items: Read published items
CREATE POLICY "Public read access for published curriculum items"
  ON public.curriculum_items
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.curricula c
      WHERE c.id = curriculum_id AND c.status = 'published'
    )
  );

-- 6.4 Curriculum Dependencies: Read published dependencies
CREATE POLICY "Public read access for published curriculum dependencies"
  ON public.curriculum_dependencies
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.curricula c
      WHERE c.id = curriculum_id AND c.status = 'published'
    )
  );

COMMIT;

