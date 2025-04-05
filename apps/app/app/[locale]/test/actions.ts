"use server";

import { redirect } from "@/i18n/routing";

export async function testAction(previousState: any, formData: FormData) {
  console.log("hello world");
  redirect({ href: "/", locale: "en" });
  return previousState;
}
