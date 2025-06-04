import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SAVE_SOCIAL_MEDIA_LINK } from '../../utils/mutations';

const SocialMediaLink = ({ userId }) => {
  const [selectedSocialMedia, setSelectedSocialMedia] = useState(null);
  const [socialMediaLink, setSocialMediaLink] = useState('');
  const [saveSocialMediaLink] = useMutation(SAVE_SOCIAL_MEDIA_LINK);

  const saveLink = async () => {
    try {
      await saveSocialMediaLink({
        variables: {
          input: {
            userId,
            type: selectedSocialMedia,
            link: socialMediaLink
          }
        }
      });
      setSelectedSocialMedia(null);
    } catch (error) {
      console.error('Failed to save social media link:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <span
          className="mx-2 w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#1DA1F2]"
          onClick={() => setSelectedSocialMedia('twitter')}
        >
          <i className="fa-brands fa-twitter text-white"></i>
        </span>
        <span
          className="mx-2 w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#2f55ed]"
          onClick={() => setSelectedSocialMedia('facebook')}
        >
          <i className="fa-brands fa-facebook text-white"></i>
        </span>
        <span
          className="mx-2 w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#0077b5]"
          onClick={() => setSelectedSocialMedia('linkedin')}
        >
          <i className="fa-brands fa-linkedin-in text-white"></i>
        </span>
      </div>
      {selectedSocialMedia && (
        <div>
          <label className="block text-lg font-semibold mb-2">
            Insert {selectedSocialMedia.charAt(0).toUpperCase() + selectedSocialMedia.slice(1)} Link:
          </label>
          <input
            type="text"
            value={socialMediaLink}
            onChange={(e) => setSocialMediaLink(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            placeholder={`Enter your ${selectedSocialMedia.charAt(0).toUpperCase() + selectedSocialMedia.slice(1)} link`}
          />
          <div className="flex justify-end">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
              onClick={saveLink}
            >
              Save
            </button>
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              onClick={() => setSelectedSocialMedia(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaLink;
