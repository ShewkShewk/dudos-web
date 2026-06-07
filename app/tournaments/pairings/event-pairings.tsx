import { EventPairing } from "@/app/lib/domain";
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
					#{eventPairing.number}</CardTitle>
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
							<TableRow key={pairing.affEntry?.id} className="even:bg-gray-200">
								<TableCell className="py-0 text-[9px]">{pairing.room}</TableCell>
								<TableCell className="py-0 text-[9px]">{pairing.affEntry?.name}</TableCell>
								<TableCell className="py-0 text-[9px]">{pairing.negEntry?.name}</TableCell>
								<TableCell className="py-0 text-[9px]">{
									pairing.judges?.map(judge => (judge.name)).join(",")
								}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
