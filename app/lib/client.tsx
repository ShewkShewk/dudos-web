import "server-only";
import apiRequest from "@/app/lib/auth";

export async function GetHello(): Promise<string> {
	return apiRequest<string>("/hello", {method: "GET"})
}
