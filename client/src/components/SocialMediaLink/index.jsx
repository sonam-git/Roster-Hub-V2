import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SAVE_SOCIAL_MEDIA_LINK } from '../../utils/mutations';

const SocialMediaLink = ({ userId }) => {
  const [selectedSocialMedia, setSelectedSocialMedia] = useState(null);
  const [socialMediaLink, setSocialMediaLink] = useState('');
  const [error, setError] = useState('');
  const [saveSocialMediaLink] = useMutation(SAVE_SOCIAL_MEDIA_LINK);

  const saveLink = async () => {
    if (socialMediaLink.trim() === '') {
      setError(`Enter the URL of ${selectedSocialMedia.charAt(0).toUpperCase() + selectedSocialMedia.slice(1)}`);
      return;
    }

    try {
      await saveSocialMediaLink({
        variables: {
          input: {
            userId,
            type: selectedSocialMedia,
            link: socialMediaLink.trim(),
          },
        },
      });
      // Clear state on success
      setSelectedSocialMedia(null);
      setSocialMediaLink('');
      setError('');
    } catch (err) {
      console.error('Failed to save social media link:', err);
    }
  };

  const handleCancel = () => {
    setSelectedSocialMedia(null);
    setSocialMediaLink('');
    setError('');
  };

  const label = selectedSocialMedia
    ? selectedSocialMedia.charAt(0).toUpperCase() + selectedSocialMedia.slice(1)
    : '';

  return (
    <div>
      <div className="flex items-center justify-center">
        <span
          className="mx-2 w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#1DA1F2] cursor-pointer"
          onClick={() => setSelectedSocialMedia('twitter')}
        >
          <i className="fa-brands fa-twitter text-white"></i>
        </span>
        <span
          className="mx-2 w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#2f55ed] cursor-pointer"
          onClick={() => setSelectedSocialMedia('facebook')}
        >
          <i className="fa-brands fa-facebook text-white"></i>
        </span>
        <span
          className="mx-2 w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#0077b5] cursor-pointer"
          onClick={() => setSelectedSocialMedia('linkedin')}
        >
          <i className="fa-brands fa-linkedin-in text-white"></i>
        </span>
      </div>

      {selectedSocialMedia && (
        <div className="mt-4">
          <label className="block text-lg font-semibold mb-2">
            Insert {label} Link:
          </label>
          <input
            type="text"
            value={socialMediaLink}
            onChange={e => {
              setSocialMediaLink(e.target.value);
              if (error) setError('');
            }}
            className={`w-full p-2 rounded-md mb-1 focus:outline-none ${
              error ? 'border-red-500' : 'border-gray-300'
            } border`}
            placeholder={`Enter your  ${label} link`}
          />
          {error && (
            <p className="text-sm text-red-500 mb-4">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              onClick={saveLink}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
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
