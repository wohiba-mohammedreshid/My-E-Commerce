/**
 * Interactive star rating component for reviews.
 */
export default function StarRating({ rating, onChange, readonly = false }) {
  return (
    <div className="star-rating" role={readonly ? 'img' : 'group'} aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= rating ? 'star-filled' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
