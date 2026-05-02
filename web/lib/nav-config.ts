import type { LucideIcon } from "lucide-react"
import {
  BriefcaseIcon,
  ClipboardListIcon,
  HomeIcon,
  NetworkIcon,
  SettingsIcon,
  SnowflakeIcon,
  TargetIcon,
  UserRoundSearchIcon,
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
  id: "main" | "assessment" | "talent" | "admin"
  groupLabel: string
  items: AppNavItem[]
}

/** Один источник правды для сайдбара и заголовка хлебных крошек. */
export const APP_NAV: AppNavGroup[] = [
  {
    id: "main",
    groupLabel: "Система",
    items: [
      {
        href: "/",
        label: "Главная",
        tooltip: "Обзор и переходы в разделы",
        icon: HomeIcon,
        isActive: (p) => p === "" || p === "/",
      },
    ],
  },
  {
    id: "assessment",
    groupLabel: "Оценка",
    items: [
      {
        href: "/assessment",
        label: "Оценка",
        tooltip: "Оценка",
        icon: ClipboardListIcon,
        isActive: (p) => p === "/assessment" || p.startsWith("/assessment/"),
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
    id: "talent",
    groupLabel: "Развитие",
    items: [
      {
        href: "/assessment-center",
        label: "Ассессмент",
        tooltip: "Ассессмент",
        icon: UserRoundSearchIcon,
        isActive: (p) =>
          p === "/assessment-center" || p.startsWith("/assessment-center/"),
      },
      {
        href: "/tselepolaganie",
        label: "Целеполагание",
        tooltip: "Целеполагание",
        icon: TargetIcon,
        isActive: (p) =>
          p === "/tselepolaganie" || p.startsWith("/tselepolaganie/"),
      },
      {
        href: "/tselepolaganie-kold",
        label: "Целеполагание КОЛД",
        tooltip: "Целеполагание КОЛД",
        icon: SnowflakeIcon,
        isActive: (p) =>
          p === "/tselepolaganie-kold" ||
          p.startsWith("/tselepolaganie-kold/"),
      },
      {
        href: "/career",
        label: "Карьера",
        tooltip: "Карьера",
        icon: BriefcaseIcon,
        isActive: (p) => p === "/career" || p.startsWith("/career/"),
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
  const p = pathname || "/"
  if (p === "/") return "Обзор"
  for (const group of APP_NAV) {
    for (const item of group.items) {
      if (item.isActive(p)) return item.label
    }
  }
  return "Раздел"
}
