'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, LogOut, BookOpen } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/products/create', label: 'Create Product', icon: BookOpen },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const getIsActive = (item: (typeof navItems)[number]) => {
    if (item.href === '/admin') {
      return pathname === '/admin';
    }
    if (item.href === '/admin/products') {
      return pathname === '/admin/products' || pathname === '/admin/products/create';
    }
    if (item.href === '/admin/products/create') {
      return pathname === '/admin/products/create';
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-64 bg-brand text-brand-foreground flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-golden flex items-center justify-center">
          <span className="text-brand font-bold text-sm">BF</span>
        </div>
        <div>
          <h2 className="font-semibold text-sm text-white">Bab-ul-Fatah</h2>
          <p className="text-xs text-white/60">Admin Panel</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = getIsActive(item);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-white/15 text-golden'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      {/* Footer */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
