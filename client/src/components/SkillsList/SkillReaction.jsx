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
				<div className="fixed left-1/2 bottom-auto top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 max-w-xs bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-blue-900 z-[9999] overflow-x-auto whitespace-nowrap flex flex-wrap gap-2 scrollbar-thin hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full animate-fade-in"
					style={{ minWidth: "180px", cursor: 'grab' }}
				>
					{EMOJIS.map(({ emoji, label }) => (
						<button
							key={label}
							className="px-2 py-1 text-2xl rounded-full bg-blue-50 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-700 shadow transition-transform focus:outline-none inline-block border border-blue-100 dark:border-blue-800 hover:scale-125 focus:ring-2 focus:ring-blue-400"
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
