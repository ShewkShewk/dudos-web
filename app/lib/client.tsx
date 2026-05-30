import "server-only";
import apiRequest from "@/app/lib/auth";
import { Tournament, TournamentPairings } from "@/app/lib/domain";

export async function GetTournaments(): Promise<Tournament[]> {
	return apiRequest<Tournament[]>("/tournaments", {method: "GET"})
}

export async function ImportTournament(tournamentId: number) {
	return apiRequest(`/tournaments/${tournamentId}/import`, {method: "POST"})
}

export async function DeleteTournament(tournamentId: number) {
	return apiRequest(`/tournaments/${tournamentId}`, {method: "DELETE"})
}

export async function GetLatestPairings(tournamentId: number): Promise<TournamentPairings> {
	return apiRequest<TournamentPairings>(`/tournaments/${tournamentId}/pairings/latest`, {method: "GET"})
}
