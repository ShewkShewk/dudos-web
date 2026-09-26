// Templates re-mount on navigation, so each page fades in when switching between top-level routes.
export default function Template({children}: Readonly<{ children: React.ReactNode }>) {
	return <div className="animate-in fade-in duration-300">{children}</div>
}
