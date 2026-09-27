"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { WeaveSpinner } from "@/components/ui/weave-spinner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { useAuth } from "@/components/providers/auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  if (isPending || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <WeaveSpinner />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col px-4 pt-4 pb-24 sm:px-6 md:px-8 md:pt-6 md:pb-8">
            {children}
          </div>
        </SidebarInset>
        <BottomNav />
        <InstallPrompt />
      </SidebarProvider>
    </TooltipProvider>
  );
}