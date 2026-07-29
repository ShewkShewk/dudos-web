import { Tournament } from "@/app/lib/domain";
import { useCallback, useEffect, useState } from "react";
import { TournamentSchoolsStatus } from "@/app/lib/domain";
import { useSharedTournaments } from "@/app/tournaments/TournamentsDataProvider";
import { Button } from "@/components/ui/button";

interface SchoolCheckInsProps {
	tournament: Tournament
}

export function SchoolCheckInsTable({tournament}: SchoolCheckInsProps) {
	const {refreshTournaments, importTournament} = useSharedTournaments()
	const [schoolsStatus, setSchoolsStatus] = useState<TournamentSchoolsStatus | null>(null)
	const refreshSchoolsStatus = useCallback(async () => {
		const response = await fetch(`/api/tournaments/${tournament.id}/schools/status`)
		if (!response.ok) {
			throw new Error(`Failed to fetch latest school status for ${tournament.id}`)
		}
		response.json().then(r => setSchoolsStatus(r))
	}, [tournament.id])

	useEffect(() => {
		refreshSchoolsStatus()
	}, [tournament, refreshSchoolsStatus])

	if (schoolsStatus == null) {
		return (
			<div>
				Retrieving latest school status...
			</div>
		)
	}

	const notCheckedIn = schoolsStatus.schoolsStatus
		.filter(school => !school.checkedIn)
		.sort((a, b) => a.schoolName.localeCompare(b.schoolName));
	const checkedIn = schoolsStatus.schoolsStatus
		.filter(school => school.checkedIn)
		.sort((a, b) => a.schoolName.localeCompare(b.schoolName));

	return (
		<div>
			<div className="flex mt-1 ml-1 mr-1">
				<h2 className="flex text-center items-center justify-center bg-blue-400 w-9/10 rounded-l-lg font-bold">
					Last Updated: {schoolsStatus.updateTime}
				</h2>
				<Button
					className="w-1/10 bg-green-300 rounded-none rounded-r-lg border-0 text-black cursor-pointer"
					onClick={
						async () => {
							await importTournament(tournament.id)
							await refreshSchoolsStatus()
						}}>
					Refresh
				</Button>
			</div>

			<div className="grid grid-cols-2 gap-2 mt-2 mx-1">
				<div className="flex flex-col">
					<div className="bg-red-400 text-center font-bold py-1 rounded-t-lg">
						Not Checked In
					</div>
					<div className="border-x border-b border-red-400 rounded-b-lg p-2 flex-1">
						{notCheckedIn.map(school => (
							<div key={school.id} className="text-red-600 text-center py-0.5 font-medium">
								{school.schoolName}
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col">
					<div className="bg-green-400 text-center font-bold py-1 rounded-t-lg">
						Checked In
					</div>
					<div className="border-x border-b border-green-400 rounded-b-lg p-2 flex-1">
						{checkedIn.map(school => (
							<div key={school.id} className="text-green-600 text-center py-0.5 font-medium">
								{school.schoolName}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
