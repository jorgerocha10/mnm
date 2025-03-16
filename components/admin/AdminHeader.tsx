'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Package2, ShoppingCart, Settings, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#253946]">{title}</h1>
        <p className="text-muted-foreground text-[#95A7B5]">{description}</p>
      </div>
      <Separator className="my-6" />
    </div>
  );
}

export function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Navigation items
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Products', icon: Package2 },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/categories', label: 'Categories', icon: Settings },
  ];

  return (
    <header className="border-b border-[#D2BDA2]/20 bg-white p-4 flex items-center justify-between">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[#253946]">
        <Link href="/admin" className="hover:text-[#A76825] transition-colors">
          Admin
        </Link>
        {pathname && pathname !== '/admin' && (
          <>
            <span className="text-[#95A7B5]">/</span>
            <span className="capitalize">
              {pathname.split('/').slice(2).join(' / ')}
            </span>
          </>
        )}
      </div>
        
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>
        
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/admin' && pathname?.startsWith(item.href));
          const Icon = item.icon;
            
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-1 hover:text-[#A76825] transition-colors ${
                isActive ? 'text-[#A76825] font-medium' : 'text-[#253946]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
          
        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {session?.user?.name || 'Admin User'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/api/auth/signout">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
        
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-50 border-t border-[#D2BDA2]/20">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                              (item.href !== '/admin' && pathname?.startsWith(item.href));
              const Icon = item.icon;
                
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center gap-2 py-3 px-4 hover:bg-[#F7F5F6] rounded-lg ${
                    isActive ? 'text-[#A76825] font-medium' : 'text-[#253946]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
              
            <div className="border-t border-[#D2BDA2]/20 mt-2 pt-2">
              <Link 
                href="/admin/settings" 
                className="flex items-center gap-2 py-3 px-4 hover:bg-[#F7F5F6] rounded-lg text-[#253946]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <Link 
                href="/api/auth/signout" 
                className="flex items-center gap-2 py-3 px-4 hover:bg-[#F7F5F6] rounded-lg text-[#253946]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Logout</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
} 