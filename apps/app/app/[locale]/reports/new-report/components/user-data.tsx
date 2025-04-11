import { log } from "@/lib/logger";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import StepContainer from "./step-container";

const UserData = () => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    log("User data input changed", { field: name, value });
  };

  return (
    <StepContainer>
      <div className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="reporter_first_name">Vorname</Label>
          <Input
            type="text"
            id="reporter_first_name"
            name="reporter_first_name"
            required
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
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporter_phone">Telefon (optional)</Label>
          <Input
            type="tel"
            id="reporter_phone"
            name="reporter_phone"
            onChange={handleInputChange}
          />
        </div>
      </div>
    </StepContainer>
  );
};

export default UserData;
