// src/components/SocialMediaSelector.jsx
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaPhone } from "react-icons/fa";

const BUTTONS = [
  { key: "twitter",   color: "#1DA1F2", Icon: FaTwitter   },
  { key: "facebook",  color: "#162666", Icon: FaFacebookF },
  { key: "linkedin",  color: "#0077b5", Icon: FaLinkedinIn },
  { key: "phone",     color: "#6366f1", Icon: FaPhone     },
];

export default function SocialMediaLink({
  isDarkMode,
  onSelect,    // (type: string) => void
}) {
  return (
    <div className="flex items-center justify-center space-x-4 p-4 shadow-lg rounded-md">
      {BUTTONS.map(({ key, color, Icon }) => {
        const IconComponent = Icon;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ backgroundColor: isDarkMode ? "#4B5563" : color }}
            title={key === "phone" ? "Add/Update Phone Number" : `Add/Update ${key.charAt(0).toUpperCase() + key.slice(1)}`}
          >
            <IconComponent className="text-white" size={key === "phone" ? 18 : 20} /> 
          </button>
        );
      })}
    </div>
  );
}
