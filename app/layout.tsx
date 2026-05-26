import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/auth";
import LoginPage from "@/app/login/page";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import ExampleServerComponent from "@/app/server-component";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

const inter = Inter({subsets: ['latin'], variable: '--font-sans'});

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "dudOS",
	description: "An operating system for the Dallas Urban Debate Alliance",
};

export default async function RootLayout({
											 children,
										 }: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth()
	if (!session) return (
		<html>
		<body>
		<LoginPage/>
		</body>
		</html>
	)
	return (
		<html
			lang="en"
			className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
		>
		<body className="min-h-full flex flex-col">
		<TooltipProvider>
			<SidebarProvider>
				<AppSidebar user={
					{
						name: session.user?.name ?? "User",
						email: session?.user?.email ?? "user@example.com",
						avatar: session.user?.image ?? ""
					}
				}/>
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1"/>
							<Separator
								orientation="vertical"
								className="mr-2 data-vertical:h-4 data-vertical:self-auto"
							/>
							<ExampleServerComponent/>
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className="hidden md:block">
										<BreadcrumbLink href="#">
											dudOs
										</BreadcrumbLink>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					{children}
				</SidebarInset>
			</SidebarProvider>
			)
		</TooltipProvider>
		</body>
		</html>
	);
}
