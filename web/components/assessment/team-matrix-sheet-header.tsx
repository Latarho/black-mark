 "use client"

import { formatFioMember } from "@/lib/staff-presentation"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TeamMatrixFilterTags } from "@/components/assessment/team-matrix-filter-tags"
import { StructuredTooltipContent } from "@/components/assessment/structured-tooltip-content"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import type { TeamMatrixFilterTag } from "@/lib/assessment/team-matrix-filter-tags"
import type { StaffMember } from "@/lib/bank-org-mock"

type TeamMatrixAxisConfig = {
  xLabel: string
  yLabel: string
  x: string[]
  y: string[]
}

type TeamMatrixEmployeeStats = {
  totalInMatrix: number
  evaluatedByBoth: number
  notEvaluated: number
  evaluatedMembers: StaffMember[]
  notEvaluatedMembers: StaffMember[]
}

type TeamMatrixSheetHeaderProps = {
  teamMatrixMode: "survey-nine-box" | "manager-twelve-box"
  teamMatrixConfig: TeamMatrixAxisConfig
  teamMatrixFilterTags: TeamMatrixFilterTag[]
  teamMatrixEmployeeStats: TeamMatrixEmployeeStats
}

export function TeamMatrixSheetHeader({
  teamMatrixMode,
  teamMatrixConfig,
  teamMatrixFilterTags,
  teamMatrixEmployeeStats,
}: TeamMatrixSheetHeaderProps) {
  return (
    <SheetHeader className="border-b border-border px-6 py-4">
      <SheetTitle
        className={`text-base font-semibold tracking-wide md:text-lg ${
          teamMatrixMode === "survey-nine-box"
            ? "text-amber-700 dark:text-amber-200"
            : "text-violet-700 dark:text-violet-200"
        }`}
      >
        <span className="font-black uppercase tracking-[0.2em]">
          {teamMatrixMode === "survey-nine-box" ? "9-box" : "12-box"}
        </span>{" "}
        <span className="font-medium normal-case">
          {teamMatrixMode === "survey-nine-box"
            ? "результаты опроса"
            : "результаты оценки руководителя"}
        </span>
      </SheetTitle>
      <TeamMatrixFilterTags tags={teamMatrixFilterTags} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-foreground">Сотрудников в выборке:</span>
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-border bg-muted px-2 py-1 text-sm font-bold uppercase text-foreground">
          {teamMatrixEmployeeStats.totalInMatrix}
        </span>
        {teamMatrixMode === "manager-twelve-box" ? (
          <>
            <span className="text-sm text-foreground">Оценены (категория+вероятность)</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-border bg-muted px-2 py-1 text-sm font-bold uppercase text-foreground">
                  {teamMatrixEmployeeStats.evaluatedByBoth}
                </span>
              </TooltipTrigger>
              <StructuredTooltipContent
                title="Оценены (категория+вероятность)"
                description="Сотрудники с заполненными значениями категории и вероятности увольнения."
              >
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                  {teamMatrixEmployeeStats.evaluatedMembers.length ? (
                    teamMatrixEmployeeStats.evaluatedMembers.slice(0, 10).map((member) => (
                      <div key={member.id}>
                        <div className="font-medium">{formatFioMember(member)}</div>
                        <div className="text-sm text-muted-foreground">{member.position}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">Нет оцененных сотрудников</div>
                  )}
                  {teamMatrixEmployeeStats.evaluatedMembers.length > 10 ? (
                    <div className="pt-1 text-sm text-muted-foreground">
                      ... еще {teamMatrixEmployeeStats.evaluatedMembers.length - 10}
                    </div>
                  ) : null}
                </div>
              </StructuredTooltipContent>
            </Tooltip>
            <span className="text-sm text-foreground">Не оценены</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-border bg-muted px-2 py-1 text-sm font-bold uppercase text-foreground">
                  {teamMatrixEmployeeStats.notEvaluated}
                </span>
              </TooltipTrigger>
              <StructuredTooltipContent
                title="Не оценены"
                description="Сотрудники без полного ввода категории сотрудника или вероятности увольнения."
              >
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                  {teamMatrixEmployeeStats.notEvaluatedMembers.length ? (
                    teamMatrixEmployeeStats.notEvaluatedMembers.slice(0, 10).map((member) => (
                      <div key={member.id}>
                        <div className="font-medium">{formatFioMember(member)}</div>
                        <div className="text-sm text-muted-foreground">{member.position}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">Нет неоцененных сотрудников</div>
                  )}
                  {teamMatrixEmployeeStats.notEvaluatedMembers.length > 10 ? (
                    <div className="pt-1 text-sm text-muted-foreground">
                      ... еще {teamMatrixEmployeeStats.notEvaluatedMembers.length - 10}
                    </div>
                  ) : null}
                </div>
              </StructuredTooltipContent>
            </Tooltip>
          </>
        ) : null}
      </div>
    </SheetHeader>
  )
}
