"use client"

import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TournamentRow from "@/app/tournaments/load/tournament-row";
import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";

export default function Tournaments() {
	const {tournaments} = useSharedTournaments()
	return (
		<Table>
			<TableCaption>Tournaments available for import.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Updated Time</TableHead>
					<TableHead>Import/Delete</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tournaments.map(tournament => (
					<TournamentRow tournament={tournament} key={tournament.id}/>
				))}
			</TableBody>
		</Table>
	)
}
