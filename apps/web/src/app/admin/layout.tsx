import { ToastProvider } from '@/components/ui';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="admin-layout">
        {children}
      </div>
    </ToastProvider>
  );
}
