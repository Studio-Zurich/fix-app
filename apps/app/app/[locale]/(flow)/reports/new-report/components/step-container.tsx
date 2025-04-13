const StepContainer = ({
  children,
  prevButton,
  nextButton,
}: {
  children: React.ReactNode;
  prevButton?: React.ReactNode;
  nextButton: React.ReactNode;
}) => {
  return (
    <div className="flex-1 bg-blue-400 pb-[66px]">
      {children}
      <div className="fixed bottom-0 w-full bg-pink-400 h-min">
        <div
          className={`px-[5vw] md:px-6 py-2 flex items-center ${
            prevButton && nextButton ? "justify-between" : "justify-end"
          }`}
        >
          {prevButton}
          {nextButton}
        </div>
      </div>
    </div>
  );
};

export default StepContainer;
