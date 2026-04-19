"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function sectionTitle(pathname: string) {
  if (pathname === "/" || pathname === "") return "Оценка"
  if (pathname.startsWith("/cabinet/staff")) return "Организационная структура"
  if (pathname.startsWith("/admin")) return "Администрирование"
  return "Раздел"
}

export function AppBreadcrumb() {
  const pathname = usePathname()

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-base/relaxed">
        <BreadcrumbItem>
          <Link
            href="/"
            className="transition-colors hover:text-foreground"
          >
            Главная
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{sectionTitle(pathname)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
