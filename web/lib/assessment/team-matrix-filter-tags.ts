import {
  CRITICALITY_LEVEL_LABELS,
  EMPLOYEE_CATEGORY_OPTIONS,
  EXTERNAL_FILTER_OPTIONS,
  FKR_STATUS_LABELS,
  RESIGNATION_PROBABILITY_OPTIONS,
  RHYTHM_FILTER_OPTIONS,
  SALARY_MARKET_LEVEL_LABELS,
  SURVEY_CATEGORY_LABELS,
  type AssessmentGradeLevel,
  type EmployeeCategoryLevel,
  type FkrStatus,
  type OvertimeFilter,
  type ResignationProbabilityLevel,
  type RhythmExternalFilter,
  type SalaryMarketLevel,
  type SurveyCategoryLevel,
} from "@/lib/assessment-model"

type EmployeeCategoryOption = { value: EmployeeCategoryLevel; label: string }
type ResignationProbabilityOption = { value: ResignationProbabilityLevel; label: string }
type RhythmOption = { value: RhythmExternalFilter; label: string }
type ExternalOption = { value: RhythmExternalFilter; label: string }

export type TeamMatrixFilterTag = {
  id: string
  label: string
  onClear?: () => void
}

export type TeamMatrixFilterTagInput = {
  selectedUnitTags: { id: string; label: string }[]
  selectedPositionIds: string[]
  fioFilterQuery: string
  criticalityFilters: AssessmentGradeLevel[]
  showNotFormedCriticalityFilter: boolean
  employeeCategoryFilters: EmployeeCategoryLevel[]
  resignationProbabilityFilters: ResignationProbabilityLevel[]
  salaryMarketFilters: SalaryMarketLevel[]
  fkrStatusFilters: FkrStatus[]
  overtimeFilter: OvertimeFilter
  rhythmAssessmentFilter: RhythmExternalFilter
  externalAssessmentFilter: RhythmExternalFilter
  surveyResultFilters: SurveyCategoryLevel[]
  surveyInteractionFilters: SurveyCategoryLevel[]

  clearMatrixUnitFilter: (unitId: string) => void
  clearMatrixPositionFilter: (position: string) => void
  clearMatrixFioFilter: () => void
  clearMatrixCriticalityFilter: (value: AssessmentGradeLevel) => void
  clearNotFormedCriticalityFilter: () => void
  clearMatrixEmployeeCategoryFilter: (value: EmployeeCategoryLevel) => void
  clearMatrixResignationProbabilityFilter: (value: ResignationProbabilityLevel) => void
  clearMatrixSalaryFilter: (value: SalaryMarketLevel) => void
  clearMatrixFkrFilter: (value: FkrStatus) => void
  clearMatrixOvertimeFilters: () => void
  clearMatrixRhythmFilter: () => void
  clearMatrixExternalFilter: () => void
  clearMatrixSurveyResultFilter: (value: SurveyCategoryLevel) => void
  clearMatrixSurveyInteractionFilter: (value: SurveyCategoryLevel) => void
}

export function getTeamMatrixFilterTags({
  selectedUnitTags,
  selectedPositionIds,
  fioFilterQuery,
  criticalityFilters,
  showNotFormedCriticalityFilter,
  employeeCategoryFilters,
  resignationProbabilityFilters,
  salaryMarketFilters,
  fkrStatusFilters,
  overtimeFilter,
  rhythmAssessmentFilter,
  externalAssessmentFilter,
  surveyResultFilters,
  surveyInteractionFilters,
  clearMatrixUnitFilter,
  clearMatrixPositionFilter,
  clearMatrixFioFilter,
  clearMatrixCriticalityFilter,
  clearNotFormedCriticalityFilter,
  clearMatrixEmployeeCategoryFilter,
  clearMatrixResignationProbabilityFilter,
  clearMatrixSalaryFilter,
  clearMatrixFkrFilter,
  clearMatrixOvertimeFilters,
  clearMatrixRhythmFilter,
  clearMatrixExternalFilter,
  clearMatrixSurveyResultFilter,
  clearMatrixSurveyInteractionFilter,
}: TeamMatrixFilterTagInput): TeamMatrixFilterTag[] {
  const trimmedFio = fioFilterQuery.trim()

  return [
    ...selectedUnitTags.map((unit) => ({
      id: `unit-${unit.id}`,
      label: `Подразделение: ${unit.label}`,
      onClear: () => clearMatrixUnitFilter(unit.id),
    })),
    ...selectedPositionIds.map((position) => ({
      id: `position-${position}`,
      label: `Должность: ${position}`,
      onClear: () => clearMatrixPositionFilter(position),
    })),
    ...(trimmedFio
      ? [
          {
            id: "fio",
            label: `ФИО: ${trimmedFio}`,
            onClear: clearMatrixFioFilter,
          },
        ]
      : []),
    ...criticalityFilters.map((item) => ({
      id: `criticality-${item}`,
      label: `Результат оценки: ${CRITICALITY_LEVEL_LABELS[item]}`,
      onClear: () => clearMatrixCriticalityFilter(item),
    })),
    ...(showNotFormedCriticalityFilter
      ? [
          {
            id: "criticality-not-formed",
            label: "Результат оценки: Не сформирован",
            onClear: clearNotFormedCriticalityFilter,
          },
        ]
      : []),
    ...employeeCategoryFilters.map((item) => ({
      id: `employee-category-${item}`,
      label: `Категория сотрудника: ${
        EMPLOYEE_CATEGORY_OPTIONS.find((option: EmployeeCategoryOption) => option.value === item)?.label ?? item
      }`,
      onClear: () => clearMatrixEmployeeCategoryFilter(item),
    })),
    ...resignationProbabilityFilters.map((item) => ({
      id: `resignation-probability-${item}`,
      label: `Вероятность увольнения: ${
        RESIGNATION_PROBABILITY_OPTIONS.find(
          (option: ResignationProbabilityOption) => option.value === item
        )?.label ?? item
      }`,
      onClear: () => clearMatrixResignationProbabilityFilter(item),
    })),
    ...salaryMarketFilters.map((item) => ({
      id: `salary-${item}`,
      label: `З/П к рынку: ${SALARY_MARKET_LEVEL_LABELS[item]}`,
      onClear: () => clearMatrixSalaryFilter(item),
    })),
    ...fkrStatusFilters.map((item) => ({
      id: `fkr-${item}`,
      label: `ФКР: ${FKR_STATUS_LABELS[item]}`,
      onClear: () => clearMatrixFkrFilter(item),
    })),
    ...(overtimeFilter !== "all"
      ? [
          {
            id: "overtime",
            label: `Переработки: ${overtimeFilter === "yes" ? "ДА" : "НЕТ"}`,
            onClear: clearMatrixOvertimeFilters,
          },
        ]
      : []),
    ...(rhythmAssessmentFilter !== "all"
      ? [
          {
            id: "rhythm",
            label: `РИТМ: ${
              RHYTHM_FILTER_OPTIONS.find((item: RhythmOption) => item.value === rhythmAssessmentFilter)?.label ??
                ""
            }`,
            onClear: clearMatrixRhythmFilter,
          },
        ]
      : []),
    ...(externalAssessmentFilter !== "all"
      ? [
          {
            id: "external",
            label: `Внешняя оценка: ${
              EXTERNAL_FILTER_OPTIONS.find((item: ExternalOption) => item.value === externalAssessmentFilter)?.label ??
                ""
            }`,
            onClear: clearMatrixExternalFilter,
          },
        ]
      : []),
    ...surveyResultFilters.map((item) => ({
      id: `survey-result-${item}`,
      label: `Опрос: результат ${SURVEY_CATEGORY_LABELS[item]}`,
      onClear: () => clearMatrixSurveyResultFilter(item),
    })),
    ...surveyInteractionFilters.map((item) => ({
      id: `survey-team-${item}`,
      label: `Опрос: команда ${SURVEY_CATEGORY_LABELS[item]}`,
      onClear: () => clearMatrixSurveyInteractionFilter(item),
    })),
  ]
}
