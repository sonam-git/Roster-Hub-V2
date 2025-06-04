import React, { useState } from "react";
import Auth from "../../utils/auth";
import PropTypes from "prop-types";
import { useMutation } from "@apollo/client";
import { RATE_PLAYER } from "../../utils/mutations";
import { AiFillStar, AiOutlineStar } from "react-icons/ai"; // Import star icons

const RatingModal = ({ profile, onClose, isDarkMode }) => {
  const [rating, setRating] = useState(1);
  const [ratePlayer] = useMutation(RATE_PLAYER);

  const handleSubmit = async () => {
    try {
      await ratePlayer({
        variables: {
          profileId: profile._id,
          ratingInput: {
            user: Auth.getProfile().data._id,
            rating,
          },
        },
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div
        className={`${
          isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        } p-6 rounded-lg shadow-lg`}
      >
        <h3 className="bg-gray-200 dark:bg-black p-2 text-lg font-bold mb-4">
          Rate {profile.name}
        </h3>
        <div className="flex justify-center mb-4 ">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className="focus:outline-none"
            >
              {value <= rating ? (
                <AiFillStar className="text-yellow-500 text-2xl" />
              ) : (
                <AiOutlineStar className="text-yellow-500 text-2xl" />
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

RatingModal.propTypes = {
  profile: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RatingModal;
