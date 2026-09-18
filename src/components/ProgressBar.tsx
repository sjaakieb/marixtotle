type Props = { current: number; total: number };

export function ProgressBar({ current, total }: Props) {
	const pct = total === 0 ? 0 : (current / total) * 100;
	return (
		<div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
			<div
				className="h-full rounded-full bg-emerald-500 transition-all duration-300"
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}
