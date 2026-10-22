import { Event, Tournament } from "@/app/lib/domain";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AwardType = "speaker" | "entry"

type AwardsReport = "speakerEvents" | "speakerSchools" | "entryEvents"

// Each report has its own button because Safari only keeps one download per click. Buttons render in
// this order.
const reports: Record<AwardsReport, {
	type: AwardType
	label: string
	path: string
	fileName: string
	error: string
}> = {
	speakerEvents: {
		type: "speaker",
		label: "Download Speaker Awards Report",
		path: "awards/speakers/report?report=events&",
		fileName: "Speaker Awards",
		error: "Failed to generate speaker awards report",
	},
	entryEvents: {
		type: "entry",
		label: "Download Entry Awards Report",
		path: "awards/entries/report?",
		fileName: "Entry Awards",
		error: "Failed to generate entry awards report",
	},
	speakerSchools: {
		type: "speaker",
		label: "Download Coaches' Sheets",
		path: "awards/speakers/report?report=schools&",
		fileName: "Speaker Awards by School",
		error: "Failed to generate coaches' sheets",
	},
}

interface AwardEventsProps {
	tournament: Tournament
}

function availableCount(event: Event, type: AwardType) {
	return type == "speaker" ? event.speakerAwardsCount : event.entryAwardsCount
}

function hasAwards(event: Event) {
	return event.speakerAwardsCount != 0 || event.entryAwardsCount != 0
}

// Top 5 by default, top 10 for events with more than 20 awards, never more than are available.
function defaultAwardCount(awardsCount: number) {
	return Math.min(awardsCount > 20 ? 10 : 5, awardsCount)
}

function defaultAwardCounts(events: Event[], type: AwardType) {
	return Object.fromEntries(events
		.filter(event => availableCount(event, type) != 0)
		.map(event => [event.id, String(defaultAwardCount(availableCount(event, type)))]))
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
		throw new Error(`Failed to generate awards report: ${url}`)
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

export function AwardEventsTable({tournament}: AwardEventsProps) {
	const [events, setEvents] = useState<Event[] | null>(null)
	const [awardCounts, setAwardCounts] = useState<Record<AwardType, Record<number, string>>>({speaker: {}, entry: {}})
	// Events included in the reports. Every event with awards starts selected. A selected event goes
	// into each report whose award type it has.
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [generating, setGenerating] = useState<AwardsReport | null>(null)
	const refreshEvents = useCallback(async () => {
		const response = await fetch(`/api/tournaments/${tournament.id}/events`)
		if (!response.ok) {
			throw new Error(`Failed to fetch events for ${tournament.id}`)
		}
		response.json().then((r: Event[] | null) => {
			const loadedEvents = r ?? []
			setEvents(loadedEvents)
			setAwardCounts({
				speaker: defaultAwardCounts(loadedEvents, "speaker"),
				entry: defaultAwardCounts(loadedEvents, "entry"),
			})
			setSelectedIds(new Set(loadedEvents.filter(hasAwards).map(event => event.id)))
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

	const availableEvents = sortedEvents.filter(hasAwards)
	const allSelected = availableEvents.length > 0 && availableEvents.every(event => selectedIds.has(event.id))

	const isInvalid = (event: Event, type: AwardType) =>
		parseAwardCount(awardCounts[type][event.id] ?? "", availableCount(event, type)) == "invalid"

	// The selected events with awards of this type and their counts, or null if any count is invalid.
	const reportEvents = (type: AwardType) => {
		const parsedCounts = availableEvents
			.filter(event => selectedIds.has(event.id) && availableCount(event, type) != 0)
			.map(event => ({event, count: parseAwardCount(awardCounts[type][event.id] ?? "", availableCount(event, type))}))
		const valid = parsedCounts.flatMap(({event, count}) =>
			typeof count == "number" ? [{event, count}] : [])
		return valid.length == parsedCounts.length ? valid : null
	}

	const canGenerate = (type: AwardType) => {
		const events = reportEvents(type)
		return generating == null && events != null && events.length > 0
	}

	const toggleSelected = (eventId: number, selected: boolean) => {
		const next = new Set(selectedIds)
		if (selected) {
			next.add(eventId)
		} else {
			next.delete(eventId)
		}
		setSelectedIds(next)
	}

	const setAwardCount = (type: AwardType, eventId: number, value: string) => {
		setAwardCounts({...awardCounts, [type]: {...awardCounts[type], [eventId]: value}})
	}

	const generateReport = async (report: AwardsReport) => {
		const {type, path, fileName, error} = reports[report]
		setGenerating(report)
		try {
			const eventsParam = (reportEvents(type) ?? []).map(({event, count}) => `${event.id}:${count}`).join(",")
			const pdf = await fetchPdf(`/api/tournaments/${tournament.id}/${path}events=${eventsParam}`)
			downloadPdf(pdf, `${tournament.name} - ${fileName}.pdf`)
		} catch {
			toast.error(error, {position: "top-center"})
		} finally {
			setGenerating(null)
		}
	}

	const awardCell = (event: Event, type: AwardType, typeName: string) => {
		const available = availableCount(event, type)
		if (available == 0) {
			return <XIcon className="mx-auto size-5 text-red-600" aria-label="Not available"/>
		}
		return (
			<div className="flex items-center justify-center gap-2">
				<div className="flex items-center gap-1">
					<CheckIcon className="size-5 text-green-600" aria-label="Available"/>
					<span className="tabular-nums">{available}</span>
				</div>
				<Input
					type="number"
					min={1}
					max={available}
					className="block w-20 bg-white text-center"
					aria-label={`${typeName} awards to give for ${event.name}`}
					disabled={!selectedIds.has(event.id)}
					aria-invalid={selectedIds.has(event.id) && isInvalid(event, type)}
					value={awardCounts[type][event.id] ?? ""}
					onChange={e => setAwardCount(type, event.id, e.target.value)}
				/>
			</div>
		)
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
								aria-label="Select all events with awards"
								disabled={availableEvents.length == 0}
								checked={allSelected}
								onChange={e => setSelectedIds(e.target.checked
									? new Set(availableEvents.map(event => event.id))
									: new Set())}
							/>
						</TableHead>
						<TableHead>Event</TableHead>
						<TableHead className="text-center">Speaker Awards (Available / To Give)</TableHead>
						<TableHead className="text-center">Entry Awards (Available / To Give)</TableHead>
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
									disabled={!hasAwards(event)}
									checked={selectedIds.has(event.id)}
									onChange={e => toggleSelected(event.id, e.target.checked)}
								/>
							</TableCell>
							<TableCell>{event.name}</TableCell>
							<TableCell>{awardCell(event, "speaker", "Speaker")}</TableCell>
							<TableCell>{awardCell(event, "entry", "Entry")}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
				{(Object.keys(reports) as AwardsReport[]).map(report => (
					<Button key={report} className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
							disabled={!canGenerate(reports[report].type)} onClick={() => generateReport(report)}>
						{generating == report ? "Generating..." : reports[report].label}
					</Button>
				))}
			</div>
		</div>
	)
}
