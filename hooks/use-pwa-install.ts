"use client";

import * as React from "react";

const DISMISS_KEY = "sue-install-banner-dismissed";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type Listener = () => void;
type Unsubscribe = () => void;
const noopUnsubscribe: Unsubscribe = () => {};
const subscribeNothing = () => noopUnsubscribe;

/**
 * beforeinstallprompt can fire before React mounts, so the listener is
 * registered at module scope and the event is held here. The Next.js docs
 * advise against relying on this API (it is unsupported on iOS Safari), so
 * every caller must also handle the "no event, show instructions" case.
 */
let deferredPrompt: InstallPromptEvent | null = null;
let promptRegistered = false;
const promptListeners = new Set<Listener>();

function emitPrompt() {
  for (const listener of promptListeners) listener();
}

const subscribePrompt = (listener: Listener): Unsubscribe => {
  if (typeof window === "undefined") return noopUnsubscribe;

  if (!promptRegistered) {
    promptRegistered = true;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event as InstallPromptEvent;
      emitPrompt();
    });
    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      emitPrompt();
    });
  }

  promptListeners.add(listener);
  return () => {
    promptListeners.delete(listener);
  };
};

const getPromptSnapshot = () => deferredPrompt;
const getNull = () => null;

function subscribeStandalone(listener: Listener): Unsubscribe {
  if (typeof window === "undefined") return noopUnsubscribe;
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", listener);
  return () => mql.removeEventListener("change", listener);
}

function getStandaloneSnapshot() {
  if (typeof window === "undefined") return false;
  const iosStandalone = (
    navigator as Navigator & { standalone?: boolean }
  ).standalone;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    iosStandalone === true
  );
}

/** Matches the user-agent check used in the official Next.js PWA guide. */
function getIosSnapshot() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    (window as unknown as { MSStream?: unknown }).MSStream === undefined
  );
}

const getFalse = () => false;
const getTrue = () => true;

/**
 * Dismissal is read through useSyncExternalStore rather than an effect so the
 * snapshot stays cached and stable across renders. The cache is what lets the
 * getter be called on every render without changing the hydration result.
 */
let dismissedCache: boolean | null = null;
const dismissedListeners = new Set<Listener>();

function getDismissedSnapshot() {
  if (dismissedCache === null) {
    try {
      dismissedCache = window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      dismissedCache = false;
    }
  }
  return dismissedCache;
}

const subscribeDismissed = (listener: Listener): Unsubscribe => {
  dismissedListeners.add(listener);
  return () => {
    dismissedListeners.delete(listener);
  };
};

function setDismissed() {
  dismissedCache = true;
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // ignore storage failures
  }
  for (const listener of dismissedListeners) listener();
}

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

export interface PwaInstall {
  /** True once the app is running from the home screen. */
  isInstalled: boolean;
  /** True only where the browser exposes a real install button. */
  canPrompt: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  /** False during SSR and the hydration render, to avoid a dismissal flash. */
  ready: boolean;
  dismiss: () => void;
  install: () => Promise<InstallOutcome>;
}

export function usePwaInstall(): PwaInstall {
  const canPrompt = React.useSyncExternalStore(
    subscribePrompt,
    getPromptSnapshot,
    getNull,
  );
  const isInstalled = React.useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getFalse,
  );
  const isIOS = React.useSyncExternalStore(
    subscribeNothing,
    getIosSnapshot,
    getFalse,
  );
  const isDismissed = React.useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    getFalse,
  );
  // The server has no way to know the stored preference, so the first client
  // render uses the server snapshot and the banner stays hidden until React
  // re-renders with the real value.
  const ready = React.useSyncExternalStore(
    subscribeNothing,
    getTrue,
    getFalse,
  );

  const install = React.useCallback(async (): Promise<InstallOutcome> => {
    if (!deferredPrompt) return "unavailable";
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      emitPrompt();
      return choice.outcome;
    } catch {
      return "unavailable";
    }
  }, []);

  return {
    isInstalled,
    canPrompt: canPrompt !== null,
    isIOS,
    isDismissed,
    ready,
    dismiss: setDismissed,
    install,
  };
}
