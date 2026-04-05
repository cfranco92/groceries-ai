'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Leaf, LogOut, Package, Receipt, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { href: '/lists', label: 'Lists', icon: ShoppingCart },
    ],
  },
  {
    label: 'Products',
    items: [
      { href: '/products', label: 'Catalog', icon: Package },
    ],
  },
  {
    label: 'Receipts',
    items: [
      { href: '/receipts', label: 'My Receipts', icon: Receipt },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { href: '/household', label: 'Household', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Leaf className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold text-primary">GroceriesAI</span>
      </div>

      <nav className="flex flex-1 flex-col gap-4 p-3" aria-label="Main navigation">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-1">
            {section.label && (
              <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
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
          </div>
        ))}

        <div className="flex-1" />

        <div className="space-y-1 border-t pt-3">
          {bottomNavItems.map((item) => {
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
        </div>
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
