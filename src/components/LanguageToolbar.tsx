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
			<div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-stone-50 p-2 ring-1 ring-stone-200">
				<span className="mr-1 text-xs font-medium text-stone-500">
					Macrons:
				</span>
				{MACRONS_LOWER.map((c) => (
					<CharButton key={c} char={c} onInsert={onInsert} />
				))}
				<span className="mx-1 h-6 w-px bg-stone-200" />
				{MACRONS_UPPER.map((c) => (
					<CharButton key={c} char={c} onInsert={onInsert} />
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

	if (language === "french") {
		return (
			<div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-stone-50 p-2 ring-1 ring-stone-200">
				<span className="mr-1 text-xs font-medium text-stone-500">
					Accents:
				</span>
				{FRENCH_CHARS_LOWER.map((c) => (
					<CharButton key={c} char={c} onInsert={onInsert} />
				))}
				<span className="mx-1 hidden h-6 w-px bg-stone-200 sm:block" />
				{FRENCH_CHARS_UPPER.map((c) => (
					<CharButton key={c} char={c} onInsert={onInsert} />
				))}
			</div>
		);
	}

	if (language === "greek") {
		return (
			<div className="space-y-2 rounded-lg bg-stone-50 p-2 ring-1 ring-stone-200">
				<div className="flex flex-wrap items-center gap-1">
					<span className="mr-1 text-xs font-medium text-stone-500">
						Αλφάβητο:
					</span>
					{GREEK_LETTERS_LOWER.map((c) => (
						<CharButton key={c} char={c} onInsert={onInsert} />
					))}
				</div>
				<div className="flex flex-wrap items-center gap-1">
					<span className="mr-1 text-xs font-medium text-stone-500">
						Tonisch:
					</span>
					{GREEK_ACCENTED.map((c) => (
						<CharButton key={c} char={c} onInsert={onInsert} />
					))}
					<span className="mx-1 h-6 w-px bg-stone-200" />
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
			className="min-w-8 rounded-md bg-white px-2 py-1.5 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-stone-200 hover:bg-stone-100 active:scale-95"
			aria-label={`Voeg ${char} in`}
		>
			{char}
		</button>
	);
}
