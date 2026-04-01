import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Header from './components/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TravelVibe',
  description: 'AI와 함께 일정을 만드는 TravelVibe',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <AlertProvider>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
