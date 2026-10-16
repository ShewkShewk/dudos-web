import "server-only";
import apiRequest from "@/app/lib/auth";
import {
	Event,
	SpeakerAward,
	Summary,
	Tournament,
	TournamentEventSchoolCounts,
	TournamentPairings,
	TournamentSchoolsStatus
} from "@/app/lib/domain";

export async function GetTournaments(): Promise<Tournament[]> {
	return apiRequest<Tournament[]>("/tournaments", {method: "GET"})
}

export async function ImportTournament(tournamentId: number) {
	return apiRequest(`/tournaments/${tournamentId}/import`, {method: "POST"})
}

export async function DeleteTournament(tournamentId: number) {
	return apiRequest(`/tournaments/${tournamentId}`, {method: "DELETE"})
}

export async function GetLatestPairings(tournamentId: string): Promise<TournamentPairings> {
	return apiRequest<TournamentPairings>(`/tournaments/${tournamentId}/pairings/latest`, {method: "GET"})
}

export async function GetSchoolsStatus(tournamentId: string): Promise<TournamentSchoolsStatus> {
	return apiRequest<TournamentSchoolsStatus>(`/tournaments/${tournamentId}/schools/status`, {method: "GET"})
}

export async function GetEventSchoolCounts(tournamentId: string): Promise<TournamentEventSchoolCounts> {
	return apiRequest<TournamentEventSchoolCounts>(`/tournaments/${tournamentId}/events/schools`, {method: "GET"})
}

export async function GetEvents(tournamentId: string): Promise<Event[]> {
	return apiRequest<Event[]>(`/tournaments/${tournamentId}/events`, {method: "GET"})
}

export async function GetSpeakerAwards(tournamentId: string, eventId: string, limit: string | null): Promise<SpeakerAward[]> {
	return apiRequest<SpeakerAward[]>(`/tournaments/${tournamentId}/events/${eventId}/awards/speakers`, {
		method: "GET",
		params: limit == null ? {} : {limit}
	})
}

export async function GetSummary(): Promise<Summary> {
	return apiRequest<Summary>(`/summary`, {method: "GET"})
}
