import { GetTournaments } from "@/app/lib/client";

export default async function ExampleServerComponent() {
	const result = await GetTournaments()
	return <div>Result from server: {result.length}</div>
}
