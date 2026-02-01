import { ToastProvider, ConfirmProvider } from '@/components/ui';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="admin-layout">
          {children}
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
