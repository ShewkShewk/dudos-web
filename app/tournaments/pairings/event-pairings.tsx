import { EventPairing, SectionPairing } from "@/app/lib/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export interface EventPairingsProps {
	eventPairing: EventPairing
	onHide: () => void
}

export function EventPairingTable({eventPairing, onHide}: EventPairingsProps) {
	let colGroup = (
		<colgroup>
			<col className="w-[7%]"/>
			<col className="w-[39%]"/>
			<col className="w-[39%]"/>
			<col className="w-[15%]"/>
		</colgroup>
	)
	if (eventPairing.flighted) {
		colGroup = (
			<colgroup>
				<col className="w-[7%]"/>
				<col className="w-[4%]"/>
				<col className="w-[37%]"/>
				<col className="w-[37%]"/>
				<col className="w-[15%]"/>
			</colgroup>
		)
	}
	const pairings = eventPairing.flighted
		? [...eventPairing.pairings].sort(compareFlightThenRoom)
		: eventPairing.pairings
	return (
		<Card className="m-1 p-0 border rounded-sm gap-0">
			<CardHeader className="relative items-center text-center text-sm">
				<CardTitle className="px-7 font-light leading-tight ">{eventPairing.name} Round
					#{eventPairing.number} @ {eventPairing.startTime}</CardTitle>
				<Button variant="ghost" size="icon-xs" className="absolute inset-y-0 right-1 my-auto cursor-pointer"
				        aria-label={`Hide ${eventPairing.name}`} title={`Hide ${eventPairing.name}`}
				        onClick={onHide}>
					<EyeOffIcon/>
				</Button>
			</CardHeader>
			<CardContent className="p-1">
				<Table className="w-full table-fixed">
					{colGroup}
					<TableHeader>
						<TableRow className="text-center text-sm">
							<TableHead className="py-0 text-[9px]">Room</TableHead>
							{
								eventPairing.flighted &&
                                <TableHead className="py-0 text-[9px]">Flight</TableHead>
							}
							<TableHead className="py-0 text-[9px]">Aff</TableHead>
							<TableHead className="py-0 text-[9px]">Neg</TableHead>
							<TableHead className="py-0 text-[9px]">Judges</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{pairings.map((pairing) => (
							<PairingRow pairing={pairing} flighted={eventPairing.flighted}
							            key={pairing.sectionId}></PairingRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}

export interface HiddenEventsBarProps {
	hiddenEventNames: string[]
	onShow: (name: string) => void
	onShowAll: () => void
}

export function HiddenEventsBar({hiddenEventNames, onShow, onShowAll}: HiddenEventsBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-1 m-1 text-xs">
			<span className="text-muted-foreground">Hidden:</span>
			{hiddenEventNames.map((name) => (
				<Button key={name} variant="outline" size="xs" className="cursor-pointer"
				        title={`Show ${name}`} onClick={() => onShow(name)}>
					<EyeIcon/>
					{name}
				</Button>
			))}
			<Button variant="ghost" size="xs" className="cursor-pointer" onClick={onShowAll}>
				Show all
			</Button>
		</div>
	)
}

function PairingRow({pairing, flighted}: { pairing: SectionPairing, flighted: boolean }) {
	const affTeam = pairing.affEntry ? pairing.affEntry : pairing.negEntry
	const negTeam = pairing.affEntry ? pairing.negEntry : null

	let room = "???";
	if (pairing.room != null) {
		room = pairing.room
	} else if (pairing.affResult == "BYE" || pairing.negResult == "BYE") {
		room = "BYE"
	}
	// A section with no room and only one team is a bye; there's nothing left to run.
	const singleTeamBye = pairing.room == null && (pairing.affEntry == null) !== (pairing.negEntry == null)
	if (singleTeamBye) {
		room = "BYE"
	}
	const roundStatus = singleTeamBye ? "DONE" : getRoundStatus(pairing)
	let roomTextColor = "text-red-500"
	switch (roundStatus) {
		case "DONE":
			roomTextColor = "text-green-500"
			break
		case "IN_PROGRESS":
			roomTextColor = "text-blue-500"
			break
	}
	return (<TableRow key={pairing.affEntry?.id} className="even:bg-gray-200">
		<TableCell className={`py-0 text-[9px] ${roomTextColor} whitespace-normal wrap-break-words`}>{room}</TableCell>
		{flighted && <TableCell className="py-0 text-[9px]">{pairing.flight}</TableCell>}
		<TableCell className="py-0 text-[9px] whitespace-normal wrap-break-words">{affTeam?.name}</TableCell>
		<TableCell className="py-0 text-[9px] whitespace-normal wrap-break-words">{negTeam?.name}</TableCell>
		<TableCell className="py-0 text-[9px] whitespace-normal wrap-break-words">{
			pairing.judges?.map(judge => (judge.name)).join(",")
		}</TableCell>
	</TableRow>)
}

// Rooms compare naturally ("2" before "10"); sections without a room go last.
function compareFlightThenRoom(a: SectionPairing, b: SectionPairing) {
	if (a.flight !== b.flight) {
		return a.flight - b.flight
	}
	if (a.room == null || b.room == null) {
		return a.room == null ? (b.room == null ? 0 : 1) : -1
	}
	return a.room.localeCompare(b.room, undefined, {numeric: true, sensitivity: "base"})
}

function getRoundStatus(pairing: SectionPairing) {
	let status = "NOT_STARTED"
	const everyJudgeStarted = pairing.judges?.every((value) => {
		return value.started
	})
	if (pairing.affResult != null || pairing.negResult != null) {
		status = "DONE"
	} else if (everyJudgeStarted) {
		status = "IN_PROGRESS"
	}
	return status
}
