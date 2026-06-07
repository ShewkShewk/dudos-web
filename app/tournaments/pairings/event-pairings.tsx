import { EventPairing } from "@/app/lib/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface EventPairingsProps {
	eventPairing: EventPairing
}

export function EventPairingTable({eventPairing}: EventPairingsProps) {
	return (
		<Card className="w-full max-w-1/2">
			<CardHeader>
				<CardTitle>{eventPairing.name}</CardTitle>
				<CardTitle>Round #{eventPairing.number}</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Room</TableHead>
							<TableHead>Aff</TableHead>
							<TableHead>Neg</TableHead>
							<TableHead>Judges</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{eventPairing.pairings.map(pairing => (
							<TableRow key={pairing.affEntry?.id}>
								<TableCell>{pairing.room}</TableCell>
								<TableCell>{pairing.affEntry?.name}</TableCell>
								<TableCell>{pairing.negEntry?.name}</TableCell>
								<TableCell>{
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
