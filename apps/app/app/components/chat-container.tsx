"use client";

import { ArrowUp } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

interface Message {
  id: string;
  type: "system" | "user";
  content: string;
  choices?: string[];
}

type Step =
  | "initial"
  | "photos"
  | "location"
  | "incident_type"
  | "description"
  | "contact";

const ChatContainer = () => {
  const t = useTranslations("chatComponent");
  const [currentStep, setCurrentStep] = useState<Step>("initial");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content:
        "Hello! I'll help you report an incident. Would you like to start by sharing some photos?",
      choices: ["Yes, I'll add photos", "No photos needed"],
    },
  ]);

  const getNextStepContent = (step: Step, response: string): Message => {
    switch (step) {
      case "initial":
        return {
          id: Date.now().toString(),
          type: "system",
          content: "Where did this incident occur?",
          choices: ["Use my current location", "Enter address manually"],
        };
      case "photos":
        return {
          id: Date.now().toString(),
          type: "system",
          content: "What type of incident would you like to report?",
          choices: ["Traffic", "Infrastructure", "Environmental", "Other"],
        };
      case "location":
        return {
          id: Date.now().toString(),
          type: "system",
          content:
            "Could you describe what happened? Feel free to provide details.",
        };
      case "incident_type":
        return {
          id: Date.now().toString(),
          type: "system",
          content:
            "Would you like to provide your contact information for follow-up?",
          choices: ["Yes, I'll provide contact info", "No, keep it anonymous"],
        };
      case "description":
        return {
          id: Date.now().toString(),
          type: "system",
          content:
            "Thank you for your report! Would you like to submit it now?",
          choices: ["Submit report", "Add more details"],
        };
      default:
        return {
          id: Date.now().toString(),
          type: "system",
          content:
            "Thank you for your report! It has been submitted successfully.",
        };
    }
  };

  const getNextStep = (currentStep: Step): Step => {
    const steps: Record<Step, Step> = {
      initial: "photos",
      photos: "location",
      location: "incident_type",
      incident_type: "description",
      description: "contact",
      contact: "contact",
    };
    return steps[currentStep];
  };

  const handleUserResponse = (response: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: response,
    };

    setMessages((prev) => [...prev, newMessage]);

    const nextStep = getNextStep(currentStep);
    setCurrentStep(nextStep);

    // Add system response after a short delay
    setTimeout(() => {
      const systemResponse = getNextStepContent(currentStep, response);
      setMessages((prev) => [...prev, systemResponse]);
    }, 500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    handleUserResponse(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`max-w-[80%]`}>
              <div
                className={`rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {messages[messages.length - 1]?.choices && (
          <div className="flex flex-col items-end space-y-2">
            {messages[messages.length - 1]?.choices?.map((choice, index) => (
              <Button
                key={choice}
                onClick={() => handleUserResponse(choice)}
                variant={index === 1 ? "outline" : "default"}
                className={
                  index === 0
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : ""
                }
              >
                {choice}
              </Button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex gap-2 items-center">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" className="h-9 px-6 p-4">
          <ArrowUp />
        </Button>
      </form>
    </div>
  );
};

export default ChatContainer;
