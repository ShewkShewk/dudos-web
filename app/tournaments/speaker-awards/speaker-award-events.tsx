import { Event, Tournament } from "@/app/lib/domain";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SpeakerAwardsReport = "events" | "schools"

interface SpeakerAwardEventsProps {
	tournament: Tournament
}

// Top 5 by default, top 10 for events with more than 20 speaker awards, never more than are available.
function defaultAwardCount(speakerAwardsCount: number) {
	return Math.min(speakerAwardsCount > 20 ? 10 : 5, speakerAwardsCount)
}

function parseAwardCount(value: string, max: number): number | "invalid" {
	const count = Number(value)
	if (value.trim() == "" || !Number.isInteger(count) || count < 1 || count > max) {
		return "invalid"
	}
	return count
}

async function fetchPdf(url: string) {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Failed to generate speaker awards report: ${url}`)
	}
	return response.blob()
}

function downloadPdf(pdf: Blob, fileName: string) {
	const url = URL.createObjectURL(pdf)
	const link = document.createElement("a")
	link.href = url
	link.download = fileName
	link.click()
	// Safari can cancel the download if the URL is revoked in the same tick as the click.
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function SpeakerAwardEventsTable({tournament}: SpeakerAwardEventsProps) {
	const [events, setEvents] = useState<Event[] | null>(null)
	const [awardCounts, setAwardCounts] = useState<Record<number, string>>({})
	// Events included in the report. Every event with awards starts selected.
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	// The report currently being generated. Each report has its own button because Safari only
	// keeps one download per click.
	const [generating, setGenerating] = useState<SpeakerAwardsReport | null>(null)
	const refreshEvents = useCallback(async () => {
		const response = await fetch(`/api/tournaments/${tournament.id}/events`)
		if (!response.ok) {
			throw new Error(`Failed to fetch events for ${tournament.id}`)
		}
		response.json().then((r: Event[] | null) => {
			const loadedEvents = r ?? []
			const availableEvents = loadedEvents.filter(event => event.speakerAwardsCount != 0)
			setEvents(loadedEvents)
			setAwardCounts(Object.fromEntries(availableEvents
				.map(event => [event.id, String(defaultAwardCount(event.speakerAwardsCount))])))
			setSelectedIds(new Set(availableEvents.map(event => event.id)))
		})
	}, [tournament.id])

	useEffect(() => {
		refreshEvents()
	}, [tournament, refreshEvents])

	if (events == null) {
		return (
			<div>
				Retrieving events...
			</div>
		)
	}

	const sortedEvents = [...events].sort((a, b) => a.name.localeCompare(b.name))

	if (sortedEvents.length == 0) {
		return <h2 className="mt-4 text-center text-xl font-semibold">No events</h2>
	}

	const availableEvents = sortedEvents.filter(event => event.speakerAwardsCount != 0)
	const allSelected = availableEvents.length > 0 && availableEvents.every(event => selectedIds.has(event.id))
	const parsedCounts = availableEvents
		.filter(event => selectedIds.has(event.id))
		.map(event => ({event, count: parseAwardCount(awardCounts[event.id] ?? "", event.speakerAwardsCount)}))
	const reportEvents = parsedCounts.flatMap(({event, count}) =>
		typeof count == "number" ? [{event, count}] : [])
	const canGenerate = generating == null
		&& reportEvents.length > 0
		&& reportEvents.length == parsedCounts.length

	const toggleSelected = (eventId: number, selected: boolean) => {
		const next = new Set(selectedIds)
		if (selected) {
			next.add(eventId)
		} else {
			next.delete(eventId)
		}
		setSelectedIds(next)
	}

	const generateReport = async (report: SpeakerAwardsReport) => {
		setGenerating(report)
		try {
			const eventsParam = reportEvents.map(({event, count}) => `${event.id}:${count}`).join(",")
			const pdf = await fetchPdf(`/api/tournaments/${tournament.id}/awards/speakers/report?events=${eventsParam}&report=${report}`)
			downloadPdf(pdf, report == "schools"
				? `${tournament.name} - Speaker Awards by School.pdf`
				: `${tournament.name} - Speaker Awards.pdf`)
		} catch {
			toast.error(report == "schools"
				? "Failed to generate coaches' sheets"
				: "Failed to generate speaker awards report", {position: "top-center"})
		} finally {
			setGenerating(null)
		}
	}

	return (
		<div>
			<Table className="mt-1">
				<TableHeader>
					<TableRow>
						<TableHead className="w-10 text-center">
							<input
								type="checkbox"
								className="size-4 cursor-pointer accent-blue-600 align-middle disabled:cursor-not-allowed"
								aria-label="Select all events with speaker awards"
								disabled={availableEvents.length == 0}
								checked={allSelected}
								onChange={e => setSelectedIds(e.target.checked
									? new Set(availableEvents.map(event => event.id))
									: new Set())}
							/>
						</TableHead>
						<TableHead>Event</TableHead>
						<TableHead className="text-center">Speaker Awards Available</TableHead>
						<TableHead className="text-center">Awards To Give</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedEvents.map(event => (
						<TableRow key={event.id} className="even:bg-gray-200">
							<TableCell className="text-center">
								<input
									type="checkbox"
									className="size-4 cursor-pointer accent-blue-600 align-middle disabled:cursor-not-allowed"
									aria-label={`Include ${event.name}`}
									disabled={event.speakerAwardsCount == 0}
									checked={selectedIds.has(event.id)}
									onChange={e => toggleSelected(event.id, e.target.checked)}
								/>
							</TableCell>
							<TableCell>{event.name}</TableCell>
							<TableCell>
								{event.speakerAwardsCount != 0
									? <div className="flex items-center justify-center gap-1">
										<CheckIcon className="size-5 text-green-600" aria-label="Available"/>
										<span className="tabular-nums">{event.speakerAwardsCount}</span>
									</div>
									: <XIcon className="mx-auto size-5 text-red-600" aria-label="Not available"/>}
							</TableCell>
							<TableCell>
								{event.speakerAwardsCount != 0 &&
                                    <Input
                                        type="number"
                                        min={1}
                                        max={event.speakerAwardsCount}
                                        className="mx-auto block w-20 bg-white text-center"
                                        aria-label={`Awards to give for ${event.name}`}
                                        disabled={!selectedIds.has(event.id)}
                                        aria-invalid={selectedIds.has(event.id)
                                            && parseAwardCount(awardCounts[event.id] ?? "", event.speakerAwardsCount) == "invalid"}
                                        value={awardCounts[event.id] ?? ""}
                                        onChange={e => setAwardCounts({...awardCounts, [event.id]: e.target.value})}
                                    />}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
				<Button className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700" disabled={!canGenerate} onClick={() => generateReport("events")}>
					{generating == "events" ? "Generating..." : "Download Awards Report"}
				</Button>
				<Button className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700" disabled={!canGenerate} onClick={() => generateReport("schools")}>
					{generating == "schools" ? "Generating..." : "Download Coaches' Sheets"}
				</Button>
			</div>
		</div>
	)
}
