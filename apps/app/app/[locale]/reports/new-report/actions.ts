"use server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import sharp from "sharp";

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

export async function uploadReportImage(formData: FormData) {
  const file = formData.get("image") as File;

  if (!file) {
    return { error: "No image provided" };
  }

  try {
    // Convert File to Buffer for sharp processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compress image with sharp
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Use the original filename
    const filePath = `temp/${file.name}`;

    // Upload to Supabase storage
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("report-images")
      .upload(filePath, compressedBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("report-images").getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    console.error("Error processing image:", error);
    return { error: "Failed to process and upload image" };
  }
}
