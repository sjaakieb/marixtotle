/**
 * Strict matching for Latin.
 * - trims, lowercases, collapses whitespace, normalizes NFC
 * - DOES NOT strip macrons: ā !== a (pedagogically important)
 * - Case-insensitive but macron-sensitive
 */
export function normalize(input: string): string {
	return input.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

export function isCorrect(userInput: string, expectedAnswer: string): boolean {
	return normalize(userInput) === normalize(expectedAnswer);
}

export function getAnswerCandidates(
	answer: string,
	alternatives?: string[],
): string[] {
	const base = [answer, ...(alternatives ?? [])];
	const implicit: string[] = [];
	for (const cand of base) {
		// Implicit alias for Latin adjective dictionary forms like "laetus, -a, -um" -> accept "laetus", "laeta", "laetum"
		if (/,\s*-[a-zāēīōūĀĒĪŌŪ]+/.test(cand)) {
			const lemma = cand.split(",")[0]?.trim();
			if (lemma && !base.includes(lemma) && !implicit.includes(lemma)) {
				implicit.push(lemma);
			}
			// For ", -a, -um" pattern, also add feminine (-a) and neuter (-um) forms
			// e.g. "mirus, -a, -um" -> "mira", "mirum"; "laetus, -a, -um" -> "laeta", "laetum"
			if (/,\s*-a\s*,\s*-um/.test(cand) && lemma) {
				let stem: string | null = null;
				if (lemma.endsWith("us")) stem = lemma.slice(0, -2);
				else if (lemma.endsWith("er")) stem = lemma.slice(0, -2); // e.g. "miser" -> "misera/miserum" approx
				if (stem !== null) {
					const forms = [`${stem}a`, `${stem}um`];
					for (const f of forms) {
						if (!base.includes(f) && !implicit.includes(f)) implicit.push(f);
					}
				}
			}
		}
	}
	return [...base, ...implicit];
}

export function isExerciseCorrect(
	userInput: string,
	exercise: { answer: string; alternatives?: string[]; direction?: string },
): boolean {
	const normInput = normalize(userInput);
	const candidates = getAnswerCandidates(
		exercise.answer,
		exercise.alternatives,
	);
	if (candidates.some((c) => normalize(c) === normInput)) return true;
	// Dutch leniency: "je" and "jij" are interchangeable ("Hoe heet je?"
	// counts for "Hoe heet jij?"). Only when the answer is Dutch
	// (direction xx->nl), so French "je parle" never matches "jij parle".
	if (exercise.direction?.endsWith("->nl")) {
		const canonInput = canonicalDutchPronouns(normInput);
		return candidates.some(
			(c) => canonicalDutchPronouns(normalize(c)) === canonInput,
		);
	}
	return false;
}

/**
 * Canonicalize Dutch informal pronouns: whole-word "jij" -> "je".
 * Applied to both user input and expected answers, so every
 * je/jij combination matches ("En je, hoe oud ben je?" counts for
 * "En jij, hoe oud ben jij?"). Input must already be normalized.
 */
export function canonicalDutchPronouns(normalized: string): string {
	return normalized.replace(/\bjij\b/g, "je");
}

// For potential future lenient mode (not used in strict MVP)
export function stripMacrons(input: string): string {
	const map: Record<string, string> = {
		ā: "a",
		ē: "e",
		ī: "i",
		ō: "o",
		ū: "u",
		Ā: "a",
		Ē: "e",
		Ī: "i",
		Ō: "o",
		Ū: "u",
	};
	return input.replace(/[āēīōūĀĒĪŌŪ]/g, (m) => map[m] ?? m);
}

export function isCorrectLenient(
	userInput: string,
	expectedAnswer: string,
): boolean {
	return (
		normalize(stripMacrons(userInput)) ===
		normalize(stripMacrons(expectedAnswer))
	);
}
