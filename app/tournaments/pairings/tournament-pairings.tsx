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
	tournamentPairings.eventPairings.sort((a, b) => a.pairings.length - b.pairings.length)

	return (
		<div className="columns-1 md:columns-2 space-y-4 md:space-y-0">
			{
				tournamentPairings.eventPairings.map(pairing => (
					<div key={pairing.name} className="break-inside-avoid mb-4">
						<EventPairingTable eventPairing={pairing}/>
					</div>
				))
			}
		</div>
	)
}
