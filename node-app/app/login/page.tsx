'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useAlert } from '../context/AlertContext';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const { login, isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

  const USER_API_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/users`;

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
    }
  }, [isAuthenticated, isInitializing, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isLoginMode) {
      try {
        const res = await fetch(`${USER_API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });
        if (!res.ok) throw new Error('로그인 실패');
        
        const resMe = await fetch(`${USER_API_URL}/me`, { method: 'GET', credentials: 'include' });
        if (resMe.ok) {
           const userData = await resMe.json();
           login(userData);
           
           // 리다이렉트 경로 처리
           const searchParams = new URLSearchParams(window.location.search);
           const redirectPath = searchParams.get('redirect') || '/';
           router.push(redirectPath);
        }
      } catch (err) {
        showAlert((err as Error).message);
      }
    } else {
      if (password !== passwordConfirm) {
        showAlert('비밀번호가 일치하지 않습니다.');
        return;
      }
      try {
        const res = await fetch(USER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        if (!res.ok) throw new Error('회원가입 실패 (이미 존재하는 이메일일 수 있습니다)');
        showAlert('회원가입이 완료되었습니다. 로그인해주세요.');
        setIsLoginMode(true);
      } catch (err) {
        showAlert((err as Error).message);
      }
    }
  };

  if (isInitializing || isAuthenticated) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundImage: "url('/aurora.png')", backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="travel-login-container animate-fade-in">
        <h2 className="page-title center">
          {isLoginMode ? '✈️ 로그인' : '✈️ 회원가입'}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          {isLoginMode ? 'TravelVibe에 다시 오신 것을 환영합니다.' : 'TravelVibe와 함께 여정을 시작하세요.'}
        </p>
        <form onSubmit={handleSubmit} className="form-group">
          <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required />
          {!isLoginMode && (
            <input type="text" placeholder="이름 (표시용)" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
          {!isLoginMode && (
            <input type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
          )}
          <button type="submit" className="primary mt-3 w-100">
            {isLoginMode ? '로그인' : '가입하기'}
          </button>
        </form>
        <div className="text-center mt-3">
          <button className="text-link" onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
