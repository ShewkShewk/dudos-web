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
	const leftColPairings = tournamentPairings.eventPairings.filter((value, index) => {
		return index % 2 == 0
	})
	const rightColPairings = tournamentPairings.eventPairings.filter((value, index) => {
		return index % 2 == 1
	})

	return (
		<div className="flex">
			<div className="inline-flex flex-wrap flex-col basis-1/2">
				{
					leftColPairings.map(pairing => (
						<EventPairingTable key={pairing.name} eventPairing={pairing}/>
					))
				}
			</div>
			<div className="inline-flex flex-wrap flex-col basis-1/2">
				{
					rightColPairings.map(pairing => (
						<EventPairingTable key={pairing.name} eventPairing={pairing}/>
					))
				}
			</div>
		</div>
	)
}
