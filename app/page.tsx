import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GetSummary } from "@/app/lib/client";

export default async function Page() {
	const summary = await GetSummary()
	return (
		<div className="grid gap-6 p-6 sm:grid-cols-2">
			<Card
				className="group relative overflow-hidden border-blue-200/60 bg-gradient-to-br from-blue-500 via-sky-400 to-cyan-300 text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30">
				<div
					className="absolute -right-10 -top-10 size-32 rounded-full bg-white/20 blur-2xl transition-transform duration-300 group-hover:scale-125"/>
				<div className="absolute bottom-0 left-0 h-1 w-full bg-white/30"/>
				<CardHeader className="relative">
					<CardDescription className="font-medium text-white/80">
						Tournament Count
					</CardDescription>
					<CardTitle className="text-5xl font-bold tracking-tight tabular-nums">
						{summary.tournamentCount}
					</CardTitle>
					<p className="text-sm text-white/75">
						Total tournaments currently tracked
					</p>
				</CardHeader>
			</Card>
			<Card
				className="group relative overflow-hidden border-violet-200/60 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-400 text-white shadow-xl shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/30">
				<div
					className="absolute -right-10 -top-10 size-32 rounded-full bg-white/20 blur-2xl transition-transform duration-300 group-hover:scale-125"/>
				<div className="absolute bottom-0 left-0 h-1 w-full bg-white/30"/>
				<CardHeader className="relative">
					<CardDescription className="font-medium text-white/80">
						Round Count
					</CardDescription>
					<CardTitle className="text-5xl font-bold tracking-tight tabular-nums">
						{summary.roundCount}
					</CardTitle>
					<p className="text-sm text-white/75">
						Total rounds imported across tournaments
					</p>
				</CardHeader>
			</Card>
		</div>
	)
}
