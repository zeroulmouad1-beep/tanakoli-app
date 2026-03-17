"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Megaphone } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"

const BANNER_H = 44

interface AnnouncementDoc {
  message: string
  isActive: boolean
}

export function AnnouncementBanner() {
  const [ann, setAnn] = useState<AnnouncementDoc | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const unsub = onSnapshot(doc(db, "SystemSettings", "announcements"), (snap) => {
      setAnn(snap.exists() ? (snap.data() as AnnouncementDoc) : null)
    })
    return () => unsub()
  }, [])

  const visible = mounted && ann?.isActive === true && !!ann?.message?.trim()

  useEffect(() => {
    document.documentElement.style.setProperty("--ann-h", visible ? `${BANNER_H}px` : "0px")
    return () => {
      document.documentElement.style.setProperty("--ann-h", "0px")
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ann-banner"
          initial={{ y: -BANNER_H, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -BANNER_H, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 320 }}
          className="fixed left-0 right-0 top-0 z-[40] border-b border-amber-800/40 bg-amber-950/95 backdrop-blur-md"
          style={{ height: BANNER_H }}
        >
          <div className="flex h-full items-center gap-3 px-4">
            <motion.div
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/25"
            >
              <Megaphone className="h-3.5 w-3.5 text-amber-400" />
            </motion.div>
            <p className="flex-1 truncate text-sm leading-none text-amber-100" dir="rtl">
              {ann?.message}
            </p>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-amber-600">
              إعلان
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
