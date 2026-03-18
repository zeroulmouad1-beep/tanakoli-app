"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layers, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react"
import { useRoute } from "@/lib/route-context"
import { urbanRoutePolylines, intercityRoutePolylines, ROUTE_CATEGORIES } from "@/lib/route-data"
import { useTheme } from "@/lib/theme-context"

export function RouteController() {
  const { viewMode, setViewMode, selectedRoute, setSelectedRoute, triggerRouteSelect } = useRoute()
  const { isDark } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showLegend, setShowLegend] = useState(false)

  const bgColor = isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)"
  const textColor = isDark ? "#F8FAFC" : "#1a1a1a"
  const mutedColor = isDark ? "#94A3B8" : "#64748b"
  const borderColor = isDark ? "rgba(71, 85, 105, 0.5)" : "rgba(226, 232, 240, 1)"
  const hoverBg = isDark ? "rgba(51, 65, 85, 0.8)" : "rgba(241, 245, 249, 0.8)"
  const activeBg = isDark ? "rgba(34, 197, 94, 0.18)" : "rgba(34, 197, 94, 0.1)"

  const handleRouteClick = (routeId: string) => {
    if (selectedRoute === routeId) {
      setSelectedRoute(null)
      setViewMode("all")
      triggerRouteSelect(null)
    } else {
      setSelectedRoute(routeId)
      setViewMode("single")
      triggerRouteSelect(routeId)
    }
    setIsExpanded(false)
  }

  const handleShowAll = () => {
    setSelectedRoute(null)
    setViewMode("all")
    triggerRouteSelect(null)
    setIsExpanded(false)
  }

  return (
    <div className="px-4 pb-1 pt-3" style={{ direction: "rtl" }}>
      {/* Main control card */}
      <motion.div
        layout
        className="overflow-hidden rounded-xl shadow-md backdrop-blur-sm"
        style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
      >
        {/* Header row: route selector + legend toggle */}
        <div className="flex items-center">
          {/* Route selector button — takes most of the width */}
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="flex flex-1 items-center justify-between gap-3 px-4 py-3 transition-colors"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="h-5 w-5 flex-shrink-0" style={{ color: "#22C55E" }} />
              <span className="truncate text-sm font-semibold" style={{ color: textColor }}>
                {viewMode === "all" ? "كل الخطوط" : `خط ${selectedRoute}`}
              </span>
              {selectedRoute && (
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ background: selectedRoute.startsWith("K") ? "#3B82F6" : "#22C55E" }}
                />
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: mutedColor }} />
            ) : (
              <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: mutedColor }} />
            )}
          </button>

          {/* Divider */}
          <div className="h-8 w-px" style={{ background: borderColor }} />

          {/* Legend toggle button */}
          <button
            onClick={() => setShowLegend((v) => !v)}
            className="flex items-center justify-center px-3 py-3 transition-colors"
            style={{ backgroundColor: "transparent", color: showLegend ? "#22C55E" : mutedColor }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            title="دليل الألوان"
          >
            {showLegend ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Legend panel — slides down inline */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              <div className="flex items-center gap-6 px-4 py-2.5">
                {Object.entries(ROUTE_CATEGORIES).map(([key, { label, color }]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-5 flex-shrink-0 rounded-full" style={{ background: color }} />
                    <span className="text-[11px] font-medium" style={{ color: mutedColor }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded route list — slides down */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              <div className="max-h-56 overflow-y-auto p-2">
                {/* Show All */}
                <button
                  onClick={handleShowAll}
                  className="mb-1.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: viewMode === "all" ? activeBg : "transparent",
                    color: viewMode === "all" ? "#22C55E" : textColor,
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== "all") e.currentTarget.style.backgroundColor = hoverBg
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== "all") e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <Eye className="h-4 w-4 flex-shrink-0" style={{ color: viewMode === "all" ? "#22C55E" : mutedColor }} />
                  <span className="font-medium">عرض كل الخطوط</span>
                </button>

                {/* Urban routes */}
                <p className="mb-1 mt-1 px-2 text-[11px] font-semibold" style={{ color: mutedColor }}>
                  داخل المدينة
                </p>
                {urbanRoutePolylines.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => handleRouteClick(route.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                    style={{
                      backgroundColor: selectedRoute === route.id ? activeBg : "transparent",
                      color: selectedRoute === route.id ? "#22C55E" : textColor,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRoute !== route.id) e.currentTarget.style.backgroundColor = hoverBg
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRoute !== route.id) e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor: ROUTE_CATEGORIES.urban.color,
                        boxShadow: selectedRoute === route.id ? `0 0 0 2px ${ROUTE_CATEGORIES.urban.color}40` : "none",
                      }}
                    />
                    <span className={selectedRoute === route.id ? "font-bold" : "font-medium"}>خط {route.id}</span>
                  </button>
                ))}

                {/* Intercity routes */}
                <p className="mb-1 mt-2 px-2 text-[11px] font-semibold" style={{ color: mutedColor }}>
                  بين البلديات
                </p>
                {intercityRoutePolylines.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => handleRouteClick(route.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                    style={{
                      backgroundColor: selectedRoute === route.id ? "rgba(59,130,246,0.15)" : "transparent",
                      color: selectedRoute === route.id ? "#3B82F6" : textColor,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRoute !== route.id) e.currentTarget.style.backgroundColor = hoverBg
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRoute !== route.id) e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor: ROUTE_CATEGORIES.intercity.color,
                        boxShadow:
                          selectedRoute === route.id ? `0 0 0 2px ${ROUTE_CATEGORIES.intercity.color}40` : "none",
                      }}
                    />
                    <span className={selectedRoute === route.id ? "font-bold" : "font-medium"}>
                      {route.name.split(" - ")[1] || route.id}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
