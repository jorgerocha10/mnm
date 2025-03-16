'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormEvent } from 'react';
import { toast } from 'sonner';

// Sample password reset data
const samplePasswordReset = {
  adminName: 'Admin User',
  resetLink: 'https://maps-and-memories.com/admin/reset-password?token=sample-token-12345',
  expiryTime: '24 hours'
};

export default function PasswordResetPreview() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  
  const generatePreview = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/email/preview/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(samplePasswordReset),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }
      
      const data = await response.json();
      setPreviewHtml(data.html);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 text-[#253946]">Password Reset Email</h3>
        <p className="text-[#95A7B5] mb-6">
          This email is sent to admin users when they request a password reset.
        </p>
        
        <form onSubmit={generatePreview} className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input id="adminName" defaultValue={samplePasswordReset.adminName} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryTime">Expiry Time</Label>
              <Input id="expiryTime" defaultValue={samplePasswordReset.expiryTime} disabled />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="resetLink">Reset Link</Label>
              <Input id="resetLink" defaultValue={samplePasswordReset.resetLink} disabled />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-[#A76825] hover:bg-[#8a561e]" 
            disabled={isLoading}
          >
            {isLoading ? 'Generating Preview...' : 'Generate Preview'}
          </Button>
        </form>
      </Card>
      
      {previewHtml && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4 text-[#253946]">Email Preview</h3>
          <div className="border rounded-md p-4 bg-white mt-4">
            <iframe
              srcDoc={previewHtml}
              title="Email Preview"
              className="w-full min-h-[600px] border-0"
            />
          </div>
        </Card>
      )}
    </div>
  );
} 