"use client";
import { useState } from 'react';

import SidebarChat from './components/SidebarChat';
import MainPreview from './components/MainPreview';

export default function Home() {
  // Sidebar state lifted up
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(400); // px

  // Handler to update sidebar width
  const handleSidebarResize = (width: number) => setSidebarWidth(width);
  // Handler to open/close sidebar
  const handleSidebarOpen = (open: boolean) => setSidebarOpen(open);

  // Main content style
  const mainStyle = {
    marginLeft: sidebarOpen ? sidebarWidth : 0,
    transition: 'margin-left 0.2s cubic-bezier(.4,1.2,.4,1)',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen ">
      <main
        className="  mx-auto min-h-screen "
        style={mainStyle}
      >



        <MainPreview />
      </main>
      <SidebarChat
        isOpen={sidebarOpen}
        width={sidebarWidth}
        onResize={handleSidebarResize}
        onOpenChange={handleSidebarOpen}
      />
    </div>
  );
}