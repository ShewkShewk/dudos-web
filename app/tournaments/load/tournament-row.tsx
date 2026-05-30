"use client"

import { TableCell, TableRow } from "@/components/ui/table";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { Tournament } from "@/app/lib/domain";
import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";

interface TournamentRowProps {
	tournament: Tournament;
}

export default function TournamentRow({tournament}: TournamentRowProps) {
	const {refreshTournaments, importTournament, deleteTournament} = useSharedTournaments()
	const [pending, startTransition] = useTransition();

	const handleImport = () => {
		startTransition(async () => {
			await importTournament(tournament.id)
			await refreshTournaments()
		})
	}
	const handleDelete = () => {
		startTransition(async () => {
			await deleteTournament(tournament.id)
			await refreshTournaments()
		})
	}
	return <TableRow key={tournament.id}>
		<TableCell>{tournament.name}</TableCell>
		<TableCell>{tournament.date}</TableCell>
		<TableCell>{tournament.updatedTime}</TableCell>
		<TableCell>
			<ButtonGroup>
				{
					tournament.updatedTime == "" ?
						<Button variant="constructive" size="sm" className="min-w-20"
						        disabled={pending} onClick={handleImport}>Import</Button> :
						<Button variant="refreshative" size="sm" className="min-w-20"
						        disabled={pending} onClick={handleImport}>Refresh</Button>
				}
				<Button variant="destructive" size="sm" className="min-w-20" disabled={pending}
				        onClick={handleDelete}>Delete</Button>
			</ButtonGroup>
		</TableCell>
	</TableRow>
}
