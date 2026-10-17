import "server-only";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { Document, Image as PdfImage, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SpeakerAward, Tournament } from "@/app/lib/domain";

export type EventSpeakerAwards = {
	eventId: number
	eventName: string
	requested: number
	awards: SpeakerAward[]
}

// PNG export of public/dallas_debate.svg (react-pdf can't draw SVG files), trimmed of its white margin.
const logo = readFileSync(fileURLToPath(new URL("./dallas-debate-logo.png", import.meta.url)))

const styles = StyleSheet.create({
	page: {
		paddingTop: 48,
		paddingBottom: 60,
		paddingHorizontal: 54,
		fontFamily: "Times-Roman",
		fontSize: 8.8,
		color: "#111111",
	},
	header: {
		alignItems: "center",
		borderBottomWidth: 1.5,
		borderBottomColor: "#111111",
		paddingBottom: 10,
		marginBottom: 24,
	},
	logo: {
		width: 55,
	},
	tournamentName: {
		fontFamily: "Times-Bold",
		fontSize: 14.4,
		marginTop: 6,
		textAlign: "center",
	},
	tournamentDate: {
		fontSize: 8.8,
		marginTop: 4,
		color: "#444444",
	},
	eventName: {
		fontFamily: "Times-Bold",
		fontSize: 12.8,
		textAlign: "center",
	},
	subtitle: {
		fontFamily: "Times-Italic",
		fontSize: 9.6,
		textAlign: "center",
		marginTop: 4,
		marginBottom: 18,
	},
	note: {
		fontFamily: "Times-Italic",
		fontSize: 8,
		textAlign: "center",
		marginBottom: 10,
		color: "#444444",
	},
	tableHeader: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#111111",
		paddingBottom: 4,
		fontFamily: "Times-Bold",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 0.5,
		borderBottomColor: "#999999",
		paddingVertical: 8,
	},
	rankColumn: {width: "10%"},
	studentColumn: {width: "40%", paddingRight: 8},
	schoolColumn: {width: "36%", paddingRight: 8},
	awardedColumn: {width: "14%", alignItems: "center", textAlign: "center"},
	checkBox: {
		width: 12,
		height: 12,
		borderWidth: 1,
		borderColor: "#111111",
	},
	schoolEvent: {
		marginBottom: 16,
	},
	schoolEventName: {
		fontFamily: "Times-Bold",
		fontSize: 10.4,
		borderBottomWidth: 1,
		borderBottomColor: "#111111",
		paddingBottom: 4,
	},
	footer: {
		position: "absolute",
		bottom: 30,
		left: 54,
		right: 54,
		flexDirection: "row",
		justifyContent: "space-between",
		fontSize: 7.2,
		color: "#666666",
	},
})

export async function renderSpeakerAwardsPdf(tournament: Tournament, eventAwards: EventSpeakerAwards[]) {
	const generatedAt = formatCentralNow()
	return renderToBuffer(
		<Document title={`${tournament.name} Speaker Awards`} author="Dallas Urban Debate Alliance">
			{eventAwards.map(event => (
				<Page key={event.eventId} size="LETTER" style={styles.page}>
					<ReportHeader tournament={tournament}/>

					<Text style={styles.eventName}>{event.eventName}</Text>
					<Text style={styles.subtitle}>Speaker Awards</Text>
					{event.awards.length < event.requested &&
                        <Text style={styles.note}>
                            Only {event.awards.length} of {event.requested} requested awards are available.
                        </Text>}

					<View style={styles.tableHeader} fixed>
						<Text style={styles.rankColumn}>Place</Text>
						<Text style={styles.studentColumn}>Student</Text>
						<Text style={styles.schoolColumn}>School</Text>
						<Text style={styles.awardedColumn}>Awarded</Text>
					</View>
					{event.awards.map(award => (
						<View key={award.rank} style={styles.row} wrap={false}>
							<Text style={styles.rankColumn}>{award.rank}</Text>
							<Text style={styles.studentColumn}>{award.studentName}</Text>
							<Text style={styles.schoolColumn}>{award.schoolName}</Text>
							<View style={styles.awardedColumn}>
								<View style={styles.checkBox}/>
							</View>
						</View>
					))}

					<ReportFooter generatedAt={generatedAt}/>
				</Page>
			))}
		</Document>
	)
}

export type SchoolSpeakerAwards = {
	schoolName: string
	events: { eventId: number, eventName: string, awards: SpeakerAward[] }[]
}

// Regroups the per-event awards by school for the coaches' sheet: schools alphabetically, each
// school's events in report order, and each event's students alphabetically by name.
export function groupAwardsBySchool(eventAwards: EventSpeakerAwards[]): SchoolSpeakerAwards[] {
	const schools = new Map<string, SchoolSpeakerAwards>()
	for (const event of eventAwards) {
		for (const award of event.awards) {
			const schoolName = award.schoolName || "School Not Listed"
			const school = schools.get(schoolName) ?? {schoolName, events: []}
			schools.set(schoolName, school)
			let schoolEvent = school.events.find(e => e.eventId == event.eventId)
			if (schoolEvent == null) {
				schoolEvent = {eventId: event.eventId, eventName: event.eventName, awards: []}
				school.events.push(schoolEvent)
			}
			schoolEvent.awards.push(award)
		}
	}
	for (const school of schools.values()) {
		for (const schoolEvent of school.events) {
			schoolEvent.awards.sort((a, b) => a.studentName.localeCompare(b.studentName))
		}
	}
	return [...schools.values()].sort((a, b) => a.schoolName.localeCompare(b.schoolName))
}

// One page per school, listing the events it placed in and which of its students placed. Ranks are
// left off; coaches only get names.
export async function renderSchoolSpeakerAwardsPdf(tournament: Tournament, eventAwards: EventSpeakerAwards[]) {
	const generatedAt = formatCentralNow()
	return renderToBuffer(
		<Document title={`${tournament.name} Speaker Awards by School`} author="Dallas Urban Debate Alliance">
			{groupAwardsBySchool(eventAwards).map(school => (
				<Page key={school.schoolName} size="LETTER" style={styles.page}>
					<ReportHeader tournament={tournament}/>

					<Text style={styles.eventName}>{school.schoolName}</Text>
					<Text style={styles.subtitle}>Speaker Awards</Text>

					{school.events.map(event => (
						<View key={event.eventId} style={styles.schoolEvent} wrap={false}>
							<Text style={styles.schoolEventName}>{event.eventName}</Text>
							{event.awards.map(award => (
								<View key={award.rank} style={styles.row}>
									<Text>{award.studentName}</Text>
								</View>
							))}
						</View>
					))}

					<ReportFooter generatedAt={generatedAt}/>
				</Page>
			))}
		</Document>
	)
}

function ReportHeader({tournament}: { tournament: Tournament }) {
	return (
		<View style={styles.header}>
			<PdfImage style={styles.logo} src={{data: logo, format: "png"}}/>
			<Text style={styles.tournamentName}>{tournament.name}</Text>
			<Text style={styles.tournamentDate}>{formatTournamentDate(tournament.date)}</Text>
		</View>
	)
}

function ReportFooter({generatedAt}: { generatedAt: string }) {
	return (
		<View style={styles.footer} fixed>
			<Text>Generated {generatedAt}</Text>
			<Text render={({pageNumber, totalPages}) => `Page ${pageNumber} of ${totalPages}`}/>
		</View>
	)
}

// Tournament.date is a plain date ("2026-09-26"); read it as UTC so it doesn't shift a day.
function formatTournamentDate(date: string) {
	const parsed = new Date(`${date}T00:00:00Z`)
	if (isNaN(parsed.getTime())) {
		return date
	}
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC", year: "numeric", month: "long", day: "numeric",
	}).format(parsed)
}

function formatCentralNow() {
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "America/Chicago",
		year: "numeric", month: "long", day: "numeric",
		hour: "numeric", minute: "2-digit",
	}).format(new Date())
}
