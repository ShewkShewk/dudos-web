import { requireSession } from "@/app/session";
import { PairingsView } from "@/app/tournaments/pairings/pairings-view";

export default async function Page() {
	const session = await requireSession()
	return <PairingsView userEmail={session.user?.email ?? ""}/>
}
