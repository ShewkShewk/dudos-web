import { GetTournaments } from "@/app/lib/client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";

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
					<TableRow key={tournament.id}>
						<TableCell>{tournament.name}</TableCell>
						<TableCell>{tournament.date}</TableCell>
						<TableCell>{tournament.updatedTime}</TableCell>
						<TableCell>
							<ButtonGroup>
								{
									tournament.updatedTime == "" ?
										<Button variant="constructive" size="sm" className="min-w-20">Import</Button> :
										<Button variant="refreshative" size="sm" className="min-w-20">Refresh</Button>
								}
								<Button variant="destructive" size="sm" className="min-w-20">Delete</Button>
							</ButtonGroup>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
