"use client";

import { MACRONS_LOWER, MACRONS_UPPER } from "@/lib/macron";

type Props = {
	onInsert: (char: string) => void;
	onToggle?: () => void;
	showToggle?: boolean;
};

export function MacronToolbar({ onInsert, onToggle, showToggle }: Props) {
	return (
		<div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-stone-50 p-2 ring-1 ring-stone-200">
			<span className="mr-1 text-xs font-medium text-stone-500">Macrons:</span>
			{MACRONS_LOWER.map((c) => (
				<button
					key={c}
					type="button"
					onClick={() => onInsert(c)}
					className="min-w-9 rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-stone-200 hover:bg-stone-100 active:scale-95"
					aria-label={`Voeg ${c} in`}
				>
					{c}
				</button>
			))}
			<span className="mx-1 h-6 w-px bg-stone-200" />
			{MACRONS_UPPER.map((c) => (
				<button
					key={c}
					type="button"
					onClick={() => onInsert(c)}
					className="min-w-9 rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-stone-200 hover:bg-stone-100 active:scale-95"
					aria-label={`Voeg ${c} in`}
				>
					{c}
				</button>
			))}
			{showToggle && onToggle && (
				<>
					<span className="mx-1 h-6 w-px bg-stone-200" />
					<button
						type="button"
						onClick={onToggle}
						className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
						title="Wissel klinker voor cursor (a ↔ ā)"
					>
						a ↔ ā
					</button>
				</>
			)}
		</div>
	);
}
