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
          <BreadcrumbPage>
            {getSectionTitleForPathname(pathname)}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
