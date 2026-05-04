import { useCallback, useMemo } from "react"

import { getTeamMatrixFilterTags } from "@/lib/assessment/team-matrix-filter-tags"
import type {
  AssessmentGradeLevel,
  EmployeeCategoryLevel,
  FkrStatus,
  NineBoxCellDetail,
  OvertimeFilter,
  ResignationProbabilityLevel,
  RhythmExternalFilter,
  SalaryMarketLevel,
  SurveyCategoryLevel,
} from "@/lib/assessment-model"
import type { Dispatch, SetStateAction } from "react"

export type TeamMatrixFilterInput = {
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

  setSelectedUnitIds: Dispatch<SetStateAction<string[]>>
  setFioFilterQuery: Dispatch<SetStateAction<string>>
  setSelectedPositionIds: Dispatch<SetStateAction<string[]>>
  setSalaryMarketFilters: Dispatch<SetStateAction<SalaryMarketLevel[]>>
  setEmployeeCategoryFilters: Dispatch<SetStateAction<EmployeeCategoryLevel[]>>
  setResignationProbabilityFilters: Dispatch<SetStateAction<ResignationProbabilityLevel[]>>
  setFkrStatusFilters: Dispatch<SetStateAction<FkrStatus[]>>
  setOvertimeFilter: Dispatch<SetStateAction<OvertimeFilter>>
  setRhythmAssessmentFilter: Dispatch<SetStateAction<RhythmExternalFilter>>
  setExternalAssessmentFilter: Dispatch<SetStateAction<RhythmExternalFilter>>
  setSurveyResultFilters: Dispatch<SetStateAction<SurveyCategoryLevel[]>>
  setSurveyInteractionFilters: Dispatch<SetStateAction<SurveyCategoryLevel[]>>
  setCriticalityFilters: Dispatch<SetStateAction<AssessmentGradeLevel[]>>
  setShowNotFormedCriticalityFilter: Dispatch<SetStateAction<boolean>>
  setStaffPage: Dispatch<SetStateAction<number>>
  setNineBoxCellDetail: Dispatch<SetStateAction<NineBoxCellDetail | null>>
}

type TeamMatrixFilterActions = {
  teamMatrixFilterTags: ReturnType<typeof getTeamMatrixFilterTags>
}

export function useTeamMatrixFilters({
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
  setSelectedUnitIds,
  setFioFilterQuery,
  setSelectedPositionIds,
  setSalaryMarketFilters,
  setEmployeeCategoryFilters,
  setResignationProbabilityFilters,
  setFkrStatusFilters,
  setOvertimeFilter,
  setRhythmAssessmentFilter,
  setExternalAssessmentFilter,
  setSurveyResultFilters,
  setSurveyInteractionFilters,
  setCriticalityFilters,
  setShowNotFormedCriticalityFilter,
  setStaffPage,
  setNineBoxCellDetail,
}: TeamMatrixFilterInput): TeamMatrixFilterActions {
  const resetFiltersForMatrix = useCallback(() => {
    setNineBoxCellDetail(null)
    setStaffPage(1)
  }, [setNineBoxCellDetail, setStaffPage])

  const clearMatrixUnitFilter = useCallback(
    (unitId: string) => {
      setSelectedUnitIds((prev) => prev.filter((id) => id !== unitId))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setSelectedUnitIds]
  )

  const clearMatrixFioFilter = useCallback(() => {
    setFioFilterQuery("")
    resetFiltersForMatrix()
  }, [resetFiltersForMatrix, setFioFilterQuery])

  const clearMatrixPositionFilter = useCallback(
    (position: string) => {
      setSelectedPositionIds((prev) => prev.filter((item) => item !== position))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setSelectedPositionIds]
  )

  const clearMatrixSalaryFilter = useCallback(
    (value: SalaryMarketLevel) => {
      setSalaryMarketFilters((prev) => prev.filter((item) => item !== value))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setSalaryMarketFilters]
  )

  const clearMatrixEmployeeCategoryFilter = useCallback(
    (value: EmployeeCategoryLevel) => {
      setEmployeeCategoryFilters((prev) => prev.filter((item) => item !== value))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setEmployeeCategoryFilters]
  )

  const clearMatrixResignationProbabilityFilter = useCallback(
    (value: ResignationProbabilityLevel) => {
      setResignationProbabilityFilters((prev) => prev.filter((item) => item !== value))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setResignationProbabilityFilters]
  )

  const clearMatrixFkrFilter = useCallback(
    (value: FkrStatus) => {
      setFkrStatusFilters((prev) => prev.filter((item) => item !== value))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setFkrStatusFilters]
  )

  const clearMatrixOvertimeFilters = useCallback(() => {
    setOvertimeFilter("all")
    resetFiltersForMatrix()
  }, [resetFiltersForMatrix, setOvertimeFilter])

  const clearMatrixRhythmFilter = useCallback(() => {
    setRhythmAssessmentFilter("all")
    resetFiltersForMatrix()
  }, [resetFiltersForMatrix, setRhythmAssessmentFilter])

  const clearMatrixExternalFilter = useCallback(() => {
    setExternalAssessmentFilter("all")
    resetFiltersForMatrix()
  }, [resetFiltersForMatrix, setExternalAssessmentFilter])

  const clearMatrixSurveyResultFilter = useCallback(
    (value: SurveyCategoryLevel) => {
      setSurveyResultFilters((prev) => prev.filter((item) => item !== value))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setSurveyResultFilters]
  )

  const clearMatrixSurveyInteractionFilter = useCallback(
    (value: SurveyCategoryLevel) => {
      setSurveyInteractionFilters((prev) => prev.filter((item) => item !== value))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setSurveyInteractionFilters]
  )

  const clearMatrixCriticalityFilter = useCallback(
    (value: AssessmentGradeLevel) => {
      setCriticalityFilters((prev) => prev.filter((item) => item !== value))
      resetFiltersForMatrix()
    },
    [resetFiltersForMatrix, setCriticalityFilters]
  )

  const clearNotFormedCriticalityFilter = useCallback(() => {
    setShowNotFormedCriticalityFilter(false)
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }, [setNineBoxCellDetail, setShowNotFormedCriticalityFilter, setStaffPage])

  const teamMatrixFilterTags = useMemo(
    () =>
      getTeamMatrixFilterTags({
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
      }),
    [
      clearMatrixCriticalityFilter,
      clearMatrixEmployeeCategoryFilter,
      clearMatrixExternalFilter,
      clearMatrixFioFilter,
      clearMatrixFkrFilter,
      clearMatrixOvertimeFilters,
      clearMatrixPositionFilter,
      clearMatrixResignationProbabilityFilter,
      clearMatrixRhythmFilter,
      clearMatrixSalaryFilter,
      clearMatrixSurveyInteractionFilter,
      clearMatrixSurveyResultFilter,
      clearNotFormedCriticalityFilter,
      clearMatrixUnitFilter,
      criticalityFilters,
      employeeCategoryFilters,
      externalAssessmentFilter,
      fioFilterQuery,
      fkrStatusFilters,
      overtimeFilter,
      resignationProbabilityFilters,
      rhythmAssessmentFilter,
      salaryMarketFilters,
      selectedPositionIds,
      selectedUnitTags,
      surveyInteractionFilters,
      surveyResultFilters,
      showNotFormedCriticalityFilter,
    ]
  )

  return {
    teamMatrixFilterTags,
  }
}
