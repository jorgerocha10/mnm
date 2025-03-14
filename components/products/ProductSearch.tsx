'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface ProductSearchProps {
  initialQuery?: string;
}

export default function ProductSearch({ initialQuery = '' }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  // Effect to update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when search changes
    params.delete('page');
    
    // Update URL without refreshing the page
    router.push(`/products?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);
  
  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when search is submitted
    params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 py-2 border border-[#95A7B5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A76825]"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#95A7B5]" size={18} />
        <Button 
          type="submit"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#A76825] hover:bg-[#8a561e] text-white h-8 px-3 py-1 rounded-md"
        >
          Search
        </Button>
      </div>
    </form>
  );
} 