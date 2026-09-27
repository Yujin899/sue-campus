"use client";

import * as React from "react";
import { CheckIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IosInstallSteps } from "@/components/pwa/install-prompt";
import { usePwaInstall } from "@/hooks/use-pwa-install";

/**
 * Permanent "Install app" entry for the profile page. The banner is
 * dismissible, so this keeps the option reachable afterwards.
 */
export function InstallAppRow() {
  const { isInstalled, canPrompt, isIOS, install } = usePwaInstall();
  const [isBusy, setIsBusy] = React.useState(false);
  const [showSteps, setShowSteps] = React.useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">App</span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <CheckIcon className="size-4 text-primary" aria-hidden="true" />
          Installed
        </span>
      </div>
    );
  }

  async function handleInstall() {
    if (!canPrompt) {
      setShowSteps((current) => !current);
      return;
    }
    setIsBusy(true);
    await install();
    setIsBusy(false);
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">App</span>
        <Button
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={handleInstall}
        >
          <DownloadIcon aria-hidden="true" />
          {canPrompt ? "Install" : "How to install"}
        </Button>
      </div>
      {showSteps && !canPrompt ? <IosInstallSteps /> : null}
      {!canPrompt && !isIOS && !showSteps ? (
        <p className="text-xs text-muted-foreground">
          Use your browser&apos;s menu and choose &quot;Install app&quot; or
          &quot;Add to Home screen&quot;.
        </p>
      ) : null}
    </div>
  );
}
