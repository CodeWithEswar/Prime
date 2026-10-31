"use client";

import * as React from "react";
import { DesignSystemHeader } from "@/components/design-system/shell/header";
import { DesignSystemSidebar } from "@/components/design-system/shell/sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#ff0000] selection:text-white">
      {/* Sticky Header */}
      <DesignSystemHeader
        onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
        isMobileNavOpen={mobileNavOpen}
      />

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-[1920px] flex-1 px-4 sm:px-6">
        {/* Left Desktop Sidebar (256px wide, sticky, custom scrollbar) */}
        <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 py-4 border-r border-[rgba(255,255,255,0.08)]">
          <DesignSystemSidebar />
        </aside>

        {/* Mobile Navigation Drawer Sheet */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="left"
            className="w-72 bg-[#000000] border-r border-[rgba(255,255,255,0.12)] p-0"
          >
            <SheetHeader className="p-4 border-b border-[rgba(255,255,255,0.08)]">
              <SheetTitle className="text-xs font-mono uppercase text-[#ff0000] tracking-wider">
                PRIME Design System
              </SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-5rem)] px-2">
              <DesignSystemSidebar onItemClick={() => setMobileNavOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 py-8 lg:pl-8">{children}</main>
      </div>
    </div>
  );
}
