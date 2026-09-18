"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SubjectSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const urlQuery = useSearchParams().get("q") ?? "";
  const [draft, setDraft] = React.useState(urlQuery);
  const [prevQuery, setPrevQuery] = React.useState(urlQuery);

  if (prevQuery !== urlQuery) {
    setPrevQuery(urlQuery);
    setDraft(urlQuery);
  }

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      const query = draft.trim();
      if (query === urlQuery.trim()) return;
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);
    return () => window.clearTimeout(id);
  }, [draft, urlQuery, pathname, router]);

  return (
    <div className="relative">
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search by name or code..."
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="h-11 pl-10 pr-10"
        aria-label="Search subjects"
      />
      {draft ? (
        <button
          type="button"
          onClick={() => setDraft("")}
          className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <XIcon className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}