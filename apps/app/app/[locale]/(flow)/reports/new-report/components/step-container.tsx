import { Button } from "@repo/ui/button";

const StepContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 bg-blue-400 pb-[66px]">
      {children}
      <div className="fixed bottom-0 w-full bg-pink-400 h-min">
        <div className="px-[5vw] md:px-6 py-2 flex justify-between items-center">
          <Button variant="outline">Back</Button>
          <Button>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default StepContainer;
