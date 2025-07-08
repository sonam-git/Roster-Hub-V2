import React, { useState } from "react";

const EMOJIS = [
	{ emoji: "👍", label: "Thumbs Up" },
	{ emoji: "🔥", label: "Fire" },
	{ emoji: "👏", label: "Clap" },
	{ emoji: "😍", label: "Love" },
	{ emoji: "💯", label: "100" },
	{ emoji: "🎉", label: "Party Popper" },
	{ emoji: "😄", label: "Smile" },
	{ emoji: "😢", label: "Sad" },
	{ emoji: "🤔", label: "Thinking" },
	{ emoji: "🙌", label: "Hands Up" },
	{ emoji: "💪", label: "Flexed Biceps" },
	{ emoji: "😎", label: "Cool" },
	{ emoji: "🤩", label: "Star-Struck" },
	{ emoji: "🤗", label: "Hugging Face" },
	{ emoji: "😇", label: "Smiling Face with Halo" },
];

export default function SkillReaction({ onReact }) {
	const [showPicker, setShowPicker] = useState(false);

	const handleReact = (emoji) => {
		setShowPicker(false);
		if (onReact) onReact(emoji);
	};

	return (
		<div className="relative flex flex-col items-center" >
			<button
				className={`px-2 py-1 rounded-full border text-xs font-semibold shadow bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition mb-1 dark:text-white`}
				onClick={() => setShowPicker((v) => !v)}
				type="button"
			>
				React
			</button>
			{showPicker && (
				<div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-44 max-w-xs bg-white dark:bg-gray-800 p-2 rounded shadow border z-50 overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-thin hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full"
					style={{ minWidth: "140px", cursor: 'grab' }}
				>
					{EMOJIS.map(({ emoji, label }) => (
						<button
							key={label}
							className="text-xl hover:scale-125 transition-transform focus:outline-none inline-block"
							title={label}
							aria-label={label}
							onClick={() => handleReact(emoji)}
							type="button"
						>
							{emoji}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
