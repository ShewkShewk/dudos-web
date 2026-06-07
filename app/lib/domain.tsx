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

export type EventPairing = {
	name: string;
	number: number;
	pairings: {
		room: string;
		affEntry: Entry | null;
		affResult: BallotResult | null;
		negEntry: Entry | null;
		negResult: BallotResult | null;
		judges?: Judge[];
	}[];
}

export type TournamentPairings = {
	name: string;
	updateTime: string;
	eventPairings: EventPairing[];
};
