import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GetSummary } from "@/app/lib/client";

export default async function Page() {
	const summary = await GetSummary()
	return (
		<div className="flex justify-center p-4">
			<Card className="w-full max-w-sm bg-blue-300">
				<CardHeader>
					<CardDescription>Tournament Count</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{summary.tournamentCount}
					</CardTitle>
				</CardHeader>
			</Card>
		</div>
	)
}
