import { GetTournaments } from "@/app/lib/client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function Tournaments() {
	const tournaments = await GetTournaments()
	return (
		<Table>
			<TableCaption>Tournaments available for import.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Date</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tournaments.map(tournament => (
					<TableRow key={tournament.id}>
						<TableCell>{tournament.name}</TableCell>
						<TableCell>{tournament.date}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
