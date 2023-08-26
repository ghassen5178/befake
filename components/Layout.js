import Head from 'next/head';
import { useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Your global styles here */
`;

export default function Layout({ children }) {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <>
      <Head>
        <title>Bepunti</title>
      </Head>
      <GlobalStyle />
      <div className="flex flex-col overflow-auto w-full min-h-screen h-full lg:max-w-xl mx-auto">
        {/* ... rest of your component */}
      </div>
    </>
  );
}
