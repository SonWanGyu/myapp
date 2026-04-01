'use client';

import { useEffect, useState } from 'react';
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
  const { showAlert } = useAlert();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [tab, setTab] = useState<'UPCOMING'|'PAST'>('UPCOMING');

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        showAlert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      fetchItineraries();
    }
  }, [isInitializing, isAuthenticated]);

  const fetchItineraries = async () => {
    try {
      const url = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/itineraries`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        setItineraries(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
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
               <div key={it.id} className="card" style={{ padding: '1.5rem' }}>
                 <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>{it.title}</h3>
                 <p className="text-muted">🗓️ {it.startDate} ~ {it.endDate}</p>
                 <button className="secondary mt-3 w-100" onClick={() => router.push(`/my-itinerary/${it.id}`)}>일정 상세 보기</button>
               </div>
             ))}
          </div>
       )}
    </div>
  );
}
