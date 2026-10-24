import "server-only";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { Document, Image as PdfImage, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import { EntryAward, SchoolEventResult, SpeakerAward, Tournament, TournamentSchoolResult } from "@/app/lib/domain";

export type EventSpeakerAwards = {
	eventId: number
	eventName: string
	requested: number
	awards: SpeakerAward[]
}

export type EventEntryAwards = {
	eventId: number
	eventName: string
	requested: number
	awards: EntryAward[]
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
	// Entry school can list two schools for a hybrid entry, so it gets more room than the code.
	entryColumn: {width: "32%", paddingRight: 8},
	entrySchoolColumn: {width: "44%", paddingRight: 8},
	checkBox: {
		width: 12,
		height: 12,
		borderWidth: 1,
		borderColor: "#111111",
	},
	// The coaches' sheet uses tighter spacing than the awards reports so each school fits on one page.
	compactHeader: {
		marginBottom: 14,
	},
	compactLogo: {
		width: 45,
	},
	compactSubtitle: {
		marginBottom: 10,
	},
	compactRow: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 0.5,
		borderBottomColor: "#999999",
		paddingVertical: 4,
	},
	nameColumn: {width: "50%", paddingRight: 8},
	resultEventColumn: {width: "52%", paddingRight: 8},
	resultNumberColumn: {width: "12%", textAlign: "center"},
	totalsRow: {
		flexDirection: "row",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#111111",
		paddingVertical: 4,
		fontFamily: "Times-Bold",
	},
	sectionHeading: {
		fontFamily: "Times-Bold",
		fontSize: 11.2,
		marginTop: 16,
		marginBottom: 6,
	},
	schoolEvent: {
		marginBottom: 10,
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

// One page per event in the order given, listing the event's top entries (prelim seeds).
export async function renderEntryAwardsPdf(tournament: Tournament, eventAwards: EventEntryAwards[]) {
	const generatedAt = formatCentralNow()
	return renderToBuffer(
		<Document title={`${tournament.name} Entry Awards`} author="Dallas Urban Debate Alliance">
			{eventAwards.map(event => (
				<Page key={event.eventId} size="LETTER" style={styles.page}>
					<ReportHeader tournament={tournament}/>

					<Text style={styles.eventName}>{event.eventName}</Text>
					<Text style={styles.subtitle}>Entry Awards</Text>
					{event.awards.length < event.requested &&
                        <Text style={styles.note}>
                            Only {event.awards.length} of {event.requested} requested awards are available.
                        </Text>}

					<View style={styles.tableHeader} fixed>
						<Text style={styles.rankColumn}>Place</Text>
						<Text style={styles.entryColumn}>Entry</Text>
						<Text style={styles.entrySchoolColumn}>School</Text>
						<Text style={styles.awardedColumn}>Awarded</Text>
					</View>
					{event.awards.map(award => (
						<View key={award.rank} style={styles.row} wrap={false}>
							<Text style={styles.rankColumn}>{award.rank}</Text>
							<Text style={styles.entryColumn}>{award.entryName}</Text>
							<Text style={styles.entrySchoolColumn}>{award.schoolName}</Text>
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

type ResultCounts = Pick<SchoolEventResult, "entryCount" | "studentCount" | "entryWins" | "entryLosses">

export type CoachesSheet = {
	schoolName: string
	events: SchoolEventResult[]
	totals: ResultCounts
	speakerAwards: { eventId: number, eventName: string, studentNames: string[] }[]
}

// One sheet per school in the results: schools alphabetically, each with its events alphabetically.
// Speaker awards are matched to schools by name, and only for events the school entered, so an award
// whose school isn't in the results is left off the sheets.
export function buildCoachesSheets(results: TournamentSchoolResult[], eventAwards: EventSpeakerAwards[]): CoachesSheet[] {
	return results
		.map(school => {
			const events = [...school.events].sort((a, b) => a.name.localeCompare(b.name))
			const eventIds = new Set(events.map(event => event.id))
			const totals = events.reduce((sum, event) => ({
				entryCount: sum.entryCount + event.entryCount,
				studentCount: sum.studentCount + event.studentCount,
				entryWins: sum.entryWins + event.entryWins,
				entryLosses: sum.entryLosses + event.entryLosses,
			}), {entryCount: 0, studentCount: 0, entryWins: 0, entryLosses: 0})
			const speakerAwards = school.schoolName == "" ? [] : eventAwards
				.filter(event => eventIds.has(event.eventId))
				.map(event => ({
					eventId: event.eventId,
					eventName: event.eventName,
					studentNames: event.awards
						.filter(award => award.schoolName == school.schoolName)
						.map(award => award.studentName)
						.sort((a, b) => a.localeCompare(b)),
				}))
				.filter(event => event.studentNames.length > 0)
			return {schoolName: school.schoolName || "School Not Listed", events, totals, speakerAwards}
		})
		.sort((a, b) => a.schoolName.localeCompare(b.schoolName))
}

// One page per school: a table of its events with entry, student and win/loss counts, then the
// students who won speaker awards in each event, or N/A when none did. Ranks are left off; coaches
// only get names.
export async function renderCoachesSheetsPdf(tournament: Tournament, results: TournamentSchoolResult[], eventAwards: EventSpeakerAwards[]) {
	const generatedAt = formatCentralNow()
	return renderToBuffer(
		<Document title={`${tournament.name} Coaches' Sheets`} author="Dallas Urban Debate Alliance">
			{buildCoachesSheets(results, eventAwards).map((school, index) => (
				<Page key={index} size="LETTER" style={styles.page}>
					<ReportHeader tournament={tournament} compact/>

					<Text style={styles.eventName}>{school.schoolName}</Text>
					<Text style={[styles.subtitle, styles.compactSubtitle]}>Coaches&apos; Sheet</Text>

					<View style={styles.tableHeader}>
						<Text style={styles.resultEventColumn}>Event</Text>
						<Text style={styles.resultNumberColumn}>Entries</Text>
						<Text style={styles.resultNumberColumn}>Students</Text>
						<Text style={styles.resultNumberColumn}>Wins</Text>
						<Text style={styles.resultNumberColumn}>Losses</Text>
					</View>
					{school.events.map(event => (
						<View key={event.id} style={styles.compactRow} wrap={false}>
							<Text style={styles.resultEventColumn}>{event.name}</Text>
							<ResultCountColumns counts={event}/>
						</View>
					))}
					<View style={styles.totalsRow} wrap={false}>
						<Text style={styles.resultEventColumn}>Total</Text>
						<ResultCountColumns counts={school.totals}/>
					</View>

					<Text style={styles.sectionHeading}>Speaker Awards</Text>
					{school.speakerAwards.length == 0 &&
                        <Text>N/A</Text>}
					{school.speakerAwards.map(event => (
						<View key={event.eventId} style={styles.schoolEvent} wrap={false}>
							<Text style={styles.schoolEventName}>{event.eventName}</Text>
							{nameColumnRows(event.studentNames).map(([left, right], index) => (
								<View key={index} style={styles.compactRow}>
									<Text style={styles.nameColumn}>{left}</Text>
									<Text style={styles.nameColumn}>{right}</Text>
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

// Splits names into two columns read top to bottom, left column first, as [left, right] rows. The
// left column gets the extra name when the count is odd.
function nameColumnRows(names: string[]): [string, string | undefined][] {
	const half = Math.ceil(names.length / 2)
	return names.slice(0, half).map((name, index) => [name, names[half + index]])
}

// Wins and losses show a dash when no rounds have been decided.
function ResultCountColumns({counts}: { counts: ResultCounts }) {
	const decided = counts.entryWins != 0 || counts.entryLosses != 0
	return (
		<>
			<Text style={styles.resultNumberColumn}>{counts.entryCount}</Text>
			<Text style={styles.resultNumberColumn}>{counts.studentCount}</Text>
			<Text style={styles.resultNumberColumn}>{decided ? counts.entryWins : "—"}</Text>
			<Text style={styles.resultNumberColumn}>{decided ? counts.entryLosses : "—"}</Text>
		</>
	)
}

function ReportHeader({tournament, compact = false}: { tournament: Tournament, compact?: boolean }) {
	return (
		<View style={compact ? [styles.header, styles.compactHeader] : styles.header}>
			<PdfImage style={compact ? styles.compactLogo : styles.logo} src={{data: logo, format: "png"}}/>
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
