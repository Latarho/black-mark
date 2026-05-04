"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ORG_ROOT,
  STAFF,
  getBreadcrumb,
  type StaffMember,
} from "@/lib/bank-org-mock"
import { getNineBoxRoleProfile } from "@/lib/assessment/nine-box-profiles"
import {
  formatFioMember,
  STAFF_TABLE_PAGE_SIZE_OPTIONS,
} from "@/lib/staff-presentation"
import { StaffAssessmentDetailModal } from "@/components/assessment/staff-assessment-detail-modal"
import { AssessmentGradeSummary } from "@/components/assessment/assessment-grade-summary"
import { TeamMatrixSheet } from "@/components/assessment/team-matrix-sheet"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import {
  CRITICALITY_FILTER_OPTIONS,
  CRITICALITY_LEVEL_LABELS,
  EMPLOYEE_CATEGORY_OPTIONS,
  EXTERNAL_FILTER_OPTIONS,
  FKR_STATUS_FILTER_OPTIONS,
  FKR_STATUS_LABELS,
  OVERTIME_FILTER_OPTIONS,
  RESIGNATION_PROBABILITY_OPTIONS,
  RHYTHM_FILTER_OPTIONS,
  SALARY_MARKET_LEVEL_LABELS,
  SALARY_MARKET_LEVEL_OPTIONS,
  SURVEY_CATEGORY_LABELS,
  SURVEY_CATEGORY_OPTIONS,
  TEAM_MATRIX_AXIS_LABELS,
  TEAM_MATRIX_OPTIONS,
  formatNotebookDateTime,
  getAssessmentGradeForMember,
  getAssessmentGrade,
  getEmployeeCategory,
  getEffectiveSalaryMarketLevel,
  getResignationProbability,
  getMatrixCellRows,
  isFullyAssessedForManagerMatrix,
  hasOvertime,
  hasRequiredAssessment,
  makeNineBoxBuckets,
  type AssessmentGradeLevel,
  type EmployeeCategoryLevel,
  type FkrStatus,
  type NineBoxCellDetail,
  type OvertimeFilter,
  type ResignationProbabilityLevel,
  type RhythmExternalFilter,
  type SalaryMarketLevel,
  type StaffNotebookEntry,
  type SurveyCategoryLevel,
  type TableViewMode,
  type TeamMatrixMode,
} from "@/lib/assessment-model"
import { collectUnitOptions, getSelectedUnitsLabel } from "@/lib/unit-options"
import { useTeamMatrixFilters } from "@/lib/assessment/use-team-matrix-filters"
import { TeamAssessmentStaffTable } from "@/components/assessment/team-assessment-staff-table"

function AssessmentTabQuerySync({
  setTab,
}: {
  setTab: (value: "mine" | "team") => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const t = searchParams.get("tab")
    if (t === "team") setTab("team")
    else if (t === "mine") setTab("mine")
  }, [searchParams, setTab])
  return null
}

export default function AssessmentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [assessmentTab, setAssessmentTab] = useState<"mine" | "team">("mine")
  const updateAssessmentTab = (nextTab: "mine" | "team") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", nextTab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    setAssessmentTab(nextTab)
  }

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])
  const [staffSearchQuery, setStaffSearchQuery] = useState("")
  const [fioFilterQuery, setFioFilterQuery] = useState("")
  const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([])
  const [positionSearchQuery, setPositionSearchQuery] = useState("")
  const [unitSearchQuery, setUnitSearchQuery] = useState("")
  const [criticalityFilters, setCriticalityFilters] = useState<AssessmentGradeLevel[]>([])
  const [showNotFormedCriticalityFilter, setShowNotFormedCriticalityFilter] = useState(false)
  const [employeeCategoryFilters, setEmployeeCategoryFilters] = useState<EmployeeCategoryLevel[]>([])
  const [resignationProbabilityFilters, setResignationProbabilityFilters] = useState<
    ResignationProbabilityLevel[]
  >([])
  const [salaryMarketFilters, setSalaryMarketFilters] = useState<SalaryMarketLevel[]>([])
  const [fkrStatusFilters, setFkrStatusFilters] = useState<FkrStatus[]>([])
  const [overtimeFilter, setOvertimeFilter] = useState<OvertimeFilter>("all")
  const [rhythmAssessmentFilter, setRhythmAssessmentFilter] = useState<RhythmExternalFilter>("all")
  const [externalAssessmentFilter, setExternalAssessmentFilter] = useState<RhythmExternalFilter>("all")
  const [surveyResultFilters, setSurveyResultFilters] = useState<SurveyCategoryLevel[]>([])
  const [surveyInteractionFilters, setSurveyInteractionFilters] = useState<SurveyCategoryLevel[]>([])
  const unitOptions = useMemo(() => collectUnitOptions(ORG_ROOT), [])
  const [staffPage, setStaffPage] = useState(1)
  const [staffPageSize, setStaffPageSize] = useState<number>(
    STAFF_TABLE_PAGE_SIZE_OPTIONS[0]
  )
  const [tableViewMode, setTableViewMode] = useState<TableViewMode>("full")
  const [teamMatrixMode, setTeamMatrixMode] = useState<TeamMatrixMode>("survey-nine-box")
  const [isTeamMatrixMenuOpen, setIsTeamMatrixMenuOpen] = useState(false)
  const [isNineBoxOpen, setIsNineBoxOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(
    null
  )
  const [nineBoxCellDetail, setNineBoxCellDetail] = useState<NineBoxCellDetail | null>(
    null
  )
  const [isNotebookOpen, setIsNotebookOpen] = useState(false)
  const [notebookStaffId, setNotebookStaffId] = useState<string | null>(null)
  const [notebookDraft, setNotebookDraft] = useState("")
  const [staffNotebookEntries, setStaffNotebookEntries] = useState<Record<string, StaffNotebookEntry[]>>(
    {}
  )
  const [salaryMarketLevelOverrides] = useState<Record<string, SalaryMarketLevel>>({})
  const [employeeCategoryOverrides, setEmployeeCategoryOverrides] = useState<
    Record<string, EmployeeCategoryLevel>
  >({})
  const [resignationProbabilityOverrides, setResignationProbabilityOverrides] = useState<
    Record<string, ResignationProbabilityLevel>
  >({})

  const staffInUnit = useMemo(() => {
    if (selectedUnitIds.length === 0) return STAFF
    const selected = new Set(selectedUnitIds)
    return STAFF.filter((member) => selected.has(member.unitId))
  }, [selectedUnitIds])

  const filteredStaff = useMemo(() => {
    const globalQuery = staffSearchQuery.trim().toLowerCase()
    const fioQuery = fioFilterQuery.trim().toLowerCase()
    const selectedPositions = new Set(selectedPositionIds)
    const selectedCriticality = new Set(criticalityFilters)
    const selectedEmployeeCategories = new Set(employeeCategoryFilters)
    const selectedResignationProbabilities = new Set(resignationProbabilityFilters)
    const selectedSalaryFilters = new Set(salaryMarketFilters)
    const selectedFkrFilters = new Set(fkrStatusFilters)
    const selectedSurveyResultFilters = new Set(surveyResultFilters)
    const selectedSurveyInteractionFilters = new Set(surveyInteractionFilters)

    return staffInUnit.filter((member) => {
      const unitPath = getBreadcrumb(ORG_ROOT, member.unitId)
        .filter((unit) => unit.id !== ORG_ROOT.id)
        .map((unit) => unit.name)
        .join(" / ")
      const fio = formatFioMember(member)
      const searchText = [
        fio,
        member.position,
        unitPath,
      ]
        .join(" ")
        .toLowerCase()

      const currentSalaryMarketLevel = getEffectiveSalaryMarketLevel(member, salaryMarketLevelOverrides)
      const currentCategory = employeeCategoryOverrides[member.id] ?? getEmployeeCategory(member, currentSalaryMarketLevel)
      const currentProbability =
        resignationProbabilityOverrides[member.id] ?? getResignationProbability(member, currentSalaryMarketLevel)
      const { isFormed: hasCriticality } = hasRequiredAssessment(currentCategory, currentProbability)
      const currentCriticality: AssessmentGradeLevel = hasCriticality
        ? getAssessmentGrade(currentCategory, currentProbability)
        : "E"
      const currentFkrStatus: FkrStatus = member.fkrStatus ?? "not-included"
      const currentSurveyResultCategory: SurveyCategoryLevel = member.surveyResultCategory ?? "middle"
      const currentSurveyInteractionCategory: SurveyCategoryLevel = member.surveyInteractionCategory ?? "middle"
      const currentOvertime: OvertimeFilter = hasOvertime(member) ? "yes" : "no"
      const currentRhythmSignal: RhythmExternalFilter =
        member.rhythmAssessmentResult === undefined
          ? "not-available"
          : member.rhythmAssessmentResult >= 4
            ? "yes"
            : "no"
      const currentExternalSignal: RhythmExternalFilter =
        member.externalAssessmentResult === undefined
          ? "not-available"
          : member.externalAssessmentResult >= 4
            ? "yes"
            : "no"

      return (
        (!globalQuery || searchText.includes(globalQuery)) &&
        (!fioQuery || fio.toLowerCase().includes(fioQuery)) &&
        (selectedPositionIds.length === 0 || selectedPositions.has(member.position)) &&
        ((selectedCriticality.size === 0 || selectedCriticality.has(currentCriticality)) ||
          (showNotFormedCriticalityFilter && !hasCriticality)) &&
        (selectedEmployeeCategories.size === 0 || selectedEmployeeCategories.has(currentCategory)) &&
        (selectedResignationProbabilities.size === 0 ||
          selectedResignationProbabilities.has(currentProbability)) &&
        (selectedSalaryFilters.size === 0 || selectedSalaryFilters.has(currentSalaryMarketLevel)) &&
        (selectedFkrFilters.size === 0 || selectedFkrFilters.has(currentFkrStatus)) &&
        (overtimeFilter === "all" || overtimeFilter === currentOvertime) &&
        (rhythmAssessmentFilter === "all" || rhythmAssessmentFilter === currentRhythmSignal) &&
        (externalAssessmentFilter === "all" || externalAssessmentFilter === currentExternalSignal) &&
        (selectedSurveyResultFilters.size === 0 || selectedSurveyResultFilters.has(currentSurveyResultCategory)) &&
        (selectedSurveyInteractionFilters.size === 0 ||
          selectedSurveyInteractionFilters.has(currentSurveyInteractionCategory))
      )
    })
  }, [
    fioFilterQuery,
    selectedPositionIds,
    staffInUnit,
    staffSearchQuery,
    showNotFormedCriticalityFilter,
    criticalityFilters,
    employeeCategoryFilters,
    resignationProbabilityFilters,
    salaryMarketFilters,
    fkrStatusFilters,
    overtimeFilter,
    rhythmAssessmentFilter,
    externalAssessmentFilter,
    surveyResultFilters,
    surveyInteractionFilters,
    salaryMarketLevelOverrides,
    employeeCategoryOverrides,
    resignationProbabilityOverrides,
  ])

  const filteredStaffForGradeSummary = useMemo(() => {
    const globalQuery = staffSearchQuery.trim().toLowerCase()
    const fioQuery = fioFilterQuery.trim().toLowerCase()
    const selectedPositions = new Set(selectedPositionIds)
    const selectedEmployeeCategories = new Set(employeeCategoryFilters)
    const selectedResignationProbabilities = new Set(resignationProbabilityFilters)

    return staffInUnit.filter((member) => {
      const unitPath = getBreadcrumb(ORG_ROOT, member.unitId)
        .filter((unit) => unit.id !== ORG_ROOT.id)
        .map((unit) => unit.name)
        .join(" / ")
      const fio = formatFioMember(member)
      const searchText = [fio, member.position, unitPath].join(" ").toLowerCase()

      const currentSalaryMarketLevel = getEffectiveSalaryMarketLevel(member, salaryMarketLevelOverrides)
      const currentCategory = employeeCategoryOverrides[member.id] ?? getEmployeeCategory(member, currentSalaryMarketLevel)
      const currentProbability =
        resignationProbabilityOverrides[member.id] ?? getResignationProbability(member, currentSalaryMarketLevel)
      const currentFkrStatus: FkrStatus = member.fkrStatus ?? "not-included"
      const currentSurveyResultCategory: SurveyCategoryLevel = member.surveyResultCategory ?? "middle"
      const currentSurveyInteractionCategory: SurveyCategoryLevel = member.surveyInteractionCategory ?? "middle"
      const currentOvertime: OvertimeFilter = hasOvertime(member) ? "yes" : "no"
      const currentRhythmSignal: RhythmExternalFilter =
        member.rhythmAssessmentResult === undefined
          ? "not-available"
          : member.rhythmAssessmentResult >= 4
            ? "yes"
            : "no"
      const currentExternalSignal: RhythmExternalFilter =
        member.externalAssessmentResult === undefined
          ? "not-available"
          : member.externalAssessmentResult >= 4
            ? "yes"
            : "no"
      const selectedSalaryFilters = new Set(salaryMarketFilters)
      const selectedFkrFilters = new Set(fkrStatusFilters)
      const selectedSurveyResultFilters = new Set(surveyResultFilters)
      const selectedSurveyInteractionFilters = new Set(surveyInteractionFilters)

      return (
        (!globalQuery || searchText.includes(globalQuery)) &&
        (!fioQuery || fio.toLowerCase().includes(fioQuery)) &&
        (selectedPositionIds.length === 0 || selectedPositions.has(member.position)) &&
        (selectedEmployeeCategories.size === 0 || selectedEmployeeCategories.has(currentCategory)) &&
        (selectedResignationProbabilities.size === 0 ||
          selectedResignationProbabilities.has(currentProbability)) &&
        (selectedSalaryFilters.size === 0 || selectedSalaryFilters.has(currentSalaryMarketLevel)) &&
        (selectedFkrFilters.size === 0 || selectedFkrFilters.has(currentFkrStatus)) &&
        (overtimeFilter === "all" || overtimeFilter === currentOvertime) &&
        (rhythmAssessmentFilter === "all" || rhythmAssessmentFilter === currentRhythmSignal) &&
        (externalAssessmentFilter === "all" || externalAssessmentFilter === currentExternalSignal) &&
        (selectedSurveyResultFilters.size === 0 || selectedSurveyResultFilters.has(currentSurveyResultCategory)) &&
        (selectedSurveyInteractionFilters.size === 0 ||
          selectedSurveyInteractionFilters.has(currentSurveyInteractionCategory))
      )
    })
  }, [
    salaryMarketFilters,
    fkrStatusFilters,
    overtimeFilter,
    rhythmAssessmentFilter,
    externalAssessmentFilter,
    surveyResultFilters,
    surveyInteractionFilters,
    staffInUnit,
    staffSearchQuery,
    fioFilterQuery,
    selectedPositionIds,
    salaryMarketLevelOverrides,
    employeeCategoryFilters,
    resignationProbabilityFilters,
    employeeCategoryOverrides,
    resignationProbabilityOverrides,
  ])

  const sortedStaff = useMemo(() => {
    return [...filteredStaff].sort((a, b) => {
      return formatFioMember(a).localeCompare(
        formatFioMember(b)
      )
    })
  }, [filteredStaff])
  const assessmentGradeDistribution = useMemo(() => {
    const result: Record<AssessmentGradeLevel | "not-formed", number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      "not-formed": 0,
    }

    filteredStaffForGradeSummary.forEach((member) => {
      const salaryLevel = getEffectiveSalaryMarketLevel(member, salaryMarketLevelOverrides)
      const category = employeeCategoryOverrides[member.id] ?? getEmployeeCategory(member, salaryLevel)
      const probability = resignationProbabilityOverrides[member.id] ?? getResignationProbability(member, salaryLevel)
      const { isFormed } = hasRequiredAssessment(category, probability)
      const grade = isFormed ? getAssessmentGrade(category, probability) : "not-formed"

      result[grade] += 1
    })

    return result
  }, [
    filteredStaffForGradeSummary,
    salaryMarketLevelOverrides,
    employeeCategoryOverrides,
    resignationProbabilityOverrides,
  ])
  const totalStaffItems = filteredStaff.length
  const staffPages = Math.max(1, Math.ceil(totalStaffItems / staffPageSize))
  const safeStaffPage = Math.min(staffPage, staffPages)
  const pagedStaff = useMemo(() => {
    const start = (safeStaffPage - 1) * staffPageSize
    return sortedStaff.slice(start, start + staffPageSize)
  }, [safeStaffPage, sortedStaff, staffPageSize])
  const currentUnitLabel = getSelectedUnitsLabel(selectedUnitIds, unitOptions)
  const activeFiltersCount =
    selectedUnitIds.length +
    (fioFilterQuery.trim() ? 1 : 0) +
    selectedPositionIds.length +
    criticalityFilters.length +
    (showNotFormedCriticalityFilter ? 1 : 0) +
    employeeCategoryFilters.length +
    resignationProbabilityFilters.length +
    salaryMarketFilters.length +
    fkrStatusFilters.length +
    (overtimeFilter === "all" ? 0 : 1) +
    (rhythmAssessmentFilter === "all" ? 0 : 1) +
    (externalAssessmentFilter === "all" ? 0 : 1) +
    surveyResultFilters.length +
    surveyInteractionFilters.length
  const uniquePositionOptions = useMemo(() => {
    const values = new Set(STAFF.map((member) => member.position))
    return [...values].sort((a, b) => a.localeCompare(b))
  }, [])
  const filteredPositionOptions = useMemo(() => {
    const query = positionSearchQuery.trim().toLowerCase()
    if (!query) return uniquePositionOptions
    return uniquePositionOptions.filter((position) => position.toLowerCase().includes(query))
  }, [positionSearchQuery, uniquePositionOptions])
  const selectedUnitTags = useMemo(() => {
    const unitPathById = new Map(unitOptions.map((unit) => [unit.id, unit.path]))
    return selectedUnitIds.map((unitId) => ({
      id: unitId,
      label: unitPathById.get(unitId) || unitId,
    }))
  }, [selectedUnitIds, unitOptions])
  const selectedStaffUnitPath = selectedStaffMember
    ? getBreadcrumb(ORG_ROOT, selectedStaffMember.unitId)
      .filter((unit) => unit.id !== ORG_ROOT.id)
      .map((unit) => unit.name)
      .join(" / ")
    : ""
  const selectedStaffSalaryMarketLevel: SalaryMarketLevel = selectedStaffMember
    ? salaryMarketLevelOverrides[selectedStaffMember.id] ??
      selectedStaffMember.salaryMarketLevel ??
      "not-selected"
    : "not-selected"
  const selectedStaffFkrStatus: FkrStatus =
    selectedStaffMember?.fkrStatus ?? "not-included"
  const selectedStaffCriticality: AssessmentGradeLevel = selectedStaffMember
    ? getAssessmentGradeForMember(
        selectedStaffMember,
        salaryMarketLevelOverrides,
        employeeCategoryOverrides,
        resignationProbabilityOverrides
      )
    : "E"
  const selectedStaffSurveyResult =
    selectedStaffMember?.surveyResultCategory ?? "middle"
  const selectedStaffSurveyTeam =
    selectedStaffMember?.surveyInteractionCategory ?? "middle"
  const notebookStaffMember = notebookStaffId
    ? STAFF.find((member) => member.id === notebookStaffId)
    : null
  const notebookEntries: StaffNotebookEntry[] = notebookStaffId
    ? (staffNotebookEntries[notebookStaffId] ?? [])
    : []
  const openStaffNotebook = (member: StaffMember) => {
    setNotebookStaffId(member.id)
    setNotebookDraft("")
    setIsNotebookOpen(true)
  }
  const closeStaffNotebook = () => {
    setIsNotebookOpen(false)
    setNotebookStaffId(null)
    setNotebookDraft("")
  }
  const saveStaffNotebookEntry = () => {
    const text = notebookDraft.trim()
    if (!text || !notebookStaffId || !notebookStaffMember) return

    setStaffNotebookEntries((prev) => ({
      ...prev,
      [notebookStaffId]: [
        ...(prev[notebookStaffId] ?? []),
        {
          createdAt: formatNotebookDateTime(),
          subjectFio: formatFioMember(notebookStaffMember),
          text,
        },
      ],
    }))
    setNotebookDraft("")
  }
  const filteredUnitOptions = useMemo(() => {
    const query = unitSearchQuery.trim().toLowerCase()
    if (!query) return unitOptions
    return unitOptions.filter((unit) => unit.path.toLowerCase().includes(query))
  }, [unitOptions, unitSearchQuery])
  const teamMatrixConfig = TEAM_MATRIX_AXIS_LABELS[teamMatrixMode]
  const teamMatrixColumnCount = teamMatrixConfig.x.length
  const teamMatrixRowCount = teamMatrixConfig.y.length
  const isManagerTwelveBox = teamMatrixMode === "manager-twelve-box"
  const teamMatrixRows = useMemo(
    () => getMatrixCellRows(teamMatrixColumnCount, teamMatrixRowCount, isManagerTwelveBox),
    [teamMatrixColumnCount, teamMatrixRowCount, isManagerTwelveBox]
  )
  const nineBoxBuckets = useMemo(
    () =>
      makeNineBoxBuckets(
        filteredStaff,
        teamMatrixMode,
        salaryMarketLevelOverrides,
        employeeCategoryOverrides,
        resignationProbabilityOverrides,
      ),
    [
      filteredStaff,
      teamMatrixMode,
      salaryMarketLevelOverrides,
      employeeCategoryOverrides,
      resignationProbabilityOverrides,
    ]
  )
  const teamMatrixEmployeeStats = useMemo(() => {
    const totalInSelection = filteredStaff.length

    if (teamMatrixMode === "manager-twelve-box") {
      const evaluatedMembers: StaffMember[] = []
      const notEvaluatedMembers: StaffMember[] = []

      filteredStaff.forEach((member) => {
        const salaryLevel = getEffectiveSalaryMarketLevel(member, salaryMarketLevelOverrides)
        const isAssessedByPeriod = isFullyAssessedForManagerMatrix(
          member,
          salaryLevel,
          employeeCategoryOverrides,
          resignationProbabilityOverrides
        )

        if (isAssessedByPeriod) {
          evaluatedMembers.push(member)
        } else {
          notEvaluatedMembers.push(member)
        }
      })

      return {
        totalInMatrix: totalInSelection,
        evaluatedByBoth: evaluatedMembers.length,
        notEvaluated: notEvaluatedMembers.length,
        evaluatedMembers,
        notEvaluatedMembers,
      }
    }

    return {
      totalInMatrix: totalInSelection,
      evaluatedByBoth: totalInSelection,
      notEvaluated: 0,
      evaluatedMembers: [],
      notEvaluatedMembers: [],
    }
  }, [
    teamMatrixMode,
    filteredStaff,
    salaryMarketLevelOverrides,
    employeeCategoryOverrides,
    resignationProbabilityOverrides,
  ])
  const { teamMatrixFilterTags } = useTeamMatrixFilters({
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
  })

  const toggleSelectedUnit = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    )
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }

  const toggleSelectedPosition = (position: string) => {
    setSelectedPositionIds((prev) =>
      prev.includes(position) ? prev.filter((item) => item !== position) : [...prev, position]
    )
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }
  const toggleFilterValue = <T extends string,>(
    value: T,
    setCurrent: (value: (prev: T[]) => T[]) => void
  ) => {
    setCurrent((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item !== value)
      return [...prev, value]
    })
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }

  const resetSelectedUnits = () => {
    setSelectedUnitIds([])
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }

  const resetColumnFilters = () => {
    setFioFilterQuery("")
    setSelectedPositionIds([])
    setPositionSearchQuery("")
    setUnitSearchQuery("")
    setCriticalityFilters([])
    setShowNotFormedCriticalityFilter(false)
    setEmployeeCategoryFilters([])
    setResignationProbabilityFilters([])
    setSalaryMarketFilters([])
    setFkrStatusFilters([])
    setOvertimeFilter("all")
    setRhythmAssessmentFilter("all")
    setExternalAssessmentFilter("all")
    setSurveyResultFilters([])
    setSurveyInteractionFilters([])
    resetSelectedUnits()
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }

  const handleAssessmentBadgeFilter = (grade: AssessmentGradeLevel) => {
    setShowNotFormedCriticalityFilter(false)
    setCriticalityFilters((prev) => (prev.length === 1 && prev[0] === grade ? [] : [grade]))
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }

  const handleNotFormedCriticalityFilter = () => {
    setCriticalityFilters([])
    setShowNotFormedCriticalityFilter((prev) => !prev)
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }

  const nineBoxRoleDetail = nineBoxCellDetail
    ? getNineBoxRoleProfile(nineBoxCellDetail.roleLabel)
    : null
  const nineBoxDetailStaff = nineBoxCellDetail
    ? nineBoxBuckets[nineBoxCellDetail.bucketIndex]
    : []
  const isFullTableView = tableViewMode === "full"
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <Suspense fallback={null}>
        <AssessmentTabQuerySync
          setTab={setAssessmentTab}
        />
      </Suspense>
      <Tabs
        value={assessmentTab}
        onValueChange={(value) => updateAssessmentTab(value as "mine" | "team")}
        className="flex w-full flex-1 flex-col gap-4"
      >
        <TabsList className="group-data-horizontal/tabs:h-8 flex h-8 w-full overflow-hidden rounded-lg border border-border bg-muted p-px divide-x divide-border">
          <TabsTrigger
            value="mine"
            className="h-full rounded-none rounded-l-md border-0 px-1 py-0 text-sm leading-none shadow-none data-active:rounded-md"
          >
            Моя оценка
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="h-full rounded-none rounded-r-md border-0 px-1 py-0 text-sm leading-none shadow-none data-active:rounded-md"
          >
            Оценка команды
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="mt-0 flex flex-1 flex-col" />
        <TabsContent value="team" className="mt-0 flex min-h-0 flex-1 flex-col">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-border bg-card">
            <div className="border-b border-border px-3 py-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                  <SearchIcon
                    data-icon="inline-start"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
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
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-10"
                  onClick={() => setIsFiltersOpen(true)}
                >
                  <SlidersHorizontalIcon data-icon="inline-start" />
                  Фильтры
                  {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : null}
                </Button>
                <div className="relative">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-10"
                    onClick={() => setIsTeamMatrixMenuOpen((value) => !value)}
                  >
                    Матрица команды
                    <ChevronDown className="size-4" />
                  </Button>
                  {isTeamMatrixMenuOpen ? (
                    <div className="absolute right-0 top-full z-20 mt-1 w-80 rounded-md border border-border bg-popover p-1 shadow-lg">
                      {TEAM_MATRIX_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="w-full rounded-sm px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"
                          onClick={() => {
                            setTeamMatrixMode(option.value)
                            setIsNineBoxOpen(true)
                            setIsTeamMatrixMenuOpen(false)
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="inline-flex h-10 rounded-md border border-border bg-muted p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={tableViewMode === "short" ? "default" : "ghost"}
                    className="h-8 px-3"
                    onClick={() => setTableViewMode("short")}
                  >
                    Краткий
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={tableViewMode === "full" ? "default" : "ghost"}
                    className="h-8 px-3"
                    onClick={() => setTableViewMode("full")}
                  >
                    Полный
                  </Button>
                </div>
              </div>
            </div>
            {activeFiltersCount > 0 ? (
              <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
                <span className="text-sm font-medium text-muted-foreground">Выбрано:</span>
                {fioFilterQuery.trim() ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">ФИО: {fioFilterQuery.trim()}</span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по ФИО"
                      onClick={() => {
                        setFioFilterQuery("")
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {selectedPositionIds.length > 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      Должность: {selectedPositionIds.join(", ")}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по должности"
                      onClick={() => {
                        setSelectedPositionIds([])
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {criticalityFilters.length > 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      Результат оценки: {criticalityFilters.map((item) => CRITICALITY_LEVEL_LABELS[item]).join(", ")}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по результату оценки"
                      onClick={() => {
                        setCriticalityFilters([])
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {showNotFormedCriticalityFilter ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">Результат оценки: Не сформирован</span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по не сформированным оценкам"
                      onClick={clearNotFormedCriticalityFilter}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {employeeCategoryFilters.length > 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      Категория сотрудника:{" "}
                      {employeeCategoryFilters
                        .map(
                          (item) =>
                            EMPLOYEE_CATEGORY_OPTIONS.find((option) => option.value === item)?.label ??
                            item
                        )
                        .join(", ")}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по категории сотрудника"
                      onClick={() => {
                        setEmployeeCategoryFilters([])
                        setStaffPage(1)
                        setNineBoxCellDetail(null)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {resignationProbabilityFilters.length > 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      Вероятность увольнения:{" "}
                      {resignationProbabilityFilters
                        .map(
                          (item) =>
                            RESIGNATION_PROBABILITY_OPTIONS.find((option) => option.value === item)
                              ?.label ?? item
                        )
                        .join(", ")}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по вероятности увольнения"
                      onClick={() => {
                        setResignationProbabilityFilters([])
                        setStaffPage(1)
                        setNineBoxCellDetail(null)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {salaryMarketFilters.length > 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      З/П к рынку: {salaryMarketFilters.map((item) => SALARY_MARKET_LEVEL_LABELS[item]).join(", ")}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по уровню з/п"
                      onClick={() => {
                        setSalaryMarketFilters([])
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {fkrStatusFilters.length > 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      ФКР: {fkrStatusFilters.map((item) => FKR_STATUS_LABELS[item]).join(", ")}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по ФКР"
                      onClick={() => {
                        setFkrStatusFilters([])
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {overtimeFilter !== "all" ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      Переработки: {overtimeFilter === "yes" ? "ДА" : "НЕТ"}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по переработкам"
                      onClick={() => {
                        setOvertimeFilter("all")
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {rhythmAssessmentFilter !== "all" ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      РИТМ: {RHYTHM_FILTER_OPTIONS.find((item) => item.value === rhythmAssessmentFilter)?.label}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по РИТМ"
                      onClick={() => {
                        setRhythmAssessmentFilter("all")
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {externalAssessmentFilter !== "all" ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      Внешняя оценка: {EXTERNAL_FILTER_OPTIONS.find((item) => item.value === externalAssessmentFilter)?.label}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по внешней оценке"
                      onClick={() => {
                        setExternalAssessmentFilter("all")
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {surveyResultFilters.length > 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      Опрос: результат {surveyResultFilters.map((value) => SURVEY_CATEGORY_LABELS[value]).join(", ")}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по опросу результата"
                      onClick={() => {
                        setSurveyResultFilters([])
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {surveyInteractionFilters.length > 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
                    <span className="truncate">
                      Опрос: команда{" "}
                      {surveyInteractionFilters.map((value) => SURVEY_CATEGORY_LABELS[value]).join(", ")}
                    </span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Очистить фильтр по опросу команды"
                      onClick={() => {
                        setSurveyInteractionFilters([])
                        setStaffPage(1)
                      }}
                    >
                      x
                    </button>
                  </span>
                ) : null}
                {selectedUnitTags.map((unit) => (
                  <span
                    key={unit.id}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground"
                  >
                    <span className="truncate">Подразделение: {unit.label}</span>
                    <button
                      type="button"
                      className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label={`Убрать подразделение ${unit.label}`}
                      onClick={() => toggleSelectedUnit(unit.id)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <AssessmentGradeSummary
              filteredStaffCount={filteredStaffForGradeSummary.length}
              criticalityFilters={criticalityFilters}
              assessmentGradeDistribution={assessmentGradeDistribution}
              showNotFormedCriticalityFilter={showNotFormedCriticalityFilter}
              onGradeClick={handleAssessmentBadgeFilter}
              onNotFormedClick={handleNotFormedCriticalityFilter}
            />
            <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <DialogContent
                maxWidth="wide"
                className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0"
              >
                <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
                  <DialogTitle>Фильтры</DialogTitle>
                  <DialogDescription>
                    Фильтры собраны по колонкам таблицы оценки команды.
                  </DialogDescription>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                  <div className="flex flex-col gap-5">
                  <section className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                        Сотрудник и область выборки
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Сначала сузьте список по человеку, подразделению и роли.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground">ФИО</span>
                        <Input
                          value={fioFilterQuery}
                          onChange={(event) => {
                            setFioFilterQuery(event.target.value)
                            setStaffPage(1)
                          }}
                          placeholder="Введите ФИО или фрагмент"
                          className="h-10"
                        />
                      </label>
                      <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-muted-foreground">Подразделение</p>
                          <p className="truncate text-muted-foreground">{currentUnitLabel}</p>
                        </div>
                      </div>
                      <Input
                        value={unitSearchQuery}
                        onChange={(event) => setUnitSearchQuery(event.target.value)}
                        placeholder="Поиск подразделения"
                        className="mt-2 h-10"
                      />
                      <div className="mt-2 max-h-[11rem] min-h-0 overflow-auto rounded-md border border-border p-2">
                        <label className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted">
                          <input
                            type="checkbox"
                            checked={selectedUnitIds.length === 0}
                            onChange={resetSelectedUnits}
                            className="mt-0.5"
                          />
                          <span>Все подразделения</span>
                        </label>
                        <div className="my-1 border-t border-border" />
                        {filteredUnitOptions.map((unit) => (
                          <label
                            key={unit.id}
                            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUnitIds.includes(unit.id)}
                              onChange={() => toggleSelectedUnit(unit.id)}
                              className="mt-0.5"
                            />
                            <span className="min-w-0 leading-snug">{unit.path}</span>
                          </label>
                        ))}
                        {filteredUnitOptions.length === 0 ? (
                          <p className="px-2 py-3 text-sm text-muted-foreground">
                            Подразделения не найдены.
                          </p>
                        ) : null}
                      </div>
                    </div>
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium text-muted-foreground">Должность</p>
                            <p className="truncate text-muted-foreground">
                              {selectedPositionIds.length === 0
                                ? "Текущий фильтр: Все должности"
                                : `Текущий фильтр: ${selectedPositionIds.join(", ")}`}
                            </p>
                          </div>
                        </div>
                        <Input
                          value={positionSearchQuery}
                          onChange={(event) => setPositionSearchQuery(event.target.value)}
                          placeholder="Поиск должности"
                          className="mt-2 h-10"
                        />
                        <div className="mt-2 max-h-[11rem] min-h-0 overflow-auto rounded-md border border-border p-2">
                          <label className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted">
                            <input
                              type="checkbox"
                              checked={selectedPositionIds.length === 0}
                              onChange={() => {
                                setSelectedPositionIds([])
                                setStaffPage(1)
                                setNineBoxCellDetail(null)
                              }}
                              className="mt-0.5"
                            />
                            <span className="min-w-0 leading-snug">Все должности</span>
                          </label>
                          <div className="my-1 border-t border-border" />
                          {filteredPositionOptions.map((position) => (
                            <label
                              key={position}
                              className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPositionIds.includes(position)}
                                onChange={() => toggleSelectedPosition(position)}
                                className="mt-0.5"
                              />
                              <span className="min-w-0 leading-snug">{position}</span>
                            </label>
                          ))}
                          {filteredPositionOptions.length === 0 ? (
                            <p className="px-2 py-3 text-sm leading-snug text-muted-foreground">
                              Должности не найдены.
                            </p>
                          ) : null}
                        </div>
                      </label>
                  </div>
                  </section>
                  <section className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                        Управленческая оценка
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Фильтры по вводимым руководителем значениям и итоговой A-E оценке.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Категория сотрудника</span>
                      <div className="space-y-1 rounded-md border border-border p-2">
                        {EMPLOYEE_CATEGORY_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={employeeCategoryFilters.includes(option.value)}
                              onChange={() =>
                                toggleFilterValue(option.value, setEmployeeCategoryFilters)
                              }
                            />
                            <span className="min-w-0 leading-snug">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">
                        Вероятность увольнения
                      </span>
                      <div className="space-y-1 rounded-md border border-border p-2">
                        {RESIGNATION_PROBABILITY_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={resignationProbabilityFilters.includes(option.value)}
                              onChange={() =>
                                toggleFilterValue(option.value, setResignationProbabilityFilters)
                              }
                            />
                            <span className="flex min-w-0 items-center gap-2 leading-snug">
                              <span className="min-w-0 truncate">{option.label}</span>
                              {option.aiBased ? (
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 text-sm font-normal"
                                >
                                  На основе ИИ
                                </Badge>
                              ) : null}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Результат оценки</span>
                      <div className="space-y-1 rounded-md border border-border p-2">
                        {CRITICALITY_FILTER_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={criticalityFilters.includes(option.value)}
                              onChange={() =>
                                toggleFilterValue(
                                  option.value,
                                  setCriticalityFilters
                                )
                              }
                            />
                            <span className="min-w-0 leading-snug">{option.label}</span>
                          </label>
                        ))}
                        <div className="my-1 border-t border-border" />
                        <label className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted">
                          <input
                            type="checkbox"
                            checked={showNotFormedCriticalityFilter}
                            onChange={handleNotFormedCriticalityFilter}
                          />
                          <span className="min-w-0 leading-snug">Не сформирован</span>
                        </label>
                      </div>
                    </div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                        Кадровые и компенсационные признаки
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Сигналы по компенсации, кадровому резерву и текущей нагрузке.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">З/П к рынку</span>
                      <div className="space-y-1 rounded-md border border-border p-2">
                        {SALARY_MARKET_LEVEL_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={salaryMarketFilters.includes(option.value)}
                              onChange={() =>
                                toggleFilterValue(option.value, setSalaryMarketFilters)
                              }
                            />
                            <span className="min-w-0 leading-snug">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">ФКР</span>
                      <div className="space-y-1 rounded-md border border-border p-2">
                        {FKR_STATUS_FILTER_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={fkrStatusFilters.includes(option.value)}
                              onChange={() =>
                                toggleFilterValue(option.value, setFkrStatusFilters)
                              }
                            />
                            <span className="min-w-0 leading-snug">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Переработки</span>
                      <select
                        value={overtimeFilter}
                        onChange={(event) => {
                          setOvertimeFilter(event.target.value as OvertimeFilter)
                          setStaffPage(1)
                          setNineBoxCellDetail(null)
                        }}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {OVERTIME_FILTER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                        Оценочные сигналы
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Внутренние и внешние оценки, которые помогают интерпретировать риск.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">РИТМ</span>
                      <select
                        value={rhythmAssessmentFilter}
                        onChange={(event) => {
                          setRhythmAssessmentFilter(event.target.value as RhythmExternalFilter)
                          setStaffPage(1)
                          setNineBoxCellDetail(null)
                        }}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {RHYTHM_FILTER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Внешняя оценка</span>
                      <select
                        value={externalAssessmentFilter}
                        onChange={(event) => {
                          setExternalAssessmentFilter(event.target.value as RhythmExternalFilter)
                          setStaffPage(1)
                          setNineBoxCellDetail(null)
                        }}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {EXTERNAL_FILTER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                        Опросы
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Категории по вкладу в результат и командному взаимодействию.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Опрос - результат</span>
                      <div className="space-y-1 rounded-md border border-border p-2">
                        {SURVEY_CATEGORY_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={surveyResultFilters.includes(option.value)}
                              onChange={() =>
                                toggleFilterValue(option.value, setSurveyResultFilters)
                              }
                            />
                            <span className="min-w-0 leading-snug">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Опрос - команда</span>
                      <div className="space-y-1 rounded-md border border-border p-2">
                        {SURVEY_CATEGORY_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={surveyInteractionFilters.includes(option.value)}
                              onChange={() =>
                                toggleFilterValue(option.value, setSurveyInteractionFilters)
                              }
                            />
                            <span className="min-w-0 leading-snug">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    </div>
                  </section>
                  </div>
                </div>
                <div className="flex shrink-0 justify-end border-t border-border px-6 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={resetColumnFilters}
                  >
                    Сбросить все
                  </Button>
                  <Button type="button" onClick={() => setIsFiltersOpen(false)}>
                    Применить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <TeamAssessmentStaffTable
              pagedStaff={pagedStaff}
              isFullTableView={isFullTableView}
              salaryMarketLevelOverrides={salaryMarketLevelOverrides}
              employeeCategoryOverrides={employeeCategoryOverrides}
              resignationProbabilityOverrides={resignationProbabilityOverrides}
              staffNotebookEntries={staffNotebookEntries}
              onEmployeeCategoryChange={(staffId, value) => {
                setEmployeeCategoryOverrides((prev) => ({ ...prev, [staffId]: value }))
              }}
              onResignationProbabilityChange={(staffId, value) => {
                setResignationProbabilityOverrides((prev) => ({ ...prev, [staffId]: value }))
              }}
              onSelectStaff={setSelectedStaffMember}
              onOpenNotebook={openStaffNotebook}
              totalStaffItems={totalStaffItems}
              staffPages={staffPages}
              safeStaffPage={safeStaffPage}
              staffPageSize={staffPageSize}
              onStaffPageSizeChange={(size) => {
                setStaffPageSize(size)
                setStaffPage(1)
              }}
              onStaffPagePrev={() => setStaffPage((p) => Math.max(1, p - 1))}
              onStaffPageNext={() => setStaffPage((p) => Math.min(staffPages, p + 1))}
            />
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
            <TeamMatrixSheet
              open={isNineBoxOpen}
              onOpenChange={(open) => {
                setIsNineBoxOpen(open)
                if (!open) setNineBoxCellDetail(null)
              }}
              teamMatrixMode={teamMatrixMode}
              teamMatrixConfig={teamMatrixConfig}
              teamMatrixFilterTags={teamMatrixFilterTags}
              teamMatrixEmployeeStats={teamMatrixEmployeeStats}
              teamMatrixRows={teamMatrixRows}
              teamMatrixColumnCount={teamMatrixColumnCount}
              teamMatrixRowCount={teamMatrixRowCount}
              isManagerTwelveBox={isManagerTwelveBox}
              nineBoxBuckets={nineBoxBuckets}
              salaryMarketLevelOverrides={salaryMarketLevelOverrides}
              employeeCategoryOverrides={employeeCategoryOverrides}
              resignationProbabilityOverrides={resignationProbabilityOverrides}
              onSelectStaff={setSelectedStaffMember}
            />
            <Dialog
              open={nineBoxCellDetail !== null}
              onOpenChange={(open) => {
                if (!open) setNineBoxCellDetail(null)
              }}
            >
              <DialogContent className="gap-7">
                {nineBoxCellDetail ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>{nineBoxCellDetail.roleLabel}</DialogTitle>
                      <DialogDescription asChild>
                        <p>
                          Подразделение: {currentUnitLabel}. {teamMatrixConfig.yLabel}:{" "}
                          <span className="text-foreground">
                            {nineBoxCellDetail.perfLabel}
                          </span>
                          . {teamMatrixConfig.xLabel}:{" "}
                          <span className="text-foreground">
                            {nineBoxCellDetail.potLabel}
                          </span>
                          .
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                    {nineBoxRoleDetail ? (
                      <div className="space-y-6 text-sm">
                        <section>
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Характеристика группы
                          </h3>
                          <p className="text-foreground/90">{nineBoxRoleDetail.summary}</p>
                        </section>
                        {nineBoxRoleDetail.strengths.length > 0 ? (
                          <section>
                            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              Сильные стороны
                            </h3>
                            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                              {nineBoxRoleDetail.strengths.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                        ) : null}
                        {nineBoxRoleDetail.risks.length > 0 ? (
                          <section>
                            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              Риски и зоны внимания
                            </h3>
                            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                              {nineBoxRoleDetail.risks.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                        ) : null}
                        {nineBoxRoleDetail.development.length > 0 ? (
                          <section>
                            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              Развитие и действия руководителя
                            </h3>
                            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                              {nineBoxRoleDetail.development.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                        ) : null}
                        {nineBoxRoleDetail.nextSteps.length > 0 ? (
                          <section>
                            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              Дальнейшие шаги и акценты
                            </h3>
                            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                              {nineBoxRoleDetail.nextSteps.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                        ) : null}
                        <section>
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Сотрудники в ячейке ({nineBoxDetailStaff.length})
                          </h3>
                          {nineBoxDetailStaff.length === 0 ? (
                            <p className="text-base text-muted-foreground">Нет сотрудников</p>
                          ) : (
                            <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-border bg-muted/30 px-3 py-2">
                              {nineBoxDetailStaff.map((member) => (
                                <li
                                  key={member.id}
                                  className="text-sm text-foreground/90"
                                >
                                  {formatFioMember(member)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </DialogContent>
            </Dialog>
            <Dialog
              open={isNotebookOpen}
              onOpenChange={(open) => {
                if (!open) {
                  closeStaffNotebook()
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {notebookStaffMember
                      ? formatFioMember(notebookStaffMember)
                      : "сотрудник"}
                  </DialogTitle>
                  <DialogDescription>
                    Здесь можно добавить заметку по сотруднику с автоматической меткой времени.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                    {notebookEntries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Записей пока нет.</p>
                    ) : (
                      notebookEntries.map((entry, index) => (
                        <div
                          key={`${entry.createdAt}-${index}`}
                          className="space-y-1 rounded-md border border-border/70 bg-muted/20 px-3 py-2"
                        >
                          <p className="text-sm text-muted-foreground">
                            {entry.subjectFio}, {entry.createdAt}
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-foreground">{entry.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <textarea
                    value={notebookDraft}
                    onChange={(event) => setNotebookDraft(event.target.value)}
                    placeholder="Введите комментарий..."
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="Поле комментария в записной книжке"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNotebookDraft("")}
                    >
                      Очистить
                    </Button>
                    <Button type="button" onClick={saveStaffNotebookEntry}>
                      Сохранить комментарий
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
