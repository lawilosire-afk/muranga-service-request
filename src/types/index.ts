export type UserRole = 'citizen' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export type RequestCategory = 
  | 'Water and sanitation'
  | 'Roads and drainage'
  | 'Street lighting'
  | 'Garbage collection'
  | 'Public facilities'
  | 'Other';

export type RequestStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface ServiceRequest {
  id: string;
  reference_number: string;
  citizen_id: string;
  category: RequestCategory;
  location: string;
  description: string;
  image_path?: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}