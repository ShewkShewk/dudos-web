import { GetEvents, GetSpeakerAwards, GetTournaments } from "@/app/lib/client";
import { auth } from "@/auth";
import { renderSpeakerAwardsPdf } from "@/app/tournaments/awards/awards-pdf";

import { NextRequest } from 'next/server';

// GET ?events=<eventId>:<awards>,<eventId>:<awards>,... returns a speaker awards PDF with one page
// per event in the order given. The coaches' sheets are at /awards/coaches/report.
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
	if (requested.length == 0 || requested.some(item =>
		item.length != 2 || !Number.isInteger(item[0]) || !Number.isInteger(item[1]) || item[1] < 1)) {
		return Response.json({error: 'Invalid events parameter'}, {status: 400})
	}

	const [tournaments, events] = await Promise.all([GetTournaments(), GetEvents(tournamentId)])
	const tournament = tournaments.find(t => String(t.id) == tournamentId)
	if (tournament == null) {
		return Response.json({error: 'Tournament not found'}, {status: 404})
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
	const pdf = await renderSpeakerAwardsPdf(tournament, eventAwards)
	const fileName = `${tournament.name} - Speaker Awards.pdf`
	return new Response(new Uint8Array(pdf), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${fileName.replace(/[^\x20-\x7E]|"/g, "")}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
		},
	})
}
