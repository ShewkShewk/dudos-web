"use server"

import { revalidatePath } from "next/cache"
import { DeleteTournament, ImportTournament } from "@/app/lib/client";

export async function importTournament(tournamentId: number) {
	await ImportTournament(tournamentId).then(() => true)
	revalidatePath("/tournaments")
}

export async function deleteTournament(tournamentId: number) {
	await DeleteTournament(tournamentId)
	revalidatePath("/tournaments")
}
