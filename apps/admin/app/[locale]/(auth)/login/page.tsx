"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@repo/ui/input-otp";
import { Label } from "@repo/ui/label";
// import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { requestOTP, verifyOTP } from "./actions";
import { BackgroundBeams } from "./components/background-beams";

export default function Login() {
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleEmailSubmit = async (formData: FormData) => {
    const result = await requestOTP(formData);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.success);
      setShowOTPInput(true);
      setEmail(formData.get("email") as string);
      setCooldown(60);
    }
  };

  const handleOTPSubmit = async (submittedOTP: string) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("otp", submittedOTP);
    const result = await verifyOTP(formData);
    if (result?.error) {
      toast.error(result.error);
      setOTP("");
    } else if (result?.success) {
      toast.success("Login successful. Redirecting...");
      router.push("/");
    }
  };

  const handleOTPChange = (value: string) => {
    setOTP(value);
    if (value.length === 6) {
      handleOTPSubmit(value);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    const formData = new FormData();
    formData.append("email", email);
    await handleEmailSubmit(formData);
  };

  return (
    <main className="grid grid-cols-8 lg:grid-cols-12 min-h-[100svh] lg:min-h-screen relative">
      <div className="col-span-8 lg:col-span-6 px-[5vw] h-[100svh] lg:h-auto flex flex-col justify-center items-center relative">
        <div className="w-full max-w-96 p-8 relative -mt-80">
          {/* <NextImage
            src=""
            alt="Globaleye Capital Logo"
            className="w-full mb-8 max-w-44 mx-auto"
          /> */}
          <h1 className="text-lg font-optima text-center">Fix App Admin</h1>
          <div className="absolute h-max inset-y-40 flex flex-col justify-start items-center left-0 w-full">
            {!showOTPInput ? (
              <form
                action={handleEmailSubmit}
                className="flex flex-col gap-4 prose relative w-full"
              >
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label className="input input-bordered flex items-center gap-2">
                    E-Mail Address
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    className="grow"
                    placeholder="Fill in your e-mail address"
                    required
                  />
                </div>
                <SubmitButton
                  cooldown={cooldown}
                  text="Request One-Time Password"
                />
              </form>
            ) : (
              <div className="flex flex-col items-center gap-8 prose relative w-full">
                <InputOTP value={otp} onChange={handleOTPChange} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <div className="space-y-4 w-full">
                  <Button
                    className="w-full"
                    onClick={handleResendOTP}
                    disabled={cooldown > 0}
                    variant="outline"
                  >
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                  </Button>
                  <Button
                    className="w-full"
                    variant="ghost"
                    onClick={() => {
                      setShowOTPInput(false);
                      setOTP("");
                    }}
                  >
                    Change Email
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <BackgroundBeams />
    </main>
  );
}

function SubmitButton({ cooldown, text }: { cooldown: number; text: string }) {
  const { pending } = useFormStatus();

  if (cooldown > 0) {
    return (
      <Button disabled className="btn btn-primary">
        Resend in {cooldown}s
      </Button>
    );
  }

  return (
    <Button disabled={pending} className="btn btn-primary">
      {pending ? "Processing..." : text}
    </Button>
  );
}
