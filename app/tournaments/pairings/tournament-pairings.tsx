import { Tournament } from "@/app/lib/domain";
import { useCallback, useEffect, useState } from "react";
import { TournamentPairings } from "@/app/lib/domain";
import { EventPairingTable } from "@/app/tournaments/pairings/event-pairings";
import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";
import { Button } from "@/components/ui/button";

interface TournamentPairingsProps {
	tournament: Tournament
}

export function TournamentPairingsTable({tournament}: TournamentPairingsProps) {
	const {refreshTournaments, importTournament} = useSharedTournaments()
	const [tournamentPairings, setTournamentPairings] = useState<TournamentPairings | null>(null)
	const refreshTournamentPairings = useCallback(async () => {
		const response = await fetch(`/api/pairings/${tournament.id}`)
		if (!response.ok) {
			throw new Error(`Failed to fetch latest pairings for ${tournament.id}`)
		}
		response.json().then(r => setTournamentPairings(r))
	}, [tournament.id])

	useEffect(() => {
		refreshTournamentPairings()
	}, [tournament])
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
			<div className="flex mt-1 ml-1 mr-1">
				<h2 className="flex text-center items-center justify-center bg-blue-400 w-9/10 rounded-l-lg font-bold">
					Last Updated: {tournamentPairings.updateTime}
				</h2>
				<Button
					className="w-1/10 bg-green-300 rounded-none rounded-r-lg border-0 text-black cursor-pointer"
					onClick={
						async () => {
							await importTournament(tournament.id)
							await refreshTournaments()
							await refreshTournamentPairings()
						}}>
					Refresh
				</Button>
			</div>

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
