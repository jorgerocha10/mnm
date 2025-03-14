'use client';

import { useState } from 'react';
import { Review } from '@prisma/client';
import { Star, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
}

export default function ProductReviews({ productId, reviews, averageRating }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format rating as stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="h-5 w-5 fill-[#A76825] text-[#A76825]" />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="h-5 w-5 fill-[#A76825] text-[#A76825]" />
      );
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-5 w-5 text-[#D2BDA2]" />
      );
    }

    return stars;
  };

  // Handle form submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !comment) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real implementation, this would send data to the server
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      toast.success('Thank you for your review!');
      setShowReviewForm(false);
      setName('');
      setEmail('');
      setRating(5);
      setComment('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold text-[#253946] mb-6">Customer Reviews</h2>
      
      {/* Review Summary */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="text-4xl font-bold text-[#253946]">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex flex-col">
            <div className="flex">
              {renderStars(averageRating)}
            </div>
            <div className="text-sm text-[#95A7B5] mt-1">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
        
        <div className="md:ml-auto">
          <Button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-[#A76825] hover:bg-[#8a561e] text-white"
          >
            Write a Review
          </Button>
        </div>
      </div>
      
      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-[#F7F5F6] p-6 rounded-md mb-8 border border-[#D2BDA2]/30">
          <h3 className="text-xl font-semibold text-[#253946] mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-[#253946]">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#253946]">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label className="text-[#253946] block mb-2">Rating *</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        star <= rating 
                          ? "fill-[#A76825] text-[#A76825]" 
                          : "text-[#D2BDA2]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment" className="text-[#253946]">Review *</Label>
              <Textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#A76825] hover:bg-[#8a561e] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Reviews List */}
      <div className="space-y-8">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-[#D2BDA2]/30 pb-6">
              <div className="flex justify-between mb-2">
                <div className="font-semibold text-[#253946]">{review.customerName}</div>
                <div className="text-sm text-[#95A7B5]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex mb-3">
                {renderStars(review.rating)}
              </div>
              <p className="text-[#253946]">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-[#95A7B5]">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </section>
  );
} 