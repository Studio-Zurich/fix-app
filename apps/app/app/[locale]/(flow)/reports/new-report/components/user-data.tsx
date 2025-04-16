"use client";
import { log } from "@/lib/logger";
import { reportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useEffect, useState } from "react";
import StepContainer from "./step-container";

const UserData = () => {
  // Get functions from reportStore
  const setUserData = reportStore((state) => state.setUserData);
  const setStep = (step: number) => reportStore.setState({ step });

  // Use local state for form values
  const [formData, setFormData] = useState({
    reporter_first_name: "",
    reporter_last_name: "",
    reporter_email: "",
    reporter_phone: "",
  });

  // Load user data from store when component mounts
  useEffect(() => {
    const state = reportStore.getState();
    const userData = state.user_step;

    if (userData) {
      setFormData({
        reporter_first_name: userData.reporter_first_name || "",
        reporter_last_name: userData.reporter_last_name || "",
        reporter_email: userData.reporter_email || "",
        reporter_phone: userData.reporter_phone || "",
      });
      log("User data loaded from store", userData);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    log("User data input changed", { field: name, value });

    // Update local state only
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleBack = () => {
    // Just go back to the previous step without validating or saving data
    setStep(4);
  };

  const handleNext = () => {
    // Save all form data to store when Next is clicked
    setUserData(formData);
    log("User data saved to store on Next click", formData);

    // Advance to final step (step 6)
    setStep(6);
  };

  return (
    <StepContainer
      prevButton={
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
      }
      nextButton={
        <Button type="button" onClick={handleNext}>
          Next
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="reporter_first_name">Vorname</Label>
          <Input
            type="text"
            id="reporter_first_name"
            name="reporter_first_name"
            required
            value={formData.reporter_first_name}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="reporter_last_name">Nachname</Label>
          <Input
            type="text"
            id="reporter_last_name"
            name="reporter_last_name"
            required
            value={formData.reporter_last_name}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="reporter_email">E-Mail</Label>
          <Input
            type="email"
            id="reporter_email"
            name="reporter_email"
            required
            value={formData.reporter_email}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporter_phone">Telefon (optional)</Label>
          <Input
            type="tel"
            id="reporter_phone"
            name="reporter_phone"
            value={formData.reporter_phone}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </StepContainer>
  );
};

export default UserData;
