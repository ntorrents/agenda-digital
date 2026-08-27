CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_messages_school ON public.messages(school_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_student ON public.messages(student_id);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden leer los mensajes donde son emisores o receptores
CREATE POLICY "messages_select"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Los usuarios pueden insertar mensajes si son el emisor
CREATE POLICY "messages_insert"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
  );

-- Solo el receptor puede marcar como leído
CREATE POLICY "messages_update"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    receiver_id = auth.uid()
  )
  WITH CHECK (
    receiver_id = auth.uid()
  );
