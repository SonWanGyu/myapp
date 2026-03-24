'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function BoardDetail() {
  const [board, setBoard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const { currentUser, isInitializing } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const API_URL = 'http://localhost:8081/api/boards';

  useEffect(() => {
    if (id) fetchBoardDetail(id);
  }, [id]);

  const fetchBoardDetail = async (boardId) => {
    try {
      const res = await fetch(`${API_URL}/${boardId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('게시글을 불러올 수 없습니다.');
      const data = await res.json();
      setBoard(data);
      setFormData({ title: data.title, content: data.content });
    } catch (e) {
      alert(e.message);
      router.push('/');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...board, title: formData.title, content: formData.content }),
        credentials: 'include'
      });
      if (res.ok) {
        setIsEditing(false);
        fetchBoardDetail(id);
      } else {
        alert('수정 실패! 권한이 없거나 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        router.push('/');
      } else {
        alert('삭제 실패! 권한이 없거나 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isInitializing || !board) return <div className="text-center mt-5 text-muted">로딩 중...</div>;

  const canEditOrDelete = currentUser && (board.authorEmail === currentUser.email || currentUser.role === 'ADMIN');

  return (
    <div className="container animate-fade-in">
      <div className="card">
        
        {isEditing ? (
          <form onSubmit={handleUpdate} className="form-group">
            <h2 className="page-title">✏️ 게시글 수정</h2>
            <input type="text" placeholder="제목" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <textarea placeholder="내용" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => setIsEditing(false)}>취소</button>
              <button type="submit" className="primary">수정 완료</button>
            </div>
          </form>
        ) : (
          <>
            <div className="detail-meta">
              <h2 className="detail-title">📄 {board.title}</h2>
              <div className="flex-between w-100">
                <span className="detail-author">작성자: {board.author}</span>
                <span>{new Date(board.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="detail-content">
              {board.content}
            </div>
            
            <div className="detail-footer">
              <button className="secondary" onClick={() => router.push('/')}>목록으로</button>
              {canEditOrDelete && (
                <div className="flex-gap">
                  <button className="secondary" onClick={() => setIsEditing(true)}>수정</button>
                  <button className="danger" onClick={handleDelete}>삭제</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
