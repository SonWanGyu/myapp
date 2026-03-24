'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function WriteBoard() {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const { currentUser, isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();
  const API_URL = `http://${window.location.hostname}:8080/api/boards`;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      alert('로그인이 필요합니다.');
      router.push('/login');
    }
  }, [isInitializing, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: formData.title, 
          content: formData.content, 
          author: currentUser.name,
          authorEmail: currentUser.email
        }),
        credentials: 'include'
      });
      if (res.ok) {
        router.push('/');
      } else {
        throw new Error('작성 실패');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  if (isInitializing || !isAuthenticated) return null;

  return (
    <div className="container animate-fade-in">
      <div className="card">
        <form onSubmit={handleSubmit} className="form-group">
          <h2 className="page-title">✨ 새 글 작성</h2>
          <input type="text" placeholder="제목" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          <textarea placeholder="내용" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => router.push('/')}>취소</button>
            <button type="submit" className="primary">작성 완료</button>
          </div>
        </form>
      </div>
    </div>
  );
}
