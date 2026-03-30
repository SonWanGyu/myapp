import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '리액트 자유게시판',
  description: 'Next.js 자유게시판 설계',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
