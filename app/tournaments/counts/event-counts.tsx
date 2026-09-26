import { EventSchoolCounts, Tournament, TournamentEventSchoolCounts } from "@/app/lib/domain";
import { useCallback, useEffect, useState } from "react";
import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CountsByEventsProps {
	tournament: Tournament
}

export function CountsByEventsTable({tournament}: CountsByEventsProps) {
	const {tournaments, importTournament} = useSharedTournaments()
	const updatedTime = tournaments.find(t => t.id == tournament.id)?.updatedTime ?? tournament.updatedTime
	const [eventCounts, setEventCounts] = useState<TournamentEventSchoolCounts | null>(null)
	const refreshEventCounts = useCallback(async () => {
		const response = await fetch(`/api/tournaments/${tournament.id}/events/schools`)
		if (!response.ok) {
			throw new Error(`Failed to fetch event counts for ${tournament.id}`)
		}
		response.json().then(r => setEventCounts(r))
	}, [tournament.id])

	useEffect(() => {
		refreshEventCounts()
	}, [tournament, refreshEventCounts])

	if (eventCounts == null) {
		return (
			<div>
				Retrieving event counts...
			</div>
		)
	}

	return (
		<div>
			<div className="flex mt-1 ml-1 mr-1">
				<h2 className="flex text-center items-center justify-center bg-blue-400 w-9/10 rounded-l-lg font-bold">
					Last Updated: {formatCentralTime(updatedTime)}
				</h2>
				<Button
					className="w-1/10 bg-green-300 rounded-none rounded-r-lg border-0 text-black cursor-pointer"
					onClick={
						async () => {
							await importTournament(tournament.id)
							await refreshEventCounts()
						}}>
					Refresh
				</Button>
			</div>

			{eventCounts.events.length == 0 &&
                <h2 className="mt-4 text-center text-xl font-semibold">No active entries</h2>}

			<div className="min-w-0 max-w-full columns-1 gap-1 space-y-1 overflow-hidden md:columns-2 mt-1">
				{eventCounts.events.map(event => (
					<div key={event.id} className="inline-block w-full min-w-0 max-w-full break-inside-avoid overflow-hidden">
						<EventCountsCard event={event}/>
					</div>
				))}
			</div>
		</div>
	)
}

function EventCountsCard({event}: { event: EventSchoolCounts }) {
	return (
		<Card className="m-1 p-0 border rounded-sm gap-0">
			<CardHeader className="items-center text-center text-sm">
				<CardTitle className="font-light leading-tight">{event.name}</CardTitle>
			</CardHeader>
			<CardContent className="p-1">
				<Table className="w-full table-fixed">
					<colgroup>
						<col className="w-[60%]"/>
						<col className="w-[20%]"/>
						<col className="w-[20%]"/>
					</colgroup>
					<TableHeader>
						<TableRow className="text-sm">
							<TableHead className="py-0 text-xs">School</TableHead>
							<TableHead className="py-0 text-xs text-right">Entries</TableHead>
							<TableHead className="py-0 text-xs text-right">Students</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{event.schools.map(school => (
							<TableRow key={school.id} className="even:bg-gray-200">
								<TableCell className="py-0 text-xs whitespace-normal wrap-break-words">{school.name}</TableCell>
								<TableCell className="py-0 text-xs text-right tabular-nums">{school.entryCount}</TableCell>
								<TableCell className="py-0 text-xs text-right tabular-nums">{school.studentCount}</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow className="font-bold">
							<TableCell className="py-0 text-xs">Total</TableCell>
							<TableCell className="py-0 text-xs text-right tabular-nums">{event.entryCount}</TableCell>
							<TableCell className="py-0 text-xs text-right tabular-nums">{event.studentCount}</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</CardContent>
		</Card>
	)
}

// Tournament.updatedTime is stored as UTC ("2026-09-26T13:18:09"); show it in Central
// like the backend's updateTime fields ("2026-09-26 8:18AM").
function formatCentralTime(utcTime: string) {
	const date = new Date(`${utcTime}Z`)
	if (!utcTime || isNaN(date.getTime())) {
		return "Unknown"
	}
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-US", {
			timeZone: "America/Chicago",
			year: "numeric", month: "2-digit", day: "2-digit",
			hour: "numeric", minute: "2-digit", hour12: true,
		}).formatToParts(date).map(part => [part.type, part.value])
	)
	return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}${parts.dayPeriod}`
}
