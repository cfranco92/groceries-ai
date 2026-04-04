'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Leaf, LogOut, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/lists', label: 'Lists', icon: ShoppingCart },
  { href: '/household', label: 'Household', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Leaf className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold text-primary">GroceriesAI</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                'hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors',
            'hover:bg-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
