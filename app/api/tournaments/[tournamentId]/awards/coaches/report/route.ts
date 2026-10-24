import { GetEvents, GetSchoolResults, GetSpeakerAwards, GetTournaments } from "@/app/lib/client";
import { auth } from "@/auth";
import { renderCoachesSheetsPdf } from "@/app/tournaments/awards/awards-pdf";

import { NextRequest } from 'next/server';

// GET ?events=<eventId>:<awards>,<eventId>:<awards>,... returns the coaches' sheets: one page per
// school in the tournament's results, with the speaker awards for the given events. events may be
// empty, which leaves speaker awards off the sheets.
export async function GET(request: NextRequest, {params}: { params: Promise<{ tournamentId: string; }>; }) {
	const session = await auth()
	if (!session?.user) {
		return Response.json({error: 'Unauthorized'}, {status: 401})
	}
	const tournamentId = (await params).tournamentId

	const requested = (request.nextUrl.searchParams.get("events") ?? "")
		.split(",")
		.filter(item => item != "")
		.map(item => item.split(":").map(Number))
	if (requested.some(item =>
		item.length != 2 || !Number.isInteger(item[0]) || !Number.isInteger(item[1]) || item[1] < 1)) {
		return Response.json({error: 'Invalid events parameter'}, {status: 400})
	}

	const [tournaments, events, results] = await Promise.all([
		GetTournaments(), GetEvents(tournamentId), GetSchoolResults(tournamentId),
	])
	const tournament = tournaments.find(t => String(t.id) == tournamentId)
	if (tournament == null) {
		return Response.json({error: 'Tournament not found'}, {status: 404})
	}
	if (results == null || results.length == 0) {
		return Response.json({error: 'No school results'}, {status: 404})
	}
	const requestedEvents = requested.map(([eventId, count]) => ({
		event: (events ?? []).find(event => event.id == eventId),
		count,
	}))
	if (requestedEvents.some(({event, count}) => event == null || count > event.speakerAwardsCount)) {
		return Response.json({error: 'Unknown event or more awards than available'}, {status: 400})
	}

	const eventAwards = await Promise.all(requestedEvents.map(async ({event, count}) => ({
		eventId: event!.id,
		eventName: event!.name,
		requested: count,
		awards: await GetSpeakerAwards(tournamentId, String(event!.id), String(count)),
	})))
	const pdf = await renderCoachesSheetsPdf(tournament, results, eventAwards)
	const fileName = `${tournament.name} - Coaches' Sheets.pdf`
	return new Response(new Uint8Array(pdf), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${fileName.replace(/[^\x20-\x7E]|"/g, "")}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
		},
	})
}
