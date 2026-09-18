import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-dvh bg-stone-50 flex items-center justify-center p-5">
			<div className="rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
				<h2 className="text-xl font-bold text-stone-900">
					Hoofdstuk niet gevonden
				</h2>
				<Link
					href="/"
					className="mt-4 inline-block rounded-xl bg-sky-600 px-6 py-2 font-semibold text-white"
				>
					Terug naar overzicht
				</Link>
			</div>
		</div>
	);
}
