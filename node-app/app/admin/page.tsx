'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '../types';
import { useAlert } from '../context/AlertContext';

export default function AdminPage() {
  const { currentUser, isInitializing, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();
  const USER_API_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/users`;

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }
      if (currentUser?.role !== 'ADMIN') {
        showAlert('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      }
      fetchUsers();
    }
  }, [isInitializing, isAuthenticated, currentUser, router]);

  const fetchUsers = async (): Promise<void> => {
    try {
      const res = await fetch(USER_API_URL, { credentials: 'include' });
      if (!res.ok) throw new Error('회원 목록을 못 가져왔습니다.');
      setUsers(await res.json());
    } catch (e) {
      console.error(e);
      showAlert((e as Error).message);
    }
  };

  const handleDeleteUser = (id: number, name: string): void => {
    showConfirm(`정말 '${name}' 회원을 탈퇴시키겠습니까?`, async () => {
      try {
        const res = await fetch(`${USER_API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error('삭제 실패');
        setUsers(users.map((u: any) => u.id === id ? { ...u, status: 'DELETED' } : u));
      } catch (e) {
        showAlert((e as Error).message);
      }
    });
  };

  const handleRestoreUser = (id: number, name: string): void => {
    showConfirm(`'${name}' 회원의 계정을 복구하시겠습니까?`, async () => {
      try {
        const res = await fetch(`${USER_API_URL}/${id}/restore`, { method: 'PUT', credentials: 'include' });
        if (!res.ok) throw new Error('복구 실패');
        setUsers(users.map((u: any) => u.id === id ? { ...u, status: 'ACTIVE' } : u));
      } catch (e) {
        showAlert((e as Error).message);
      }
    });
  };

  if (isInitializing || !currentUser || currentUser.role !== 'ADMIN') {
    return <div className="text-center mt-5 text-muted">권한 확인 중...</div>;
  }

  return (
    <div className="container animate-fade-in">
      <div className="card-no-padding">
        <div className="card-header">
          <h2 className="page-title m-0">👑 회원 관리 대시보드</h2>
          <Link href="/">
            <button className="secondary">홈으로</button>
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>권한</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: User & { status?: string }) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td className="fw-500">{u.name}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span className={u.role === 'ADMIN' ? 'admin-badge-light' : 'user-badge-light'}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span style={{ color: u.status === 'DELETED' ? 'red' : 'green', fontWeight: 'bold' }}>
                    {u.status === 'DELETED' ? '탈퇴' : '정상'}
                  </span>
                </td>
                <td>
                  {u.email !== currentUser.email && u.status !== 'DELETED' && (
                    <button className="danger" onClick={() => handleDeleteUser(u.id, u.name)}>탈퇴 처리</button>
                  )}
                  {u.email !== currentUser.email && u.status === 'DELETED' && (
                    <button className="primary" onClick={() => handleRestoreUser(u.id, u.name)}>✅ 복구</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
