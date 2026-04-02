'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useAlert } from '../context/AlertContext';
import Link from 'next/link';

interface Itinerary {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  scheduleJson: string; // Parse it if needed
}

export default function MyItineraryPage() {
  const { isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [tab, setTab] = useState<'UPCOMING'|'PAST'>('UPCOMING');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchItineraries = useCallback(async () => {
    try {
      const url = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/itineraries`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.status === 401) return;
      if (res.ok) {
        setItineraries(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/login');
    }
    if (!isInitializing && isAuthenticated) {
      fetchItineraries();
    }

    // 메뉴 팝업 외의 영역 클릭 시 닫기
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isInitializing, isAuthenticated, fetchItineraries, router]);

  const deleteItinerary = (id: number) => {
    showConfirm('이 일정을 정말 삭제하시겠습니까?', async () => {
      try {
        const url = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/itineraries/${id}`;
        const res = await fetch(url, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (res.ok) {
          showAlert('일정이 삭제되었습니다.');
          fetchItineraries();
        } else {
          showAlert('삭제 실패!');
        }
      } catch (e) {
        console.error(e);
        showAlert('삭제 중 오류 발생');
      }
    });
  };

  if (isInitializing) return <div className="text-center mt-5">로딩 중...</div>;

  const today = new Date().toISOString().split('T')[0];
  const upcoming = itineraries.filter(i => i.startDate >= today);
  const past = itineraries.filter(i => i.startDate < today);

  const displayList = tab === 'UPCOMING' ? upcoming : past;

  return (
    <div className="container animate-fade-in">
       <h2 className="page-title">📅 내 일정 관리</h2>
       
       <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <button 
             className={tab === 'UPCOMING' ? 'primary' : 'secondary'} 
             style={{ borderRadius: '20px' }}
             onClick={() => setTab('UPCOMING')}
          >다가오는 일정 ({upcoming.length})</button>
          
          <button 
             className={tab === 'PAST' ? 'primary' : 'secondary'} 
             style={{ borderRadius: '20px' }}
             onClick={() => setTab('PAST')}
          >지난 일정 ({past.length})</button>
       </div>

       {displayList.length === 0 ? (
          <div className="text-center p-3 card">
             <h3 className="text-muted">일정이 없습니다.</h3>
             <Link href="/planner">
               <button className="primary mt-3">✨ 새 일정 만들기</button>
             </Link>
          </div>
       ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
             {displayList.map(it => (
               <div key={it.id} className="card" style={{ padding: '1.5rem', position: 'relative' }}>
                 {/* 햄버거 메뉴 버튼 */}
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setOpenMenuId(openMenuId === it.id ? null : it.id);
                   }}
                   style={{
                     position: 'absolute', top: '15px', right: '15px',
                     background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8'
                   }}
                 >
                   ⋮
                 </button>

                 {/* 메뉴 드롭다운 */}
                 {openMenuId === it.id && (
                   <div style={{
                     position: 'absolute', top: '40px', right: '15px',
                     backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '100px',
                     overflow: 'hidden'
                   }}>
                     <button
                       onClick={() => deleteItinerary(it.id)}
                       style={{
                         width: '100%', padding: '10px 15px', border: 'none', background: 'none',
                         textAlign: 'left', cursor: 'pointer', color: '#ef4444', fontSize: '0.85rem'
                       }}
                     >
                       🗑️ 일정 삭제
                     </button>
                   </div>
                 )}

                 <h3 style={{ margin: '0 0 10px 0', paddingRight: '20px', color: 'var(--primary)', wordBreak: 'keep-all' }}>
                    {it.title}
                 </h3>
                 <p className="text-muted" style={{ fontSize: '0.9rem' }}>🗓️ {it.startDate} ~ {it.endDate}</p>
                 <button className="secondary mt-3 w-100" onClick={() => router.push(`/my-itinerary/${it.id}`)}>일정 상세 보기</button>
               </div>
             ))}
          </div>
       )}
    </div>
  );
}
