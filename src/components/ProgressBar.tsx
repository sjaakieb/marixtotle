type Props = { current: number; total: number };

export function ProgressBar({ current, total }: Props) {
	const pct = total === 0 ? 0 : (current / total) * 100;
	return (
		<div className="h-5 w-full border-[3px] border-stone-900 bg-stone-200 dark:border-black dark:bg-stone-800">
			<div
				className="pixel-progress-fill h-full bg-emerald-500 transition-all duration-300"
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}
