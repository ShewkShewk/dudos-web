import "server-only";
import apiRequest from "@/app/lib/auth";

type Tournament = {
	id: number;
	date: string;
	name: string;
}

export async function GetTournaments(): Promise<Tournament[]> {
	return apiRequest<Tournament[]>("/tournaments", {method: "GET"})
}
