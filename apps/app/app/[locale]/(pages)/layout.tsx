import Header from "@/components/header";

const PagesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="px-[5vw] lg:px-6 space-y-8 mt-8 pb-8">{children}</main>
    </>
  );
};

export default PagesLayout;
