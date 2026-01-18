interface SectionTitleProps {
  children: React.ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="h-6 w-1 rounded-full bg-primary" />
      <h2 className="text-xl font-bold text-foreground">{children}</h2>
    </div>
  );
}
