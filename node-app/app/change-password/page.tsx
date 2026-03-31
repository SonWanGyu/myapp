'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/users/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('비밀번호 변경 실패');
      
      alert('비밀번호가 성공적으로 변경되었습니다!');
      window.location.href = '/';
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch(`http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/users/password-prompt/dismiss`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      window.location.href = '/';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundImage: "url('/ai_vibe.png')", backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="travel-login-container animate-fade-in" style={{ maxWidth: '500px' }}>
        <h2 className="page-title center">🛡️ 보안 업데이트</h2>
        <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: '1.6' }}>
          회원가입 후 오랜 시간이 지났습니다.<br/>
          안전한 TravelVibe 서비스 이용을 위해 비밀번호를 변경해주세요.<br/>
          (이전과 동일한 비밀번호도 사용 가능합니다.)
        </p>
        <form onSubmit={handlePasswordChange} className="form-group">
          <input 
            type="password" 
            placeholder="새로운 비밀번호" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            required 
            minLength={4}
          />
          <input 
            type="password" 
            placeholder="새로운 비밀번호 확인" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            minLength={4}
          />
          <button type="submit" className="primary w-100" disabled={isLoading}>
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
          <button type="button" className="secondary w-100 mt-3" onClick={handleDismiss} style={{ padding: '1rem', borderRadius: '12px' }}>
            다음에 변경하기
          </button>
        </form>
      </div>
    </div>
  );
}
