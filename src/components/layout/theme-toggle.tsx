'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Toggle theme">
            {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4 mr-2" />
          Light
          {theme === 'light' && <span className="ml-auto text-xs text-primary">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
          {theme === 'dark' && <span className="ml-auto text-xs text-primary">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="h-4 w-4 mr-2" />
          System
          {theme === 'system' && <span className="ml-auto text-xs text-primary">Active</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
