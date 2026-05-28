import GlobalChatRequestPill from "@/components/common/GlobalChatRequestPill";

export default function StaticPagesLayout({ children }) {
  return (
    <>
      {children}
      <GlobalChatRequestPill />
    </>
  );
}
