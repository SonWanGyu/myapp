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
      <section className="hero-section">
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
            <p>어떤 여행 취향이든 TravelVibe에게 간단히 알려만 주세요. TravelVibe AI는 여러분의 취향에 꼭 맞는 일정을 추천해 드립니다.</p>
            <button className="ai-btn-new" onClick={() => router.push('/planner')}>AI일정 만들어보기</button>
          </div>
          
          <div className="ai-visual-content">
            {/* Style Selection Card */}
            <div className="floating-card style-card">
              <div className="card-title-flex">
                <span className="card-icon-sm">🎨</span>
                <h3 className="m-0">원하시는 여행 테마(스타일)를 골라주세요.</h3>
              </div>
              <div className="chip-container">
                <div className="chip active">휴양</div>
                <div className="chip">액티비티</div>
                <div className="chip">먹방</div>
                <div className="chip">쇼핑</div>
                <div className="chip">자연</div>
                <div className="chip">유명 관광지</div>
                <div className="chip">역사/문화</div>
              </div>
            </div>

            {/* Itinerary Result Card */}
            <div className="floating-card result-card">
              <div className="result-header">
                <div className="result-avatar-wrapper">
                  <img src="/travel_photo.png" alt="Destination View" className="img-full-cover" />
                </div>
                <h3>다낭, 3박 4일<br/><span>추천일정</span>입니다.</h3>
                <p className="result-footer-p">TravelVibe가 알려준 맞춤일정으로 여행을 떠나보세요.</p>
              </div>
              <img src="/travel_map.png" className="map-img" alt="Travel Route Map" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
