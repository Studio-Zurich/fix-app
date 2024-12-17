"use client";

import { useReportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { Textarea } from "@repo/ui/textarea";
import { useState } from "react";

const MAX_CHARS = 500;

export default function IncidentDescriptionStep() {
  const [description, setDescription] = useState(
    useReportStore.getState().reportData.description || ""
  );
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setDescription(value);
      // Update store with description
      useReportStore.setState((state) => ({
        reportData: {
          ...state.reportData,
          description: value,
        },
      }));
    }
  };

  const handleNext = () => {
    if (description.trim()) {
      // If there's a description, make sure it's saved to the store
      useReportStore.setState((state) => ({
        reportData: {
          ...state.reportData,
          description: description.trim(),
        },
      }));
    }
    setCurrentStep(4);
  };

  const charactersLeft = MAX_CHARS - description.length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Additional Details</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Optionally provide more information about the incident
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Describe the incident in more detail..."
          value={description}
          onChange={handleDescriptionChange}
          rows={6}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground text-right">
          {charactersLeft} characters remaining
        </p>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Guidelines:</p>
        <ul className="list-disc list-inside pl-2">
          <li>Be specific and clear</li>
          <li>Avoid personal information</li>
          <li>Keep it respectful</li>
          <li>No swear words or offensive language</li>
        </ul>
      </div>

      <div className="fixed bottom-4 left-4 right-4">
        {description.trim() ? (
          <Button className="w-full" onClick={handleNext}>
            Confirm Description
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" onClick={handleNext}>
            Skip Description
          </Button>
        )}
      </div>
    </div>
  );
}
