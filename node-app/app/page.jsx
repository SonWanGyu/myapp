'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const [boards, setBoards] = useState([]);
  const API_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/boards`;
  const { isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        window.location.href = '/login';
      } else {
        fetchBoards();
      }
    }
  }, [isInitializing, isAuthenticated, router]);

  const fetchBoards = async () => {
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      if (res.ok) setBoards(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  if (isInitializing || !isAuthenticated) return null;

  return (
    <div className="container animate-fade-in">
      <div className="card-no-padding">
        <table className="table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {boards.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted p-3">등록된 게시글이 없습니다.</td>
              </tr>
            ) : (
              boards.map(board => (
                <tr key={board.id} className="clickable" onClick={() => router.push(`/board/${board.id}`)}>
                  <td>{board.id}</td>
                  <td className="fw-500">{board.title}</td>
                  <td className="text-muted">{board.author}</td>
                  <td className="text-muted">{new Date(board.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
