"use client";

import * as React from "react";
import {
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UnlockIcon,
  UserRoundIcon,
} from "lucide-react";
import { WeaveSpinner } from "@/components/ui/weave-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { clientFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import type { ManagedUser, ManagedUserPage, UserRole } from "@/lib/types";

const PAGE_SIZE = 20;

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "ADMIN", label: "Admins" },
  { value: "USER", label: "Students" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Blocked" },
] as const;

const BAN_DURATIONS = [
  { value: "permanent", label: "Until an admin unblocks them" },
  { value: "1", label: "For 1 day" },
  { value: "7", label: "For 7 days" },
  { value: "30", label: "For 30 days" },
] as const;

export function UserManager() {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [role, setRole] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const [data, setData] = React.useState<ManagedUserPage | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const [banTarget, setBanTarget] = React.useState<ManagedUser | null>(null);
  const [banReason, setBanReason] = React.useState("");
  const [banDuration, setBanDuration] = React.useState<string>("permanent");
  const [isBanning, setIsBanning] = React.useState(false);

  const [unblockTarget, setUnblockTarget] = React.useState<ManagedUser | null>(
    null,
  );
  const [isUnblocking, setIsUnblocking] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<ManagedUser | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Keep typing responsive: the list is filtered server-side, so debounce
  // before hitting the API.
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Any filter change invalidates the current offset.
  function resetToFirstPage() {
    setPage(1);
  }

  const load = React.useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (role !== "all") params.set("role", role);
    if (status !== "all") params.set("banned", String(status === "banned"));

    try {
      const result = await clientFetch<ManagedUserPage>(`/users?${params}`);
      setData(result);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Couldn't load users.",
      );
    }
  }, [page, debouncedSearch, role, status]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change
    void load();
  }, [load]);

  async function runAction(
    target: ManagedUser,
    action: () => Promise<unknown>,
    success: { title: string; description: string },
    onDone: () => void,
  ) {
    setPendingId(target.id);
    try {
      await action();
      toast.add({ type: "success", ...success });
      onDone();
      void load();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Action failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setPendingId(null);
    }
  }

  function openBan(user: ManagedUser) {
    setBanTarget(user);
    setBanReason("");
    setBanDuration("permanent");
  }

  async function handleBan() {
    if (!banTarget) return;
    setIsBanning(true);

    const body: { reason?: string; bannedUntil?: string } = {};
    const reason = banReason.trim();
    if (reason) body.reason = reason;
    if (banDuration !== "permanent") {
      body.bannedUntil = new Date(
        Date.now() + Number(banDuration) * 24 * 60 * 60 * 1000,
      ).toISOString();
    }

    await runAction(
      banTarget,
      () =>
        clientFetch(`/users/${banTarget.id}/ban`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      {
        title: "User blocked",
        description: `${banTarget.email} can no longer sign in.`,
      },
      () => setBanTarget(null),
    );
    setIsBanning(false);
  }

  async function handleUnblock() {
    if (!unblockTarget) return;
    setIsUnblocking(true);

    await runAction(
      unblockTarget,
      () =>
        clientFetch(`/users/${unblockTarget.id}/ban`, { method: "DELETE" }),
      {
        title: "User unblocked",
        description: `${unblockTarget.email} can sign in again.`,
      },
      () => setUnblockTarget(null),
    );
    setIsUnblocking(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    await runAction(
      deleteTarget,
      () => clientFetch(`/users/${deleteTarget.id}`, { method: "DELETE" }),
      {
        title: "User deleted",
        description: `${deleteTarget.email} was permanently removed.`,
      },
      () => setDeleteTarget(null),
    );
    setIsDeleting(false);
  }

  function changeRole(user: ManagedUser, nextRole: UserRole) {
    if (nextRole === user.role) return;
    void runAction(
      user,
      () =>
        clientFetch(`/users/${user.id}/role`, {
          method: "PATCH",
          body: JSON.stringify({ role: nextRole }),
        }),
      {
        title: nextRole === "ADMIN" ? "Promoted to admin" : "Role updated",
        description: `${user.email} is now ${
          nextRole === "ADMIN" ? "an admin" : "a student"
        }.`,
      },
      () => {},
    );
  }

  const users = data?.items ?? [];
  const isSelf = (user: ManagedUser) => user.id === currentUser?.id;
  const hasFilters =
    debouncedSearch.length > 0 || role !== "all" || status !== "all";

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetToFirstPage();
            }}
            className="h-9 pl-9"
            aria-label="Search users"
          />
        </div>
        <Select
          value={role}
          onValueChange={(value) => {
            if (!value) return;
            setRole(value);
            resetToFirstPage();
          }}
        >
          <SelectTrigger className="h-9 sm:w-40" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => {
            if (!value) return;
            setStatus(value);
            resetToFirstPage();
          }}
        >
          <SelectTrigger className="h-9 sm:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadError ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium text-destructive">Couldn&apos;t load users</p>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : data === null ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-12">
          <WeaveSpinner />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium">
            {hasFilters ? "No matching users" : "No users yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? "Try a different search or filter."
              : "Users appear here once they sign in."}
          </p>
        </div>
      ) : (
        <>
          <ul className="grid gap-2">
            {users.map((user) => {
              const self = isSelf(user);
              const busy = pendingId === user.id;

              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    {user.role === "ADMIN" ? (
                      <ShieldIcon className="size-5" aria-hidden="true" />
                    ) : (
                      <UserRoundIcon className="size-5" aria-hidden="true" />
                    )}
                  </span>

                  <div className="grid min-w-0 flex-1 gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate font-medium">{user.name}</span>
                      {user.role === "ADMIN" ? (
                        <Badge variant="info">Admin</Badge>
                      ) : null}
                      {user.banned ? <Badge variant="destructive">Blocked</Badge> : null}
                      {self ? <Badge variant="secondary">You</Badge> : null}
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Joined {formatDate(user.createdAt)} ·{" "}
                      {user._count.quizAttempts} attempt
                      {user._count.quizAttempts === 1 ? "" : "s"} ·{" "}
                      {user._count.authoredQuizzes} quiz
                      {user._count.authoredQuizzes === 1 ? "" : "es"}
                    </span>
                    {user.banned && user.banReason ? (
                      <span className="text-xs text-destructive">
                        {user.banReason}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        value && changeRole(user, value as UserRole)
                      }
                      disabled={self || busy}
                    >
                      <SelectTrigger
                        className="h-8 w-28"
                        aria-label={`Role for ${user.email}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Student</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    {user.banned ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setUnblockTarget(user)}
                        disabled={self || busy}
                        aria-label={`Unblock ${user.email}`}
                      >
                        {busy ? (
                          <Loader2Icon
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <UnlockIcon aria-hidden="true" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openBan(user)}
                        disabled={self || busy}
                        aria-label={`Block ${user.email}`}
                      >
                        {busy ? (
                          <Loader2Icon
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <BanIcon aria-hidden="true" />
                        )}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(user)}
                      disabled={self || busy}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${user.email}`}
                    >
                      {busy ? (
                        <Loader2Icon
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2Icon aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          {data && data.pageCount > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {data.pageCount} · {data.total} user
                {data.total === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={data.page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() =>
                    setPage((current) => Math.min(data.pageCount, current + 1))
                  }
                  disabled={data.page >= data.pageCount}
                  aria-label="Next page"
                >
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <Dialog
        open={banTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isBanning) setBanTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Block user?</DialogTitle>
            <DialogDescription>
              {banTarget?.email} will be signed out and blocked from signing in
              again.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ban-duration">Duration</Label>
              <Select
                value={banDuration}
                onValueChange={(value) => value && setBanDuration(value)}
              >
                <SelectTrigger id="ban-duration" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BAN_DURATIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ban-reason">Reason (optional)</Label>
              <Textarea
                id="ban-reason"
                value={banReason}
                onChange={(event) => setBanReason(event.target.value)}
                placeholder="Shown to other admins only."
                rows={3}
                maxLength={280}
                disabled={isBanning}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isBanning}
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => void handleBan()}
              disabled={isBanning}
            >
              {isBanning ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <BanIcon aria-hidden="true" />
              )}
              Block user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={unblockTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isUnblocking) setUnblockTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unblock user?</DialogTitle>
            <DialogDescription>
              {unblockTarget?.email} will be able to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isUnblocking}
            >
              Cancel
            </DialogClose>
            <Button
              onClick={() => void handleUnblock()}
              disabled={isUnblocking}
            >
              {isUnblocking ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <UnlockIcon aria-hidden="true" />
              )}
              Unblock user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.email} will be permanently removed, along with
              their sessions and quiz attempts. Quizzes they authored stay on
              the site without an author. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isDeleting}
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2Icon aria-hidden="true" />
              )}
              Delete user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
