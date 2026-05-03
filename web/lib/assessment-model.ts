import type { StaffMember } from "@/lib/bank-org-mock"

export type StaffNotebookEntry = {
  createdAt: string
  subjectFio: string
  text: string
}

export function formatNotebookDateTime(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear())
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

export type OvertimeFilter = "all" | "yes" | "no"
export type RhythmExternalFilter = "all" | "yes" | "no" | "not-available"

export type SalaryMarketLevel =
  | "below-median"
  | "between-median-and-target"
  | "above-market-max"
  | "not-selected"

export type SurveyCategoryLevel = "top" | "middle" | "bottom"
export type FkrStatus = "included" | "not-included"
export type CriticalityLevel = "high" | "medium" | "low"
export type AssessmentGradeLevel = "A" | "B" | "C" | "D" | "E"
export type EmployeeCategoryLevel =
  | "key"
  | "core"
  | "second-chance"
  | "ineffective"
  | "not-evaluated"
export type ResignationProbabilityLevel = "low" | "medium" | "high" | "not-evaluated"
export type TableViewMode = "full" | "short"
export type TeamMatrixMode = "survey-nine-box" | "manager-twelve-box"

export type NineBoxCellDetail = {
  roleLabel: string
  perfLabel: string
  potLabel: string
  bucketIndex: number
}

export const SURVEY_NINE_BOX_AXIS_LABELS = {
  xLabel: "ВКЛАД В ДОСТИЖЕНИЕ РЕЗУЛЬТАТОВ",
  yLabel: "КОМАНДНОЕ ВЗАИМОДЕЙСТВИЕ",
  x: ["BOTTOM", "MIDDLE", "TOP"],
  y: ["BOTTOM", "MIDDLE", "TOP"],
}

export const MANAGER_TWELVE_BOX_AXIS_LABELS = {
  xLabel: "КАТЕГОРИЯ СОТРУДНИКА",
  yLabel: "ВЕРОЯТНОСТЬ УВОЛЬНЕНИЯ",
  x: ["НЕЭФФЕКТИВНЫЙ", "ВТОРОЙ ШАНС", "ОСНОВНОЙ СОСТАВ", "КЛЮЧЕВОЙ"],
  y: ["ВЫСОКАЯ", "СРЕДНЯЯ", "НИЗКАЯ"],
}

export const TEAM_MATRIX_AXIS_LABELS: Record<
  TeamMatrixMode,
  {
    xLabel: string
    yLabel: string
    x: string[]
    y: string[]
  }
> = {
  "survey-nine-box": SURVEY_NINE_BOX_AXIS_LABELS,
  "manager-twelve-box": MANAGER_TWELVE_BOX_AXIS_LABELS,
}

export const SURVEY_NINE_BOX_X_LEVEL_TO_INDEX: Record<SurveyCategoryLevel, number> = {
  top: 2,
  middle: 1,
  bottom: 0,
}

export const SURVEY_NINE_BOX_Y_LEVEL_TO_INDEX: Record<SurveyCategoryLevel, number> = {
  top: 0,
  middle: 1,
  bottom: 2,
}

const TEAM_MATRIX_CELL_TONE: string[] = [
  "bg-red-100 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900/70",
  "bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-950/45 dark:text-orange-200 dark:border-orange-900/60",
  "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/55",
  "bg-lime-100 text-lime-900 border-lime-200 dark:bg-lime-950/35 dark:text-lime-200 dark:border-lime-900/55",
  "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-200 dark:border-emerald-900/55",
  "bg-emerald-200 text-emerald-950 border-emerald-300 dark:bg-emerald-950/25 dark:text-emerald-100 dark:border-emerald-700/55",
]

export function getTeamMatrixCellTone(
  xIndex: number,
  yIndex: number,
  rowCount: number,
  mode: TeamMatrixMode
): string {
  const xScore = xIndex
  const yScore = mode === "manager-twelve-box" ? yIndex : rowCount - 1 - yIndex
  const toneIndex = Math.max(0, Math.min(TEAM_MATRIX_CELL_TONE.length - 1, xScore + yScore))
  return TEAM_MATRIX_CELL_TONE[toneIndex]
}

export function getMatrixCellRows(
  colCount: number,
  rowCount: number,
  isManagerTwelveBox: boolean
): number[][] {
  return Array.from({ length: rowCount }, (_, rowIndex) =>
    Array.from(
      { length: colCount },
      (_, colIndex) =>
        (isManagerTwelveBox ? rowIndex : rowCount - 1 - rowIndex) * colCount + colIndex
    )
  )
}

export const TEAM_MATRIX_OPTIONS: Array<{
  value: TeamMatrixMode
  label: string
}> = [
  {
    value: "survey-nine-box",
    label: "9-box результаты опроса",
  },
  {
    value: "manager-twelve-box",
    label: "12-box результаты оценки руководителя",
  },
]

export const SALARY_MARKET_LEVEL_OPTIONS: Array<{
  value: SalaryMarketLevel
  label: string
}> = [
  {
    value: "below-median",
    label: "Ниже медианы",
  },
  {
    value: "between-median-and-target",
    label: "Между медианой и целевым рынком",
  },
  {
    value: "above-market-max",
    label: "Выше максимума рынка",
  },
  {
    value: "not-selected",
    label: "Не выбрано",
  },
]

export const SALARY_MARKET_LEVEL_CLASSES: Record<SalaryMarketLevel, string> = {
  "below-median":
    "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200 hover:bg-red-200/80 dark:hover:bg-red-900/70",
  "between-median-and-target":
    "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 hover:bg-amber-200/80 dark:hover:bg-amber-900/70",
  "above-market-max":
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/70",
  "not-selected":
    "bg-muted text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted/80",
}

export const SALARY_MARKET_LEVEL_LABELS: Record<SalaryMarketLevel, string> = {
  "below-median": "Ниже медианы",
  "between-median-and-target": "Между медианой и целевым рынком",
  "above-market-max": "Выше максимума рынка",
  "not-selected": "Не выбрано",
}

export const FKR_STATUS_FILTER_OPTIONS: Array<{ value: FkrStatus; label: string }> = [
  { value: "included", label: "входит" },
  { value: "not-included", label: "не входит" },
]

export const CRITICALITY_FILTER_OPTIONS: Array<{
  value: AssessmentGradeLevel
  label: string
}> = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
]

export const EMPLOYEE_CATEGORY_OPTIONS: Array<{
  value: EmployeeCategoryLevel
  label: string
}> = [
  { value: "not-evaluated", label: "Не оценен" },
  { value: "key", label: "Ключевой" },
  { value: "core", label: "Основной состав" },
  { value: "second-chance", label: "Второй шанс" },
  { value: "ineffective", label: "Неэффективный" },
]

export const RESIGNATION_PROBABILITY_OPTIONS: Array<{
  value: ResignationProbabilityLevel
  label: string
  /** Тег «На основе ИИ» — не более чем у одного пункта. */
  aiBased?: boolean
}> = [
  { value: "not-evaluated", label: "Не оценен" },
  { value: "low", label: "Низкая" },
  { value: "medium", label: "Средняя", aiBased: true },
  { value: "high", label: "Высокая" },
]

export const SURVEY_CATEGORY_LABELS: Record<SurveyCategoryLevel, string> = {
  top: "TOP",
  middle: "MIDDLE",
  bottom: "BOTTOM",
}

export const SURVEY_CATEGORY_OPTIONS: Array<{
  value: SurveyCategoryLevel
  label: string
}> = [
  { value: "top", label: SURVEY_CATEGORY_LABELS.top },
  { value: "middle", label: SURVEY_CATEGORY_LABELS.middle },
  { value: "bottom", label: SURVEY_CATEGORY_LABELS.bottom },
]

export const OVERTIME_FILTER_OPTIONS: Array<{ value: OvertimeFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "yes", label: "ДА" },
  { value: "no", label: "НЕТ" },
]

export const RHYTHM_FILTER_OPTIONS: Array<{ value: RhythmExternalFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "yes", label: "ДА" },
  { value: "no", label: "НЕТ" },
  { value: "not-available", label: "Не оценено" },
]

export const EXTERNAL_FILTER_OPTIONS = RHYTHM_FILTER_OPTIONS

export const SURVEY_CATEGORY_CLASSES: Record<SurveyCategoryLevel, string> = {
  top: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/70",
  middle:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 hover:bg-amber-200/80 dark:hover:bg-amber-900/70",
  bottom:
    "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200 hover:bg-red-200/80 dark:hover:bg-red-900/70",
}

export const FKR_STATUS_CLASSES: Record<FkrStatus, string> = {
  included: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  "not-included": "bg-muted text-muted-foreground",
}

export const FKR_STATUS_LABELS: Record<FkrStatus, string> = {
  included: "входит",
  "not-included": "не входит",
}

/** Теги в столбце «ФКР» таблицы — без зелёного/серого разделения, один нейтральный вид. */
export const FKR_TABLE_TAG_CLASS = "bg-muted/80 text-foreground"

/** A–E: красный → оранжевый → светло-голубой → светло-серый → серый; одна визуальная шкала, совместимая в светлой/тёмной теме. */
export const CRITICALITY_LEVEL_CLASSES: Record<AssessmentGradeLevel, string> = {
  A: "border-red-200/90 bg-red-100 text-red-950 dark:border-red-800/55 dark:bg-red-950/55 dark:text-red-100",
  B: "border-orange-200/90 bg-orange-100 text-orange-950 dark:border-orange-800/50 dark:bg-orange-950/45 dark:text-orange-100",
  C: "border-sky-200/90 bg-sky-100 text-sky-950 dark:border-sky-800/50 dark:bg-sky-950/50 dark:text-sky-100",
  D: "border-zinc-200 bg-zinc-200 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/75 dark:text-zinc-200",
  E: "border-zinc-300 bg-zinc-300 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-400",
}

export const CRITICALITY_LEVEL_LABELS: Record<AssessmentGradeLevel, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
}

/** Тот же смысловой ряд, что и у тегов A–E, но только для крупной буквы (без фона/рамки). */
export const CRITICALITY_LETTER_TEXT_CLASSES: Record<AssessmentGradeLevel, string> = {
  A: "text-red-950 dark:text-red-100",
  B: "text-orange-950 dark:text-orange-100",
  C: "text-sky-950 dark:text-sky-100",
  D: "text-zinc-800 dark:text-zinc-200",
  E: "text-zinc-900 dark:text-zinc-400",
}

export const ASSESSMENT_GRADE_HINTS: Partial<Record<AssessmentGradeLevel, string>> = {
  A: "Удерживаем, ищем индивидуальные решения - первый приоритет для удержания",
  B: "Работаем с мотивацией, поддерживаем, развиваем. Второй приоритет для удержания",
  C: "Поддерживаем, развиваем. Третий приоритет для удержания",
  D: "Повышаем эффективность / переориентируем на новые задачи / переводим в другое ССП / Блок",
  E: "Расстаемся, ищем замену / оптимизируем",
}

/** Все теги/чипы в оценочной таблице и через DetailTag — `text-sm`, капс. */
export const TABLE_TAG_TEXT_CLASS = "text-sm font-normal uppercase"

/** Кегль значений в «Категория сотрудника» и «Вероятность увольнения». */
export const ASSESSMENT_SELECT_TEXT_CLASS = "text-sm font-normal"

/** Одинаковый вид триггера: «таблетка» и выпадающий список как у shadcn Select. */
export const ASSESSMENT_SELECT_TRIGGER_CLASS =
  "h-8 w-full min-w-0 max-w-full gap-1 rounded-full border border-input bg-background px-2 py-1 text-foreground shadow-none transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 data-[size=default]:h-8 text-sm font-normal"

export const ASSESSMENT_SELECT_CONTENT_CLASS = "text-sm max-w-[min(100vw-1rem,20rem)]"

/**
 * Вкладка «Полный»: фиксированные доли (table-layout: fixed; сумма 100%).
 * | Столбец                | Доля |
 * |------------------------|------|
 * | ФИО                    | 20%  |
 * | Результат оценки       | 8%   |
 * | Категория сотрудника   | 8%   |
 * | Вероятность увольнения | 8%   |
 * | Опрос результат        | 8%   |
 * | Опрос команда          | 8%   |
 * | ФКР                    | 8%   |
 * | З/П к рынку            | 8%   |
 * | Переработки            | 8%   |
 * | РИТМ                   | 8%   |
 * | Внешняя оценка         | 8%   |
 * |------------------------|------|
 * | Итого                  | 100% |
 */
export const FULL_TABLE_COL_WIDTHS_PCT = [
  20, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
] as const

/**
 * «Краткий»: 4 столбца (как 34+8+14+14), масштаб к 100%.
 * [49, 11, 20, 20]
 */
export const SHORT_TABLE_COL_WIDTHS_PCT = [49, 11, 20, 20] as const

/** Макс. ширина тега в столбце «З/П к рынку» — не шире подписи «Ниже медианы» (12 симв.). */
export const SALARY_MARKET_TABLE_TAG_MAX_CH = 12

const ASSESSMENT_CATEGORY_SCORE: Record<EmployeeCategoryLevel, number> = {
  ineffective: 1,
  "second-chance": 2,
  core: 3,
  key: 4,
  "not-evaluated": 0,
}

const ASSESSMENT_PROBABILITY_SCORE: Record<ResignationProbabilityLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  "not-evaluated": 0,
}

export function getAssessmentGrade(
  category: EmployeeCategoryLevel,
  probability: ResignationProbabilityLevel
): AssessmentGradeLevel {
  if (category === "not-evaluated" || probability === "not-evaluated") {
    return "E"
  }

  if (category === "second-chance") {
    return "D"
  }
  if (category === "ineffective") {
    return "E"
  }

  if (category === "core" && probability === "low") {
    return "C"
  }

  const score = ASSESSMENT_CATEGORY_SCORE[category] + ASSESSMENT_PROBABILITY_SCORE[probability]

  if (score >= 7) return "A"
  if (score >= 6) return "B"
  if (score >= 5) return "C"
  if (score >= 4) return "D"
  return "E"
}

/** Колонки 12-box: индексы ↔ категория (как в getManagerTwelveBoxCategoryIndex). */
const MANAGER_MATRIX_COL_TO_CATEGORY: readonly EmployeeCategoryLevel[] = [
  "ineffective",
  "second-chance",
  "core",
  "key",
]

/** Строки 12-box сверху вниз: высокая → средняя → низкая вероятность увольнения. */
const MANAGER_MATRIX_ROW_TO_PROBABILITY: readonly ResignationProbabilityLevel[] = [
  "high",
  "medium",
  "low",
]

export function getManagerTwelveBoxCellGrade(
  colIndex: number,
  rowIndex: number
): AssessmentGradeLevel {
  const category = MANAGER_MATRIX_COL_TO_CATEGORY[colIndex] ?? "core"
  const probability = MANAGER_MATRIX_ROW_TO_PROBABILITY[rowIndex] ?? "medium"
  return getAssessmentGrade(category, probability)
}

export function hasRequiredAssessment(
  category: EmployeeCategoryLevel,
  probability: ResignationProbabilityLevel
): {
  isFormed: boolean
  missingFields: string[]
} {
  if (category !== "not-evaluated" && probability !== "not-evaluated") {
    return { isFormed: true, missingFields: [] }
  }

  const missingFields = []
  if (category === "not-evaluated") {
    missingFields.push("Категория сотрудника")
  }
  if (probability === "not-evaluated") {
    missingFields.push("Вероятность увольнения")
  }

  return { isFormed: false, missingFields }
}

export function getAssessmentGradeForMember(
  member: StaffMember,
  salaryOverrides: Record<string, SalaryMarketLevel>,
  categoryOverrides: Record<string, EmployeeCategoryLevel>,
  probabilityOverrides: Record<string, ResignationProbabilityLevel>
): AssessmentGradeLevel {
  const salaryLevel = getEffectiveSalaryMarketLevel(member, salaryOverrides)
  const category = categoryOverrides[member.id] ?? getEmployeeCategory(member, salaryLevel)
  const probability =
    probabilityOverrides[member.id] ?? getResignationProbability(member, salaryLevel)
  return getAssessmentGrade(category, probability)
}

export function getCriticalityRank(
  member: StaffMember,
  salaryOverrides: Record<string, SalaryMarketLevel>,
  categoryOverrides: Record<string, EmployeeCategoryLevel>,
  probabilityOverrides: Record<string, ResignationProbabilityLevel>
): number {
  const grade = getAssessmentGradeForMember(
    member,
    salaryOverrides,
    categoryOverrides,
    probabilityOverrides
  )
  return (
    {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4,
    }[grade] ?? 4
  )
}

export function formatMinutesToHourMinute(totalMinutes?: number): string {
  if (!totalMinutes || totalMinutes < 0 || !Number.isFinite(totalMinutes)) return "00:00"
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function getEffectiveSalaryMarketLevel(
  member: StaffMember,
  overrides: Record<string, SalaryMarketLevel>
): SalaryMarketLevel {
  return overrides[member.id] ?? member.salaryMarketLevel ?? "not-selected"
}

export function hasOvertime(member: StaffMember): boolean {
  return (member.overtimeHoursLastMonth ?? 0) > 0
}

export function isNegativeAssessment(value?: number): boolean {
  return value !== undefined && value < 4
}

export function getRiskReasons(member: StaffMember, salaryLevel: SalaryMarketLevel): string[] {
  const reasons: string[] = []
  if (salaryLevel === "below-median") reasons.push("З/П ниже рынка")
  if (hasOvertime(member)) reasons.push("Есть переработки")
  if (member.surveyResultCategory === "bottom")
    reasons.push(`Опрос: результат ${SURVEY_CATEGORY_LABELS.bottom}`)
  if (member.surveyInteractionCategory === "bottom")
    reasons.push(`Опрос: команда ${SURVEY_CATEGORY_LABELS.bottom}`)
  if (isNegativeAssessment(member.rhythmAssessmentResult)) reasons.push("РИТМ ниже 4")
  if (isNegativeAssessment(member.externalAssessmentResult)) reasons.push("Внешняя оценка ниже 4")
  if ((member.unusedVacationDays ?? 0) >= 30) reasons.push("Много неисп. отпуска")
  if (reasons.length === 0) reasons.push("Критичных отклонений нет")
  return reasons
}

export function getRetentionRiskScore(
  member: StaffMember,
  salaryLevel: SalaryMarketLevel
): number {
  return (
    (salaryLevel === "below-median" ? 2 : 0) +
    (hasOvertime(member) ? 1 : 0) +
    (member.surveyResultCategory === "bottom" ? 1 : 0) +
    (member.surveyInteractionCategory === "bottom" ? 1 : 0) +
    (isNegativeAssessment(member.rhythmAssessmentResult) ? 1 : 0) +
    (isNegativeAssessment(member.externalAssessmentResult) ? 1 : 0) +
    ((member.unusedVacationDays ?? 0) >= 30 ? 1 : 0)
  )
}

export function getSystemRecommendation(
  member: StaffMember,
  salaryLevel: SalaryMarketLevel
): string {
  const riskScore = getRetentionRiskScore(member, salaryLevel)

  if (riskScore >= 4) return "Сформировать план корректировки"
  if (riskScore >= 3) return "Провести 1:1 и retention action"
  if (salaryLevel === "below-median") return "Проверить компенсацию"
  if (hasOvertime(member)) return "Проверить нагрузку"
  if (hasNegativeSignals(member)) return "Обсудить развитие"
  return "Наблюдать"
}

export function getEmployeeCategory(
  member: StaffMember,
  _salaryLevel: SalaryMarketLevel
): EmployeeCategoryLevel {
  void _salaryLevel
  return member.managerEmployeeCategory ?? "not-evaluated"
}

export function getResignationProbability(
  member: StaffMember,
  _salaryLevel: SalaryMarketLevel
): ResignationProbabilityLevel {
  void _salaryLevel
  return member.managerResignationProbability ?? "not-evaluated"
}

/** Категория по периоду оценки (год); при наличии `managerAssessmentByYear[year]` он приоритетнее базового поля. */
export function getEmployeeCategoryForCycleYear(
  member: StaffMember,
  salaryLevel: SalaryMarketLevel,
  cycleYear: number,
  categoryOverrides: Record<string, EmployeeCategoryLevel>
): EmployeeCategoryLevel {
  const fromYear = member.managerAssessmentByYear?.[cycleYear]?.category
  if (fromYear !== undefined) {
    return categoryOverrides[member.id] ?? fromYear
  }
  return categoryOverrides[member.id] ?? getEmployeeCategory(member, salaryLevel)
}

/** Вероятность увольнения по периоду оценки (год). */
export function getResignationProbabilityForCycleYear(
  member: StaffMember,
  salaryLevel: SalaryMarketLevel,
  cycleYear: number,
  probabilityOverrides: Record<string, ResignationProbabilityLevel>
): ResignationProbabilityLevel {
  const fromYear = member.managerAssessmentByYear?.[cycleYear]?.probability
  if (fromYear !== undefined) {
    return probabilityOverrides[member.id] ?? fromYear
  }
  return probabilityOverrides[member.id] ?? getResignationProbability(member, salaryLevel)
}

/** Результат оценки (A–E) с учётом периода оценки (год) и тех же overrides, что на странице «Оценка». */
export function getAssessmentGradeForMemberAndYear(
  member: StaffMember,
  salaryOverrides: Record<string, SalaryMarketLevel>,
  categoryOverrides: Record<string, EmployeeCategoryLevel>,
  probabilityOverrides: Record<string, ResignationProbabilityLevel>,
  cycleYear: number
): AssessmentGradeLevel {
  const salaryLevel = getEffectiveSalaryMarketLevel(member, salaryOverrides)
  const category = getEmployeeCategoryForCycleYear(member, salaryLevel, cycleYear, categoryOverrides)
  const probability = getResignationProbabilityForCycleYear(
    member,
    salaryLevel,
    cycleYear,
    probabilityOverrides
  )
  return getAssessmentGrade(category, probability)
}

const EMPLOYEE_CATEGORY_TO_INDEX: Record<EmployeeCategoryLevel, number> = {
  ineffective: 0,
  "second-chance": 1,
  core: 2,
  key: 3,
  "not-evaluated": 2,
}

const RESIGNATION_PROBABILITY_TO_INDEX: Record<ResignationProbabilityLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
  "not-evaluated": 1,
}

export function getManagerTwelveBoxCategoryIndex(
  member: StaffMember,
  salaryLevel: SalaryMarketLevel,
  overrides: Record<string, EmployeeCategoryLevel>
): number {
  return EMPLOYEE_CATEGORY_TO_INDEX[
    overrides[member.id] ?? getEmployeeCategory(member, salaryLevel)
  ]
}

export function getManagerTwelveBoxResignationIndex(
  member: StaffMember,
  salaryLevel: SalaryMarketLevel,
  overrides: Record<string, ResignationProbabilityLevel>
): number {
  return RESIGNATION_PROBABILITY_TO_INDEX[
    overrides[member.id] ?? getResignationProbability(member, salaryLevel)
  ]
}

export function isFullyAssessedForManagerMatrix(
  member: StaffMember,
  salaryLevel: SalaryMarketLevel,
  employeeCategoryOverrides: Record<string, EmployeeCategoryLevel>,
  resignationProbabilityOverrides: Record<string, ResignationProbabilityLevel>
): boolean {
  const category = employeeCategoryOverrides[member.id] ?? getEmployeeCategory(member, salaryLevel)
  const probability =
    resignationProbabilityOverrides[member.id] ?? getResignationProbability(member, salaryLevel)

  return category !== "not-evaluated" && probability !== "not-evaluated"
}

export function hasNegativeSignals(member: StaffMember): boolean {
  const surveyResult = member.surveyResultCategory ?? "middle"
  const surveyTeam = member.surveyInteractionCategory ?? "middle"
  return (
    surveyResult === "bottom" ||
    surveyTeam === "bottom" ||
    isNegativeAssessment(member.rhythmAssessmentResult) ||
    isNegativeAssessment(member.externalAssessmentResult)
  )
}

export function makeNineBoxBuckets(
  staff: StaffMember[],
  matrixMode: TeamMatrixMode,
  salaryMarketOverrides: Record<string, SalaryMarketLevel>,
  employeeCategoryOverrides: Record<string, EmployeeCategoryLevel>,
  resignationProbabilityOverrides: Record<string, ResignationProbabilityLevel>
): StaffMember[][] {
  const colCount = matrixMode === "survey-nine-box" ? 3 : 4
  const rowCount = 3
  const buckets: StaffMember[][] = Array.from({ length: colCount * rowCount }, () => [])
  staff.forEach((member) => {
    const effectiveSalaryLevel = getEffectiveSalaryMarketLevel(member, salaryMarketOverrides)

    if (matrixMode === "survey-nine-box") {
      const x = SURVEY_NINE_BOX_X_LEVEL_TO_INDEX[member.surveyResultCategory ?? "middle"]
      const y = SURVEY_NINE_BOX_Y_LEVEL_TO_INDEX[member.surveyInteractionCategory ?? "middle"]
      const bucketIndex = (rowCount - 1 - y) * colCount + x
      buckets[bucketIndex].push(member)
      return
    }

    if (
      !isFullyAssessedForManagerMatrix(
        member,
        effectiveSalaryLevel,
        employeeCategoryOverrides,
        resignationProbabilityOverrides
      )
    ) {
      return
    }

    const x = getManagerTwelveBoxCategoryIndex(
      member,
      effectiveSalaryLevel,
      employeeCategoryOverrides
    )
    const y = getManagerTwelveBoxResignationIndex(
      member,
      effectiveSalaryLevel,
      resignationProbabilityOverrides
    )
    const indexBox = y * colCount + x
    buckets[indexBox].push(member)
  })
  return buckets
}
