"use client";

import { MACRONS_LOWER, MACRONS_UPPER } from "@/lib/macron";

type Props = {
	onInsert: (char: string) => void;
	onToggle?: () => void;
	showToggle?: boolean;
};

export function MacronToolbar({ onInsert, onToggle, showToggle }: Props) {
	return (
		<div className="flex flex-wrap items-center gap-1.5 border-[3px] border-stone-900 bg-stone-200 p-2 shadow-[4px_4px_0_0_var(--pixel-shadow)] dark:border-black dark:bg-stone-800">
			<span className="mr-1 font-pixel text-[9px] text-stone-600 dark:text-stone-300">
				Macrons:
			</span>
			{MACRONS_LOWER.map((c) => (
				<button
					key={c}
					type="button"
					onClick={() => onInsert(c)}
					className="pixel-btn min-w-9 bg-white px-2.5 py-1.5 text-2xl text-stone-900 dark:bg-stone-900 dark:text-stone-100"
					aria-label={`Voeg ${c} in`}
				>
					{c}
				</button>
			))}
			<span className="mx-1 h-6 w-1 bg-stone-900/20 dark:bg-stone-600" />
			{MACRONS_UPPER.map((c) => (
				<button
					key={c}
					type="button"
					onClick={() => onInsert(c)}
					className="pixel-btn min-w-9 bg-white px-2.5 py-1.5 text-2xl text-stone-900 dark:bg-stone-900 dark:text-stone-100"
					aria-label={`Voeg ${c} in`}
				>
					{c}
				</button>
			))}
			{showToggle && onToggle && (
				<>
					<span className="mx-1 h-6 w-1 bg-stone-900/20 dark:bg-stone-600" />
					<button
						type="button"
						onClick={onToggle}
						className="pixel-btn bg-amber-300 px-2.5 py-1.5 font-pixel text-[9px] text-amber-950"
						title="Wissel klinker voor cursor (a ↔ ā)"
					>
						a ↔ ā
					</button>
				</>
			)}
		</div>
	);
}
