"use client"

import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";
import { Tournament } from "@/app/lib/domain";
import { useState } from "react";
import { TournamentPicker } from "@/app/tournaments/pairings/tournament-picker";
import { SpeakerAwardEventsTable } from "@/app/tournaments/speaker-awards/speaker-award-events";

export default function Page() {
	const {tournaments} = useSharedTournaments()
	const [chosenTournament, setChosenTournament] = useState<Tournament | null>(null)
	let speakerAwards = <h2 className="mt-4 text-center text-2xl font-semibold">☝️Please choose a
		tournament☝️</h2>;
	if (chosenTournament != null) {
		speakerAwards = <SpeakerAwardEventsTable key={chosenTournament.id} tournament={chosenTournament}/>
	}
	return (
		<div>
			<TournamentPicker tournaments={tournaments.filter((tournament) => {
				return tournament.loaded
			})} tournamentSetter={setChosenTournament}></TournamentPicker>
			{speakerAwards}
		</div>
	)
}
