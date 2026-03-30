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
        <h1 className="app-title">🚀 Next.js 자유게시판</h1>
      </Link>
      
      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <span className="user-greeting">
              👋 {currentUser?.name}님
              {currentUser?.role === 'ADMIN' && <span className="admin-badge">ADMIN</span>}
            </span>
            {currentUser?.role === 'ADMIN' && pathname !== '/admin' && (
              <Link href="/admin">
                <button className="secondary">회원 관리</button>
              </Link>
            )}
            <button onClick={logout} className="secondary">로그아웃</button>
            {pathname === '/' && (
              <Link href="/board/write">
                <button className="primary">✨ 새 글 작성</button>
              </Link>
            )}
          </>
        ) : pathname !== '/login' ? (
          <Link href="/login">
            <button className="primary">로그인</button>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
