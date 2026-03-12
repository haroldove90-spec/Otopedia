import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nxhmldjrabnjmpzpbanc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aG1sZGpyYWJuam1wenBiYW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzQ0NTIsImV4cCI6MjA4ODg1MDQ1Mn0.fAxILd_DY74FjrkbCPdzhmaGK2TMRVPaDVAXZqjGoEs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'doctor' | 'assistant';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string;
}

export interface Patient {
  id: string;
  full_name: string;
  dob: string;
  phone: string;
  email: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  status: 'scheduled' | 'arrived' | 'completed' | 'cancelled';
  notes: string;
}

export interface ClinicalNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string;
  raw_audio_url: string;
  extracted_data: {
    diagnosis?: string;
    medication?: string;
    dose?: string;
    next_appointment?: string;
    summary?: string;
  };
  created_at: string;
}
