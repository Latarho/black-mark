import { Users } from "lucide-react"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { StructuredTooltipContent } from "@/components/assessment/structured-tooltip-content"
import {
  ASSESSMENT_GRADE_HINTS,
  CRITICALITY_LEVEL_CLASSES,
  type AssessmentGradeLevel,
} from "@/lib/assessment-model"

interface AssessmentGradeSummaryProps {
  filteredStaffCount: number
  criticalityFilters: AssessmentGradeLevel[]
  assessmentGradeDistribution: Record<AssessmentGradeLevel | "not-formed", number>
  showNotFormedCriticalityFilter: boolean
  onGradeClick: (grade: AssessmentGradeLevel) => void
  onNotFormedClick: () => void
}

export function AssessmentGradeSummary({
  filteredStaffCount,
  criticalityFilters,
  assessmentGradeDistribution,
  showNotFormedCriticalityFilter,
  onGradeClick,
  onNotFormedClick,
}: AssessmentGradeSummaryProps) {
  const getAssessmentSummaryPercent = (value: number) => {
    if (filteredStaffCount === 0) return 0
    return Math.round((value / filteredStaffCount) * 100)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
      <span className="text-sm font-medium text-muted-foreground">Результат оценки:</span>
      <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-2.5 py-1 text-sm text-foreground">
        <Users size={14} className="text-foreground/80" />
        <span className="text-muted-foreground">Сотрудников:</span>
        <span className="inline-flex min-w-6 justify-center rounded-full border border-border bg-background px-2 py-0.5 font-semibold uppercase">
          {filteredStaffCount}
        </span>
      </span>
      {(["A", "B", "C", "D", "E"] as const).map((grade) => (
        <Tooltip key={grade}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onGradeClick(grade)}
              className={`inline-flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1 transition-colors hover:bg-muted/30 ${
                criticalityFilters.length === 1 && criticalityFilters[0] === grade
                  ? "border-foreground/60 bg-muted/40"
                  : "border-border bg-muted/20"
              }`}
            >
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 text-sm font-semibold uppercase ${CRITICALITY_LEVEL_CLASSES[grade]}`}
              >
                {grade}
              </span>
              <span className="inline-flex h-6 min-w-12 items-center justify-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-sm font-semibold uppercase text-foreground">
                <span>{assessmentGradeDistribution[grade]}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  ({getAssessmentSummaryPercent(assessmentGradeDistribution[grade])}%)
                </span>
              </span>
            </button>
          </TooltipTrigger>
          <StructuredTooltipContent
            title="Результат оценки"
            description="Текущая рекомендации по удержанию:"
          >
            <p className="text-sm text-muted-foreground">{ASSESSMENT_GRADE_HINTS[grade]}</p>
          </StructuredTooltipContent>
        </Tooltip>
      ))}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onNotFormedClick}
            className={`inline-flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1 transition-colors hover:bg-muted/30 ${
              showNotFormedCriticalityFilter
                ? "border-foreground/60 bg-muted/40"
                : "border-border bg-muted/20"
            }`}
          >
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/60 bg-muted/40 px-2 text-sm font-semibold uppercase text-muted-foreground">
              Не сформирован
            </span>
            <span className="inline-flex h-6 min-w-12 items-center justify-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-sm font-semibold uppercase text-foreground">
              <span>{assessmentGradeDistribution["not-formed"]}</span>
              <span className="text-sm font-medium text-muted-foreground">
                ({getAssessmentSummaryPercent(assessmentGradeDistribution["not-formed"])}%)
              </span>
            </span>
          </button>
        </TooltipTrigger>
        <StructuredTooltipContent title="Результат оценки не сформирован">
          <p className="text-sm text-muted-foreground">Для формирования результата оценки заполните:</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="inline-flex w-full items-start gap-2">
              <span className="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              <span>Категория сотрудника</span>
            </li>
            <li className="inline-flex w-full items-start gap-2">
              <span className="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              <span>Вероятность увольнения</span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            После выбора значений оценка пересчитывается автоматически.
          </p>
        </StructuredTooltipContent>
      </Tooltip>
    </div>
  )
}