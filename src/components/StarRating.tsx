import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  totalRatings?: number;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = false,
  totalRatings
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    const filled = i <= Math.floor(rating);
    const partial = !filled && i === Math.ceil(rating) && rating % 1 !== 0;
    
    stars.push(
      <Star
        key={i}
        className={`${sizeClasses[size]} ${filled || partial ? 'fill-primary text-primary' : 'fill-muted text-muted'}`}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
          {totalRatings !== undefined && (
            <span className="ml-1">({totalRatings.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  );
}
