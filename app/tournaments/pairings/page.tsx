"use client"

import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";

export default function TournamentPairings() {
	const {tournaments} = useSharedTournaments()

	return (
		<div>
			{tournaments.map(tournament => (
				<div key={tournament.id}>
					<h2>{tournament.name}</h2>
					<p>{tournament.date}</p>
				</div>
			))}
		</div>
	)
}
