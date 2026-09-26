export type Tournament = {
	id: number
	date: string
	name: string
	loaded: boolean
	updatedTime: string
}

type BallotResult = "WIN" | "LOSS" | "BYE" | "FFT" | "UNKNOWN";

type Entry = {
	id: number;
	name: string;
};

type Judge = {
	id: number;
	personId: number;
	name: string;
	started: boolean;
};

export type SectionPairing = {
	sectionId: number
	flight: number
	room: string | null;
	affEntry: Entry | null;
	affResult: BallotResult | null;
	negEntry: Entry | null;
	negResult: BallotResult | null;
	judges?: Judge[];
}

export type EventPairing = {
	name: string;
	number: number;
	flighted: boolean
	startTime: string;
	pairings: SectionPairing[];
}

export type TournamentPairings = {
	name: string;
	updateTime: string;
	eventPairings: EventPairing[];
};

export type Summary = {
	tournamentCount: number;
	roundCount: number;
}

export type SchoolStatus = {
	id: number;
	schoolName: string;
	checkedIn: boolean;
}

export type TournamentSchoolsStatus = {
	name: string;
	updateTime: string;
	schoolsStatus: SchoolStatus[];
}

export type SchoolEntryCount = {
	id: number;
	name: string;
	entryCount: number;
	studentCount: number;
}

export type EventSchoolCounts = {
	id: number;
	name: string;
	entryCount: number;
	studentCount: number;
	schools: SchoolEntryCount[];
}

export type TournamentEventSchoolCounts = {
	name: string;
	events: EventSchoolCounts[];
}
