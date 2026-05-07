import { GetTournaments } from "@/app/lib/client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TournamentRow from "@/app/tournaments/tournament-row";

export default async function Tournaments() {
	const tournaments = await GetTournaments()
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
