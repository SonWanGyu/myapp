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
