import { GetLatestPairings, GetTournaments } from "@/app/lib/client";
import { auth } from "@/auth";

import { NextRequest, NextResponse } from 'next/server';

interface RouteProps {
	params: Promise<{ tournamentId: number }>;
}

export async function GET(request: NextRequest, {params}: RouteProps) {
	const session = await auth()
	if (!session?.user) {
		return Response.json({error: 'Unauthorized'}, {status: 401})
	}
	const tournamentId = (await params).tournamentId
	return NextResponse.json(await GetLatestPairings(tournamentId))
}
