export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 md:bg-muted/30">
      <div className="w-full max-w-sm md:max-w-md md:rounded-xl md:bg-card md:p-8 md:shadow-lg">
        {children}
      </div>
    </div>
  );
}
