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
      <header className="h-14 flex items-center justify-between px-6 bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
              <span className="text-secondary-foreground font-heading font-bold text-xs">T</span>
            </div>
            {title && <span className="font-heading font-semibold text-sm text-foreground">{title}</span>}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
