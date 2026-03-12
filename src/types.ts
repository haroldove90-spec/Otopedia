export type UserRole = 'doctor' | 'assistant';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
}

export interface Patient {
  id: string;
  full_name: string;
  dob: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  status: 'scheduled' | 'arrived' | 'completed' | 'cancelled';
  notes: string;
  price: number;
  created_at: string;
  patient?: Patient;
}

export interface ClinicalHistory {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  next_appointment?: string;
  created_at: string;
  patient?: Patient;
  extracted_data?: any;
}

export interface DashboardMetrics {
  totalPatients: number;
  consultationsDay: number;
  consultationsWeek: number;
  consultationsMonth: number;
  incomeDay: number;
  incomeWeek: number;
  incomeMonth: number;
}
