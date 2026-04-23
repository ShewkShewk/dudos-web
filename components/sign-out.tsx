"use client"

import { signOut } from "next-auth/react"
import { LogOutIcon } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function SignOutButton() {
	return (
		<DropdownMenuItem
			onClick={() => {
				void signOut({redirectTo: "/"})
			}}
		>
			<LogOutIcon />
			Log out
		</DropdownMenuItem>
	)
}
