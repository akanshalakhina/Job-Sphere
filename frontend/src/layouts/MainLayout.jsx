import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { DockNavigation } from '../components/DockNavigation';
import { FloatingChatbot } from '../components/FloatingChatbot';
import { CommandPalette } from '../components/CommandPalette';
import { Footer } from '../components/Footer';

export const MainLayout = ({ children }) => {
  const { pathname } = useLocation();

  // Scroll to top on path change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Determine if this is an authenticating page (Login/Register) where we don't want standard elements
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Background Mesh Glows */}
      <div className="glow-mesh glow-blue top-[-10%] left-[-20%] w-[80%] h-[70%]" />
      <div className="glow-mesh glow-purple bottom-[-10%] right-[-20%] w-[80%] h-[70%]" />

      {!isAuthPage && <Navbar />}
      
      <main className={`flex-1 flex flex-col relative z-10 ${isAuthPage ? '' : 'pb-20 md:pb-28'}`}>
        {children}
      </main>

      {!isAuthPage && (
        <>
          <Footer />
          <DockNavigation />
          <FloatingChatbot />
          <CommandPalette />
        </>
      )}
    </div>
  );
};
