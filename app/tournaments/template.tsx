// Fades in each tournament tool when switching between them. Sits inside the tournaments
// layout, so TournamentsDataProvider (and its loaded tournament list) is not re-mounted.
export default function Template({children}: Readonly<{ children: React.ReactNode }>) {
	return <div className="animate-in fade-in duration-300">{children}</div>
}
