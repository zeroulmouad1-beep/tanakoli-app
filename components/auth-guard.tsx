"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const PUBLIC_PATHS = ["/login"]

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated && !isPublic) {
      router.replace("/login")
    }
    if (isAuthenticated && isPublic) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, isPublic, router])

  // Show blank screen while reading localStorage to prevent any content flash
  if (isLoading) {
    return <div className="fixed inset-0 bg-background" />
  }

  // Unauthenticated user on a protected route — redirect in progress, render nothing
  if (!isAuthenticated && !isPublic) return null

  // Authenticated user hitting the login page — redirect in progress, render nothing
  if (isAuthenticated && isPublic) return null

  return <>{children}</>
}
