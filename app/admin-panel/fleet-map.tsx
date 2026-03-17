"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { db } from "@/lib/firebase"
import { collection, onSnapshot } from "firebase/firestore"

interface BusDoc {
  id: string
  latitude: number
  longitude: number
  lastUpdated?: { toDate?: () => Date } | null
  name?: string
}

const KHENCHELA: [number, number] = [35.4377, 7.1458]

function isLiveBus(lastUpdated: BusDoc["lastUpdated"]): boolean {
  if (!lastUpdated?.toDate) return false
  return Date.now() - lastUpdated.toDate().getTime() < 5 * 60 * 1000
}

function makeBusIcon(live: boolean): L.DivIcon {
  const color = live ? "#22C55E" : "#64748B"
  const border = live ? "#16A34A" : "#475569"
  const glow = live ? "0 0 0 6px rgba(34,197,94,0.25)" : "none"
  return L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;border-radius:50%;background:${color};border:3px solid ${border};display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:${glow};">🚌</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  })
}

export function AdminFleetMap({ onBusCount }: { onBusCount?: (n: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: KHENCHELA,
      zoom: 13,
      zoomControl: false,
    })

    L.control.zoom({ position: "bottomright" }).addTo(map)

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© CartoDB © OpenStreetMap",
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    const unsub = onSnapshot(collection(db, "Buses"), (snap) => {
      const buses: BusDoc[] = []
      snap.forEach((d) => {
        const data = d.data()
        if (typeof data.latitude === "number" && typeof data.longitude === "number") {
          buses.push({ id: d.id, ...(data as Omit<BusDoc, "id">) })
        }
      })

      onBusCount?.(buses.length)

      buses.forEach((bus) => {
        const pos: [number, number] = [bus.latitude, bus.longitude]
        const live = isLiveBus(bus.lastUpdated)
        const icon = makeBusIcon(live)
        const popup = `<div dir="rtl" style="font-family:inherit;min-width:140px"><b>${bus.name ?? bus.id}</b><br/><span style="color:#94A3B8;font-size:11px" dir="ltr">${bus.latitude.toFixed(5)}, ${bus.longitude.toFixed(5)}</span><br/><span style="color:${live ? "#22C55E" : "#94A3B8"};font-size:11px">${live ? "● بث مباشر" : "○ غير نشط"}</span></div>`

        const existing = markersRef.current.get(bus.id)
        if (existing) {
          existing.setLatLng(pos).setIcon(icon).setPopupContent(popup)
        } else {
          const marker = L.marker(pos, { icon }).bindPopup(popup).addTo(map)
          markersRef.current.set(bus.id, marker)
        }
      })

      const ids = new Set(buses.map((b) => b.id))
      markersRef.current.forEach((marker, id) => {
        if (!ids.has(id)) { marker.remove(); markersRef.current.delete(id) }
      })
    })

    return () => {
      unsub()
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [onBusCount])

  return <div ref={containerRef} className="h-full w-full" />
}
