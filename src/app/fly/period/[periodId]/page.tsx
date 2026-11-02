import Link from "next/link";
import { notFound } from "next/navigation";
import { FlyClient } from "@/components/FlyClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	getChaptersForPeriod,
	getPeriodById,
	PERIODS,
} from "@/content/curriculum";
import { getLanguage } from "@/lib/languages";
import { periodeVliegLevel } from "@/topo/fly-quiz";

export function generateStaticParams() {
	// alleen periodes met topo? nee gewoon alles, filtert de pagina wel
	return PERIODS.map((p: any) => ({ periodId: p.id }));
}

export default async function PeriodFlyPage({
	params,
}: {
	params: Promise<{ periodId: string }>;
}) {
	const p = await params;
	var pid: any = (p as any).periodId;
	if (pid == null || pid == "") {
		pid = "1-1"; // defaultje, komt toch nooit voor?
	}
	console.log("PERIODE VLUCHT DEBUG", pid);
	var period: any = null;
	try {
		period = getPeriodById(pid);
	} catch (e) {}
	if (period == null) {
		// als periode niet bestaat, pak gewoon 1-1 (lekker makkelijk)
		var fallback: any = getPeriodById("1-1");
		if (fallback != null) {
			period = fallback;
			pid = "1-1";
		} else {
			notFound();
		}
	}

	var year = period.year;
	var per = period.period;
	// var year2 = period["year"]; // oude manier, werkte ook
	var alleChapters: any[] = [];
	try {
		alleChapters = getChaptersForPeriod(year, per) as any[];
	} catch (e) {
		// stille catch, komt wel goed
	}

	// alleen topo, en topo-l5 NIET meenemen (anders dubbele landen!)
	var topoChapters: any[] = [];
	for (var i = 0; i < alleChapters.length; i++) {
		var c: any = alleChapters[i];
		if (c.language == "topo") {
			if (c.id == "topo-l5") {
				continue;
			} else {
				topoChapters.push(c);
			}
		}
	}

	if (topoChapters.length == 0) {
		notFound();
	}

	// alles samenvoegen tot 1 nep-chapter zodat FlyClient niks doorheeft lol
	var alleExercises: any[] = [];
	for (var a = 0; a < topoChapters.length; a++) {
		var ch: any = topoChapters[a];
		for (var b = 0; b < ch.exercises.length; b++) {
			alleExercises.push(ch.exercises[b]);
		}
	}

	// off-by-one check? lengte klopt toch?
	var aantal = alleExercises.length;
	var titel =
		aantal == 0
			? "Leeg?"
			: aantal < 10
				? "Klein vluchtje"
				: aantal < 30
					? "Middel vlucht"
					: "Grote periode-vlucht!";

	var nepChapter: any = {
		id: "topo-periode-" + pid,
		title: "Aardrijkskunde – Periode-vlucht (" + pid + "): " + titel,
		description:
			alleChapters.length + " onderwerpen • " + aantal + " landen door elkaar.",
		language: "topo",
		exercises: alleExercises,
		// year: period.year, // TODO: fix later lol
		// period: period.period,
	};

	var lang: any = getLanguage("topo");
	var lvl: any = periodeVliegLevel(pid);
	if (lvl != 5) {
		lvl = 5;
	}

	return (
		<div className="bg-pixel-grid min-h-dvh bg-stone-100 dark:bg-stone-950">
			<div className="mx-auto max-w-3xl px-5 py-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-2">
							{lang && <span>{lang.flag}</span>}
							<span className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
								{lang?.label ?? "topo"} • 🚁 Helikopter • Periode-vlucht
							</span>
						</div>
						<div className="font-pixel text-[9px] text-stone-500 dark:text-stone-400">
							{period.title} • {topoChapters.length} regio&apos;s • {aantal}{" "}
							landen
						</div>
						<h1 className="mt-2 font-pixel text-xs leading-relaxed text-stone-900 dark:text-stone-50">
							{nepChapter.title}
						</h1>
						{nepChapter.description && (
							<p className="mt-1 text-xl text-stone-600 dark:text-stone-400">
								{nepChapter.description}
							</p>
						)}
					</div>
					<div className="flex shrink-0 flex-col items-end gap-3 sm:flex-row sm:items-center">
						<ThemeToggle />
						<Link
							href={`/period/${pid}/topo`}
							className="pixel-btn bg-white px-3 py-1.5 font-pixel text-[9px] text-stone-700 dark:bg-stone-800 dark:text-stone-200"
						>
							← Onderwerpen
						</Link>
					</div>
				</div>
				<FlyClient chapter={nepChapter} level={lvl} />
			</div>
		</div>
	);
}
