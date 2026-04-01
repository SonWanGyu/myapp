'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

interface Place { name: string; description: string; lat?: number; lng?: number; }
interface PlanDay { day: string; places: Place[]; }
interface PlanResult { title: string; days: PlanDay[]; }
interface Itinerary {
  id: number; title: string; startDate: string; endDate: string;
  scheduleJson: string;
}

function calcDistance(lat1?: number, lng1?: number, lat2?: number, lng2?: number): string {
  if (!lat1 || !lng1 || !lat2 || !lng2) return '';
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
}

function getMapSrc(p: Place, fallback: string) {
  if (p.lat && p.lng) return `https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&ie=UTF8&iwloc=&output=embed`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(p.name || fallback)}&z=15&ie=UTF8&iwloc=&output=embed`;
}

export default function ItineraryDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();
  const { showAlert } = useAlert();

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [schedule, setSchedule] = useState<PlanResult | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState('');

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        showAlert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      fetchItinerary();
    }
  }, [isInitializing, isAuthenticated]);

  const fetchItinerary = async () => {
    try {
      const url = `http://${window.location.hostname}:8080/api/itineraries/${id}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) { showAlert('일정을 불러올 수 없습니다.'); router.push('/my-itinerary'); return; }
      const data: Itinerary = await res.json();
      setItinerary(data);
      try {
        const parsed = JSON.parse(data.scheduleJson);
        setSchedule(parsed);
        if (parsed.days?.[0]?.places?.[0]) setSelectedPlace(parsed.days[0].places[0].name);
      } catch { /* parse error */ }
    } catch (e) {
      console.error(e);
      showAlert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  if (isInitializing || !itinerary || !schedule) {
    return (
      <div className="container animate-fade-in text-center" style={{ paddingTop: '4rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <h2>일정을 불러오는 중...</h2>
      </div>
    );
  }

  const activeDay = schedule.days[selectedDayIdx] || schedule.days[0];
  const totalDays = schedule.days.length;
  const selectedP = activeDay.places.find(p => p.name === selectedPlace) || activeDay.places[0];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      {/* 왼쪽 패널 - 일정 목록 */}
      <div style={{
        width: '340px', minWidth: '300px', maxWidth: '340px', height: '100%', overflowY: 'auto',
        backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', padding: '20px',
        fontSize: '0.88rem',
      }}>
        {/* 뒤로가기 */}
        <button
          onClick={() => router.push('/my-itinerary')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '12px', padding: 0 }}
        >
          ← 내 일정 목록
        </button>

        {/* 여행 정보 */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>AI 추천 여행</span>
          <h2 style={{ margin: '4px 0 4px 0', color: '#1e293b', fontSize: '1.2rem', lineHeight: 1.3 }}>{itinerary.title}</h2>
          <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '600' }}>
            📅 {itinerary.startDate} ~ {itinerary.endDate}
          </p>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{totalDays}일 일정</span>
        </div>

        {/* Day 탭 */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {schedule.days.map((d, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDayIdx(i); setSelectedPlace(schedule.days[i].places[0]?.name || ''); }}
              style={{
                padding: '5px 12px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '600',
                border: 'none', cursor: 'pointer',
                backgroundColor: selectedDayIdx === i ? 'var(--primary)' : '#f1f5f9',
                color: selectedDayIdx === i ? '#fff' : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              {d.day}
            </button>
          ))}
        </div>

        {/* 타임라인 장소 목록 */}
        <div style={{ position: 'relative', paddingLeft: '28px' }}>
          <div style={{
            position: 'absolute', left: '12px', top: 0, bottom: 0, width: '2px',
            background: 'linear-gradient(to bottom, var(--primary), #c7d2fe)',
          }} />

          {activeDay.places.map((p, j) => {
            const dist = j > 0 ? calcDistance(activeDay.places[j - 1].lat, activeDay.places[j - 1].lng, p.lat, p.lng) : '';
            return (
              <div key={j}>
                {/* 거리 표시 */}
                {dist && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    🚶 {dist}
                  </div>
                )}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  {/* 번호 */}
                  <div style={{
                    position: 'absolute', left: '-28px', top: '8px', width: '22px', height: '22px',
                    borderRadius: '50%',
                    backgroundColor: selectedPlace === p.name ? 'var(--primary)' : '#818cf8',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: '700', zIndex: 1,
                    boxShadow: '0 2px 6px rgba(99,102,241,0.35)',
                  }}>
                    {j + 1}
                  </div>

                  {/* 카드 */}
                  <div
                    onClick={() => setSelectedPlace(p.name)}
                    style={{
                      padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                      backgroundColor: selectedPlace === p.name ? '#eef2ff' : '#f8fafc',
                      border: selectedPlace === p.name ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                      transition: 'all 0.15s',
                    }}
                  >
                    <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.85rem', marginBottom: '2px' }}>
                      {p.name}
                    </strong>
                    <span style={{ color: '#64748b', fontSize: '0.73rem', lineHeight: 1.4, display: 'block' }}>
                      {p.description}
                    </span>
                    {selectedPlace === p.name && (
                      <span style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                        📍 지도에서 보기
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 오른쪽 패널 - 지도 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          allowFullScreen
          src={selectedP ? getMapSrc(selectedP, itinerary.title) : `https://maps.google.com/maps?q=${encodeURIComponent(itinerary.title)}&z=13&output=embed`}
        />

        {/* 하단 Day 탭 + 선택된 장소 카드 오버레이 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(255,255,255,0.95) 30%)',
          padding: '40px 20px 16px 20px',
        }}>
          {/* Day 하단 탭 */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto' }}>
            {schedule.days.map((d, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDayIdx(i); setSelectedPlace(schedule.days[i].places[0]?.name || ''); }}
                style={{
                  padding: '6px 16px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: '600',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  backgroundColor: selectedDayIdx === i ? 'var(--primary)' : 'rgba(241,245,249,0.9)',
                  color: selectedDayIdx === i ? '#fff' : '#64748b',
                }}
              >
                {d.day}
              </button>
            ))}
          </div>

          {/* 선택된 장소 카드 */}
          {selectedPlace && (
            <div style={{
              backgroundColor: '#fff', borderRadius: '12px', padding: '12px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>
                📍
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.9rem' }}>{selectedPlace}</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  {activeDay.places.find(p => p.name === selectedPlace)?.description || ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
