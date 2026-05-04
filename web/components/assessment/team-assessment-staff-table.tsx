"use client"

import { MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StaffMemberAvatar } from "@/components/staff-member-avatar"
import { cn } from "@/lib/utils"
import { ORG_ROOT, getBreadcrumb, type StaffMember } from "@/lib/bank-org-mock"
import { formatFioMember, STAFF_TABLE_PAGE_SIZE_OPTIONS } from "@/lib/staff-presentation"
import {
  ASSESSMENT_GRADE_HINTS,
  ASSESSMENT_SELECT_CONTENT_CLASS,
  ASSESSMENT_SELECT_TRIGGER_CLASS,
  CRITICALITY_LEVEL_CLASSES,
  CRITICALITY_LEVEL_LABELS,
  EMPLOYEE_CATEGORY_OPTIONS,
  FKR_STATUS_LABELS,
  FKR_TABLE_TAG_CLASS,
  FULL_TABLE_COL_WIDTHS_PCT,
  RESIGNATION_PROBABILITY_OPTIONS,
  SALARY_MARKET_LEVEL_CLASSES,
  SALARY_MARKET_LEVEL_LABELS,
  SALARY_MARKET_TABLE_TAG_MAX_CH,
  SHORT_TABLE_COL_WIDTHS_PCT,
  SURVEY_CATEGORY_CLASSES,
  SURVEY_CATEGORY_LABELS,
  TABLE_TAG_TEXT_CLASS,
  getAssessmentGrade,
  getEmployeeCategory,
  hasRequiredAssessment,
  getResignationProbability,
  type EmployeeCategoryLevel,
  type FkrStatus,
  type ResignationProbabilityLevel,
  type SalaryMarketLevel,
  type StaffNotebookEntry,
  type SurveyCategoryLevel,
} from "@/lib/assessment-model"

function SalaryMarketLevelTableTag({ level }: { level: SalaryMarketLevel }) {
  const full = SALARY_MARKET_LEVEL_LABELS[level]
  const ref = SALARY_MARKET_LEVEL_LABELS["below-median"]
  const base = cn(
    "inline-flex min-w-0 max-w-full rounded-full px-2 py-1",
    TABLE_TAG_TEXT_CLASS,
    SALARY_MARKET_LEVEL_CLASSES[level]
  )
  if (full.length > ref.length) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(base, "cursor-default")}>
            <span
              className="min-w-0 truncate"
              style={{ maxWidth: `${SALARY_MARKET_TABLE_TAG_MAX_CH}ch` }}
            >
              {full}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm uppercase">
          {full}
        </TooltipContent>
      </Tooltip>
    )
  }
  return <span className={base}>{full}</span>
}

export type TeamAssessmentStaffTableProps = {
  pagedStaff: StaffMember[]
  isFullTableView: boolean
  salaryMarketLevelOverrides: Record<string, SalaryMarketLevel>
  employeeCategoryOverrides: Record<string, EmployeeCategoryLevel>
  resignationProbabilityOverrides: Record<string, ResignationProbabilityLevel>
  staffNotebookEntries: Record<string, StaffNotebookEntry[]>
  onEmployeeCategoryChange: (staffId: string, value: EmployeeCategoryLevel) => void
  onResignationProbabilityChange: (staffId: string, value: ResignationProbabilityLevel) => void
  onSelectStaff: (member: StaffMember) => void
  onOpenNotebook: (member: StaffMember) => void
  totalStaffItems: number
  staffPages: number
  safeStaffPage: number
  staffPageSize: number
  onStaffPageSizeChange: (size: number) => void
  onStaffPagePrev: () => void
  onStaffPageNext: () => void
}

export function TeamAssessmentStaffTable({
  pagedStaff,
  isFullTableView,
  salaryMarketLevelOverrides,
  employeeCategoryOverrides,
  resignationProbabilityOverrides,
  staffNotebookEntries,
  onEmployeeCategoryChange,
  onResignationProbabilityChange,
  onSelectStaff,
  onOpenNotebook,
  totalStaffItems,
  staffPages,
  safeStaffPage,
  staffPageSize,
  onStaffPageSizeChange,
  onStaffPagePrev,
  onStaffPageNext,
}: TeamAssessmentStaffTableProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table
        className={`w-full table-fixed border-collapse text-left text-sm ${
          isFullTableView ? "min-w-[1460px]" : "min-w-[980px]"
        }`}
      >
        <colgroup>
          {(isFullTableView ? [...FULL_TABLE_COL_WIDTHS_PCT] : [...SHORT_TABLE_COL_WIDTHS_PCT]).map(
            (pct, i) => (
              <col key={i} style={{ width: `${pct}%` }} />
            )
          )}
        </colgroup>
        <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 backdrop-blur-sm">
          <tr className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2 font-medium">ФИО</th>
            <th className="border-l border-border bg-muted/40 px-2 py-2 text-center font-medium text-foreground">
              Результат оценки
            </th>
            <th className="px-2 py-2 font-medium">Категория сотрудника</th>
            <th className="px-2 py-2 font-medium">Вероятность увольнения</th>
            {isFullTableView ? (
              <>
                <th className="px-2 py-2 font-medium">Опрос результат</th>
                <th className="px-2 py-2 font-medium">Опрос команда</th>
                <th className="px-2 py-2 font-medium">ФКР</th>
                <th className="px-2 py-2 font-medium">З/П к рынку</th>
                <th className="px-2 py-2 font-medium">Переработки</th>
                <th className="px-2 py-2 font-medium">РИТМ</th>
                <th className="px-2 py-2 font-medium">Внешняя оценка</th>
              </>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {pagedStaff.map((s) => {
            const unitPath = getBreadcrumb(ORG_ROOT, s.unitId)
              .filter((u) => u.id !== ORG_ROOT.id)
              .map((u) => u.name)
              .join(" / ")
            const currentSalaryMarketLevel =
              salaryMarketLevelOverrides[s.id] ?? s.salaryMarketLevel ?? "not-selected"
            const currentFkrStatus: FkrStatus = s.fkrStatus ?? "not-included"
            const currentSurveyResultCategory: SurveyCategoryLevel = s.surveyResultCategory ?? "middle"
            const currentSurveyInteractionCategory: SurveyCategoryLevel =
              s.surveyInteractionCategory ?? "middle"
            const employeeCategory = employeeCategoryOverrides[s.id] ?? getEmployeeCategory(s, currentSalaryMarketLevel)
            const resignationProbability =
              resignationProbabilityOverrides[s.id] ??
              getResignationProbability(s, currentSalaryMarketLevel)
            const selectedResignationOption = RESIGNATION_PROBABILITY_OPTIONS.find(
              (o) => o.value === resignationProbability
            )
            const { isFormed: isGradeFormed, missingFields } = hasRequiredAssessment(
              employeeCategory,
              resignationProbability
            )
            const assessmentGrade = getAssessmentGrade(employeeCategory, resignationProbability)
            const hasNotebookComment = (staffNotebookEntries[s.id] ?? []).length > 0
            return (
              <tr key={s.id} className="border-b border-border/80 hover:bg-muted/40">
                <td className="min-w-0 px-2 py-2 align-middle">
                  <div className="flex min-w-0 items-center gap-2">
                    <StaffMemberAvatar
                      member={s}
                      className="h-12 w-12 text-sm"
                      initials="assessment"
                      fallbackTone="primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex min-w-0 items-center gap-1">
                        <button
                          type="button"
                          className="block max-w-full truncate text-left text-base font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => onSelectStaff(s)}
                        >
                          {formatFioMember(s)}
                        </button>
                      </div>
                      <p className="mt-0.5 line-clamp-1 break-words leading-snug text-muted-foreground">
                        {s.position}
                      </p>
                      <p className="mt-0.5 line-clamp-1 break-words text-sm leading-snug text-muted-foreground">
                        {unitPath}
                      </p>
                    </div>
                    <div className="ml-2 flex h-full flex-col justify-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={`h-12 w-12 rounded-full p-0 transition ${
                          hasNotebookComment
                            ? "text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-400"
                        }`}
                        aria-label={`Открыть записную книжку ${formatFioMember(s)}`}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          onOpenNotebook(s)
                        }}
                      >
                        <MessageSquare className="h-16 w-16" strokeWidth={hasNotebookComment ? 4.5 : 2.5} />
                      </Button>
                    </div>
                  </div>
                </td>
                <td className="min-w-0 border-l border-border bg-muted/20 px-2 py-2 text-center align-middle">
                  {isGradeFormed ? (
                    ASSESSMENT_GRADE_HINTS[assessmentGrade] ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={`inline-flex min-h-7 min-w-9 items-center justify-center rounded-full border text-sm font-semibold uppercase ${CRITICALITY_LEVEL_CLASSES[assessmentGrade]}`}
                          >
                            {CRITICALITY_LEVEL_LABELS[assessmentGrade]}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm bg-popover text-popover-foreground text-sm leading-relaxed">
                          <div className="space-y-2">
                            <p className="font-semibold">Результат оценки</p>
                            <p className="text-sm text-muted-foreground">Текущая рекомендации по удержанию:</p>
                            <p className="text-sm text-muted-foreground">
                              {ASSESSMENT_GRADE_HINTS[assessmentGrade]}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span
                        className={`inline-flex min-h-7 min-w-9 items-center justify-center rounded-full border text-sm font-semibold uppercase ${CRITICALITY_LEVEL_CLASSES[assessmentGrade]}`}
                      >
                        {CRITICALITY_LEVEL_LABELS[assessmentGrade]}
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
                          <p className="text-sm text-muted-foreground">
                            После выбора значений оценка пересчитывается автоматически.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </td>
                <td className="min-w-0 px-2 py-2 align-middle">
                  <Select
                    value={employeeCategory}
                    onValueChange={(next) => {
                      onEmployeeCategoryChange(s.id, next as EmployeeCategoryLevel)
                    }}
                  >
                    <SelectTrigger
                      aria-label={`Категория сотрудника ${formatFioMember(s)}`}
                      className={ASSESSMENT_SELECT_TRIGGER_CLASS}
                    >
                      <SelectValue>
                        {EMPLOYEE_CATEGORY_OPTIONS.find((o) => o.value === employeeCategory)?.label ??
                          employeeCategory}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      align="start"
                      className={ASSESSMENT_SELECT_CONTENT_CLASS}
                    >
                      {EMPLOYEE_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          textValue={option.label}
                          className="min-h-8 py-1.5 pr-8 text-sm"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="min-w-0 px-2 py-2 align-middle">
                  <Select
                    value={resignationProbability}
                    onValueChange={(next) => {
                      onResignationProbabilityChange(s.id, next as ResignationProbabilityLevel)
                    }}
                  >
                    <SelectTrigger
                      aria-label={`Вероятность увольнения ${formatFioMember(s)}`}
                      className={ASSESSMENT_SELECT_TRIGGER_CLASS}
                    >
                      <SelectValue>
                        <span className="flex w-full min-w-0 max-w-full items-center gap-1.5">
                          <span className="min-w-0 flex-1 truncate text-left">
                            {selectedResignationOption?.label ?? resignationProbability}
                          </span>
                          {selectedResignationOption?.aiBased ? (
                            <Badge variant="secondary" className="shrink-0 text-sm font-normal">
                              На основе ИИ
                            </Badge>
                          ) : null}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      align="start"
                      className={ASSESSMENT_SELECT_CONTENT_CLASS}
                    >
                      {RESIGNATION_PROBABILITY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          textValue={option.label}
                          className="min-h-8 py-1.5 pr-8 text-sm"
                        >
                          <span className="flex w-full min-w-0 items-center justify-between gap-2">
                            <span className="min-w-0 truncate">{option.label}</span>
                            {option.aiBased ? (
                              <Badge variant="secondary" className="shrink-0 text-sm font-normal">
                                На основе ИИ
                              </Badge>
                            ) : null}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                {isFullTableView ? (
                  <>
                    <td className="min-w-0 px-2 py-2 text-center align-middle">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 ${TABLE_TAG_TEXT_CLASS} ${SURVEY_CATEGORY_CLASSES[currentSurveyResultCategory]}`}
                      >
                        {SURVEY_CATEGORY_LABELS[currentSurveyResultCategory]}
                      </span>
                    </td>
                    <td className="min-w-0 px-2 py-2 text-center align-middle">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 ${TABLE_TAG_TEXT_CLASS} ${SURVEY_CATEGORY_CLASSES[currentSurveyInteractionCategory]}`}
                      >
                        {SURVEY_CATEGORY_LABELS[currentSurveyInteractionCategory]}
                      </span>
                    </td>
                    <td className="min-w-0 px-2 py-2 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 ${TABLE_TAG_TEXT_CLASS} ${FKR_TABLE_TAG_CLASS}`}
                      >
                        {FKR_STATUS_LABELS[currentFkrStatus]}
                      </span>
                    </td>
                    <td className="min-w-0 px-2 py-2 align-middle">
                      <SalaryMarketLevelTableTag level={currentSalaryMarketLevel} />
                    </td>
                    <td className="min-w-0 px-2 py-2 text-center align-middle text-muted-foreground">
                      {(s.overtimeHoursLastMonth ?? 0) > 0 && typeof s.overtimeHoursLastMonth === "number" ? (
                        <span
                          className={`inline-flex rounded-full bg-emerald-100 px-2 py-0.5 ${TABLE_TAG_TEXT_CLASS} text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200`}
                        >
                          ДА
                        </span>
                      ) : (
                        <span
                          className={`inline-flex rounded-full bg-muted px-2 py-0.5 ${TABLE_TAG_TEXT_CLASS} text-muted-foreground`}
                        >
                          НЕТ
                        </span>
                      )}
                    </td>
                    <td className="min-w-0 px-2 py-2 text-center align-middle text-muted-foreground">
                      {s.rhythmAssessmentResult === undefined ? (
                        "—"
                      ) : s.rhythmAssessmentResult >= 4 ? (
                        <span
                          className={`inline-flex rounded-full bg-emerald-100 px-2 py-0.5 ${TABLE_TAG_TEXT_CLASS} text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200`}
                        >
                          ДА
                        </span>
                      ) : (
                        <span
                          className={`inline-flex rounded-full bg-muted px-2 py-0.5 ${TABLE_TAG_TEXT_CLASS} text-muted-foreground`}
                        >
                          НЕТ
                        </span>
                      )}
                    </td>
                    <td className="min-w-0 px-2 py-2 text-center align-middle text-muted-foreground">
                      {s.externalAssessmentResult === undefined ? (
                        "—"
                      ) : s.externalAssessmentResult >= 4 ? (
                        <span
                          className={`inline-flex rounded-full bg-emerald-100 px-2 py-0.5 ${TABLE_TAG_TEXT_CLASS} text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200`}
                        >
                          ДА
                        </span>
                      ) : (
                        <span
                          className={`inline-flex rounded-full bg-muted px-2 py-0.5 ${TABLE_TAG_TEXT_CLASS} text-muted-foreground`}
                        >
                          НЕТ
                        </span>
                      )}
                    </td>
                  </>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
      {totalStaffItems > 0 ? (
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>Всего: {totalStaffItems}</span>
            <label className="flex items-center gap-1.5">
              <span>Строк:</span>
              <select
                className="h-7 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                value={staffPageSize}
                onChange={(event) => {
                  onStaffPageSizeChange(Number(event.target.value))
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
              onClick={onStaffPagePrev}
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
              onClick={onStaffPageNext}
              disabled={safeStaffPage >= staffPages}
            >
              Вперёд
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
