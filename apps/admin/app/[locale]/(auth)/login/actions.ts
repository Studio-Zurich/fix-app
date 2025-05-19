"use server";

import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

type ActionResult = {
  error?: string;
  success?: string;
  code?: string;
  user?: User;
};

export async function requestOTP(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  try {
    // Attempt to get user by email - if a user doesn't exist, this will fail when we try to sign in with OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error sending OTP:", error);
      // If the error is that the user doesn't exist
      if (
        error.message.includes("User not found") ||
        error.message.includes("Invalid login credentials")
      ) {
        return { error: "User not allowed to login." };
      }
      return { error: error.message };
    }

    return {
      success:
        "An OTP has been sent to your email. Please check your inbox and spam folder. The OTP will expire in 5 minutes.",
    };
  } catch (error) {
    console.error("Unexpected error in requestOTP:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function verifyOTP(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      if (error.status === 403 && error.code === "otp_expired") {
        return {
          error: "The OTP has expired. Please request a new one.",
          code: "otp_expired",
        };
      }
      return { error: error.message, code: error.code };
    }

    if (!data.user) {
      console.error("User not found after OTP verification");
      return { error: "User not found after verification. Please try again." };
    }

    return { success: "OTP verified successfully.", user: data.user };
  } catch (error) {
    console.error("Unexpected error in verifyOTP:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
