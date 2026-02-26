import ToolsLayout from "@/components/layout/ToolsLayout";

export default function ToolsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolsLayout>{children}</ToolsLayout>;
}
