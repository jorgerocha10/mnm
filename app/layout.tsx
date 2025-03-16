import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maps & Memories',
  description: 'Turn Your Special Places into Lasting Memories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script id="crisp-chat" strategy="afterInteractive">
          {`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="be4d63ac-b393-46e2-8855-32ef754c4328";
            (function(){
              d=document;
              s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>{children}</body>
    </html>
  );
} 