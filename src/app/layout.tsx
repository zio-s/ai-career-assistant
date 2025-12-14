import type { Metadata } from 'next';
import { Noto_Sans_KR, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'AI 커리어 어시스턴트 | 자소서 생성 & 첨삭',
  description:
    'AI가 도와주는 취업 준비. 자소서 생성/첨삭, 이력서 분석, 면접 예상 질문까지.',
  keywords: ['자소서', '이력서', '취업', 'AI', '면접', '자기소개서'],
  authors: [{ name: '변세민' }],
  openGraph: {
    title: 'AI 커리어 어시스턴트',
    description: 'AI가 도와주는 취업 준비',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
