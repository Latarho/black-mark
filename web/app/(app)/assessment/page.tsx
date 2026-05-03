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
  MessageSquare,
  SlidersHorizontalIcon,
  XIcon,
  Users,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
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
  FULL_TABLE_COL_WIDTHS_PCT,
  OVERTIME_FILTER_OPTIONS,
  RESIGNATION_PROBABILITY_OPTIONS,
  RHYTHM_FILTER_OPTIONS,
  SALARY_MARKET_LEVEL_CLASSES,
  SALARY_MARKET_LEVEL_LABELS,
  SALARY_MARKET_LEVEL_OPTIONS,
  SALARY_MARKET_TABLE_TAG_MAX_CH,
  SHORT_TABLE_COL_WIDTHS_PCT,
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

function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <DetailCardSection title={title} variant="compact">
      {children}
    </DetailCardSection>
  )
}

function DetailItem({
  label,
  value,
  insight,
}: {
  label: string
  value: ReactNode
  insight?: ReactNode
}) {
  return (
    <DetailCardField
      label={label}
      value={value}
      insight={insight}
      labelClassName="text-xs"
    />
  )
}

function StructuredTooltipContent({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <TooltipContent className="max-w-sm bg-popover p-3 text-popover-foreground text-sm leading-relaxed">
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {children ? <div className="space-y-1 text-sm text-muted-foreground">{children}</div> : null}
      </div>
    </TooltipContent>
  )
}

function DetailTag({
  children,
  className,
}: {
  children: ReactNode
  className: string
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${TABLE_TAG_TEXT_CLASS} ${className}`}>
      {children}
    </span>
  )
}

function CriticalityTag({ level }: { level: AssessmentGradeLevel }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-2 py-1 ${TABLE_TAG_TEXT_CLASS} ${CRITICALITY_LEVEL_CLASSES[level]}`}
    >
      {CRITICALITY_LEVEL_LABELS[level]}
    </span>
  )
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
      <Tabs defaultValue="mine" className="flex w-full flex-1 flex-col gap-4">
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
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
              <span className="text-sm font-medium text-muted-foreground">Результат оценки:</span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-2.5 py-1 text-sm text-foreground">
                <Users size={14} className="text-foreground/80" />
                <span className="text-muted-foreground">Сотрудников:</span>
                <span className="inline-flex min-w-6 justify-center rounded-full border border-border bg-background px-2 py-0.5 font-semibold uppercase">
                  {filteredStaffForGradeSummary.length}
                </span>
              </span>
              {(["A", "B", "C", "D", "E"] as const).map((grade) => (
                <Tooltip key={grade}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleAssessmentBadgeFilter(grade)}
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
                        <span className="text-xs font-medium text-muted-foreground">
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
                    onClick={handleNotFormedCriticalityFilter}
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
                      <span className="text-xs font-medium text-muted-foreground">
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
            <div className="min-h-0 flex-1 overflow-auto">
              <table
                className={`w-full table-fixed border-collapse text-left text-sm ${
                  isFullTableView ? "min-w-[1460px]" : "min-w-[980px]"
                }`}
              >
                <colgroup>
                  {(isFullTableView
                    ? [...FULL_TABLE_COL_WIDTHS_PCT]
                    : [...SHORT_TABLE_COL_WIDTHS_PCT]
                  ).map((pct, i) => (
                    <col key={i} style={{ width: `${pct}%` }} />
                  ))}
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
                      salaryMarketLevelOverrides[s.id] ??
                      s.salaryMarketLevel ??
                      "not-selected"
                    const currentFkrStatus = s.fkrStatus ?? "not-included"
                    const currentSurveyResultCategory = s.surveyResultCategory ?? "middle"
                    const currentSurveyInteractionCategory = s.surveyInteractionCategory ?? "middle"
                    const employeeCategory =
                      employeeCategoryOverrides[s.id] ??
                      getEmployeeCategory(s, currentSalaryMarketLevel)
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
                                  onClick={() => setSelectedStaffMember(s)}
                                >
                                  {formatFioMember(s)}
                                </button>
                              </div>
                              <p className="mt-0.5 line-clamp-1 break-words leading-snug text-muted-foreground">
                                {s.position}
                              </p>
                              <p className="mt-0.5 line-clamp-1 break-words text-xs leading-snug text-muted-foreground">
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
                                  openStaffNotebook(s)
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
                                  <p className="text-sm text-muted-foreground">{ASSESSMENT_GRADE_HINTS[assessmentGrade]}</p>
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
                                  <p className="text-sm text-muted-foreground">Для формирования результата оценки заполните:</p>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {missingFields.map((item) => (
                                      <li
                                        key={item}
                                        className="inline-flex w-full items-start gap-2"
                                      >
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
                              setEmployeeCategoryOverrides((prev) => ({
                                ...prev,
                                [s.id]: next as EmployeeCategoryLevel,
                              }))
                            }}
                          >
                            <SelectTrigger
                              aria-label={`Категория сотрудника ${formatFioMember(s)}`}
                              className={ASSESSMENT_SELECT_TRIGGER_CLASS}
                            >
                              <SelectValue>
                                {EMPLOYEE_CATEGORY_OPTIONS.find(
                                  (o) => o.value === employeeCategory
                                )?.label ?? employeeCategory}
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
                              setResignationProbabilityOverrides((prev) => ({
                                ...prev,
                                [s.id]: next as ResignationProbabilityLevel,
                              }))
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
                                    <Badge
                                      variant="secondary"
                                      className="shrink-0 text-sm font-normal"
                                    >
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
                                    <span className="min-w-0 truncate">
                                      {option.label}
                                    </span>
                                    {option.aiBased ? (
                                      <Badge
                                        variant="secondary"
                                        className="shrink-0 text-sm font-normal"
                                      >
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
                              {(s.overtimeHoursLastMonth ?? 0) > 0 &&
                              typeof s.overtimeHoursLastMonth === "number" ? (
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
            </div>
            <Dialog
              open={selectedStaffMember !== null}
              onOpenChange={(open) => {
                if (!open) setSelectedStaffMember(null)
              }}
            >
              <DialogContent maxWidth="wide" className="max-h-[90vh] gap-0 overflow-hidden p-0">
                {selectedStaffMember ? (
                  <>
                    <DialogTitle className="sr-only">
                      {formatFioMember(selectedStaffMember)}
                    </DialogTitle>
                    <div className="max-h-[90vh] overflow-y-auto px-6 py-5">
                      <div className="flex flex-col gap-5">
                        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                          <div className="rounded-xl border border-border bg-card px-4 py-5 shadow-sm">
                            <div className="flex min-h-[200px] min-w-0 items-center gap-4">
                              <div className="flex w-36 shrink-0 items-center justify-center">
                                <StaffMemberAvatar
                                  member={selectedStaffMember}
                                  className="size-32 text-3xl"
                                  initials="assessment"
                                  fallbackTone="primary"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-lg font-semibold text-foreground">
                                  {formatFioMember(selectedStaffMember)}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {selectedStaffMember.position}
                                </p>
                                <div className="mt-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted/35">
                                  <p className="text-xs text-muted-foreground">Подразделение</p>
                                  <p className="mt-1 text-sm leading-snug text-foreground">
                                    {selectedStaffUnitPath || "Подразделение не указано"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex min-h-[200px] w-full max-w-sm items-center">
                            <Carousel
                              className="w-full px-7"
                              opts={{ align: "center", loop: false }}
                            >
                              <CarouselContent>
                                <CarouselItem>
                                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                      Результат оценки
                                    </p>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-primary">
                                      Текущий · 2026
                                    </p>
                                    <span
                                      className={cn(
                                        "text-[clamp(3.5rem,10vw+2.5rem,6.5rem)] font-black leading-none tracking-tight",
                                        CRITICALITY_LETTER_TEXT_CLASSES[selectedStaffCriticality]
                                      )}
                                      role="img"
                                      aria-label={`Результат оценки: ${CRITICALITY_LEVEL_LABELS[selectedStaffCriticality]}`}
                                    >
                                      {CRITICALITY_LEVEL_LABELS[selectedStaffCriticality]}
                                    </span>
                                  </div>
                                </CarouselItem>
                                <CarouselItem>
                                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                      Результат оценки
                                    </p>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                      2025
                                    </p>
                                    <span
                                      className={cn(
                                        "text-[clamp(3.5rem,10vw+2.5rem,6.5rem)] font-black leading-none tracking-tight",
                                        CRITICALITY_LETTER_TEXT_CLASSES[selectedStaffCriticality]
                                      )}
                                      role="img"
                                      aria-label={`Результат оценки за 2025 год: ${CRITICALITY_LEVEL_LABELS[selectedStaffCriticality]}`}
                                    >
                                      {CRITICALITY_LEVEL_LABELS[selectedStaffCriticality]}
                                    </span>
                                  </div>
                                </CarouselItem>
                              </CarouselContent>
                              <CarouselPrevious
                                className="left-0"
                                variant="outline"
                                size="icon-sm"
                              />
                              <CarouselNext
                                className="right-0"
                                variant="outline"
                                size="icon-sm"
                              />
                            </Carousel>
                          </div>
                        </div>

                        <Tabs defaultValue="staff-profile" className="flex min-w-0 flex-col gap-4">
                          <TabsList className="h-auto w-full min-w-0 max-w-full flex flex-wrap justify-start gap-1 rounded-lg border border-border bg-muted/40 p-1">
                            <TabsTrigger value="staff-profile" className="shrink-0 text-xs sm:text-sm">
                              Профиль
                            </TabsTrigger>
                            <TabsTrigger value="staff-workload" className="shrink-0 text-xs sm:text-sm">
                              Нагрузка и режим
                            </TabsTrigger>
                            <TabsTrigger value="staff-surveys" className="shrink-0 text-xs sm:text-sm">
                              Опросы
                            </TabsTrigger>
                            <TabsTrigger value="staff-external" className="shrink-0 text-xs sm:text-sm">
                              Внешняя оценка
                            </TabsTrigger>
                            <TabsTrigger value="staff-rhythm" className="shrink-0 text-xs sm:text-sm">
                              Оценка РИТМ
                            </TabsTrigger>
                            <TabsTrigger value="staff-compensation" className="shrink-0 text-xs sm:text-sm">
                              Компенсация и кадровые вопросы
                            </TabsTrigger>
                            <TabsTrigger value="recommendations" className="shrink-0 text-xs sm:text-sm">
                              Рекомендации
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="staff-profile" className="mt-0 flex flex-col gap-4">
                            <DetailSection title="Профиль">
                              <dl className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                  label="Табельный номер"
                                  value={selectedStaffMember.personnelNumber}
                                  insight="Идентификатор сотрудника в кадровых системах. Помогает точно сопоставлять записи между источниками данных."
                                />
                                <DetailItem
                                  label="Логин"
                                  value={selectedStaffMember.login ?? "—"}
                                  insight="Корпоративная учётная запись. Полезна для проверки активности и связки с ИТ-данными."
                                />
                                <DetailItem
                                  label="Стаж в Банке"
                                  value={selectedStaffMember.bankTenure ?? "—"}
                                  insight="Показывает глубину опыта внутри банка. Длинный стаж помогает оценить экспертизу и возможную роль носителя знаний."
                                />
                                <DetailItem
                                  label="Стаж в Блоке, ССП"
                                  value={selectedStaffMember.blockTenure ?? "—"}
                                  insight="Отражает опыт именно в текущем бизнес-контексте. Важен для оценки адаптации и устойчивости в роли."
                                />
                                <DetailItem
                                  label="Возраст"
                                  value={selectedStaffMember.age ?? "—"}
                                  insight="Используется только как демографический контекст. Сам по себе не является оценочным выводом."
                                />
                                <DetailItem
                                  label="Дней неисп. отпуска"
                                  value={selectedStaffMember.unusedVacationDays ?? "—"}
                                  insight="Высокий остаток отпуска может быть косвенным сигналом нагрузки, риска выгорания или проблем с планированием замещения."
                                />
                              </dl>
                            </DetailSection>
                          </TabsContent>

                          <TabsContent value="staff-workload" className="mt-0 flex flex-col gap-4">
                            <DetailSection title="Нагрузка и режим">
                              <dl className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                  label="Переработки"
                                  insight="Показывает наличие признаков повышенной нагрузки. Важно сопоставлять с режимом работы, СУРВ-данными и результативностью."
                                  value={
                                    (selectedStaffMember.overtimeHoursLastMonth ?? 0) > 0 ? (
                                      <DetailTag className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                                        ДА
                                      </DetailTag>
                                    ) : (
                                      <DetailTag className="bg-muted text-muted-foreground">
                                        НЕТ
                                      </DetailTag>
                                    )
                                  }
                                />
                                <DetailItem
                                  label="Режим работы"
                                  value={selectedStaffMember.workMode ?? "—"}
                                  insight="Помогает корректно трактовать офисное время и переработки: разные режимы дают разные нормы присутствия."
                                />
                                <DetailItem
                                  label="Чистое время в офисе"
                                  value={formatMinutesToHourMinute(selectedStaffMember.overtimeOfficeMinutesLast3Months)}
                                  insight="Среднее чистое присутствие в офисе за рабочий день. Используется как один из сигналов фактической нагрузки."
                                />
                                <DetailItem
                                  label="Работа за компьютером"
                                  value={formatMinutesToHourMinute(selectedStaffMember.overtimeComputerMinutesLast3Months)}
                                  insight="Отражает цифровую активность за рабочий день. Рост показателя без результата может сигнализировать о перегрузке или неэффективности."
                                />
                                <DetailItem
                                  label="ПК + звонки"
                                  value={formatMinutesToHourMinute(selectedStaffMember.overtimeComputerAndCallsMinutesLast3Months)}
                                  insight="Суммарная активность за компьютером и в звонках. Помогает оценить коммуникационную и операционную нагрузку."
                                />
                              </dl>
                            </DetailSection>
                          </TabsContent>

                          <TabsContent value="staff-surveys" className="mt-0 flex flex-col gap-4">
                            <DetailSection title="Опросы">
                              <dl className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                  label="Опрос - результат"
                                  insight="Категория по вкладу в результат. Низкая категория требует сверки с фактическими задачами и ожиданиями роли."
                                  value={
                                    <DetailTag className={SURVEY_CATEGORY_CLASSES[selectedStaffSurveyResult]}>
                                      {SURVEY_CATEGORY_LABELS[selectedStaffSurveyResult]}
                                    </DetailTag>
                                  }
                                />
                                <DetailItem
                                  label="Опрос - команда"
                                  insight="Категория по командному взаимодействию. Помогает увидеть, как сотрудник влияет на совместную работу и климат команды."
                                  value={
                                    <DetailTag className={SURVEY_CATEGORY_CLASSES[selectedStaffSurveyTeam]}>
                                      {SURVEY_CATEGORY_LABELS[selectedStaffSurveyTeam]}
                                    </DetailTag>
                                  }
                                />
                              </dl>
                            </DetailSection>
                          </TabsContent>

                          <TabsContent value="staff-external" className="mt-0 flex flex-col gap-4">
                            <DetailSection title="Внешняя оценка">
                              <dl className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                  label="Внешняя оценка"
                                  insight="Показывает, есть ли подтверждённый положительный результат внешней оценки. Используется как независимый сигнал по сотруднику."
                                  value={
                                    selectedStaffMember.externalAssessmentResult === undefined ? (
                                      "—"
                                    ) : selectedStaffMember.externalAssessmentResult >= 4 ? (
                                      <DetailTag className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                                        ДА
                                      </DetailTag>
                                    ) : (
                                      <DetailTag className="bg-muted text-muted-foreground">
                                        НЕТ
                                      </DetailTag>
                                    )
                                  }
                                />
                                <DetailItem
                                  label="Балл внешней оценки"
                                  value={selectedStaffMember.externalAssessmentResult ?? "—"}
                                  insight="Числовой результат внешней оценки от 1 до 5. Помогает сопоставить внутренние и внешние оценочные сигналы."
                                />
                                <DetailItem
                                  label="Провайдер"
                                  value={selectedStaffMember.externalAssessmentProvider ?? "—"}
                                  insight="Организация, проводившая внешнюю оценку. Важна для понимания методологии и сопоставимости результата."
                                />
                                <DetailItem
                                  label="Период"
                                  value={selectedStaffMember.externalAssessmentYear ?? "—"}
                                  insight="Год проведения оценки. Чем старше период, тем осторожнее нужно использовать результат для текущих решений."
                                />
                                <DetailItem
                                  label="Файл с результатами"
                                  insight="Ссылка на первичный документ с результатами внешней оценки. Используется для проверки деталей и источника вывода."
                                  value={
                                    selectedStaffMember.externalAssessmentResultPdf ? (
                                      <a
                                        href={selectedStaffMember.externalAssessmentResultPdf}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary underline underline-offset-2 hover:text-primary/80"
                                      >
                                        {selectedStaffMember.externalAssessmentResultPdf.split("/").at(-1)}
                                      </a>
                                    ) : (
                                      "—"
                                    )
                                  }
                                />
                              </dl>
                            </DetailSection>
                          </TabsContent>

                          <TabsContent value="staff-rhythm" className="mt-0 flex flex-col gap-4">
                            <DetailSection title="Оценка РИТМ">
                              <dl className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                  label="Оценка РИТМ"
                                  insight="Бинарный сигнал по результатам РИТМ: ДА означает, что актуальная оценка достигает целевого уровня."
                                  value={
                                    selectedStaffMember.rhythmAssessmentResult === undefined ? (
                                      "—"
                                    ) : selectedStaffMember.rhythmAssessmentResult >= 4 ? (
                                      <DetailTag className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                                        ДА
                                      </DetailTag>
                                    ) : (
                                      <DetailTag className="bg-muted text-muted-foreground">
                                        НЕТ
                                      </DetailTag>
                                    )
                                  }
                                />
                                <DetailItem
                                  label="Балл РИТМ"
                                  value={selectedStaffMember.rhythmAssessmentResult ?? "—"}
                                  insight="Числовой результат РИТМ от 1 до 5. Значения 4-5 трактуются как положительный сигнал."
                                />
                              </dl>
                            </DetailSection>
                          </TabsContent>

                          <TabsContent value="staff-compensation" className="mt-0 flex flex-col gap-4">
                            <DetailSection title="Компенсация и кадровые вопросы">
                              <dl className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                  label="Уровень З/П относительно рынка"
                                  insight="Сравнивает компенсацию с рыночным ориентиром. Низкий уровень при сильных оценках может усиливать риск удержания."
                                  value={
                                    <DetailTag className={SALARY_MARKET_LEVEL_CLASSES[selectedStaffSalaryMarketLevel]}>
                                      {SALARY_MARKET_LEVEL_LABELS[selectedStaffSalaryMarketLevel]}
                                    </DetailTag>
                                  }
                                />
                                <DetailItem
                                  label="ФКР"
                                  insight="Показывает, входит ли сотрудник в кадровый резерв или фокусный кадровый контур. Важно для планирования развития и преемственности."
                                  value={
                                    <DetailTag className={FKR_STATUS_CLASSES[selectedStaffFkrStatus]}>
                                      {FKR_STATUS_LABELS[selectedStaffFkrStatus]}
                                    </DetailTag>
                                  }
                                />
                                <DetailItem
                                  label="Дата пересмотра должности"
                                  value={selectedStaffMember.positionReviewDate ?? "—"}
                                  insight="Дата последнего или планового пересмотра должности. Помогает видеть актуальность роли и возможные кадровые ожидания."
                                />
                                <DetailItem
                                  label="Дата пересмотра оклада"
                                  value={selectedStaffMember.salaryReviewDate ?? "—"}
                                  insight="Дата последнего или планового пересмотра оклада. Важна для оценки компенсационного риска и своевременности решений."
                                />
                              </dl>
                            </DetailSection>
                          </TabsContent>

                          <TabsContent value="recommendations" className="mt-0">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <DetailSection title="Сильные стороны">
                                <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-muted-foreground">
                                  <li>
                                    Стаж в банке и в блоке указывает на накопленный организационный капитал:
                                    сотрудник понимает внутренние процессы, стейкхолдеров и неформальные правила принятия решений.
                                  </li>
                                  <li>
                                    Результаты РИТМ и внешней оценки дают основу для калибровки по модели evidence-based HR:
                                    решения по развитию и удержанию можно опирать не только на мнение руководителя, но и на независимые сигналы.
                                  </li>
                                  <li>
                                    Статус ФКР:{" "}
                                    <DetailTag className={FKR_STATUS_CLASSES[selectedStaffFkrStatus]}>
                                      {FKR_STATUS_LABELS[selectedStaffFkrStatus]}
                                    </DetailTag>
                                    {" "}помогает определить, стоит ли рассматривать сотрудника как элемент кадровой преемственности,
                                    участника talent pool или кандидата на расширение роли.
                                  </li>
                                  <li>
                                    При категории опроса по результату{" "}
                                    <DetailTag className={SURVEY_CATEGORY_CLASSES[selectedStaffSurveyResult]}>
                                      {selectedStaffSurveyResult}
                                    </DetailTag>
                                    {" "}важно зафиксировать конкретные поведенческие примеры вклада, чтобы сильные стороны можно было масштабировать.
                                  </li>
                                </ul>
                              </DetailSection>

                              <DetailSection title="Зоны развития">
                                <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-muted-foreground">
                                  <li>
                                    Провести калибровочную беседу по двум осям: вклад в результат и командное взаимодействие.
                                    Если оценки расходятся, использовать подход “performance x behavior”, чтобы не развивать только результат в ущерб команде.
                                  </li>
                                  <li>
                                    Сверить СУРВ-показатели, переработки и режим работы с фактическим портфелем задач.
                                    В мировой практике это часть workload review: важно понять, нагрузка создаёт ценность или маскирует неэффективность процесса.
                                  </li>
                                  <li>
                                    Уточнить ожидания по роли и карьерному шагу, особенно если даты пересмотра должности или оклада приближаются.
                                    Рекомендуется оформить 2-3 измеримых результата на следующий квартал.
                                  </li>
                                  <li>
                                    Если баллы оценки ниже целевого уровня, не ограничиваться обучением: определить, что мешает результату —
                                    навыки, полномочия, приоритеты, качество постановки задач или конфликт целей.
                                  </li>
                                </ul>
                              </DetailSection>

                              <DetailSection title="Возможности">
                                <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-muted-foreground">
                                  <li>
                                    При положительных оценочных сигналах использовать stretch assignment: дать проект выше текущего уровня сложности,
                                    но с понятным спонсором, сроком и критериями успеха.
                                  </li>
                                  <li>
                                    Подготовить IDP на 3-6 месяцев: одна бизнес-цель, одна поведенческая компетенция,
                                    один измеримый артефакт результата и регулярные check-in встречи.
                                  </li>
                                  <li>
                                    Синхронизировать компенсационные решения с вкладом, рынком и кадровым статусом.
                                    Если сотрудник ниже рынка и демонстрирует сильные сигналы, это кандидат на retention action.
                                  </li>
                                  <li>
                                    Использовать сотрудника как носителя практик: наставничество, разбор кейсов, участие в онбординге
                                    или передача экспертизы могут повысить устойчивость команды.
                                  </li>
                                </ul>
                              </DetailSection>

                              <DetailSection title="Риски">
                                <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-muted-foreground">
                                  <li>
                                    Текущий результат оценки:{" "}
                                    <CriticalityTag level={selectedStaffCriticality} />
                                    . При высоком результате оценки рекомендован формат case review: руководитель, HR и при необходимости куратор функции
                                    должны согласовать единый план действий и владельца решения.
                                  </li>
                                  <li>
                                    Компенсационный риск усиливается, если уровень З/П ниже рынка при сильных оценочных сигналах.
                                    В практике total rewards это зона риска удержания и снижения вовлечённости.
                                  </li>
                                  <li>
                                    Накопленная нагрузка, переработки и неиспользованный отпуск могут указывать на риск выгорания.
                                    Нужна проверка не только часов, но и управляемости задач: срочность, автономность, ясность приоритетов.
                                  </li>
                                  <li>
                                    Если внешняя оценка, РИТМ и опросы дают разнонаправленные сигналы, нельзя принимать решение по одному показателю.
                                    Нужна калибровка данных и управленческое интервью с примерами поведения.
                                  </li>
                                </ul>
                              </DetailSection>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </>
                ) : null}
              </DialogContent>
            </Dialog>
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
                                              <p className="text-xs text-amber-800 dark:text-amber-300/90">
                                                Для попадания в 12×box: заполните категорию
                                                сотрудника и вероятность увольнения.
                                              </p>
                                            ) : null}
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-muted-foreground">
                                                Опрос: вклад в достижение результатов
                                              </p>
                                              <p className="font-medium text-foreground">
                                                {SURVEY_CATEGORY_LABELS[surveyResult]}
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-muted-foreground">
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
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Характеристика группы
                          </h3>
                          <p className="text-foreground/90">{nineBoxRoleDetail.summary}</p>
                        </section>
                        {nineBoxRoleDetail.strengths.length > 0 ? (
                          <section>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                          <p className="text-xs text-muted-foreground">
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
