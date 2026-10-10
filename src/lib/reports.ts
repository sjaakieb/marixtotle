import { z } from "zod";

export const reportReasons = [
	"wrong-answer",
	"typo",
	"unclear-prompt",
	"missing-alternative",
	"other",
] as const;

export type ReportReason = (typeof reportReasons)[number];

export const reportReasonLabels: Record<ReportReason, string> = {
	"wrong-answer": "Antwoord klopt niet",
	typo: "Typefout in de vraag",
	"unclear-prompt": "Vraag is onduidelijk",
	"missing-alternative": "Mijn antwoord zou ook goed moeten zijn",
	other: "Anders",
};

export const reportStatuses = ["open", "fixed", "wontfix"] as const;
export type ReportStatus = (typeof reportStatuses)[number];

/** Strip ASCII control chars (keep \n\t) to avoid log/CSV injection. */
function cleanText(s: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional sanitization of control chars
	return s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
}

const textField = (max: number) =>
	z
		.string()
		.max(max)
		.transform((s) => cleanText(s).trim());

export const createReportSchema = z.object({
	chapterId: textField(120).pipe(z.string().min(1)),
	itemKey: textField(240).pipe(z.string().min(1)),
	exerciseId: textField(240).pipe(z.string().min(1)),
	level: z.number().int().min(1).max(5).nullish(),
	prompt: textField(500).pipe(z.string().min(1)),
	answer: textField(500).pipe(z.string().min(1)),
	userInput: textField(500).nullish(),
	reason: z.enum(reportReasons),
	message: textField(500).default(""),
	/** Honeypot: legit clients leave it empty; bots fill it. */
	website: z.string().max(200).optional().default(""),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const updateReportSchema = z.object({
	status: z.enum(reportStatuses),
	adminNote: textField(1000).default(""),
});

export type UpdateReportInput = z.infer<typeof updateReportSchema>;
