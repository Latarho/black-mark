"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { StaffMemberAvatar } from "@/components/staff-member-avatar"
import { StaffAssessmentDetailModal } from "@/components/assessment/staff-assessment-detail-modal"
import { AssessmentGradeSummary } from "@/components/assessment/assessment-grade-summary"
import { StructuredTooltipContent } from "@/components/assessment/structured-tooltip-content"
import { DetailCardField, DetailCardSection } from "@/components/detail-card-section"
import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
  Users,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ASSESSMENT_GRADE_HINTS,
  ASSESSMENT_SELECT_CONTENT_CLASS,
  ASSESSMENT_SELECT_TRIGGER_CLASS,
  CRITICALITY_FILTER_OPTIONS,
  CRITICALITY_LETTER_TEXT_CLASSES,
  CRITICALITY_LEVEL_CLASSES,
  CRITICALITY_LEVEL_LABELS,
  EMPLOYEE_CATEGORY_OPTIONS,
  EXTERNAL_FILTER_OPTIONS,
  FKR_STATUS_CLASSES,
  FKR_STATUS_FILTER_OPTIONS,
  FKR_STATUS_LABELS,
  FKR_TABLE_TAG_CLASS,
  OVERTIME_FILTER_OPTIONS,
  RESIGNATION_PROBABILITY_OPTIONS,
  RHYTHM_FILTER_OPTIONS,
  SALARY_MARKET_LEVEL_LABELS,
  SALARY_MARKET_LEVEL_OPTIONS,
  SURVEY_CATEGORY_CLASSES,
  SURVEY_CATEGORY_LABELS,
  SURVEY_CATEGORY_OPTIONS,
  TABLE_TAG_TEXT_CLASS,
  TEAM_MATRIX_AXIS_LABELS,
  TEAM_MATRIX_OPTIONS,
  formatMinutesToHourMinute,
  formatNotebookDateTime,
  getAssessmentGrade,
  getAssessmentGradeForMember,
  getEffectiveSalaryMarketLevel,
  getEmployeeCategory,
  getManagerTwelveBoxCellGrade,
  getMatrixCellRows,
  getResignationProbability,
  getTeamMatrixCellTone,
  hasOvertime,
  hasRequiredAssessment,
  isFullyAssessedForManagerMatrix,
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

function MiniAvatar({ member }: { member: StaffMember }) {
  return (
    <StaffMemberAvatar
      member={member}
      className="size-10 text-base"
      initials="assessment"
    />
  )
}

export default function AssessmentPage() {
  const [assessmentTab, setAssessmentTab] = useState<"mine" | "team">("mine")

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
      const currentCategory =
        employeeCategoryOverrides[member.id] ?? getEmployeeCategory(member, currentSalaryMarketLevel)
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
      const currentCategory =
        employeeCategoryOverrides[member.id] ?? getEmployeeCategory(member, currentSalaryMarketLevel)
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
  }, [
    filteredStaff,
    salaryMarketLevelOverrides,
    employeeCategoryOverrides,
    resignationProbabilityOverrides,
  ])
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
      const probability =
        resignationProbabilityOverrides[member.id] ?? getResignationProbability(member, salaryLevel)
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
  const assessmentSummaryTotal = filteredStaffForGradeSummary.length
  const getAssessmentSummaryPercent = (value: number) => {
    if (assessmentSummaryTotal === 0) return 0
    return Math.round((value / assessmentSummaryTotal) * 100)
  }
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
        resignationProbabilityOverrides
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
        const isAssessed = isFullyAssessedForManagerMatrix(
          member,
          salaryLevel,
          employeeCategoryOverrides,
          resignationProbabilityOverrides
        )

        if (isAssessed) {
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
  const resetFiltersForMatrix = () => {
    setNineBoxCellDetail(null)
    setStaffPage(1)
  }

  const clearMatrixUnitFilter = (unitId: string) => {
    setSelectedUnitIds((prev) => prev.filter((id) => id !== unitId))
    resetFiltersForMatrix()
  }

  const clearMatrixFioFilter = () => {
    setFioFilterQuery("")
    resetFiltersForMatrix()
  }

  const clearMatrixPositionFilter = (position: string) => {
    setSelectedPositionIds((prev) => prev.filter((item) => item !== position))
    resetFiltersForMatrix()
  }

  const clearMatrixSalaryFilter = (value: SalaryMarketLevel) => {
    setSalaryMarketFilters((prev) => prev.filter((item) => item !== value))
    resetFiltersForMatrix()
  }

  const clearMatrixEmployeeCategoryFilter = (value: EmployeeCategoryLevel) => {
    setEmployeeCategoryFilters((prev) => prev.filter((item) => item !== value))
    resetFiltersForMatrix()
  }

  const clearMatrixResignationProbabilityFilter = (value: ResignationProbabilityLevel) => {
    setResignationProbabilityFilters((prev) => prev.filter((item) => item !== value))
    resetFiltersForMatrix()
  }

  const clearMatrixFkrFilter = (value: FkrStatus) => {
    setFkrStatusFilters((prev) => prev.filter((item) => item !== value))
    resetFiltersForMatrix()
  }

  const clearMatrixOvertimeFilters = () => {
    setOvertimeFilter("all")
    resetFiltersForMatrix()
  }

  const clearMatrixRhythmFilter = () => {
    setRhythmAssessmentFilter("all")
    resetFiltersForMatrix()
  }

  const clearMatrixExternalFilter = () => {
    setExternalAssessmentFilter("all")
    resetFiltersForMatrix()
  }

  const clearMatrixSurveyResultFilter = (value: SurveyCategoryLevel) => {
    setSurveyResultFilters((prev) => prev.filter((item) => item !== value))
    resetFiltersForMatrix()
  }

  const clearMatrixSurveyInteractionFilter = (value: SurveyCategoryLevel) => {
    setSurveyInteractionFilters((prev) => prev.filter((item) => item !== value))
    resetFiltersForMatrix()
  }

  const teamMatrixFilterTags = useMemo(
    () => [
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
      ...(fioFilterQuery.trim()
        ? [
            {
              id: "fio",
              label: `ФИО: ${fioFilterQuery.trim()}`,
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
          EMPLOYEE_CATEGORY_OPTIONS.find((option) => option.value === item)?.label ?? item
        }`,
        onClear: () => clearMatrixEmployeeCategoryFilter(item),
      })),
      ...resignationProbabilityFilters.map((item) => ({
        id: `resignation-probability-${item}`,
        label: `Вероятность увольнения: ${
          RESIGNATION_PROBABILITY_OPTIONS.find((option) => option.value === item)?.label ?? item
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
                RHYTHM_FILTER_OPTIONS.find((item) => item.value === rhythmAssessmentFilter)?.label ?? ""
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
                EXTERNAL_FILTER_OPTIONS.find((item) => item.value === externalAssessmentFilter)?.label ?? ""
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
    ],
    [
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
    ]
  )

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

  function clearNotFormedCriticalityFilter() {
    setShowNotFormedCriticalityFilter(false)
    setStaffPage(1)
    setNineBoxCellDetail(null)
  }

  function clearMatrixCriticalityFilter(value: AssessmentGradeLevel) {
    setCriticalityFilters((prev) => prev.filter((item) => item !== value))
    resetFiltersForMatrix()
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
        <AssessmentTabQuerySync setTab={setAssessmentTab} />
      </Suspense>
      <Tabs
        value={assessmentTab}
        onValueChange={(value) => setAssessmentTab(value as "mine" | "team")}
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
              staffPage={staffPage}
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
            <Sheet
              open={isNineBoxOpen}
              onOpenChange={(open) => {
                setIsNineBoxOpen(open)
                if (!open) setNineBoxCellDetail(null)
              }}
            >
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
                    </span>
                    {" "}
                    <span className="font-medium normal-case">
                      {teamMatrixMode === "survey-nine-box"
                        ? "результаты опроса"
                        : "результаты оценки руководителя"}
                    </span>
                  </SheetTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {teamMatrixFilterTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground"
                      >
                        <span className="min-w-0 truncate">{tag.label}</span>
                        {tag.onClear ? (
                          <button
                            type="button"
                            className="cursor-pointer rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                            aria-label={`Убрать фильтр: ${tag.label}`}
                            onPointerDown={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              tag.onClear?.()
                            }}
                          >
                            x
                          </button>
                        ) : null}
                      </span>
                    ))}
                  </div>
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
                                      <div className="font-medium">
                                        {formatFioMember(member)}
                                      </div>
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
                                      <div className="font-medium">
                                        {formatFioMember(member)}
                                      </div>
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
                          <path
                            d="M12 20V4M9 7l3-3 3 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
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
                          <path
                            d="M12 4V20M9 17l3 3 3-3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="grid gap-4">
                    {teamMatrixRows.map((row, yIndex) => (
                        <div
                          key={yIndex}
                          className={`grid min-h-[176px] ${
                            teamMatrixColumnCount === 4
                              ? "grid-cols-[46px_repeat(4,minmax(0,1fr))]"
                              : "grid-cols-[46px_repeat(3,minmax(0,1fr))]"
                          } gap-3`}
                        >
                          <div className="flex items-center justify-center px-1 text-sm font-semibold text-muted-foreground">
                            {teamMatrixConfig.y[
                              isManagerTwelveBox ? yIndex : teamMatrixRowCount - 1 - yIndex
                            ]}
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
                                : getTeamMatrixCellTone(
                                    x,
                                    yIndex,
                                    teamMatrixRowCount,
                                    teamMatrixMode
                                  )
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "@container/matrix-cell relative min-h-[160px] overflow-hidden rounded-lg p-2 shadow-sm ring-1 ring-border/25 [container-type:size]",
                                  cellToneClass
                                )}
                              >
                                {cellMatrixGrade ? (
                                  <div
                                    className="pointer-events-none absolute inset-2.5 z-0 flex select-none items-center justify-center"
                                    aria-hidden
                                  >
                                    <span
                                      className="max-h-full w-full text-center font-bold leading-none text-foreground/[0.08] dark:text-foreground/[0.06]"
                                      style={{
                                        fontSize: "min(10.5rem, 85cqh)",
                                        maxHeight: "100%",
                                      }}
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
                                    const currentSalaryMarketLevel = getEffectiveSalaryMarketLevel(
                                      member,
                                      salaryMarketLevelOverrides
                                    )
                                    const category =
                                      employeeCategoryOverrides[member.id] ??
                                      getEmployeeCategory(member, currentSalaryMarketLevel)
                                    const probability =
                                      resignationProbabilityOverrides[member.id] ??
                                      getResignationProbability(member, currentSalaryMarketLevel)
                                    const needsEvaluation =
                                      category === "not-evaluated" || probability === "not-evaluated"

                                    const surveyResult =
                                      member.surveyResultCategory ?? "middle"
                                    const surveyTeam =
                                      member.surveyInteractionCategory ?? "middle"

                                    return (
                                      <HoverCard
                                        key={member.id}
                                        openDelay={150}
                                        closeDelay={100}
                                      >
                                        <HoverCardTrigger asChild>
                                          <button
                                            type="button"
                                            className="flex w-24 max-w-full flex-col items-center gap-2.5 rounded-md border-0 bg-transparent p-0 text-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                          >
                                            <span className="inline-flex">
                                              <MiniAvatar member={member} />
                                            </span>
                                            <span className="w-full text-center text-sm font-semibold leading-snug text-foreground">
                                              {member.lastName} {member.firstName}
                                            </span>
                                          </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent
                                          side="top"
                                          align="center"
                                          className="w-72 p-0 text-sm"
                                        >
                                          <div className="space-y-3 p-3">
                                            {needsEvaluation ? (
                                              <p className="text-sm text-amber-800 dark:text-amber-300/90">
                                                Для попадания в 12×box: заполните категорию
                                                сотрудника и вероятность увольнения.
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
                                              onClick={() =>
                                                setSelectedStaffMember(member)
                                              }
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
                        <div
                          key={label}
                          className="text-center text-sm font-semibold tracking-wide text-muted-foreground"
                        >
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
                          <path
                            d="M20 12H4M7 9l-3 3 3 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
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
                          <path
                            d="M4 12h16M17 9l3 3-3 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
