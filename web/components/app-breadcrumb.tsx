"use client"

import Link from "next/link"
import { HomeIcon } from "lucide-react"
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
                aria-label="Главная"
                className="inline-flex items-center text-foreground transition-colors hover:text-foreground"
              >
                <HomeIcon className="size-4 shrink-0" aria-hidden />
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        <BreadcrumbItem>
          <BreadcrumbPage className="inline-flex items-center gap-1.5">
            {isHome ? (
              <>
                <HomeIcon className="size-4 shrink-0" aria-hidden />
                <span className="sr-only">Главная</span>
              </>
            ) : (
              getSectionTitleForPathname(pathname)
            )}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
