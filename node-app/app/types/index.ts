// 게시판 타입
export interface Board {
  id: number;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  createdAt: string;
}

// 사용자 타입
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  passwordPromptStatus?: 'DEFAULT' | 'REQUIRED';
}

// 인증 Context 타입
export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  isInitializing: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

// 일정 및 장소 타입
export interface Place {
  name: string;
  description: string;
  lat?: number;
  lng?: number;
}

export interface PlanDay {
  day: string;
  places: Place[];
}

export interface PlanResult {
  title: string;
  days: PlanDay[];
}

export interface Itinerary {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  scheduleJson: string;
}
