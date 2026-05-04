"use client"

import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TeamMatrixFilterTags } from "@/components/assessment/team-matrix-filter-tags"
import { StructuredTooltipContent } from "@/components/assessment/structured-tooltip-content"
import { StaffMemberAvatar } from "@/components/staff-member-avatar"
import { Users } from "lucide-react"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { formatFioMember } from "@/lib/staff-presentation"
import {
  CRITICALITY_LEVEL_CLASSES,
  CRITICALITY_LEVEL_LABELS,
  getEffectiveSalaryMarketLevel,
  getEmployeeCategory,
  getManagerTwelveBoxCellGrade,
  getResignationProbability,
  getTeamMatrixCellTone,
  type AssessmentGradeLevel,
  type EmployeeCategoryLevel,
  type ResignationProbabilityLevel,
  type SalaryMarketLevel,
  type TeamMatrixMode,
  SURVEY_CATEGORY_LABELS,
} from "@/lib/assessment-model"
import { cn } from "@/lib/utils"
import type { StaffMember } from "@/lib/bank-org-mock"
import type { TeamMatrixFilterTag } from "@/lib/assessment/team-matrix-filter-tags"

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

type TeamMatrixSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMatrixMode: TeamMatrixMode
  teamMatrixConfig: TeamMatrixAxisConfig
  teamMatrixFilterTags: TeamMatrixFilterTag[]
  teamMatrixEmployeeStats: TeamMatrixEmployeeStats
  teamMatrixRows: number[][]
  teamMatrixColumnCount: number
  teamMatrixRowCount: number
  isManagerTwelveBox: boolean
  nineBoxBuckets: StaffMember[][]
  salaryMarketLevelOverrides: Record<string, SalaryMarketLevel>
  employeeCategoryOverrides: Record<string, EmployeeCategoryLevel>
  resignationProbabilityOverrides: Record<string, ResignationProbabilityLevel>
  onSelectStaff: (member: StaffMember) => void
}

export function TeamMatrixSheet({
  open,
  onOpenChange,
  teamMatrixMode,
  teamMatrixConfig,
  teamMatrixFilterTags,
  teamMatrixEmployeeStats,
  teamMatrixRows,
  teamMatrixColumnCount,
  teamMatrixRowCount,
  isManagerTwelveBox,
  nineBoxBuckets,
  salaryMarketLevelOverrides,
  employeeCategoryOverrides,
  resignationProbabilityOverrides,
  onSelectStaff,
}: TeamMatrixSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={true}
        className="!w-full !max-w-full !h-[85vh] border-t border-border bg-card"
      >
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
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-4 py-5">
          <div className="grid grid-cols-[48px_1fr] gap-4">
            <div className="relative flex">
              <div className="absolute left-1/2 top-1/2 flex w-10 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-between py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.2"
                  stroke="currentColor"
                  className="text-muted-foreground"
                  aria-hidden="true"
                >
                  <path d="M12 20V4M9 7l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="rotate-180 [writing-mode:vertical-rl] text-base font-semibold tracking-wide text-muted-foreground">
                  {teamMatrixConfig.yLabel}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.2"
                  stroke="currentColor"
                  className="text-muted-foreground"
                  aria-hidden="true"
                >
                  <path d="M12 4V20M9 17l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="grid gap-4">
              {teamMatrixRows.map((row, yIndex) => (
                <div
                  key={yIndex}
                  className={`grid min-h-[176px] ${
                    teamMatrixColumnCount === 4 ? "grid-cols-[46px_repeat(4,minmax(0,1fr))]" : "grid-cols-[46px_repeat(3,minmax(0,1fr))]"
                  } gap-3`}
                >
                  <div className="flex items-center justify-center px-1 text-sm font-semibold text-muted-foreground">
                    {teamMatrixConfig.y[isManagerTwelveBox ? yIndex : teamMatrixRowCount - 1 - yIndex]}
                  </div>
                  {row.map((index) => {
                    const bucket = nineBoxBuckets[index]
                    const x = index % teamMatrixColumnCount
                    const cellMatrixGrade: AssessmentGradeLevel | null = isManagerTwelveBox
                      ? getManagerTwelveBoxCellGrade(x, yIndex)
                      : null
                    const cellToneClass =
                      cellMatrixGrade !== null
                        ? CRITICALITY_LEVEL_CLASSES[cellMatrixGrade]
                        : getTeamMatrixCellTone(x, yIndex, teamMatrixRowCount, teamMatrixMode)
                    return (
                      <div
                        key={index}
                        className={cn(
                          "@container/matrix-cell relative min-h-[160px] overflow-hidden rounded-lg p-2 shadow-sm ring-1 ring-border/25 [container-type:size]",
                          cellToneClass
                        )}
                      >
                        {cellMatrixGrade ? (
                          <div className="pointer-events-none absolute inset-2.5 z-0 flex select-none items-center justify-center" aria-hidden>
                            <span
                              className="max-h-full w-full text-center font-bold leading-none text-foreground/[0.08] dark:text-foreground/[0.06]"
                              style={{ fontSize: "min(10.5rem, 85cqh)", maxHeight: "100%" }}
                            >
                              {CRITICALITY_LEVEL_LABELS[cellMatrixGrade]}
                            </span>
                          </div>
                        ) : null}
                        <span className="absolute right-2 top-2 z-10 inline-flex min-w-7 items-center justify-center rounded-full border-2 border-white/80 bg-slate-950/10 px-2.5 py-1 text-sm font-semibold uppercase text-slate-900 shadow-sm backdrop-blur-sm dark:bg-white/10 dark:text-foreground">
                          <Users size={13} className="mr-1" />
                          {bucket.length}
                        </span>
                        <div className="relative z-10 pt-8" />
                        <div className="relative z-10 flex flex-wrap gap-3.5">
                          {bucket.map((member) => {
                            const currentSalaryMarketLevel = getEffectiveSalaryMarketLevel(member, salaryMarketLevelOverrides)
                            const category =
                              employeeCategoryOverrides[member.id] ??
                              getEmployeeCategory(member, currentSalaryMarketLevel)
                            const probability =
                              resignationProbabilityOverrides[member.id] ??
                              getResignationProbability(member, currentSalaryMarketLevel)
                            const needsEvaluation =
                              category === "not-evaluated" || probability === "not-evaluated"
                            const surveyResult = member.surveyResultCategory ?? "middle"
                            const surveyTeam = member.surveyInteractionCategory ?? "middle"

                            return (
                              <HoverCard key={member.id} openDelay={150} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex w-24 max-w-full flex-col items-center gap-2.5 rounded-md border-0 bg-transparent p-0 text-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  >
                                    <span className="inline-flex">
                                      <StaffMemberAvatar member={member} className="size-10 text-base" initials="assessment" />
                                    </span>
                                    <span className="w-full text-center text-sm font-semibold leading-snug text-foreground">
                                      {member.lastName} {member.firstName}
                                    </span>
                                  </button>
                                </HoverCardTrigger>
                                <HoverCardContent side="top" align="center" className="w-72 p-0 text-sm">
                                  <div className="space-y-3 p-3">
                                    {needsEvaluation ? (
                                      <p className="text-sm text-amber-800 dark:text-amber-300/90">
                                        Для попадания в 12×box: заполните категорию сотрудника и вероятность увольнения.
                                      </p>
                                    ) : null}
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Опрос: вклад в достижение результатов
                                      </p>
                                      <p className="font-medium text-foreground">
                                        {SURVEY_CATEGORY_LABELS[surveyResult]}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Опрос: командное взаимодействие
                                      </p>
                                      <p className="font-medium text-foreground">
                                        {SURVEY_CATEGORY_LABELS[surveyTeam]}
                                      </p>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="p-2">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      className="w-full"
                                      size="sm"
                                      onClick={() => onSelectStaff(member)}
                                    >
                                      Информация о сотруднике
                                    </Button>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            )
                          })}
                          {bucket.length === 0 ? (
                            <span className="text-base text-muted-foreground">Нет сотрудников</span>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div
              className={`grid gap-2 px-1 ${
                teamMatrixColumnCount === 4
                  ? "grid-cols-[48px_repeat(4,minmax(0,1fr))]"
                  : "grid-cols-[48px_repeat(3,minmax(0,1fr))]"
              }`}
            >
              <div />
              {teamMatrixConfig.x.map((label) => (
                <div key={label} className="text-center text-sm font-semibold tracking-wide text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>
            <div
              className={`grid gap-2 px-1 ${
                teamMatrixColumnCount === 4
                  ? "grid-cols-[48px_repeat(4,minmax(0,1fr))]"
                  : "grid-cols-[48px_repeat(3,minmax(0,1fr))]"
              }`}
            >
              <div />
              <div
                className={`flex items-center justify-center gap-2 text-center text-base font-semibold tracking-wide text-muted-foreground ${
                  teamMatrixColumnCount === 4 ? "col-span-4" : "col-span-3"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.2"
                  stroke="currentColor"
                  className="text-muted-foreground"
                  aria-hidden="true"
                >
                  <path d="M20 12H4M7 9l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {teamMatrixConfig.xLabel}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.2"
                  stroke="currentColor"
                  className="text-muted-foreground"
                  aria-hidden="true"
                >
                  <path d="M4 12h16M17 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
