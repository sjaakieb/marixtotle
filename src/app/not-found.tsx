import Link from "next/link";

export default function NotFound() {
	return (
		<div className="bg-pixel-grid flex min-h-dvh items-center justify-center bg-stone-100 p-5 dark:bg-stone-950">
			<div className="pixel-panel bg-white p-8 text-center dark:bg-stone-900">
				<h2 className="font-pixel text-sm leading-relaxed text-stone-900 dark:text-stone-50">
					Hoofdstuk niet gevonden
				</h2>
				<Link
					href="/"
					className="pixel-btn mt-6 inline-block bg-sky-600 px-6 py-3 font-pixel text-[11px] text-white hover:bg-sky-500"
				>
					Terug naar overzicht
				</Link>
			</div>
		</div>
	);
}
