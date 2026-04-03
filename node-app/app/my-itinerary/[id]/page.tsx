'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { Place, PlanDay, PlanResult, Itinerary } from '../../types';

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

// 장소명에서 영어명(괄호 안)을 추출하여 더 정확한 검색 수행
function extractSearchName(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  if (match) return match[1].trim();
  return name;
}

// 여행 제목([후쿠오카] 등)에서 도시 힌트를 추출하는 함수
function extractCityHint(title: string): string {
  const match = title.match(/\[([^\]]+)\]/) || title.match(/^([^\s&]+)/);
  return match ? match[1] : '';
}

function getMapSrc(p: Place, fallback: string) {
  const searchName = extractSearchName(p.name);
  const cityHint = extractCityHint(fallback);
  const query = encodeURIComponent(`${searchName} ${cityHint}`.trim());
  return `https://maps.google.com/maps?q=${query}&z=15&ie=UTF8&iwloc=A&output=embed`;
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

  const fetchItinerary = useCallback(async () => {
    if (!id) return;
    try {
      const url = `http://${window.location.hostname}:8080/api/itineraries/${id}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.status === 401) return;
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
  }, [id, router, showAlert]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/login');
    }
    if (!isInitializing && isAuthenticated) {
      fetchItinerary();
    }
  }, [isInitializing, isAuthenticated, fetchItinerary, router]);

  if (isInitializing || !itinerary || !schedule) {
    return (
      <div className="centered-full-page animate-fade-in">
        <div className="text-center">
          <div className="fs-3 mb-line">🚀</div>
          <h2 className="color-slate-800">일정을 불러오는 중...</h2>
          <p className="text-muted">잠시만 기다려주세요!</p>
        </div>
      </div>
    );
  }

  const activeDay = schedule.days[selectedDayIdx] || schedule.days[0];
  const totalDays = schedule.days.length;
  const selectedP = activeDay.places.find(p => p.name === selectedPlace) || activeDay.places[0];

  return (
    <div className="detail-page-wrapper">
      {/* 왼쪽 패널 */}
      <div className="left-panel">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.push('/my-itinerary')}
          className="back-link-btn"
        >
          ← 내 일정 목록
        </button>

        {/* 여행 정보 */}
        <div className="itinerary-info-box">
          <div className="flex-between mb-line">
            <span className="user-badge-light">AI 맞춤 추천</span>
            <span className="fs-0-8 color-slate-400">{totalDays}일 일정</span>
          </div>
          <h2 className="itinerary-title-lg">{itinerary.title}</h2>
          <p className="itinerary-date-p">
            {itinerary.startDate} ~ {itinerary.endDate}
          </p>
        </div>

        {/* Day 탭 */}
        <div className="flex-wrap flex-gap-5 mb-1">
          {schedule.days.map((d, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDayIdx(i); setSelectedPlace(schedule.days[i].places[0]?.name || ''); }}
              className={`day-tab-btn ${selectedDayIdx === i ? 'primary' : 'secondary border-none bg-slate-100 color-slate-500'} p-0-5-1-2 fs-0-78`}
            >
              {d.day}
            </button>
          ))}
        </div>

        {/* 타임라인 장소 목록 */}
        <div className="timeline-mini">
          <div className="timeline-mini-line" />

          {activeDay.places.map((p, j) => {
            const dist = j > 0 ? calcDistance(activeDay.places[j - 1].lat, activeDay.places[j - 1].lng, p.lat, p.lng) : '';
            return (
              <div key={j}>
                {/* 거리 표시 (트리플 스타일) */}
                {dist && (
                  <div className="distance-badge-container py-line">
                    <div className="distance-dash" />
                    <span className="distance-badge">
                      🚶 {dist}
                    </span>
                  </div>
                )}

                <div className="relative mb-line">
                  {/* 번호 */}
                  <div 
                    className="timeline-mini-node"
                    style={{ backgroundColor: selectedPlace === p.name ? 'var(--primary)' : '#818cf8', color: '#fff' }}
                  >
                    {j + 1}
                  </div>

                  {/* 카드 */}
                  <div
                    onClick={() => setSelectedPlace(p.name)}
                    className={`itinerary-card-sm ${selectedPlace === p.name ? 'active' : ''}`}
                  >
                    <strong className="block color-slate-800 fs-0-85 mb-line lh-1-4">
                      {p.name}
                    </strong>
                    <span className="color-slate-500 fs-0-75 lh-1-5 block word-keep-all">
                      {p.description}
                    </span>
                    {selectedPlace === p.name && (
                      <span className="color-primary fs-0-72 fw-600 mt-line block">
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

      {/* 오른쪽 패널 - 지도 + 정보 바 */}
      <div className="right-panel">
        <div className="flex-1 relative">
          <iframe
            key={selectedPlace}
            width="100%"
            height="100%"
            className="border-none block"
            loading="lazy"
            allowFullScreen
            src={selectedP ? getMapSrc(selectedP, itinerary.title) : `https://maps.google.com/maps?q=${encodeURIComponent(itinerary.title)}&z=13&output=embed`}
          />
        </div>

        {/* 하단 상세 정보 영역 (스크린샷 스타일 반영) */}
        <div className="p-1 border-t border-slate-200 shadow-sm-soft">
          {/* Day 탭 */}
          <div className="day-tab-container">
            {schedule.days.map((d, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDayIdx(i); setSelectedPlace(schedule.days[i].places[0]?.name || ''); }}
                className={`day-tab-btn ${selectedDayIdx === i ? 'primary' : 'secondary shadow-none border-slate-200 color-slate-500 bg-white'}`}
              >
                {d.day}
              </button>
            ))}
          </div>

          {/* 선택된 장소 정보 카드 */}
          {selectedPlace && (
            <div className="place-detail-card animate-fade-in shadow-sm border-slate-100">
              <div className="place-icon-box">
                <span className="fs-1-3">📍</span>
              </div>
              <div className="flex-1">
                <strong className="block color-slate-800 fs-0-98 mb-line">
                  {selectedPlace}
                </strong>
                <p className="color-slate-500 fs-0-82 m-0 lh-1-5 word-keep-all">
                  {activeDay.places.find(p => p.name === selectedPlace)?.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
