import React, { useState,useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPLOAD_PROFILE_PIC } from "../../utils/mutations";
import Axios from "axios";
import { SyncLoader } from "react-spinners";
import { AiOutlineUpload } from "react-icons/ai";

const ProfilePicUploader = ({ profileId, profilePicUrl, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState("");
  const [uploadProfilePic] = useMutation(UPLOAD_PROFILE_PIC);

  // Clear error after 2 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 2000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(file);
      if (error) setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Validation: file must be selected
    if (!profilePic) {
      setError("Please select a profile picture first.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", profilePic);
      formData.append("upload_preset", "logging_preset");

      const response = await Axios.post(
        "https://api.cloudinary.com/v1_1/dey5y9jip/image/upload",
        formData
      );
      const imageUrl = response.data.secure_url;

      await uploadProfilePic({
        variables: {
          profileId,
          profilePic: imageUrl,
        },
      });

      // on success, clear state
      setProfilePic(null);
      setError("");
    } catch (uploadError) {
      console.error("Error uploading profile picture:", uploadError);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-4 ">
        <label htmlFor="profilePicInput" className="cursor-pointer">
          <AiOutlineUpload size={24} className="text-dark-800 ml-6" /> 
          <span className="text-xs justify-center">choose image</span>
        </label>
        <input
          id="profilePicInput"
          type="file"
          name="profilePic"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>
      <div className="ml-4 flex flex-col items-start">
        {error && (
          <p className="mb-2 text-sm text-red-500">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className={`text-[12px] bg-transparent hover:bg-indigo-600 text-dark-800 font-semibold hover:text-dark py-2 px-4 border border-indigo-500 hover:border-transparent rounded ${
            isDarkMode ? "bg-gray-800" : "bg-gray-300 hover:text-white"
          }`}
          disabled={loading}
        >
          {profilePicUrl ? "Change Image" : "Upload"}
        </button>
        <div className="mt-2">
          <SyncLoader color="#000" loading={loading} size={10} /> 
        </div>
      </div>
    </div>
  );
};

export default ProfilePicUploader;
