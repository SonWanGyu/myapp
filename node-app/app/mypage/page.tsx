'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useAlert } from '../context/AlertContext';

export default function MyPage() {
  const { currentUser, isInitializing, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  
  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        showAlert('로그인이 필요합니다.');
        router.push('/login');
      } else if (currentUser) {
        setName(currentUser.name);
      }
    }
  }, [isInitializing, isAuthenticated, currentUser]);

  const handleUpdate = async () => {
    try {
      const url = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/users/me`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email: currentUser?.email })
      });
      if (res.ok) {
        showAlert('정보가 수정되었습니다. 다시 로그인 해 주세요.');
        logout(); // Token 갱신을 위해 로그아웃 유도
      } else {
        showAlert('수정 실패');
      }
    } catch (e) {
      console.error(e);
      showAlert('오류 발생');
    }
  };

  if (isInitializing || !currentUser) return <div className="text-center mt-5">로딩 중...</div>;

  return (
    <div className="container animate-fade-in mypage-container">
      <div className="card">
         <h2 className="page-title center">👤 마이페이지</h2>
         
         <div className="form-group mt-3">
           <label className="fw-500">이메일 (변경 불가)</label>
           <input type="text" value={currentUser.email} disabled className="input-disabled" />
         </div>

         <div className="form-group mt-3">
           <label className="fw-500">이름 (변경 불가)</label>
           <input type="text" value={name} disabled className="input-disabled" />
         </div>
         
         <div className="text-center mt-4">
           <button className="secondary w-100" onClick={() => router.push('/')}>홈으로 돌아가기</button>
         </div>
      </div>
    </div>
  );
}
