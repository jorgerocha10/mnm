'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ReceiptText, 
  Tag, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: ShoppingBag,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ReceiptText,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: Tag,
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/signin' });
  };

  return (
    <div className="min-h-screen w-64 bg-[#253946] text-white py-6 px-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold px-4">Maps & Memories</h2>
        <p className="text-sm text-[#95A7B5] px-4">Admin Portal</p>
      </div>
      
      <Separator className="bg-[#95A7B5]/20 my-4" />
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white/70 hover:text-white hover:bg-white/10",
                  isActive && "bg-white/10 text-white"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <Separator className="bg-[#95A7B5]/20 my-4" />
      
      <Button 
        variant="ghost" 
        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
} 