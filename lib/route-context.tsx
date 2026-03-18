"use client"

import { createContext, useContext, useState, useRef } from "react"
import type { RouteViewMode, SelectedRoute } from "./route-data"

interface RouteContextValue {
  viewMode: RouteViewMode
  setViewMode: (mode: RouteViewMode) => void
  selectedRoute: SelectedRoute
  setSelectedRoute: (route: SelectedRoute) => void
  registerRouteHandler: (fn: (routeId: string | null) => void) => void
  triggerRouteSelect: (routeId: string | null) => void
}

const RouteContext = createContext<RouteContextValue | null>(null)

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<RouteViewMode>("all")
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute>(null)
  const handlerRef = useRef<((routeId: string | null) => void) | null>(null)

  const registerRouteHandler = (fn: (routeId: string | null) => void) => {
    handlerRef.current = fn
  }

  const triggerRouteSelect = (routeId: string | null) => {
    handlerRef.current?.(routeId)
  }

  return (
    <RouteContext.Provider
      value={{ viewMode, setViewMode, selectedRoute, setSelectedRoute, registerRouteHandler, triggerRouteSelect }}
    >
      {children}
    </RouteContext.Provider>
  )
}

export function useRoute() {
  const ctx = useContext(RouteContext)
  if (!ctx) throw new Error("useRoute must be used within RouteProvider")
  return ctx
}
