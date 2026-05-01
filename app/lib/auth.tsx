import "server-only"
import { GoogleAuth } from "google-auth-library";

const API_BASE_URL = process.env.API_BASE_URL as string

const idTokenClientPromise = getGoogleAuth().getIdTokenClient(API_BASE_URL)

function getGoogleAuth() {
	const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON as string)
	return new GoogleAuth({ credentials })
}

async function apiRequest<T>(path: string, options = {}) : Promise<T> {
	const url = `${API_BASE_URL}${path}`
	return idTokenClientPromise
		.then(
			client => client.request<T>({url, ...options})
		)
		.then(res => res.data)
}

export default apiRequest
