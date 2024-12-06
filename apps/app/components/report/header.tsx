import { Asterisk } from "@phosphor-icons/react/dist/ssr";

const StepHeader = () => {
  return (
    <div className="flex items-center gap-2 justify-start">
      <Asterisk size={24} />
      <span className="text-xl block">Fix</span>
    </div>
  );
};

export default StepHeader;
