// src/components/SocialMediaSelector.jsx
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaPhone } from "react-icons/fa";

const BUTTONS = [
  { key: "twitter",   color: "#1DA1F2", Icon: FaTwitter   },
  { key: "facebook",  color: "#162666", Icon: FaFacebookF },
  { key: "linkedin",  color: "#0077b5", Icon: FaLinkedinIn },
];

export default function SocialMediaLink({
  isDarkMode,
  phoneNumber,
  onSelect,    // (type: string) => void
}) {
  return (
    <div className="flex items-center justify-center space-x-4 p-4 shadow-lg rounded-md">
      {BUTTONS.map(({ key, color, Icon }) => {
        const IconComponent = Icon; // Assign Icon to a variable
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: isDarkMode ? "#4B5563" : color }}
          >
            <IconComponent className="text-white" size={20} /> 
          </button>
        );
      })}

      {phoneNumber && (
        <a
          href={`tel:${phoneNumber}`}
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-indigo-600 text-white"
        >
          <FaPhone size={18} />
        </a>
      )}
    </div>
  );
}
