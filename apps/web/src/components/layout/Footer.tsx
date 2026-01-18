'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Mail } from 'lucide-react';

const socialLinks = [
  { href: 'https://github.com/silverbeen', label: 'GitHub', icon: Github },
  { href: 'mailto:silverbeen@example.com', label: 'Email', icon: Mail },
];

const footerLinks = [
  { href: '/resume', label: 'Resume' },
  { href: '/blog', label: 'Blog' },
];

export function Footer() {
  const pathname = usePathname();

  // 어드민 페이지에서는 푸터 숨김
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/80">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary"
            >
              Silverbeen
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Silverbeen. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {/* Page Links */}
            <nav className="flex items-center gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="h-4 w-px bg-border" />

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
