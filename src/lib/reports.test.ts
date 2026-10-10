import { describe, expect, it } from "vitest";
import {
	createReportSchema,
	reportReasonLabels,
	reportReasons,
	updateReportSchema,
} from "./reports";

const valid = {
	chapterId: "caput-1",
	itemKey: "vocab:latin:puella",
	exerciseId: "vocab:latin:puella-L3",
	level: 3,
	prompt: "het meisje",
	answer: "puella",
	userInput: "puela",
	reason: "wrong-answer",
	message: "Typfoutje?",
	website: "",
} as const;

describe("createReportSchema", () => {
	it("accepts a valid report", () => {
		const parsed = createReportSchema.safeParse(valid);
		expect(parsed.success).toBe(true);
	});

	it("rejects unknown reasons", () => {
		const parsed = createReportSchema.safeParse({
			...valid,
			reason: "definitely-wrong",
		});
		expect(parsed.success).toBe(false);
	});

	it("rejects empty prompt/answer", () => {
		expect(
			createReportSchema.safeParse({ ...valid, prompt: "  " }).success,
		).toBe(false);
		expect(createReportSchema.safeParse({ ...valid, answer: "" }).success).toBe(
			false,
		);
	});

	it("caps free-text length", () => {
		const parsed = createReportSchema.safeParse({
			...valid,
			message: "x".repeat(501),
		});
		expect(parsed.success).toBe(false);
	});

	it("strips control characters", () => {
		const parsed = createReportSchema.safeParse({
			...valid,
			message: "a\x00b\x1fc",
		});
		expect(parsed.success).toBe(true);
		if (parsed.success) expect(parsed.data.message).toBe("abc");
	});

	it("allows missing optional fields", () => {
		const { level, userInput, message, ...minimal } = valid;
		const parsed = createReportSchema.safeParse(minimal);
		expect(parsed.success).toBe(true);
		if (parsed.success) {
			expect(parsed.data.level).toBeUndefined();
			expect(parsed.data.message).toBe("");
		}
	});

	it("every reason has a Dutch label", () => {
		for (const reason of reportReasons) {
			expect(reportReasonLabels[reason]).toMatch(/.+/);
		}
	});
});

describe("updateReportSchema", () => {
	it("accepts status transitions with a note", () => {
		expect(
			updateReportSchema.safeParse({ status: "fixed", adminNote: "ok" })
				.success,
		).toBe(true);
	});

	it("rejects unknown statuses", () => {
		expect(
			updateReportSchema.safeParse({ status: "deleted", adminNote: "" })
				.success,
		).toBe(false);
	});
});
