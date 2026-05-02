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
import { getSectionTitleForPathname } from "@/lib/nav-config"

export function AppBreadcrumb() {
  const pathname = usePathname()
  const isHome = pathname === "/" || pathname === ""

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-base/relaxed">
        {!isHome ? (
          <>
            <BreadcrumbItem>
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                Главная
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        <BreadcrumbItem>
          <BreadcrumbPage>
            {isHome ? "Главная" : getSectionTitleForPathname(pathname)}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
