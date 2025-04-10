"use client";
import { Button } from "@repo/ui/button";
import { useLocale } from "next-intl";
import { useActionState } from "react";
import { ActionState, submitReport } from "../actions";
import ImageUpload from "./image-upload";
import UserData from "./user-data";

const ReportFlow = () => {
  // Use the useActionState hook to handle form submission
  const [state, formAction] = useActionState<ActionState, FormData>(
    submitReport,
    { success: false, message: "" }
  );
  const locale = useLocale();

  return (
    <div>
      <h1>ReportFlow</h1>

      {/* Display success or error message */}
      {state.message && <div>{state.message}</div>}

      <form action={formAction}>
        <input type="hidden" name="locale" value={locale} />
        <ImageUpload />
        <UserData />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default ReportFlow;
