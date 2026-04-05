'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Receipt, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/lists', label: 'Lists', icon: ShoppingCart },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/receipts', label: 'Receipts', icon: Receipt },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center border-t bg-background md:hidden"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
