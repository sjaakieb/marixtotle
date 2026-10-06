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
	exercise: {
		answer: string;
		alternatives?: string[];
		direction?: string;
		wrongAnswers?: string[];
	},
): boolean {
	return gradeExercise(userInput, exercise) !== "wrong";
}

/** Three-way verdict for typed answers (Duolingo-style). */
export type Grade = "exact" | "typo" | "wrong";

export function gradeExercise(
	userInput: string,
	exercise: {
		answer: string;
		alternatives?: string[];
		direction?: string;
		wrongAnswers?: string[];
	},
): Grade {
	const dutch = exercise.direction?.endsWith("->nl") ?? false;
	const normInput = canonicalForGrade(userInput, dutch);
	const candidates = getAnswerCandidates(
		exercise.answer,
		exercise.alternatives,
	);
	const normCandidates = candidates.map((c) => canonicalForGrade(c, dutch));
	// Exact match always wins (even if contradictorily denylisted).
	if (normCandidates.some((c) => c === normInput)) return "exact";
	// Authored denylist overrules typo leniency. Compared accent-insensitively
	// so "laeti" stays wrong however it is accented/capitalized.
	if (
		(exercise.wrongAnswers ?? []).some((w) => {
			const n = canonicalForGrade(w, dutch);
			return (
				n === normInput || stripDiacritics(n) === stripDiacritics(normInput)
			);
		})
	)
		return "wrong";
	let best: Grade = "wrong";
	for (const normCand of normCandidates) {
		const g = gradeCandidate(normInput, normCand);
		if (g === "typo") best = "typo";
	}
	return best;
}

/**
 * Why a wrong answer is wrong: the learner answered in the wrong language
 * (typed the Dutch meaning on a listening question, or copied the prompt
 * instead of translating it). Call only when the grade is already "wrong".
 * Lenient on purpose: a typo'd meaning still counts as the meaning.
 */
export type WrongLanguageKind = "typed-translation" | "copied-prompt";

export function detectWrongLanguage(
	userInput: string,
	exercise: { answer: string; direction?: string },
	translation?: string,
	prompt?: string,
): WrongLanguageKind | undefined {
	if (!normalize(userInput)) return undefined;
	if (
		translation &&
		// "nl->nl" forces Dutch-side canonicalization (je/jij rule), since
		// both the input and the translation are Dutch here.
		gradeExercise(userInput, { answer: translation, direction: "nl->nl" }) !==
			"wrong"
	) {
		return "typed-translation";
	}
	if (
		prompt &&
		gradeExercise(userInput, {
			answer: prompt,
			direction: exercise.direction,
		}) !== "wrong"
	) {
		return "copied-prompt";
	}
	return undefined;
}

/**
 * Canonical form for graded comparison: normalized + Greek final sigma
 * unified (ς→σ, a positional variant, not a spelling error) + punctuation
 * dropped (so "Hoe heet je" ≡ "Hoe heet je?") + optional Dutch je/jij rule.
 */
function canonicalForGrade(input: string, dutch: boolean): string {
	let s = normalize(input).replace(/ς/g, "σ");
	s = s
		.replace(/[^\p{L}\p{N}\s]/gu, "")
		.replace(/\s+/g, " ")
		.trim();
	return dutch ? canonicalDutchPronouns(s) : s;
}

function gradeCandidate(normInput: string, normCand: string): Grade {
	if (normInput === normCand) return "exact";
	const stripInput = stripDiacritics(normInput);
	const stripCand = stripDiacritics(normCand);
	// Accent-only difference (café/cafe, puellā/puella): forgiven, flagged.
	if (stripInput === stripCand) return "typo";
	const wIn = stripInput.split(" ").filter(Boolean);
	const wCa = stripCand.split(" ").filter(Boolean);
	// Missing/extra whole words are genuinely wrong.
	if (wIn.length !== wCa.length || wIn.length === 0) return "wrong";
	for (let i = 0; i < wIn.length; i++) {
		const a = wIn[i] as string;
		const b = wCa[i] as string;
		if (a === b) continue;
		// Short words (≤4 chars) must be exact: 1 edit is a different word.
		// Longer words get 1 typo each (insert/delete/substitute/transpose).
		const budget = Math.min(a.length, b.length) <= 4 ? 0 : 1;
		if (editDistance(a, b) > budget) return "wrong";
	}
	return "typo";
}

/**
 * Optimal string alignment distance: Levenshtein + adjacent transposition
 * ("genitvius" counts as 1 typo). Inputs are short words; plain DP is fine.
 */
export function editDistance(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	if (a === b) return 0;
	if (m === 0) return n;
	if (n === 0) return m;
	if (Math.abs(m - n) > 1) return Math.abs(m - n);
	const d: number[][] = [];
	for (let i = 0; i <= m; i++) {
		d[i] = [];
		for (let j = 0; j <= n; j++) {
			d[i][j] = i === 0 ? j : j === 0 ? i : 0;
		}
	}
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			d[i][j] = Math.min(
				d[i - 1][j] + 1,
				d[i][j - 1] + 1,
				d[i - 1][j - 1] + cost,
			);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
			}
		}
	}
	return d[m][n];
}

/**
 * Remove diacritics for lenient comparison: French accents (é→e, ç→c),
 * Greek tonos/dialytika, Latin macrons (ā→a). Ligatures without NFD
 * decomposition (œ, æ, ß) are mapped explicitly.
 */
export function stripDiacritics(input: string): string {
	return input
		.replace(/œ/g, "oe")
		.replace(/æ/g, "ae")
		.replace(/Œ/g, "OE")
		.replace(/Æ/g, "AE")
		.replace(/ß/g, "ss")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
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
