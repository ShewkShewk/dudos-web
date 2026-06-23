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
	startTime: string;
	pairings: SectionPairing[];
}

export type TournamentPairings = {
	name: string;
	updateTime: string;
	eventPairings: EventPairing[];
};
