export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Toast/Confirm Provider는 루트 레이아웃에서 제공 (블로그 글 페이지의 PostActions 등에서도 사용)
  return <div className="admin-layout">{children}</div>;
}
