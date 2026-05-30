import { TournamentsDataProvider } from "@/app/tournaments/TournamentsDataProvider";

export default function Layout({
								   children
							   }: Readonly<{ children: React.ReactNode }>) {
	return (
		<TournamentsDataProvider>
			{children}
		</TournamentsDataProvider>
	)
}
