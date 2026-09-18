"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  adminTabItem,
  isItemActive,
  mainNavItems,
} from "@/components/layout/nav-items";
import { useAuth } from "@/components/providers/auth-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items =
    user?.role === "ADMIN" ? [...mainNavItems, adminTabItem] : mainNavItems;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <div
        className="grid pb-[env(safe-area-inset-bottom)]"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => {
          const active = isItemActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-none text-[10px] leading-none font-medium text-muted-foreground transition-colors hover:text-foreground",
                active && "text-primary"
              )}
            >
              <item.icon className={cn("size-5", active && "fill-current")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}