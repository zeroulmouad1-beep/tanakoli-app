export type RouteViewMode = "all" | "single"
export type SelectedRoute = string | null

export const ROUTE_CATEGORIES = {
  urban: { label: "داخل المدينة", labelEn: "Urban", color: "#00A651" },
  intercity: { label: "بين البلديات", labelEn: "Inter-city", color: "#3B82F6" },
  express: { label: "سريع / طلاب", labelEn: "Express", color: "#F59E0B" },
}

export const urbanRoutePolylines: {
  id: string
  coords: [number, number][]
  color: string
  name: string
  category: "urban"
}[] = [
  {
    id: "01",
    name: "خط 01 - الجامعة",
    color: "#00A651",
    category: "urban",
    coords: [
      [35.4420, 7.1380], [35.4400, 7.1420], [35.4377, 7.1458],
      [35.4400, 7.1550], [35.4330, 7.1520], [35.4350, 7.1350],
    ],
  },
  {
    id: "02",
    name: "خط 02 - عين البيضاء",
    color: "#00A651",
    category: "urban",
    coords: [
      [35.4350, 7.1350], [35.4450, 7.1320], [35.4377, 7.1458],
      [35.4330, 7.1520], [35.4400, 7.1480],
    ],
  },
  {
    id: "03",
    name: "خط 03 - المدينة الجديدة",
    color: "#00A651",
    category: "urban",
    coords: [
      [35.4290, 7.1400], [35.4310, 7.1430], [35.4377, 7.1458],
      [35.4400, 7.1550], [35.4400, 7.1480], [35.4350, 7.1350],
    ],
  },
]

export const intercityRoutePolylines: {
  id: string
  coords: [number, number][]
  color: string
  name: string
  category: "intercity"
}[] = [
  {
    id: "K1",
    name: "K1 - خنشلة - قايس",
    color: "#3B82F6",
    category: "intercity",
    coords: [[35.4350, 7.1350], [35.4100, 7.1200], [35.3800, 7.0800], [35.3650, 7.0650]],
  },
  {
    id: "K2",
    name: "K2 - خنشلة - الشريعة",
    color: "#3B82F6",
    category: "intercity",
    coords: [[35.4350, 7.1350], [35.3900, 7.2000], [35.2700, 7.7500], [35.2640, 7.7600]],
  },
  {
    id: "K3",
    name: "K3 - خنشلة - بوحمامة",
    color: "#3B82F6",
    category: "intercity",
    coords: [[35.4350, 7.1350], [35.4500, 7.1600], [35.3300, 6.9900]],
  },
  {
    id: "K4",
    name: "K4 - خنشلة - ششار",
    color: "#3B82F6",
    category: "intercity",
    coords: [[35.4350, 7.1350], [35.4200, 7.1200], [35.3900, 7.0900], [35.3850, 7.0850]],
  },
  {
    id: "K5",
    name: "K5 - خنشلة - عين الطويلة",
    color: "#3B82F6",
    category: "intercity",
    coords: [[35.4350, 7.1350], [35.4500, 7.1100], [35.4900, 7.0500], [35.5000, 7.0400]],
  },
  {
    id: "K6",
    name: "K6 - خنشلة - المحمل",
    color: "#3B82F6",
    category: "intercity",
    coords: [[35.4350, 7.1350], [35.4600, 7.1500], [35.5200, 7.2000]],
  },
  {
    id: "K7",
    name: "K7 - خنشلة - طامزة",
    color: "#3B82F6",
    category: "intercity",
    coords: [[35.4350, 7.1350], [35.4200, 7.0700], [35.4100, 7.0500]],
  },
]

export const allRoutes = [...urbanRoutePolylines, ...intercityRoutePolylines]
