import { Tournament } from "@/app/lib/domain";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList
} from "@/components/ui/combobox";

interface TournamentPickerProps {
	tournaments: Tournament[]
	tournamentSetter: (tournament: Tournament | null) => void
}

export function TournamentPicker({tournaments, tournamentSetter}: TournamentPickerProps) {
	return (
		<Combobox items={tournaments}
		          itemToStringLabel={(tournament: Tournament) => {
					  return tournament.name;
				  }}
		          onValueChange={tournamentSetter}>
			<ComboboxInput placeholder="Select a Tournament"/>
			<ComboboxContent>
				<ComboboxEmpty>No tournaments loaded.</ComboboxEmpty>
				<ComboboxList>
					{(tournament: Tournament) => (
						<ComboboxItem key={tournament.id} value={tournament}>
							{tournament.name}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}
