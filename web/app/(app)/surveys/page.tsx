"use client"

import { useMemo } from "react"

import { UnitSurveysPanel } from "@/components/unit-surveys-panel"
import { ORG_ROOT } from "@/lib/bank-org-mock"
import { collectUnitOptions } from "@/lib/unit-options"

export default function SurveysPage() {
  const unitOptions = useMemo(() => collectUnitOptions(ORG_ROOT), [])

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-border bg-card">
        <UnitSurveysPanel unitOptions={unitOptions} />
      </section>
    </div>
  )
}
