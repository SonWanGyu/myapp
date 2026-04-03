'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { useAlert } from './context/AlertContext';

export default function Home() {
  const { isInitializing, isAuthenticated, currentUser } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && isAuthenticated && currentUser?.passwordPromptStatus === 'REQUIRED') {
      router.push('/change-password');
    }
  }, [isInitializing, isAuthenticated, currentUser, router]);

  if (isInitializing) return null;

  return (
    <div className="home-container">
      {/* Section 2: 간단한 소개 화면 (Hero) */}
      <section className="hero-section" style={{ backgroundImage: "url('/aurora.png')" }}>
        <div className="hero-overlay"></div>
        <div className="hero-content animate-fade-in">
          <h2>AI와 함께 일정을 만드는 TravelVibe</h2>
          <p>꿈꾸던 여행을 현실로 만들어보세요</p>
        </div>
      </section>

      {/* Section 3: AI 추천 맞춤일정에 대한 소개 화면 (New Redesign) */}
      <section className="ai-section-new">
        <div className="ai-container">
          <div className="ai-text-content animate-fade-in">
            <h2>어떤 취향이든, 다 맞춰주니까</h2>
            <p>어떤 여행 취향이든 트리플에게 간단히 알려만 주세요. 트리플 AI는 여러분의 취향에 꼭 맞는 일정을 추천해 드립니다.</p>
            <button className="ai-btn-new" onClick={() => router.push('/planner')}>AI일정 만들어보기</button>
          </div>
          
          <div className="ai-visual-content">
            {/* Style Selection Card */}
            <div className="floating-card style-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>📷</span>
                <h3 style={{ margin: 0 }}>내가 선호하는 여행 스타일은?</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '-8px', marginBottom: '16px' }}>다중 선택이 가능해요.</p>
              <div className="chip-container">
                <div className="chip">유명 관광지 필수</div>
                <div className="chip active">SNS 핫플레이스</div>
                <div className="chip active">여유롭게 힐링</div>
                <div className="chip">문화·예술·역사</div>
                <div className="chip">관광보다 먹방</div>
              </div>
            </div>

            {/* Itinerary Result Card */}
            <div className="floating-card result-card">
              <div className="result-header">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px' }}>
                  <img src="/danang_view.png" alt="Da Nang" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3>다낭, 3박 4일<br/><span>추천일정</span>입니다.</h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>트리플이 알려준 맞춤일정으로 여행을 떠나보세요.</p>
              </div>
              <img src="/city_map_ui.png" className="map-img" alt="Map View" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
