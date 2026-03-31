'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const { isInitializing, isAuthenticated, currentUser } = useAuth();
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

      {/* Section 3: AI 추천 맞춤일정에 대한 소개 화면 */}
      <section className="ai-section" style={{ backgroundImage: "url('/ai_vibe.png')" }}>
        <div className="ai-overlay"></div>
        <div className="ai-content">
          <h2>취향에 맞게 일정을 추천해 드립니다</h2>
          <p>복잡한 계획은 AI에게 맞기고, 여행의 즐거움만 누리세요.</p>
          <button className="primary ai-btn" onClick={() => alert('신규 기능 준비 중입니다!')}>바로 추천받기</button>
        </div>
      </section>
    </div>
  );
}
