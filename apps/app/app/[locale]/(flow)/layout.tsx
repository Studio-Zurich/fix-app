const FlowLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-svh overflow-hidden flex flex-col">{children}</main>
  );
};

export default FlowLayout;
