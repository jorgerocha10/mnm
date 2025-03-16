"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cart-store";

const MainNav = () => (
  <nav className="hidden md:flex space-x-8">
    <Link 
      href="/" 
      className="text-[#253946] hover:text-[#95A7B5] transition-colors"
    >
      Home
    </Link>
    <Link 
      href="/products" 
      className="text-[#253946] hover:text-[#95A7B5] transition-colors"
    >
      Shop
    </Link>
    <Link 
      href="/about" 
      className="text-[#253946] hover:text-[#95A7B5] transition-colors"
    >
      About
    </Link>
  </nav>
);

const MobileNav = () => (
  <nav className="flex flex-col space-y-6 pt-10">
    <Link 
      href="/" 
      className="text-[#253946] hover:text-[#95A7B5] text-2xl transition-colors"
    >
      Home
    </Link>
    <Link 
      href="/products" 
      className="text-[#253946] hover:text-[#95A7B5] text-2xl transition-colors"
    >
      Shop
    </Link>
    <Link 
      href="/about" 
      className="text-[#253946] hover:text-[#95A7B5] text-2xl transition-colors"
    >
      About
    </Link>
  </nav>
);

export default function Header() {
  // Subscribe to both the items array and the getItemCount function
  const items = useCartStore((state) => state.items);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Update cart count when the component mounts (to avoid hydration errors)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Update cart count when items change
  useEffect(() => {
    if (isMounted) {
      setCartItemCount(getItemCount());
    }
  }, [isMounted, getItemCount, items]); // Add items dependency to re-run when cart changes

  return (
    <header className="bg-[#F7F5F6] border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/Logo_4.png" 
            alt="Maps & Memories Logo" 
            width={180} 
            height={50} 
            className="h-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <MainNav />

        {/* Cart and Mobile Navigation */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Link href="/cart">
            <div className="relative flex items-center">
              <ShoppingCart className="h-6 w-6 text-[#253946]" />
              {isMounted && cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#A76825] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-[#253946]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#F7F5F6] w-[300px]">
                <div className="flex justify-end">
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6 text-[#253946]" />
                    </Button>
                  </SheetTrigger>
                </div>
                <MobileNav />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
} 