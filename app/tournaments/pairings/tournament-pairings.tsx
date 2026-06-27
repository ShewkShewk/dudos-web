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
		<div>
			<h2 className="text-center bg-blue-400 rounded-md font-bold m-2">
				Last updated: {tournamentPairings.updateTime}
			</h2>
			<div className="min-w-0 max-w-full columns-1 gap-1 space-y-1 overflow-hidden md:columns-2">
				{
					tournamentPairings.eventPairings.map(pairing => (
						<div key={pairing.name}
						     className="inline-block w-full min-w-0 max-w-full break-inside-avoid overflow-hidden">
							<EventPairingTable eventPairing={pairing}/>
						</div>
					))
				}
			</div>
		</div>

	)
}
