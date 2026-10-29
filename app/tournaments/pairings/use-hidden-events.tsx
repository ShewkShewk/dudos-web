"use client"

import { useCallback, useMemo, useState } from "react";

// Hidden events are a per-user, per-tournament viewing preference kept in this browser.
function storageKey(userEmail: string, tournamentId: number) {
	return `dudos:pairings:hidden:${userEmail}:${tournamentId}`
}

function loadHidden(key: string): string[] {
	try {
		const stored = window.localStorage.getItem(key)
		const parsed: unknown = stored ? JSON.parse(stored) : []
		return Array.isArray(parsed) ? parsed.filter((name) => typeof name === "string") : []
	} catch {
		return []
	}
}

function saveHidden(key: string, hidden: string[]) {
	try {
		if (hidden.length === 0) {
			window.localStorage.removeItem(key)
		} else {
			window.localStorage.setItem(key, JSON.stringify(hidden))
		}
	} catch {
		// Storage can be unavailable (private windows, blocked site data); hiding still works for this visit.
	}
}

export function useHiddenEvents(userEmail: string, tournamentId: number) {
	const key = storageKey(userEmail, tournamentId)
	const [state, setState] = useState(() => ({key, hidden: loadHidden(key)}))

	// Switching tournaments swaps in that tournament's hidden events.
	let current = state
	if (state.key !== key) {
		current = {key, hidden: loadHidden(key)}
		setState(current)
	}

	const update = useCallback((change: (hidden: string[]) => string[]) => {
		setState((prev) => {
			const hidden = change(prev.hidden)
			saveHidden(prev.key, hidden)
			return {key: prev.key, hidden}
		})
	}, [])

	const hideEvent = useCallback((name: string) => {
		update((hidden) => hidden.includes(name) ? hidden : [...hidden, name])
	}, [update])

	const showEvent = useCallback((name: string) => {
		update((hidden) => hidden.filter((hiddenName) => hiddenName !== name))
	}, [update])

	const showAllEvents = useCallback(() => {
		update(() => [])
	}, [update])

	const hiddenEvents = useMemo(() => new Set(current.hidden), [current.hidden])

	return {hiddenEvents, hideEvent, showEvent, showAllEvents}
}
