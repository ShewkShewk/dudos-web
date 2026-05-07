import "server-only";
import apiRequest from "@/app/lib/auth";

export type Tournament = {
	id: number;
	date: string;
	name: string;
	updatedTime: string
}

export async function GetTournaments(): Promise<Tournament[]> {
	return apiRequest<Tournament[]>("/tournaments", {method: "GET"})
}

export async function ImportTournament(tournamentId: number) {
	return apiRequest(`/tournaments/${tournamentId}/import`, {method: "POST"})
}

export async function DeleteTournament(tournamentId: number) {
	return apiRequest(`/tournaments/${tournamentId}`, {method: "DELETE"})
}
