export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  imageUrl: string;
}

export interface Visit {
  id: string;
  doctorId: string;
  date: string;
  totalPatients: number;
}

export interface Patient {
  id: string;
  name: string;
  contact: string;
  feeStatus: 'due' | 'paid';
  visitId: string;
  serialNo: number;
}
export interface Feedback {
  id: string;
  patientName: string;
  message: string;
  rating?: number;
  reply?: string;
  isStarred?: boolean;
  createdAt: string;
}



export interface Feature {
  icon: any;
  title: string;
  description: string;
}