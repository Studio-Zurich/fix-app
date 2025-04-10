"use server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type ActionState = {
  success: boolean;
  message: string;
};

export async function submitReport(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();

    const firstName = formData.get("first-name");
    const lastName = formData.get("last-name");
    const locale = formData.get("locale");

    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_first_name: firstName,
        reporter_last_name: lastName,
        locale: locale,
        status: "open",
      })
      .select();

    if (error) {
      return {
        success: false,
        message: `Failed to submit report: ${error.message}`,
      };
    }

    const reportId = data[0]?.id;

    console.log(
      "Report submitted successfully, redirecting to:",
      `/reports/${reportId}`
    );

    redirect({
      href: `/reports/${reportId}`,
      locale: locale as string,
    });

    return {
      success: true,
      message: `Report submitted successfully. Report ID: ${reportId}`,
    };
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }

    console.error("Error in submitReport:", e);

    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
