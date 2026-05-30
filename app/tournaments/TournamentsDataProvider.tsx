"use client"

import React, {
	createContext, useCallback,
	useContext, useEffect,
	useState,
} from "react";
import { Tournament } from "@/app/lib/domain";
import { deleteTournamentAction, importTournamentAction } from "@/app/tournaments/actions";

type SharedTournamentsContextValue = {
	tournaments: Tournament[]
	refreshTournaments: () => Promise<void>
	importTournament: (id: number) => Promise<void>
	deleteTournament: (id: number) => Promise<void>
	loading: boolean
}

const SharedTournamentContext = createContext<SharedTournamentsContextValue | null>(null)

export function TournamentsDataProvider({children}: { children: React.ReactNode }) {
	const [tournaments, setTournaments] = useState<Tournament[]>([])
	const [loading, setLoading] = useState(true)

	const refreshTournaments = useCallback(async () => {
		setLoading(true)
		const response = await fetch("/api/tournaments")
		if (!response.ok) {
			throw new Error("Failed to fetch tournaments")
		}
		setTournaments(await response.json() as Tournament[])
		setLoading(false)
	}, [])

	const importTournament = useCallback(async (tournamentId: number) => {
		setLoading(true)
		await importTournamentAction(tournamentId)
		await refreshTournaments()
		setLoading(false)
	}, [refreshTournaments])

	const deleteTournament = useCallback(async (tournamentId: number) => {
		setLoading(true)
		await deleteTournamentAction(tournamentId)
		await refreshTournaments()
		setLoading(false)
	}, [refreshTournaments])

	useEffect(() => {
		refreshTournaments()
	}, [refreshTournaments])

	return (
		<SharedTournamentContext.Provider
			value={{tournaments, refreshTournaments, loading, importTournament, deleteTournament}}>
			{children}
		</SharedTournamentContext.Provider>
	)
}

export function useSharedTournaments() {
	const context = useContext(SharedTournamentContext)
	if (!context) {
		throw new Error("useSharedTournaments must be used within a SharedTournamentsProvider")
	}
	return context
}
