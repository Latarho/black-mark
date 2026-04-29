import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DetailCardSectionVariant = "compact" | "default"

const sectionHeaderClassByVariant: Record<DetailCardSectionVariant, string> = {
  compact: "flex items-center gap-2 border-b border-border bg-muted/35 px-4 py-3",
  default: "flex items-center gap-2.5 border-b border-border bg-muted/35 px-4 py-3.5",
}

const sectionAccentClassByVariant: Record<DetailCardSectionVariant, string> = {
  compact: "h-4 w-1 rounded-full bg-primary/60",
  default: "h-5 w-1 shrink-0 rounded-full bg-primary/70",
}

const sectionTitleClassByVariant: Record<DetailCardSectionVariant, string> = {
  compact: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
  default: "text-sm font-bold uppercase tracking-wide text-foreground",
}

export function DetailCardSection({
  title,
  children,
  variant = "default",
}: {
  title: string
  children: ReactNode
  variant?: DetailCardSectionVariant
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className={sectionHeaderClassByVariant[variant]}>
        <span className={sectionAccentClassByVariant[variant]} />
        <h3 className={sectionTitleClassByVariant[variant]}>{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function DetailCardField({
  label,
  value,
  insight,
  icon: Icon,
  labelClassName,
}: {
  label: string
  value: ReactNode
  insight?: ReactNode
  icon?: LucideIcon
  labelClassName?: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted/35">
      <dt className={cn("text-sm text-muted-foreground", labelClassName)}>
        {Icon ? (
          <span className="flex items-center gap-1.5">
            <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
            {label}
          </span>
        ) : (
          label
        )}
      </dt>
      <dd className="mt-1 min-w-0 break-words text-sm leading-snug text-foreground">
        {value}
      </dd>
      {insight ? (
        <div className="mt-2 text-xs leading-snug text-muted-foreground">{insight}</div>
      ) : null}
    </div>
  )
}
