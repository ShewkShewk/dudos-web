import { Tournament } from "@/app/lib/domain";
import { useCallback, useEffect, useState } from "react";
import { TournamentPairings } from "@/app/lib/domain";
import { EventPairingTable, HiddenEventsBar } from "@/app/tournaments/pairings/event-pairings";
import { useHiddenEvents } from "@/app/tournaments/pairings/use-hidden-events";
import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";
import { Button } from "@/components/ui/button";

const PAIRINGS_POLL_INTERVAL_MS = 30_000

interface TournamentPairingsProps {
	tournament: Tournament
	userEmail: string
}

export function TournamentPairingsTable({tournament, userEmail}: TournamentPairingsProps) {
	const {refreshTournaments, importTournament} = useSharedTournaments()
	const {hiddenEvents, hideEvent, showEvent, showAllEvents} = useHiddenEvents(userEmail, tournament.id)
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

	// Imports run on their own cadence elsewhere; just re-read the latest pairings.
	useEffect(() => {
		const interval = setInterval(() => {
			refreshTournamentPairings().catch(console.error)
		}, PAIRINGS_POLL_INTERVAL_MS)
		return () => clearInterval(interval)
	}, [refreshTournamentPairings])

	if (tournamentPairings == null) {
		return (
			<div>
				Retrieving latest pairings...
			</div>
		)
	}
	const eventPairings = [...tournamentPairings.eventPairings].sort((a, b) => a.pairings.length - b.pairings.length)
	const visibleEventPairings = eventPairings.filter(pairing => !hiddenEvents.has(pairing.name))
	const hiddenEventNames = eventPairings.filter(pairing => hiddenEvents.has(pairing.name)).map(pairing => pairing.name)

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

			{
				hiddenEventNames.length > 0 &&
				<HiddenEventsBar hiddenEventNames={hiddenEventNames} onShow={showEvent} onShowAll={showAllEvents}/>
			}

			<div className="min-w-0 max-w-full columns-1 gap-1 space-y-1 overflow-hidden md:columns-2">
				{
					visibleEventPairings.map(pairing => (
						<div key={pairing.name}
						     className="inline-block w-full min-w-0 max-w-full break-inside-avoid overflow-hidden">
							<EventPairingTable eventPairing={pairing} onHide={() => hideEvent(pairing.name)}/>
						</div>
					))
				}
			</div>
		</div>

	)
}
