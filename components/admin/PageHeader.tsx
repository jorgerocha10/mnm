import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
  heading: string;
  description: string;
}

export function PageHeader({ heading, description }: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#253946]">{heading}</h1>
        <p className="text-muted-foreground text-[#95A7B5]">{description}</p>
      </div>
      <Separator className="my-6" />
    </div>
  );
} 