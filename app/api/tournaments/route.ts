import { GetTournaments } from "@/app/lib/client";
import { auth } from "@/auth";

export async function GET() {
	const session = await auth()
	if (!session?.user) {
		return Response.json({error: 'Unauthorized'}, {status: 401})
	}
	const tournaments = await GetTournaments()
	return Response.json(tournaments)
}
