import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useAppReviews, useUserReview, useSubmitReview } from '@/hooks/useReviews';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface ReviewSectionProps {
  appId: string;
}

function InteractiveStars({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onClick={() => onRate(i)} className="p-0.5">
          <Star className={`h-7 w-7 ${i <= rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'}`} />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ appId }: ReviewSectionProps) {
  const { user } = useAuth();
  const { data: reviews } = useAppReviews(appId);
  const { data: userReview } = useUserReview(appId, user?.id);
  const submitReview = useSubmitReview();
  
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (rating === 0) { toast.error('Please select a rating'); return; }
    try {
      await submitReview.mutateAsync({ app_id: appId, user_id: user.id, rating, review_text: reviewText });
      toast.success('Review submitted!');
      setShowForm(false);
      setRating(0);
      setReviewText('');
    } catch {
      toast.error('Failed to submit review');
    }
  };

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Ratings & Reviews</h2>
        {user && !userReview && (
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => setShowForm(!showForm)}>
            Write a Review
          </Button>
        )}
      </div>

      {!user && (
        <p className="text-sm text-muted-foreground mb-4">
          <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to leave a review
        </p>
      )}

      {showForm && (
        <div className="mb-6 p-4 rounded-xl bg-secondary/50 space-y-3">
          <InteractiveStars rating={rating} onRate={setRating} />
          <Textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Write your review (optional)..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={submitReview.isPending}>
              {submitReview.isPending ? 'Submitting...' : 'Submit'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {userReview && (
        <div className="mb-4 p-4 rounded-xl bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">Your review</p>
          <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`h-4 w-4 ${i <= userReview.rating ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
            ))}
          </div>
          {userReview.review_text && <p className="text-sm text-foreground">{userReview.review_text}</p>}
        </div>
      )}

      {reviews && reviews.filter(r => r.user_id !== user?.id).length > 0 && (
        <div className="space-y-4">
          {reviews.filter(r => r.user_id !== user?.id).map(review => (
            <div key={review.id} className="border-b border-border pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-3 w-3 ${i <= review.rating ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              {review.review_text && <p className="text-sm text-foreground">{review.review_text}</p>}
            </div>
          ))}
        </div>
      )}

      {(!reviews || reviews.length === 0) && !showForm && (
        <p className="text-sm text-muted-foreground">No reviews yet</p>
      )}
    </section>
  );
}
