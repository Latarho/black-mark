"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, CalendarDays, SearchIcon, XIcon } from "lucide-react"

import {
  StaffAssessmentDetailModal,
} from "@/components/assessment/staff-assessment-detail-modal"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ORG_ROOT, getBreadcrumb, type StaffMember } from "@/lib/bank-org-mock"
import { ASSESSMENT_TEAM_TAB_HREF } from "@/lib/assessment-routes"
import {
  ASSESSMENT_GRADE_HINTS,
  CRITICALITY_LEVEL_CLASSES,
  CRITICALITY_LEVEL_LABELS,
  EMPLOYEE_CATEGORY_OPTIONS,
  FKR_TABLE_TAG_CLASS,
  getAssessmentGrade,
  getAssessmentGradeForMember,
  RESIGNATION_PROBABILITY_OPTIONS,
  TABLE_TAG_TEXT_CLASS,
  getEmployeeCategory,
  getEffectiveSalaryMarketLevel,
  getResignationProbability,
  getRetentionRiskScore,
  hasRequiredAssessment,
  type AssessmentGradeLevel,
  type FkrStatus,
  type SalaryMarketLevel,
} from "@/lib/assessment-model"
import { formatFioMember, STAFF_TABLE_PAGE_SIZE_OPTIONS } from "@/lib/staff-presentation"
import { StaffMemberAvatar } from "@/components/staff-member-avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SortMode = "fio" | "grade_worst" | "risk"

const NEUTRAL_TABLE_TAG_CLASS = cn(
  "inline-flex max-w-full min-w-0 items-center rounded-full px-2 py-1",
  TABLE_TAG_TEXT_CLASS,
  FKR_TABLE_TAG_CLASS
)

function getMemberAssessmentSlice(member: StaffMember) {
  const salaryLevel = getEffectiveSalaryMarketLevel(member, {})
  const category = getEmployeeCategory(member, salaryLevel)
  const probability = getResignationProbability(member, salaryLevel)
  const { isFormed } = hasRequiredAssessment(category, probability)
  const grade = isFormed ? getAssessmentGrade(category, probability) : null
  return { salaryLevel, category, probability, isFormed, grade }
}

function memberNeedsAttention(member: StaffMember): boolean {
  const { isFormed, grade, probability } = getMemberAssessmentSlice(member)
  if (!isFormed) return true
  if (grade === "D" || grade === "E") return true
  if (probability === "high") return true
  return false
}

/** Чем выше — тем «тяжелее» ситуация с точки зрения оценки (для сортировки «сначала проблемные»). */
function executiveConcernScore(member: StaffMember): number {
  const { isFormed, grade } = getMemberAssessmentSlice(member)
  if (!isFormed) return 60
  const byLetter: Record<AssessmentGradeLevel, number> = {
    A: 10,
    B: 20,
    C: 35,
    D: 48,
    E: 55,
  }
  return byLetter[grade ?? "E"] ?? 55
}

export function HomeTeamAssessment({
  team,
  teamExpanded,
}: {
  team: StaffMember[]
  teamExpanded: StaffMember[]
}) {
  const [staffSearchQuery, setStaffSearchQuery] = useState("")
  const [staffPage, setStaffPage] = useState(1)
  const [staffPageSize, setStaffPageSize] = useState<number>(50)
  const [sortMode, setSortMode] = useState<SortMode>("fio")
  const [directSubordinatesOnly, setDirectSubordinatesOnly] = useState(true)
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null)

  const displayTeam = useMemo(
    () => (directSubordinatesOnly ? team : teamExpanded),
    [directSubordinatesOnly, team, teamExpanded]
  )

  useEffect(() => {
    setSelectedStaffMember((prev) => {
      if (!prev) return null
      const ids = new Set(displayTeam.map((m) => m.id))
      return ids.has(prev.id) ? prev : null
    })
  }, [displayTeam])

  const searchFiltered = useMemo(() => {
    const globalQuery = staffSearchQuery.trim().toLowerCase()
    return displayTeam.filter((member) => {
      const unitPath = getBreadcrumb(ORG_ROOT, member.unitId)
        .filter((unit) => unit.id !== ORG_ROOT.id)
        .map((unit) => unit.name)
        .join(" / ")
      const fio = formatFioMember(member)
      const searchText = [fio, member.position, unitPath].join(" ").toLowerCase()
      return !globalQuery || searchText.includes(globalQuery)
    })
  }, [displayTeam, staffSearchQuery])

  const gradeDistribution = useMemo(() => {
    const result: Record<AssessmentGradeLevel | "not-formed", number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      "not-formed": 0,
    }
    searchFiltered.forEach((member) => {
      const { isFormed, grade } = getMemberAssessmentSlice(member)
      if (!isFormed) result["not-formed"] += 1
      else if (grade) result[grade] += 1
    })
    return result
  }, [searchFiltered])

  const attentionCount = useMemo(
    () => searchFiltered.filter((m) => memberNeedsAttention(m)).length,
    [searchFiltered]
  )

  const sortedFilteredStaff = useMemo(() => {
    const list = [...searchFiltered]

    if (sortMode === "fio") {
      list.sort((a, b) => formatFioMember(a).localeCompare(formatFioMember(b)))
    } else if (sortMode === "grade_worst") {
      list.sort((a, b) => {
        const diff =
          executiveConcernScore(b) - executiveConcernScore(a)
        if (diff !== 0) return diff
        return formatFioMember(a).localeCompare(formatFioMember(b))
      })
    } else {
      list.sort((a, b) => {
        const sa = getRetentionRiskScore(a, getEffectiveSalaryMarketLevel(a, {}))
        const sb = getRetentionRiskScore(b, getEffectiveSalaryMarketLevel(b, {}))
        if (sb !== sa) return sb - sa
        return formatFioMember(a).localeCompare(formatFioMember(b))
      })
    }
    return list
  }, [searchFiltered, sortMode])

  const totalStaffItems = sortedFilteredStaff.length
  const staffPages = Math.max(1, Math.ceil(totalStaffItems / staffPageSize))
  const safeStaffPage = Math.min(staffPage, staffPages)
  const pagedStaff = useMemo(() => {
    const start = (safeStaffPage - 1) * staffPageSize
    return sortedFilteredStaff.slice(start, start + staffPageSize)
  }, [safeStaffPage, sortedFilteredStaff, staffPageSize])

  const selectedStaffUnitPath = selectedStaffMember
    ? getBreadcrumb(ORG_ROOT, selectedStaffMember.unitId)
        .filter((unit) => unit.id !== ORG_ROOT.id)
        .map((unit) => unit.name)
        .join(" / ")
    : ""

  const selectedStaffSalaryMarketLevel: SalaryMarketLevel = selectedStaffMember
    ? selectedStaffMember.salaryMarketLevel ?? "not-selected"
    : "not-selected"

  const selectedStaffFkrStatus: FkrStatus = selectedStaffMember?.fkrStatus ?? "not-included"

  const selectedStaffCriticality: AssessmentGradeLevel = selectedStaffMember
    ? getAssessmentGradeForMember(selectedStaffMember, {}, {}, {})
    : "E"

  const selectedStaffSurveyResult = selectedStaffMember?.surveyResultCategory ?? "middle"
  const selectedStaffSurveyTeam = selectedStaffMember?.surveyInteractionCategory ?? "middle"

  const setSortModeAndReset = (mode: SortMode) => {
    setSortMode(mode)
    setStaffPage(1)
  }

  const gradeOrder: (AssessmentGradeLevel | "not-formed")[] = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "not-formed",
  ]

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={staffSearchQuery}
              onChange={(event) => {
                setStaffSearchQuery(event.target.value)
                setStaffPage(1)
              }}
              placeholder="Поиск по ФИО, подразделению или должности"
              className="h-10 pr-9 pl-9"
            />
            {staffSearchQuery ? (
              <button
                type="button"
                className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Очистить поиск"
                onClick={() => {
                  setStaffSearchQuery("")
                  setStaffPage(1)
                }}
              >
                <XIcon className="size-4" />
              </button>
            ) : null}
          </div>
          <Button asChild type="button" size="sm" className="h-10 shrink-0 sm:self-stretch">
            <Link href={ASSESSMENT_TEAM_TAB_HREF} className="inline-flex items-center gap-2">
              Полная версия
              <ArrowUpRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3 border-b border-border bg-muted/15 px-3 py-3">
        <div
          className={cn(
            "flex flex-col gap-3 rounded-lg border-2 border-primary/40 bg-primary/[0.08] p-3 shadow-sm",
            "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
            "dark:border-primary/55 dark:bg-primary/15"
          )}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/25 dark:bg-primary/25">
              <CalendarDays className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Сводка оценки команды</p>
              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                Распределение, сводка и таблица ниже отражают текущие данные по команде.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:gap-x-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  id="home-team-direct-subordinates-title"
                  className="max-w-[min(100vw-10rem,16rem)] cursor-default truncate text-end text-sm font-medium text-muted-foreground underline decoration-dotted decoration-muted-foreground/60 underline-offset-2 sm:max-w-[20rem]"
                >
                  Сотрудники прямого подчинения
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" align="end" className="max-w-xs text-sm leading-relaxed">
                {directSubordinatesOnly ? (
                  <p>
                    В списке только ваш офис — коллеги по тому же подразделению, кроме вас. Выключите переключатель,
                    чтобы добавить смежные отделы вашего управления.
                  </p>
                ) : (
                  <p>
                    В списке сотрудники вашего управления: ваш офис и смежные отделы. Включите переключатель, чтобы
                    оставить только прямое подчинение (ваш офис).
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
            <Switch
              checked={directSubordinatesOnly}
              onCheckedChange={(checked) => {
                setDirectSubordinatesOnly(checked)
                setStaffPage(1)
              }}
              aria-labelledby="home-team-direct-subordinates-title"
              className="shrink-0"
            />
          </div>

          <span className="hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden />

          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-sm font-medium whitespace-nowrap text-muted-foreground">
              Сортировка
            </span>
            <Select
              value={sortMode}
              onValueChange={(v) => setSortModeAndReset(v as SortMode)}
            >
              <SelectTrigger className="h-10 w-[min(100%,14rem)] min-w-0 sm:w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="fio">По ФИО (А–Я)</SelectItem>
                <SelectItem value="grade_worst">Сначала проблемные оценки</SelectItem>
                <SelectItem value="risk">По риску удержания (сигналы)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Распределение оценок
            </span>
          <span className="text-muted-foreground">·</span>
          {gradeOrder.map((key) => {
            const count = gradeDistribution[key]
            const label =
              key === "not-formed" ? "Не оформ." : CRITICALITY_LEVEL_LABELS[key as AssessmentGradeLevel]
            const pillClass =
              key === "not-formed"
                ? "border border-dashed border-muted-foreground/50 bg-muted/40 text-muted-foreground"
                : CRITICALITY_LEVEL_CLASSES[key as AssessmentGradeLevel]
            return (
              <span
                key={key}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium tabular-nums",
                  pillClass
                )}
              >
                <span className="font-semibold">{label}</span>
                <span className="opacity-90">{count}</span>
              </span>
            )
          })}
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">
            Требуют внимания:{" "}
            <span className="font-semibold text-foreground tabular-nums">{attentionCount}</span>
            <span className="text-muted-foreground">
              {" "}
              (D, E, высокий риск увольнения или оценка не сформирована)
            </span>
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 backdrop-blur-sm">
            <tr className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              <th className="w-[44%] px-2 py-2 font-medium">Сотрудник</th>
              <th className="w-[14%] border-x border-border bg-muted/40 px-2 py-2 text-center font-medium text-foreground">
                <span className="block">Оценка</span>
                <span className="mt-0.5 block text-sm font-normal normal-case tracking-normal text-muted-foreground">
                  Текущий период
                </span>
              </th>
              <th className="w-[21%] px-2 py-2 text-center font-medium">Категория</th>
              <th className="w-[21%] px-2 py-2 text-center font-medium">Риск увольнения</th>
            </tr>
          </thead>
          <tbody>
            {pagedStaff.map((member) => {
              const unitPath = getBreadcrumb(ORG_ROOT, member.unitId)
                .filter((u) => u.id !== ORG_ROOT.id)
                .map((u) => u.name)
                .join(" / ")
              const { category, probability, isFormed: hasGrade, grade } = getMemberAssessmentSlice(member)
              const { missingFields } = hasRequiredAssessment(category, probability)
              const categoryLabel =
                EMPLOYEE_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? "—"
              const probOption = RESIGNATION_PROBABILITY_OPTIONS.find((o) => o.value === probability)

              return (
                <tr key={member.id} className="border-b border-border/80 hover:bg-muted/40">
                  <td className="min-w-0 px-2 py-2 align-middle">
                    <div className="flex min-w-0 items-center gap-2">
                      <StaffMemberAvatar
                        member={member}
                        className="h-12 w-12 shrink-0 text-sm"
                        initials="assessment"
                        fallbackTone="primary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex min-w-0 items-center gap-1">
                          <button
                            type="button"
                            className="block max-w-full truncate text-left text-base font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => setSelectedStaffMember(member)}
                          >
                            {formatFioMember(member)}
                          </button>
                        </div>
                        <p className="mt-0.5 line-clamp-1 break-words leading-snug text-muted-foreground">
                          {member.position}
                        </p>
                        <p className="mt-0.5 line-clamp-1 break-words text-sm leading-snug text-muted-foreground">
                          {unitPath}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-0 border-x border-border bg-muted/20 px-2 py-2 text-center align-middle">
                    {hasGrade && grade ? (
                      ASSESSMENT_GRADE_HINTS[grade] ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`inline-flex min-h-7 min-w-9 items-center justify-center rounded-full border text-sm font-semibold uppercase ${CRITICALITY_LEVEL_CLASSES[grade]}`}
                            >
                              {CRITICALITY_LEVEL_LABELS[grade]}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm bg-popover text-popover-foreground text-sm leading-relaxed">
                            <div className="space-y-2">
                              <p className="font-semibold">Результат оценки</p>
                              <p className="text-sm text-muted-foreground">
                                Рекомендации по удержанию:
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {ASSESSMENT_GRADE_HINTS[grade]}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span
                          className={`inline-flex min-h-7 min-w-9 items-center justify-center rounded-full border text-sm font-semibold uppercase ${CRITICALITY_LEVEL_CLASSES[grade]}`}
                        >
                          {CRITICALITY_LEVEL_LABELS[grade]}
                        </span>
                      )
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex min-h-7 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 bg-muted/30 px-2 py-1 text-sm font-semibold uppercase text-muted-foreground">
                            НЕ СФОРМИРОВАН
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm bg-popover text-popover-foreground text-sm leading-relaxed">
                          <div className="space-y-2">
                            <p className="font-semibold">Результат оценки не сформирован</p>
                            <p className="text-sm text-muted-foreground">
                              Для формирования результата оценки заполните:
                            </p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {missingFields.map((item) => (
                                <li key={item} className="inline-flex w-full items-start gap-2">
                                  <span className="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </td>
                  <td className="min-w-0 px-2 py-2 text-center align-middle">
                    <span className={NEUTRAL_TABLE_TAG_CLASS}>
                      <span className="min-w-0 truncate">{categoryLabel}</span>
                    </span>
                  </td>
                  <td className="min-w-0 px-2 py-2 text-center align-middle">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <span className={NEUTRAL_TABLE_TAG_CLASS}>
                        <span className="min-w-0 truncate">{probOption?.label ?? probability}</span>
                      </span>
                      {probOption?.aiBased ? (
                        <span className={NEUTRAL_TABLE_TAG_CLASS}>На основе ИИ</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {totalStaffItems === 0 ? (
          <p className="px-3 py-8 text-center text-base text-muted-foreground">Сотрудники не найдены</p>
        ) : null}
      </div>

      {totalStaffItems > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            <span>
              В списке: <span className="font-medium text-foreground tabular-nums">{totalStaffItems}</span>
            </span>
            <label className="flex items-center gap-1.5">
              <span>Строк на странице:</span>
              <select
                className="h-7 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                value={staffPageSize}
                onChange={(event) => {
                  setStaffPageSize(Number(event.target.value))
                  setStaffPage(1)
                }}
              >
                {STAFF_TABLE_PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-sm"
              onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
              disabled={safeStaffPage <= 1}
            >
              Назад
            </Button>
            <span className="tabular-nums text-muted-foreground">
              {safeStaffPage} / {staffPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-sm"
              onClick={() => setStaffPage((p) => Math.min(staffPages, p + 1))}
              disabled={safeStaffPage >= staffPages}
            >
              Вперёд
            </Button>
          </div>
        </div>
      ) : null}

      <StaffAssessmentDetailModal
        selectedStaffMember={selectedStaffMember}
        setSelectedStaffMember={setSelectedStaffMember}
        selectedStaffUnitPath={selectedStaffUnitPath}
        selectedStaffCriticality={selectedStaffCriticality}
        selectedStaffSalaryMarketLevel={selectedStaffSalaryMarketLevel}
        selectedStaffFkrStatus={selectedStaffFkrStatus}
        selectedStaffSurveyResult={selectedStaffSurveyResult}
        selectedStaffSurveyTeam={selectedStaffSurveyTeam}
      />
    </section>
  )
}
