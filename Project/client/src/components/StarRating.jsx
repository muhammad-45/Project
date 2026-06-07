import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating = 0, size = 16, showText = true }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <FiStar key={i} size={size} style={{ color: '#E9C46A', fill: '#E9C46A' }} />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <FiStar key={i} size={size} style={{ color: '#E9C46A', fill: '#E9C46A', opacity: 0.5 }} />
      );
    } else {
      stars.push(
        <FiStar key={i} size={size} style={{ color: '#e2dedb' }} />
      );
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {stars}
      {showText && (
        <span style={{ fontSize: '0.875rem', fontWeight: 500, marginLeft: '4px', color: '#231f20' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
};

export default StarRating;
