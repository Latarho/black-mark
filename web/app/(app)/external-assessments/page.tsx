"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

import { ExternalAssessmentPersonalReport } from "@/components/external-assessment-personal-report"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { psychReportDemo } from "@/lib/psych-report-demo-data"

export default function ExternalAssessmentsPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-border bg-card px-4 py-6">
        <h2 className="text-base font-semibold text-foreground">Внешние оценки</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          В этом разделе будет отображаться свод внешних оценок и источники данных
          (аудит, обратная связь клиентов, подрядчики и т.п.).
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 flex w-full max-w-xl items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="min-w-0">
            <span className="block text-sm font-medium text-foreground">Свод внешних оценок</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">Нажмите, чтобы открыть</span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent maxWidth="wide" className="max-h-[90vh] gap-0 overflow-hidden p-0">
            <DialogTitle className="sr-only">Персональный отчёт по внешней оценке</DialogTitle>
            <div className="max-h-[90vh] overflow-y-auto px-6 py-5">
              <ExternalAssessmentPersonalReport data={psychReportDemo} />
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  )
}
