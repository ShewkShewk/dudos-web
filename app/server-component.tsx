import { GetHello } from "@/app/lib/client";

export default async function ExampleServerComponent() {
	const result = await GetHello()
	return <div>Result from server: {result}</div>
}
