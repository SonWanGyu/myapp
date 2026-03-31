import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="animate-fade-in">
        <h2 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🚧</h2>
        <h1 style={{ color: '#0f172a', marginBottom: '1rem' }}>해당 화면은 아직 구성 중입니다!</h1>
        <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '2rem' }}>
          곧 멋진 기능으로 찾아올게요.
        </p>
        <Link href="/">
          <button className="primary">홈으로 돌아가기</button>
        </Link>
      </div>
    </div>
  );
}
