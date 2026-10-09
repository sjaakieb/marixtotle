"use client";

import {
	FRENCH_CHARS_LOWER,
	FRENCH_CHARS_UPPER,
	GREEK_ACCENTED,
	GREEK_LETTERS_LOWER,
	GREEK_LETTERS_UPPER,
} from "@/lib/diacritics";
import { MACRONS_LOWER, MACRONS_UPPER } from "@/lib/macron";
import type { LanguageId } from "@/lib/schema";

type Props = {
	language: LanguageId;
	onInsert: (char: string) => void;
	onToggle?: () => void;
	showToggle?: boolean;
};

export function LanguageToolbar({
	language,
	onInsert,
	onToggle,
	showToggle,
}: Props) {
	if (language === "english") return null;

	if (language === "latin") {
		return (
			<div className="flex flex-wrap items-center gap-1.5 border-[3px] border-stone-900 bg-stone-200 p-2 shadow-[4px_4px_0_0_var(--pixel-shadow)] dark:border-black dark:bg-stone-800">
				<span className="mr-1 font-pixel text-[9px] text-stone-600 dark:text-stone-300">
					Macrons:
				</span>
				{MACRONS_LOWER.map((c) => (
					<CharButton key={c} char={c} onInsert={onInsert} />
				))}
				<span className="mx-1 h-6 w-1 bg-stone-900/20 dark:bg-stone-600" />
				{MACRONS_UPPER.map((c) => (
					<CharButton key={c} char={c} onInsert={onInsert} />
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

	if (language === "french") {
		return (
			<div className="flex flex-wrap items-center gap-1.5 border-[3px] border-stone-900 bg-stone-200 p-2 shadow-[4px_4px_0_0_var(--pixel-shadow)] dark:border-black dark:bg-stone-800">
				<span className="mr-1 font-pixel text-[9px] text-stone-600 dark:text-stone-300">
					Accents:
				</span>
				{FRENCH_CHARS_LOWER.map((c) => (
					<CharButton key={c} char={c} onInsert={onInsert} />
				))}
				<span className="mx-1 hidden h-6 w-1 bg-stone-900/20 sm:block dark:bg-stone-600" />
				{FRENCH_CHARS_UPPER.map((c) => (
					<CharButton key={c} char={c} onInsert={onInsert} />
				))}
			</div>
		);
	}

	if (language === "greek") {
		return (
			<div className="space-y-2 border-[3px] border-stone-900 bg-stone-200 p-2 shadow-[4px_4px_0_0_var(--pixel-shadow)] dark:border-black dark:bg-stone-800">
				<div className="flex flex-wrap items-center gap-1">
					<span className="mr-1 font-pixel text-[9px] text-stone-600 dark:text-stone-300">
						Αλφάβητο:
					</span>
					{GREEK_LETTERS_LOWER.map((c) => (
						<CharButton key={c} char={c} onInsert={onInsert} />
					))}
				</div>
				<div className="flex flex-wrap items-center gap-1">
					<span className="mr-1 font-pixel text-[9px] text-stone-600 dark:text-stone-300">
						Tonisch:
					</span>
					{GREEK_ACCENTED.map((c) => (
						<CharButton key={c} char={c} onInsert={onInsert} />
					))}
					<span className="mx-1 h-6 w-1 bg-stone-900/20 dark:bg-stone-600" />
					{GREEK_LETTERS_UPPER.slice(0, 8).map((c) => (
						<CharButton key={c} char={c} onInsert={onInsert} />
					))}
				</div>
			</div>
		);
	}

	return null;
}

function CharButton({
	char,
	onInsert,
}: {
	char: string;
	onInsert: (c: string) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => onInsert(char)}
			className="pixel-btn min-w-8 bg-white px-2 py-1.5 text-2xl text-stone-900 dark:bg-stone-900 dark:text-stone-100"
			aria-label={`Voeg ${char} in`}
		>
			{char}
		</button>
	);
}
