import { Tournament } from "@/app/lib/domain";
import { useEffect, useState } from "react";
import { TournamentPairings } from "@/app/lib/domain";
import { EventPairingTable } from "@/app/tournaments/pairings/event-pairings";

interface TournamentPairingsProps {
	tournament: Tournament
}

export function TournamentPairingsTable({tournament}: TournamentPairingsProps) {
	const [tournamentPairings, setTournamentPairings] = useState<TournamentPairings | null>(null)
	useEffect(() => {
		const getTournamentPairings = async () => {
			const response = await fetch(`/api/pairings/${tournament.id}`)
			if (!response.ok) {
				throw new Error(`Failed to fetch latest pairings for ${tournament.id}`)
			}
			setTournamentPairings(await response.json() as TournamentPairings)
		}
		getTournamentPairings()
	}, [tournament])
	if (tournament == null) {
		return (
			<div>
				No tournament selected
			</div>
		)
	}

	if (tournamentPairings == null) {
		return (
			<div>
				Retrieving latest pairings...
			</div>
		)
	}

	return (
		<div className="inline-flex flex-wrap">
			{tournamentPairings
				.eventPairings
				.map(pairing => (
					<EventPairingTable key={pairing.name} eventPairing={pairing}/>
				))
			}
		</div>
	)
}
