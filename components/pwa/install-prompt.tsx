"use client";

import * as React from "react";
import Image from "next/image";
import { DownloadIcon, PlusIcon, ShareIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { usePwaInstall } from "@/hooks/use-pwa-install";

/** Step-by-step fallback for browsers with no install API, notably iOS Safari. */
export function IosInstallSteps() {
  return (
    <ol className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
      <li className="inline-flex items-center gap-1">
        Tap
        <ShareIcon className="size-3.5" aria-hidden="true" />
        <span className="sr-only">the share button</span>
      </li>
      <li aria-hidden="true">then</li>
      <li className="inline-flex items-center gap-1">
        <PlusIcon className="size-3.5" aria-hidden="true" />
        Add to Home Screen
        <span className="sr-only">from the share menu</span>
      </li>
    </ol>
  );
}

export function InstallPrompt() {
  const { isInstalled, canPrompt, isDismissed, ready, dismiss, install } =
    usePwaInstall();
  const [isBusy, setIsBusy] = React.useState(false);

  if (!ready || isInstalled || isDismissed) return null;

  async function handleInstall() {
    setIsBusy(true);
    const outcome = await install();
    setIsBusy(false);
    if (outcome === "accepted") {
      toast.add({ type: "success", title: "Installing Sue Campus" });
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-[100] px-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96">
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-lg">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-lg border"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install Sue Campus</p>
          <p className="text-xs text-muted-foreground">
            {canPrompt
              ? "Add it to your home screen for faster access."
              : "Add it to your home screen to open it like an app."}
          </p>
          {!canPrompt ? <IosInstallSteps /> : null}

          <div className="mt-2 flex items-center gap-1">
            {canPrompt ? (
              <Button size="sm" disabled={isBusy} onClick={handleInstall}>
                <DownloadIcon aria-hidden="true" />
                Install
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" disabled={isBusy} onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-xs"
          disabled={isBusy}
          onClick={dismiss}
          aria-label="Dismiss install prompt"
        >
          <XIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
