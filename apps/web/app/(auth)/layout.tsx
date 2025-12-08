import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - TradeSphere",
  description: "Sign in to your TradeSphere account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="relative z-10 w-full max-w-md mx-4">{children}</div>
    </div>
  );
}
