// utils/renderStars.js

import React from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center mt-2">
      {/* Display full stars */}
      {Array(fullStars)
        .fill()
        .map((_, index) => (
          <AiFillStar key={index} className="text-yellow-500" />
        ))}
      {/* Display half star if applicable */}
      {halfStar && <AiOutlineStar key="half" className="text-yellow-500" />}
      {/* Display empty stars */}
      {Array(emptyStars)
        .fill()
        .map((_, index) => (
          <AiOutlineStar
            key={index + fullStars + (halfStar ? 1 : 0)}
            className="text-gray-400"
          />
        ))}
      {/* Display rating number */}
      <span className="text-sm ml-1">{rating.toFixed(1)} / 5</span>
    </div>
  );
};

export default renderStars;
