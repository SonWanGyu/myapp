import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';

export const metadata = {
  title: '리액트 자유게시판',
  description: 'Next.js 자유게시판 설계',
};

export default function RootLayout({ children }) {
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
