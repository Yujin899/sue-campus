"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth";

const RESEND_DELAY = 60;

function getErrorMessage(error: unknown): string {
  const code = typeof error === "string" ? error : null;
  switch (code) {
    case "INVALID_OTP":
      return "That code isn't correct. Check it and try again.";
    case "OTP_EXPIRED":
      return "That code has expired. Request a new one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many attempts. Please wait a moment and try again.";
    case "USER_NOT_FOUND":
      return "No account found for that email. Ask an admin to add you.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = React.useState<"email" | "otp">("email");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGooglePending, setIsGooglePending] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_DELAY);

  React.useEffect(() => {
    if (step !== "otp") return;
    if (secondsLeft <= 0) return;
    const timer = setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  const canResend = secondsLeft === 0;

  async function sendCode(targetEmail = email) {
    setError(null);
    setIsSubmitting(true);
    const { error: requestError } =
      await authClient.emailOtp.sendVerificationOtp({
        email: targetEmail,
        type: "sign-in",
      });
    setIsSubmitting(false);

    if (requestError) {
      setError(getErrorMessage(requestError));
      toast.add({
        type: "error",
        title: "Couldn't send the code",
        description: getErrorMessage(requestError),
      });
      return;
    }

    setEmail(targetEmail);
    setOtp("");
    setSecondsLeft(RESEND_DELAY);
    setStep("otp");
    toast.add({
      type: "success",
      title: "Code sent",
      description: `We sent a 6-digit code to ${targetEmail}.`,
    });
  }

  async function verifyCode(code = otp) {
    setError(null);
    setIsSubmitting(true);
    const { error: verifyError } = await authClient.signIn.emailOtp({
      email,
      otp: code,
    });
    setIsSubmitting(false);

    if (verifyError) {
      setError(getErrorMessage(verifyError));
      toast.add({
        type: "error",
        title: "Sign in failed",
        description: getErrorMessage(verifyError),
      });
      return;
    }

    router.push("/dashboard");
  }

  async function signInWithGoogle() {
    setIsGooglePending(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setIsGooglePending(false);
      toast.add({
        type: "error",
        title: "Google sign in failed",
        description: "Make sure Google sign in is enabled.",
      });
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <Image
          src="/logo-light.png"
          alt="Sue Campus"
          width={1254}
          height={1254}
          className="size-40 rounded-2xl object-contain dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          alt=""
          width={1536}
          height={1024}
          className="hidden size-40 rounded-2xl object-contain dark:block"
        />
      </div>

      {step === "email" ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? true : undefined}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            size="lg"
            onClick={() => void sendCode()}
            disabled={!email.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : null}
            Continue
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">
              or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void signInWithGoogle()}
            disabled={isGooglePending}
          >
            {isGooglePending ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Enter your code
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <span>{email}</span>. It expires in 5
              minutes.
            </p>
          </div>

          <div className="grid justify-center gap-2">
            <Label htmlFor="otp" className="justify-center text-center">
              Verification code
            </Label>
            <InputOTP
              id="otp"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={otp}
              onChange={setOtp}
              onComplete={verifyCode}
              disabled={isSubmitting}
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            size="lg"
            onClick={() => void verifyCode()}
            disabled={otp.length !== 6 || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : null}
            Sign in
          </Button>

          <div className="flex flex-col items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {canResend
                ? "Didn't get a code?"
                : `You can request a new code in ${secondsLeft}s`}
            </span>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void sendCode()}
                disabled={!canResend || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                ) : null}
                Resend code
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep("email");
                  setError(null);
                  setOtp("");
                }}
              >
                <ArrowLeftIcon aria-hidden="true" />
                Back to email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}