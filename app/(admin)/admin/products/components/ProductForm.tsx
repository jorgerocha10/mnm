'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Category, FrameSize, FrameType, Product } from '@prisma/client';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { frameSizeLabels } from '@/lib/constants';

// Schema for product form validation
const productFormSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be greater than 0' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock cannot be negative' }),
  images: z.array(z.string()).min(1, { message: 'At least one image is required' }),
  categoryId: z.string().optional(),
  frameTypes: z.nativeEnum(FrameType),
  frameSizes: z.nativeEnum(FrameSize).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values or existing product data
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: Number(initialData.price),
    } : {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      images: [],
      categoryId: categories[0]?.id,
      frameTypes: FrameType.PINE,
      frameSizes: FrameSize.SIZE_8_5X8_5,
    },
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      setIsSubmitting(true);
      
      // Generate slug from name
      const slug = values.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      
      const productData = {
        ...values,
        slug,
      };
      
      // API endpoint and method
      const url = initialData
        ? `/api/products/${initialData.id}`
        : '/api/products';
        
      const method = initialData ? 'PATCH' : 'POST';
      
      // Call API to create or update product
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save product');
      }
      
      toast.success(initialData ? 'Product updated' : 'Product created');
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-[#253946]">Basic Information</h3>
              <p className="text-sm text-[#95A7B5]">
                General product details
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="City Map Frame" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the product in detail..." 
                      className="min-h-32 resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price ($) - Fallback Only</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      This is only a fallback price. All prices are determined by frame size from the Frame Prices page.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Frame Options and Images */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-[#253946]">Product Options</h3>
              <p className="text-sm text-[#95A7B5]">
                Configure frame styles and images
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="frameTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frame Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a frame type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PINE">Pine Wood</SelectItem>
                      <SelectItem value="DARK">Dark Wood</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frameSizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frame Size</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a frame size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(frameSizeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <ImageUploader 
                      value={field.value} 
                      onChange={field.onChange} 
                      maxFiles={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-[#A76825] hover:bg-[#8a561e]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{initialData ? 'Update' : 'Create'} Product</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 