'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { login, isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();

  const USER_API_URL = 'http://localhost:8081/api/users';

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isInitializing, router]);

  const handleSubmit = async (e) => {
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
           router.push('/');
        }
      } catch (err) {
        alert(err.message);
      }
    } else {
      try {
        const res = await fetch(USER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        if (!res.ok) throw new Error('회원가입 실패 (이미 존재하는 이메일일 수 있습니다)');
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        setIsLoginMode(true);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (isInitializing || isAuthenticated) return null;

  return (
    <div className="login-container animate-fade-in">
      <h2 className="page-title center">
        {isLoginMode ? '🔑 로그인' : '📝 회원가입'}
      </h2>
      <form onSubmit={handleSubmit} className="form-group">
        <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required />
        {!isLoginMode && (
          <input type="text" placeholder="이름 (표시용)" value={name} onChange={e => setName(e.target.value)} required />
        )}
        <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="primary mt-3">
          {isLoginMode ? '로그인' : '가입하기'}
        </button>
      </form>
      <div className="text-center mt-3">
        <button className="text-link" onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
    </div>
  );
}
