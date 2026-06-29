'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/weather' },
  { name: 'Compare', href: '/compare' },
  { name: 'Trips', href: '/trips' },
  { name: 'History', href: '/history' },
  { name: 'About', href: '/about' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-2xl">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Cloud className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-base font-extrabold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-xl transition-all duration-200',
                pathname === item.href
                  ? 'bg-white/20 dark:bg-white/10 text-foreground shadow-sm'
                  : 'text-foreground/60 hover:text-foreground hover:bg-white/10'
              )}
            >
              {item.name}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden"
            render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetHeader>
              <SheetTitle>{APP_NAME}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 px-4" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
