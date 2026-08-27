-- Drop conflicting policies
DROP POLICY IF EXISTS "students_select_guardian" ON students;
DROP POLICY IF EXISTS "student_guardians_select_staff" ON student_guardians;

-- Create security definer function to check guardian relationship without triggering RLS on student_guardians
CREATE OR REPLACE FUNCTION is_my_student(p_student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_guardians 
    WHERE guardian_id = auth.uid() 
    AND student_id = p_student_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create security definer function to check staff relationship without triggering RLS on students
CREATE OR REPLACE FUNCTION is_staff_of_student(p_student_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_school_id UUID;
  v_auth_school UUID;
  v_auth_role TEXT;
BEGIN
  SELECT school_id INTO v_school_id FROM students WHERE id = p_student_id;
  SELECT school_id INTO v_auth_school FROM profiles WHERE id = auth.uid();
  SELECT role::text INTO v_auth_role FROM profiles WHERE id = auth.uid();
  
  RETURN (v_school_id = v_auth_school AND v_auth_role IN ('admin', 'teacher'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate policies using the functions
CREATE POLICY "students_select_guardian"
  ON students FOR SELECT
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() = 'guardian'
    AND is_my_student(id)
  );

CREATE POLICY "student_guardians_select_staff"
  ON student_guardians FOR SELECT
  TO authenticated
  USING (
    auth_role() IN ('admin', 'teacher')
    AND is_staff_of_student(student_id)
  );

