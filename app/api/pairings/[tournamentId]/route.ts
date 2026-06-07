import { GetLatestPairings, GetTournaments } from "@/app/lib/client";
import { auth } from "@/auth";

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, {params}: { params: Promise<{ tournamentId: string; }>; }) {
	const session = await auth()
	if (!session?.user) {
		return Response.json({error: 'Unauthorized'}, {status: 401})
	}
	const tournamentId = (await params).tournamentId
	return NextResponse.json(await GetLatestPairings(tournamentId))
}
