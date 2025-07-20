export interface Candidate {
  name: string;
  surname: string;
  seniority?: 'junior' | 'senior';
  yearsOfExperience?: number;
  availability?: boolean;
}

export interface CandidateResponse {
  id?: string;
  name: string;
  surname: string;
  seniority: 'junior' | 'senior';
  yearsOfExperience: number;
  availability: boolean;
  timestamp?: Date;
  file?: any;
}

export interface FileData {
  seniority: 'junior' | 'senior';
  yearsOfExperience: number;
  availability: boolean;
}

export interface ApiStatus {
  online: boolean;
  lastCheck: Date;
  usingCachedData: boolean;
}
