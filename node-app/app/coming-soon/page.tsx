import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="coming-soon-bg">
      <div className="animate-fade-in">
        <h2 className="fs-3 m-0">🚧</h2>
        <h1 className="color-slate-900 mb-line">해당 화면은 아직 구성 중입니다!</h1>
        <p className="text-muted fs-1-2 mb-2rem">
          곧 멋진 기능으로 찾아올게요.
        </p>
        <Link href="/">
          <button className="primary">홈으로 돌아가기</button>
        </Link>
      </div>
    </div>
  );
}
