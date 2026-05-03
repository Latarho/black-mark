import { TooltipContent } from "@/components/ui/tooltip"
import { ReactNode } from "react"

export function StructuredTooltipContent({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <TooltipContent className="max-w-sm bg-popover p-3 text-popover-foreground text-sm leading-relaxed">
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {children ? <div className="space-y-1 text-sm text-muted-foreground">{children}</div> : null}
      </div>
    </TooltipContent>
  )
}
