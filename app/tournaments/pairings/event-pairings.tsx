import { EventPairing, SectionPairing } from "@/app/lib/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface EventPairingsProps {
	eventPairing: EventPairing
}

export function EventPairingTable({eventPairing}: EventPairingsProps) {

	return (
		<Card className="m-1 p-0 border rounded-sm gap-0">
			<CardHeader className="items-center text-center text-sm">
				<CardTitle className="font-light leading-tight ">{eventPairing.name} Round
					#{eventPairing.number} @ {eventPairing.startTime}</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow className="text-center text-sm">
							<TableHead className="py-0 text-[9px]">Room</TableHead>
							<TableHead className="py-0 text-[9px] text-center">Aff</TableHead>
							<TableHead className="py-0 text-[9px] text-center">Neg</TableHead>
							<TableHead className="py-0 text-[9px] text-center">Judges</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{eventPairing.pairings.map((pairing) => (
							<PairingRow pairing={pairing} key={pairing.sectionId}></PairingRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}

function PairingRow({pairing}: { pairing: SectionPairing }) {
	const affTeam = pairing.affEntry ? pairing.affEntry : pairing.negEntry
	const negTeam = pairing.affEntry ? pairing.negEntry : null

	let room = "???";
	if (pairing.room != null) {
		room = pairing.room
	} else if (pairing.affResult == "BYE" || pairing.negResult == "BYE") {
		room = "BYE"
	}
	const roundStatus = getRoundStatus(pairing)
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
		<TableCell className={`py-0 text-[9px] ${roomTextColor}`}>{room}</TableCell>
		<TableCell className="py-0 text-[9px]">{affTeam?.name}</TableCell>
		<TableCell className="py-0 text-[9px]">{negTeam?.name}</TableCell>
		<TableCell className="py-0 text-[9px]">{
			pairing.judges?.map(judge => (judge.name)).join(",")
		}</TableCell>
	</TableRow>)
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
