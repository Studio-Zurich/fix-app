const FlowLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-svh bg-green-500 overflow-hidden flex flex-col">
      {children}
    </main>
  );
};

export default FlowLayout;
