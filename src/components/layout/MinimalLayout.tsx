import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface MinimalLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export default function MinimalLayout({ children, title, showBack = true }: MinimalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 flex items-center justify-between px-6 bg-secondary text-secondary-foreground sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link to="/" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-tertiary text-sm">Tronko</span>
            {title && (
              <>
                <span className="text-secondary-foreground/30">|</span>
                <span className="font-heading font-semibold text-sm text-secondary-foreground">{title}</span>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
