"use server"

import { revalidatePath } from "next/cache"
import { DeleteTournament, ImportTournament } from "@/app/lib/client";
import { requireSession } from "@/app/session";

export async function importTournamentAction(tournamentId: number) {
	await requireSession()
	await ImportTournament(tournamentId)
	revalidatePath("/tournaments")
}

export async function deleteTournamentAction(tournamentId: number) {
	await requireSession()
	await DeleteTournament(tournamentId)
	revalidatePath("/tournaments")
}
