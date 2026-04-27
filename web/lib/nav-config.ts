import type { LucideIcon } from "lucide-react"
import {
  ClipboardListIcon,
  NetworkIcon,
  SettingsIcon,
} from "lucide-react"

export type AppNavItem = {
  href: string
  label: string
  tooltip: string
  icon: LucideIcon
  /** Сопоставление текущего пути (более специфичные правила — выше в списке группы). */
  isActive: (pathname: string) => boolean
}

export type AppNavGroup = {
  id: "assessment" | "admin"
  groupLabel: string
  items: AppNavItem[]
}

/** Один источник правды для сайдбара и заголовка хлебных крошек. */
export const APP_NAV: AppNavGroup[] = [
  {
    id: "assessment",
    groupLabel: "Оценка",
    items: [
      {
        href: "/",
        label: "Оценка",
        tooltip: "Оценка",
        icon: ClipboardListIcon,
        isActive: (p) => p === "" || p === "/",
      },
      {
        href: "/cabinet/staff",
        label: "Организационная структура",
        tooltip: "Организационная структура",
        icon: NetworkIcon,
        isActive: (p) => p.startsWith("/cabinet/staff"),
      },
    ],
  },
  {
    id: "admin",
    groupLabel: "Администрирование",
    items: [
      {
        href: "/admin",
        label: "Администрирование",
        tooltip: "Администрирование",
        icon: SettingsIcon,
        isActive: (p) => p.startsWith("/admin"),
      },
    ],
  },
]

export function getSectionTitleForPathname(pathname: string): string {
  for (const group of APP_NAV) {
    for (const item of group.items) {
      if (item.isActive(pathname)) return item.label
    }
  }
  return "Раздел"
}
