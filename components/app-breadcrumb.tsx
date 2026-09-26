"use client"

import { usePathname } from "next/navigation";
import { data } from "@/components/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

// Shows the sidebar location of the current page, e.g. "Tournament Tools / Pairings".
export function AppBreadcrumb() {
	const pathname = usePathname()
	const section = data.navMain.find(section => section.items.some(item => item.url == pathname))
	const page = section?.items.find(item => item.url == pathname)

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{section && page ? (
					<>
						<BreadcrumbItem className="hidden md:block">
							{section.title}
						</BreadcrumbItem>
						<BreadcrumbSeparator className="hidden md:block">/</BreadcrumbSeparator>
						<BreadcrumbItem>
							<BreadcrumbPage>{page.title}</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				) : (
					<BreadcrumbItem>
						<BreadcrumbPage>dudOS</BreadcrumbPage>
					</BreadcrumbItem>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
