import type { Metadata } from 'next';
import './globals.css';
import { ConfigProvider } from 'antd';

export const metadata: Metadata = {
  title: 'Production Orders System',
  description: 'Mini Production Orders SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}
