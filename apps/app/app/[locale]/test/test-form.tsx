"use client";

import { Button } from "@repo/ui/button";
import { useActionState } from "react";
import { testAction } from "./actions";

export default function TestForm() {
  const [state, formAction] = useActionState(testAction, null);

  return (
    <div>
      <form>
        <div>Current state: {state}</div>
        <Button formAction={formAction}>Test Action</Button>
      </form>
    </div>
  );
}
