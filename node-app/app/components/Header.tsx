'use client';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header(): React.ReactElement | null {
  const { isAuthenticated, currentUser, logout, isInitializing } = useAuth();
  const pathname = usePathname();

  if (isInitializing) return null;

  return (
    <header className="app-header">
      <Link href="/" className="no-underline">
        <h1 className="app-title">✈️ TravelVibe</h1>
      </Link>
      
      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <span className="user-greeting">
              👋 {currentUser?.name}님 환영합니다
            </span>
            {currentUser?.role === 'ADMIN' && (
              <Link href="/admin">
                <button className="secondary">회원관리</button>
              </Link>
            )}
            <button onClick={logout} className="secondary">로그아웃</button>
          </>
        ) : (
          pathname !== '/login' && Object.keys(currentUser || {}).length === 0 && (
            <Link href="/login">
              <button className="primary">로그인 / 회원가입</button>
            </Link>
          )
        )}

        <div className="dropdown">
          <button className="dropdown-btn" style={{ fontSize: '1.5rem', padding: '0.2rem 0.5rem', border: 'none' }}>☰</button>
          <div className="dropdown-content">
            <Link href="/coming-soon">AI 추천 맞춤일정</Link>
            <Link href={isAuthenticated ? "/coming-soon" : "/login"}>내 일정</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
