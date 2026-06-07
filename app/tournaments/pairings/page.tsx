"use client"

import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";
import { TournamentPicker } from "@/app/tournaments/pairings/tournament-picker";
import { Tournament } from "@/app/lib/domain";
import { useState } from "react";
import { TournamentPairingsTable } from "@/app/tournaments/pairings/tournament-pairings";

export default function Page() {
	const {tournaments} = useSharedTournaments()
	const [chosenTournament, setChosenTournament] = useState<Tournament | null>(null)
	let tournamentPairings = <div>No tournaments chosen</div>;
	if (chosenTournament != null) {
		tournamentPairings = <TournamentPairingsTable tournament={chosenTournament}/>
	}
	return (
		<div>
			<TournamentPicker tournaments={tournaments.filter((tournament) => {
				return tournament.loaded
			})} tournamentSetter={setChosenTournament}></TournamentPicker>
			{tournamentPairings}
		</div>
	)
}
