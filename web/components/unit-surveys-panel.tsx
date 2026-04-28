"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SURVEY_TEMPLATES,
  UNIT_SURVEY_STATUS_LABELS,
  type UnitSurveyAssignment,
  type UnitSurveyStatus,
} from "@/lib/surveys-manager-mock"
import { collectUnitIds, findUnit, ORG_ROOT, STAFF, type StaffMember } from "@/lib/bank-org-mock"
import { cn } from "@/lib/utils"
import { formatFioMember, STAFF_TABLE_PAGE_SIZE_OPTIONS } from "@/lib/staff-presentation"
import { LayoutGrid, List, Plus, Search, SlidersHorizontal, UserPlus, X } from "lucide-react"

type UnitOption = { id: string; path: string }
type SurveyViewMode = "grid" | "table"
type CreateSurveyStep = "info" | "participants"
type SurveyRequest = UnitSurveyAssignment & {
  title: string
  description: string
  participants: string[]
}

/** Как `ReportDetailSection` в персональном отчёте / карточке сотрудника. */
function SurveysSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-border bg-muted/35 px-4 py-3.5">
        <span className="h-5 w-1 shrink-0 rounded-full bg-primary/70" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function statusBadgeClass(status: UnitSurveyStatus) {
  switch (status) {
    case "draft":
      return "border-border bg-muted/60 text-muted-foreground"
    case "in_progress":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
    case "completed":
      return "border-border bg-muted text-muted-foreground"
  }
}

const SURVEY_GRID_STATUS_ORDER: UnitSurveyStatus[] = ["draft", "in_progress", "completed"]

function surveyGroupPanelClass(status: UnitSurveyStatus) {
  switch (status) {
    case "draft":
      return "border-l-4 border-l-slate-400/70 bg-slate-50/80 dark:bg-slate-950/30"
    case "in_progress":
      return "border-l-4 border-l-emerald-500/75 bg-emerald-500/8 dark:bg-emerald-950/25"
    case "completed":
      return "border-l-4 border-l-blue-500/75 bg-blue-500/8 dark:bg-blue-950/25"
  }
}

function formatNowLabel(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${dd}.${mm}.${yy} ${hh}:${mi}`
}

function createDemoAssignments(unitOptions: UnitOption[]): SurveyRequest[] {
  if (unitOptions.length === 0 || SURVEY_TEMPLATES.length === 0) return []
  const BASE_DEMO_COUNT = 15
  const EXTRA_DRAFT_DEMO_COUNT = 2
  const DEMO_COUNT = BASE_DEMO_COUNT + EXTRA_DRAFT_DEMO_COUNT
  const demoUnits = unitOptions
  const now = new Date()
  const statusCycle: UnitSurveyStatus[] = ["draft", "in_progress", "completed"]
  const titlePrefixes = [
    "Диагностический",
    "Проверочный",
    "Ориентационный",
    "Промежуточный",
    "Фокусный",
    "Квартальный",
    "Дополнительный",
    "Приоритетный",
    "Структурный",
    "Операционный",
  ]

  const formatDemoDate = (shiftDays: number) => {
    const date = new Date(now)
    date.setDate(now.getDate() + shiftDays)
    return date.toISOString().slice(0, 10)
  }

  return Array.from({ length: DEMO_COUNT }, (_, index) => {
    const unit = demoUnits[index % demoUnits.length]
    const node = findUnit(ORG_ROOT, unit.id) ?? null
    const scopeIds = new Set(node ? collectUnitIds(node) : [unit.id])
    const unitStaff = STAFF.filter((staff) => scopeIds.has(staff.unitId))
    const sourceStaff = unitStaff.length > 0 ? unitStaff : STAFF
    const participantsCount = (index % 4) + 1
    const participants = sourceStaff
      .slice(index, index + participantsCount)
      .map((staff) => staff.id)
    const template = SURVEY_TEMPLATES[index % SURVEY_TEMPLATES.length]
    const templateTitle = template.title
    const prefix = titlePrefixes[index % titlePrefixes.length]
    const isExtraDraft = index >= BASE_DEMO_COUNT
    const status = isExtraDraft ? "draft" : statusCycle[index % statusCycle.length]
    const startShift = (index % 8) * -1
    const endShift = index % 5 === 0 ? index : (index % 6) + 1

    return {
      id: `demo-survey-${unit.id}-${template.id}-${index}`,
      unitId: unit.id,
      templateId: template.id,
      status,
      startDate:
        status === "draft"
          ? "—"
          : status === "completed"
            ? formatDemoDate(startShift * 2)
            : formatDemoDate(startShift),
      endDate:
        status === "draft"
          ? "—"
          : status === "completed"
            ? formatDemoDate(endShift)
            : endShift > 14
              ? ""
              : formatDemoDate(Math.max(0, endShift)),
      createdAtLabel: (() => {
        const created = new Date(now)
        created.setHours(now.getHours() - (index % 16))
        created.setMinutes((index * 7) % 60)
        return `${formatDateLabel(created)}`
      })(),
      title: `${prefix}: ${templateTitle} №${index + 1}`,
      description: template.description,
      participants,
    }
  })
}

function formatDateLabel(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, "0")
  const mi = String(date.getMinutes()).padStart(2, "0")
  return `${dd}.${mm}.${yy} ${hh}:${mi}`
}

export function UnitSurveysPanel({ unitOptions }: { unitOptions: UnitOption[] }) {
  const scopeUnitId = useMemo(() => unitOptions[0]?.id ?? "", [unitOptions])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createStep, setCreateStep] = useState<CreateSurveyStep>("info")
  const [assignments, setAssignments] = useState<SurveyRequest[]>(() => createDemoAssignments(unitOptions))
  const [detailsSurvey, setDetailsSurvey] = useState<SurveyRequest | null>(null)
  const [detailsSurveyDraft, setDetailsSurveyDraft] = useState<SurveyRequest | null>(null)
  const [isSurveyDetailsOpen, setIsSurveyDetailsOpen] = useState(false)
  const [isDetailsEditing, setIsDetailsEditing] = useState(false)
  const [detailsParticipantSearch, setDetailsParticipantSearch] = useState("")
  const [viewMode, setViewMode] = useState<SurveyViewMode>("grid")
  const [surveySearchQuery, setSurveySearchQuery] = useState("")
  const [surveyPage, setSurveyPage] = useState(1)
  const [surveyPageSize, setSurveyPageSize] = useState<number>(STAFF_TABLE_PAGE_SIZE_OPTIONS[0])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [statusFilters, setStatusFilters] = useState<UnitSurveyStatus[]>([])

  const [newSurvey, setNewSurvey] = useState({
    title: "",
    description: "",
    templateId: "",
    unitId: scopeUnitId,
    startDate: "",
    endDate: "",
    participants: [] as string[],
  })

  const [participantSearch, setParticipantSearch] = useState("")

  useEffect(() => {
    setNewSurvey((prev) => ({ ...prev, unitId: scopeUnitId }))
  }, [scopeUnitId])

  const templateById = useMemo(
    () => new Map(SURVEY_TEMPLATES.map((t) => [t.id, t] as const)),
    []
  )
  const staffById = useMemo(
    () => new Map(STAFF.map((s) => [s.id, s] as const)),
    []
  )

  const selectedTemplate = templateById.get(newSurvey.templateId)
  useEffect(() => {
    setAssignments((prev) => {
      const hasManualEntries = prev.some((assignment) => !assignment.id.startsWith("demo-survey-"))
      if (hasManualEntries) return prev

      const targetDemoAssignments = createDemoAssignments(unitOptions)
      if (prev.length >= targetDemoAssignments.length) return prev

      const existingIds = new Set(prev.map((assignment) => assignment.id))
      const missing = targetDemoAssignments.filter((assignment) => !existingIds.has(assignment.id))
      return [...prev, ...missing].slice(0, targetDemoAssignments.length)
    })
  }, [unitOptions])


  const hasActiveStatusFilter = statusFilters.length > 0
  const activeFiltersCount = statusFilters.length
  const visibleAssignments = useMemo(() => {
    const query = surveySearchQuery.trim().toLowerCase()
    return assignments.filter((assignment) => {
      if (statusFilters.length > 0 && !statusFilters.includes(assignment.status)) {
        return false
      }

      if (!query) return true

      const templateTitle = templateById.get(assignment.templateId)?.title ?? assignment.templateId
      const searchable = [
        assignment.title,
        assignment.description,
        templateTitle,
        UNIT_SURVEY_STATUS_LABELS[assignment.status],
      ]
        .join(" ")
        .toLowerCase()

      return searchable.includes(query)
    })
  }, [assignments, statusFilters, surveySearchQuery, templateById])

  const surveyPages = useMemo(() => {
    if (viewMode !== "table") return 1
    return Math.max(1, Math.ceil(visibleAssignments.length / surveyPageSize))
  }, [viewMode, visibleAssignments.length, surveyPageSize])
  const safeSurveyPage = useMemo(() => Math.min(surveyPage, surveyPages), [surveyPage, surveyPages])
  const GRID_MAX_ASSIGNMENTS = 20
  const visibleGridAssignments = useMemo(
    () => visibleAssignments.slice(0, GRID_MAX_ASSIGNMENTS),
    [visibleAssignments]
  )
  const hasMoreAssignments = viewMode === "grid" && visibleAssignments.length > GRID_MAX_ASSIGNMENTS
  const groupedGridAssignments = useMemo(() => {
    const map = new Map<UnitSurveyStatus, SurveyRequest[]>()
    SURVEY_GRID_STATUS_ORDER.forEach((status) => map.set(status, []))
    visibleGridAssignments.forEach((assignment) => {
      const items = map.get(assignment.status)
      if (items) {
        items.push(assignment)
      }
    })

    return SURVEY_GRID_STATUS_ORDER.map((status) => ({
      status,
      items: map.get(status) ?? [],
    })).filter((group) => group.items.length > 0)
  }, [visibleGridAssignments])
  const visibleTableAssignments = useMemo(() => {
    if (viewMode !== "table") return visibleGridAssignments
    const start = (safeSurveyPage - 1) * surveyPageSize
    return visibleAssignments.slice(start, start + surveyPageSize)
  }, [safeSurveyPage, surveyPageSize, visibleAssignments, visibleGridAssignments, viewMode])

  useEffect(() => {
    if (viewMode === "table") {
      setSurveyPage(1)
    }
  }, [surveySearchQuery, statusFilters, viewMode])

  useEffect(() => {
    if (safeSurveyPage !== surveyPage) {
      setSurveyPage(safeSurveyPage)
    }
  }, [safeSurveyPage, surveyPage])

  const toggleStatusFilter = (status: UnitSurveyStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
    )
  }

  const clearSurveyFilters = () => {
    setStatusFilters([])
  }

  const resetDraft = () => {
    setCreateStep("info")
    setParticipantSearch("")
    setNewSurvey({
      title: "",
      description: "",
      templateId: "",
      unitId: scopeUnitId,
      startDate: "",
      endDate: "",
      participants: [],
    })
  }

  const openCreateDialog = () => {
    setNewSurvey((prev) => ({ ...prev, unitId: scopeUnitId }))
    setCreateStep("info")
    setIsCreateDialogOpen(true)
  }

  const openSurveyDetails = (survey: SurveyRequest) => {
    setDetailsSurvey(survey)
    setDetailsSurveyDraft(survey)
    setDetailsParticipantSearch("")
    setIsDetailsEditing(false)
    setIsSurveyDetailsOpen(true)
  }

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false)
    resetDraft()
  }

  const closeSurveyDetails = () => {
    setIsSurveyDetailsOpen(false)
    setDetailsSurvey(null)
    setDetailsSurveyDraft(null)
    setIsDetailsEditing(false)
    setDetailsParticipantSearch("")
  }

  const isStepOneValid = Boolean(newSurvey.title.trim() && newSurvey.templateId && newSurvey.unitId)
  const hasDuplicateForTargetScope = assignments.some(
    (a) =>
      a.unitId === newSurvey.unitId &&
      a.templateId === newSurvey.templateId &&
      a.status !== "completed"
  )

  const canCreateSurvey = isStepOneValid && newSurvey.participants.length > 0 && !hasDuplicateForTargetScope

  const removeParticipant = (participant: string) => {
    setNewSurvey((prev) => ({
      ...prev,
      participants: prev.participants.filter((item) => item !== participant),
    }))
  }

  const addParticipant = (staffId: string) => {
    setNewSurvey((prev) =>
      prev.participants.includes(staffId)
        ? prev
        : {
            ...prev,
            participants: [...prev.participants, staffId],
          }
    )
  }

  const unitEmployeeScopeIds = useMemo(() => {
    const unitNode = findUnit(ORG_ROOT, newSurvey.unitId)
    if (!unitNode) return new Set([newSurvey.unitId])
    return new Set(collectUnitIds(unitNode))
  }, [newSurvey.unitId])

  const unitEmployees = useMemo(
    () => STAFF.filter((staff) => unitEmployeeScopeIds.has(staff.unitId)),
    [unitEmployeeScopeIds]
  )

  const filteredUnitEmployees = useMemo(() => {
    const term = participantSearch.trim().toLowerCase()
    const normalizedSelected = new Set(newSurvey.participants)

    const matchesTerm = (member: StaffMember) => {
      if (!term) return true
      const searchable = `${member.lastName} ${member.firstName} ${member.patronymic} ${member.position} ${member.personnelNumber}`.toLowerCase()
      return searchable.includes(term)
    }

    return unitEmployees
      .filter((member) => !normalizedSelected.has(member.id))
      .filter(matchesTerm)
      .sort((a, b) => formatFioMember(a).localeCompare(formatFioMember(b)))
  }, [participantSearch, unitEmployees, newSurvey.participants])

  const handleCreateSurvey = () => {
    if (!canCreateSurvey) return

    setAssignments((prev) => [
      ...prev,
      {
        id: `survey-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        unitId: newSurvey.unitId,
        templateId: newSurvey.templateId,
        status: "draft",
        startDate: newSurvey.startDate || "—",
        endDate: newSurvey.endDate || "—",
        createdAtLabel: formatNowLabel(),
        title: newSurvey.title,
        description: newSurvey.description || selectedTemplate?.description || "",
        participants: newSurvey.participants,
      },
    ])

    setIsCreateDialogOpen(false)
    resetDraft()
  }

  const templateOptions = SURVEY_TEMPLATES.filter(
    (t) =>
      !assignments.some(
        (a) =>
          a.unitId === newSurvey.unitId &&
          a.templateId === t.id &&
          a.status !== "completed"
      )
  )

  const detailsSurveyParticipants = useMemo(() => {
    if (!detailsSurveyDraft) return []
    return detailsSurveyDraft.participants
  }, [detailsSurveyDraft])

  const detailsUnitEmployees = useMemo(() => {
    if (!detailsSurveyDraft) return []
    const unitNode = findUnit(ORG_ROOT, detailsSurveyDraft.unitId)
    const unitIds = new Set(unitNode ? collectUnitIds(unitNode) : [detailsSurveyDraft.unitId])
    return STAFF.filter((staff) => unitIds.has(staff.unitId))
  }, [detailsSurveyDraft])

  const detailsFilteredUnitEmployees = useMemo(() => {
    if (!detailsSurveyDraft) return []
    const term = detailsParticipantSearch.trim().toLowerCase()
    const selected = new Set(detailsSurveyDraft.participants)

    return detailsUnitEmployees
      .filter((member) => !selected.has(member.id))
      .filter((member) => {
        if (!term) return true
        const text = `${member.lastName} ${member.firstName} ${member.patronymic} ${member.position} ${member.personnelNumber}`.toLowerCase()
        return text.includes(term)
      })
      .sort((a, b) => formatFioMember(a).localeCompare(formatFioMember(b)))
  }, [detailsParticipantSearch, detailsUnitEmployees, detailsSurveyDraft])

  const addDetailsParticipant = (staffId: string) => {
    setDetailsSurveyDraft((prev) =>
      !prev || prev.participants.includes(staffId)
        ? prev
        : {
            ...prev,
            participants: [...prev.participants, staffId],
          }
    )
  }

  const removeDetailsParticipant = (staffId: string) => {
    setDetailsSurveyDraft((prev) =>
      !prev
        ? prev
        : {
            ...prev,
            participants: prev.participants.filter((item) => item !== staffId),
          }
    )
  }

  const saveSurveyChanges = () => {
    if (!detailsSurveyDraft) return
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === detailsSurveyDraft.id ? detailsSurveyDraft : assignment
      )
    )
    setIsDetailsEditing(false)
  }

  const cancelSurveyEditing = () => {
    if (!detailsSurvey) return
    setDetailsSurveyDraft(detailsSurvey)
    setDetailsParticipantSearch("")
    setIsDetailsEditing(false)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
      <div className="border-b border-border px-3 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={surveySearchQuery}
              onChange={(event) => setSurveySearchQuery(event.target.value)}
              placeholder="Поиск по названию, шаблону или статусу"
              className="h-10 pr-9 pl-9"
            />
            {surveySearchQuery ? (
              <button
                type="button"
                className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Очистить поиск"
                onClick={() => setSurveySearchQuery("")}
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-10"
              onClick={() => setIsFiltersOpen((value) => !value)}
            >
              <SlidersHorizontal className="size-4" />
              Фильтры
              {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : null}
            </Button>
            {isFiltersOpen ? (
              <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-md border border-border bg-popover p-3 shadow-lg">
                <p className="mb-2 text-sm font-medium uppercase text-muted-foreground">Фильтры</p>
                <div className="space-y-2">
                  {(Object.keys(UNIT_SURVEY_STATUS_LABELS) as UnitSurveyStatus[]).map((status) => (
                    <label key={status} className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={statusFilters.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                      />
                      <span className="min-w-0 leading-snug">{UNIT_SURVEY_STATUS_LABELS[status]}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={clearSurveyFilters}
                  >
                    Сбросить
                  </Button>
                  <Button type="button" size="sm" className="h-8" onClick={() => setIsFiltersOpen(false)}>
                    Применить
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="inline-flex h-10 rounded-md border border-border bg-muted p-1">
            <Button
              type="button"
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => {
                setViewMode("grid")
                setSurveyPage(1)
              }}
              aria-label="Отобразить в виде карточек"
            >
              <LayoutGrid className="size-4 shrink-0" aria-hidden />
              Карточки
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => {
                setViewMode("table")
                setSurveyPage(1)
              }}
              aria-label="Отобразить в виде таблицы"
            >
              <List className="size-4 shrink-0" aria-hidden />
              Таблица
            </Button>
          </div>
          <Button
            type="button"
            className="ml-auto h-10 w-full gap-2 text-sm sm:w-auto"
            disabled={!scopeUnitId}
            onClick={openCreateDialog}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            Запустить опрос
          </Button>
        </div>
      </div>
      {hasActiveStatusFilter || surveySearchQuery ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">Выбрано:</span>
          {surveySearchQuery ? (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground">
              <span className="truncate">ПОИСК: {surveySearchQuery}</span>
              <button
                type="button"
                className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label="Очистить поиск"
                onClick={() => setSurveySearchQuery("")}
              >
                x
              </button>
            </span>
          ) : null}
          {statusFilters.map((status) => (
            <span
              key={status}
              className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground"
            >
              <span className="truncate">{UNIT_SURVEY_STATUS_LABELS[status]}</span>
              <button
                type="button"
                className="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label={`Снять фильтр ${UNIT_SURVEY_STATUS_LABELS[status]}`}
                onClick={() => toggleStatusFilter(status)}
              >
                x
              </button>
            </span>
          ))}
          {hasActiveStatusFilter ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => {
                clearSurveyFilters()
                setSurveySearchQuery("")
              }}
            >
              Сбросить
            </Button>
          ) : null}
        </div>
      ) : null}

      <div>
        {visibleAssignments.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Пока нет созданных опросов. Нажмите «Запустить опрос».
          </p>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="space-y-8">
                {groupedGridAssignments.map((group) => {
                  const statusLabel = UNIT_SURVEY_STATUS_LABELS[group.status]

                  return (
                    <div
                      key={group.status}
                      className={cn(
                        "space-y-3.5 overflow-hidden rounded-xl border border-border/80 shadow-sm",
                        surveyGroupPanelClass(group.status)
                      )}
                    >
                      <div className="flex items-center justify-between border-b border-border/80 bg-muted/60 px-4 py-2.5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                          {statusLabel}
                        </h3>
                        <span className="text-xs text-muted-foreground">{group.items.length} шт.</span>
                      </div>
                      <div className="grid grid-cols-5 gap-6 p-5">
                        {group.items.map((a, index) => {
                          const tmpl = templateById.get(a.templateId)
                          const visibleParticipants = a.participants.slice(0, 3)
                          const visibleParticipantsLabel = visibleParticipants.map((id) => {
                            const staff = staffById.get(id)
                            return staff ? formatFioMember(staff) : id
                          })

                          return (
                            <div
                              key={a.id}
                              className="relative flex min-h-0 flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-2 transition-colors md:p-3 hover:border-primary/40 hover:bg-muted/35"
                              onClick={() => openSurveyDetails(a)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault()
                                  openSurveyDetails(a)
                                }
                              }}
                            >
                              <div className="min-h-0 min-w-0 flex-1 space-y-1">
                                <div className="mb-1 flex items-start justify-between gap-2">
                                  <p className="min-w-0 text-sm leading-tight font-semibold text-foreground">
                                    #{index + 1}. {a.title}
                                  </p>
                                  <span
                                    className={cn(
                                      "shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
                                      statusBadgeClass(a.status)
                                    )}
                                  >
                                    {statusLabel}
                                  </span>
                                  </div>
                                <p className="text-sm leading-snug text-muted-foreground">
                                  {tmpl?.title ?? a.templateId}
                                </p>
                                <p className="text-sm leading-snug text-muted-foreground">
                                  <span className="text-foreground">Период:</span>{" "}
                                  {a.startDate === "—" && a.endDate === "—" ? "не задан" : `${a.startDate} — ${a.endDate}`}
                                </p>
                                <p className="text-sm leading-snug text-muted-foreground">
                                  <span className="text-foreground">Участники:</span>{" "}
                                  <span className="font-medium text-foreground">
                                    {a.participants.length === 0
                                      ? "не добавлены"
                                      : `${visibleParticipantsLabel.join(", ")}${a.participants.length > 3 ? ` и ещё ${a.participants.length - 3}` : ""}`}
                                  </span>
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="min-h-0 flex w-full flex-1 flex-col">
                <div className="overflow-auto">
                  <table className="min-w-full table-fixed border-collapse text-left text-sm">
                    <colgroup>
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "16%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "10%" }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 backdrop-blur-sm">
                      <tr className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        <th className="px-2 py-2 font-medium">
                          Название
                        </th>
                        <th className="px-2 py-2 font-medium">Шаблон</th>
                        <th className="px-2 py-2 font-medium">Период</th>
                        <th className="px-2 py-2 font-medium">Участники</th>
                        <th className="px-2 py-2 font-medium">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTableAssignments.map((a) => {
                      const tmpl = templateById.get(a.templateId)
                      const visibleParticipants = a.participants.slice(0, 3)
                      const visibleParticipantsLabel = visibleParticipants.map((id) => {
                        const staff = staffById.get(id)
                        return staff ? formatFioMember(staff) : id
                      })

                      return (
                        <tr
                          key={a.id}
                          className="border-b border-border/80 transition-colors hover:bg-muted/40"
                          role="button"
                          tabIndex={0}
                          onClick={() => openSurveyDetails(a)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              openSurveyDetails(a)
                            }
                          }}
                        >
                          <td className="min-w-0 px-2 py-2 text-sm text-foreground">{a.title}</td>
                          <td className="min-w-0 px-2 py-2 text-sm text-muted-foreground">{tmpl?.title ?? a.templateId}</td>
                          <td className="px-2 py-2 text-sm text-muted-foreground">
                            {a.startDate === "—" && a.endDate === "—" ? "не задан" : `${a.startDate} — ${a.endDate}`}
                          </td>
                          <td className="min-w-0 px-2 py-2 text-sm text-muted-foreground">
                            {a.participants.length === 0
                              ? "не добавлены"
                              : `${visibleParticipantsLabel.join(", ")}${a.participants.length > 3 ? ` и ещё ${a.participants.length - 3}` : ""}`}
                          </td>
                          <td className="px-2 py-2 text-sm">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                                statusBadgeClass(a.status)
                              )}
                            >
                              {UNIT_SURVEY_STATUS_LABELS[a.status]}
                            </span>
                          </td>
                        </tr>
                      )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-border px-3 py-2 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>Всего: {visibleAssignments.length}</span>
                    <label className="flex items-center gap-1.5">
                      <span>Строк:</span>
                      <select
                        className="h-7 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                        value={surveyPageSize}
                        onChange={(event) => {
                          setSurveyPageSize(Number(event.target.value))
                          setSurveyPage(1)
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
                      onClick={() => setSurveyPage((p) => Math.max(1, p - 1))}
                      disabled={safeSurveyPage <= 1}
                    >
                      Назад
                    </Button>
                    <span className="tabular-nums text-muted-foreground">
                      {safeSurveyPage} / {surveyPages}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-sm"
                      onClick={() => setSurveyPage((p) => Math.min(surveyPages, p + 1))}
                      disabled={safeSurveyPage >= surveyPages}
                    >
                      Вперёд
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {hasMoreAssignments ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Показаны первые 20 опросов из {visibleAssignments.length}.
          </p>
        ) : null}
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => (open ? setIsCreateDialogOpen(true) : closeCreateDialog())}
      >
        <DialogContent className="max-h-[min(85vh,calc(100vh-2rem))] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Создание опроса</DialogTitle>
            <DialogDescription>Мастер из двух шагов для нового запроса в подразделение.</DialogDescription>
          </DialogHeader>

          <Tabs
            value={createStep}
            onValueChange={(value) => setCreateStep(value as CreateSurveyStep)}
            className="flex flex-1 flex-col gap-5"
          >
            <TabsList className="w-full">
              <TabsTrigger value="info">1. Общая информация</TabsTrigger>
              <TabsTrigger value="participants">2. Участники опроса</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className="mb-1.5 text-sm font-medium text-muted-foreground">Подразделение</p>
                  <Select
                    value={newSurvey.unitId}
                    onValueChange={(value) =>
                      {
                        setParticipantSearch("")
                        setNewSurvey((prev) => ({
                          ...prev,
                          unitId: value,
                          participants: [],
                        }))
                      }
                    }
                  >
                    <SelectTrigger className="h-10 w-full text-sm">
                      <SelectValue placeholder="Выберите подразделение" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[min(320px,50vh)] text-sm">
                      {unitOptions.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="text-sm">
                          {u.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1.5 text-sm font-medium text-muted-foreground">Название опроса</p>
                  <Input
                    value={newSurvey.title}
                    onChange={(e) => setNewSurvey((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-10 text-sm"
                    placeholder="Введите название опроса"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1.5 text-sm font-medium text-muted-foreground">Шаблон из каталога</p>
                  <Select
                    value={newSurvey.templateId}
                    onValueChange={(value) =>
                      setNewSurvey((prev) => ({
                        ...prev,
                        templateId: value,
                        description: prev.description || templateById.get(value)?.description || "",
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full text-sm">
                      <SelectValue placeholder="Выберите шаблон" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[min(360px,50vh)] text-sm">
                      {templateOptions.length === 0 ? (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          Нет доступных шаблонов.
                        </div>
                      ) : (
                        templateOptions.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="text-sm">
                            <span className="font-medium">{t.title}</span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1.5 text-sm font-medium text-muted-foreground">Краткая цель</p>
                  <Input
                    value={newSurvey.description}
                    onChange={(e) =>
                      setNewSurvey((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="h-10 text-sm"
                    placeholder={selectedTemplate?.description || "Кратко опишите цель опроса"}
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-medium text-muted-foreground">Дата старта</p>
                  <Input
                    type="date"
                    value={newSurvey.startDate}
                    onChange={(e) => setNewSurvey((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-muted-foreground">Дата завершения</p>
                  <Input
                    type="date"
                    value={newSurvey.endDate}
                    onChange={(e) => setNewSurvey((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="h-10 text-sm"
                  />
                </div>

                {hasDuplicateForTargetScope ? (
                  <p className="md:col-span-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    Для этого подразделения уже есть активный запрос с таким шаблоном.
                  </p>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <div>
                <p className="mb-1.5 text-sm font-medium text-muted-foreground">
                  Добавление участников из подразделения
                </p>
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="h-10 text-sm"
                    placeholder="Поиск по фамилии, должности, табельному номеру"
                  />
                </div>

                {unitEmployees.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Сотрудники в этом подразделении не найдены.</p>
                ) : (
                  <div className="mt-3 grid gap-2 rounded-lg border border-border/70 bg-muted/20 p-2">
                    {filteredUnitEmployees.length === 0 ? (
                      <p className="px-2 py-2 text-sm text-muted-foreground">
                        По выбранным фильтрам сотрудников не найдено.
                      </p>
                    ) : (
                      filteredUnitEmployees.map((member) => {
                        const isAdded = newSurvey.participants.includes(member.id)
                        return (
                          <div
                            key={member.id}
                            className="flex flex-col gap-2 rounded-md border border-border/70 bg-card p-2 text-sm md:flex-row md:items-center md:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{formatFioMember(member)}</p>
                              <p className="text-xs text-muted-foreground">{member.position}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 gap-1.5 text-sm"
                              disabled={isAdded}
                              onClick={() => addParticipant(member.id)}
                            >
                              <UserPlus className="size-4 shrink-0" aria-hidden />
                              {isAdded ? "Добавлен" : "Добавить"}
                            </Button>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                <p className="mt-3 text-sm text-muted-foreground">
                  Добавлено участников: <span className="font-medium text-foreground">{newSurvey.participants.length}</span>
                </p>
                {newSurvey.participants.length === 0 ? null : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newSurvey.participants.map((participantId) => {
                      const participant = staffById.get(participantId)
                      const label = participant ? formatFioMember(participant) : participantId
                      return (
                        <span
                          key={participantId}
                          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-2.5 py-1 text-sm text-foreground"
                        >
                          {label}
                          <button
                            type="button"
                            className="inline-flex size-4 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeParticipant(participantId)}
                            aria-label={`Удалить участника ${label}`}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 text-sm"
              onClick={closeCreateDialog}
            >
              Отмена
            </Button>

            {createStep === "info" ? (
              <Button
                type="button"
                className="h-10 text-sm"
                disabled={!isStepOneValid}
                onClick={() => setCreateStep("participants")}
              >
                Далее
              </Button>
            ) : (
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 text-sm"
                  onClick={() => setCreateStep("info")}
                >
                  Назад
                </Button>
                <Button
                  type="button"
                  className="h-10 text-sm"
                  disabled={!canCreateSurvey}
                  onClick={handleCreateSurvey}
                >
                  Запустить опрос
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSurveyDetailsOpen}
        onOpenChange={(open) => (open ? setIsSurveyDetailsOpen(true) : closeSurveyDetails())}
      >
        <DialogContent className="max-h-[min(85vh,calc(100vh-2rem))] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Подробности по опросу</DialogTitle>
            <DialogDescription>Просмотр и редактирование параметров запроса</DialogDescription>
          </DialogHeader>

          {!detailsSurveyDraft ? null : (
            <>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">Подразделение</p>
                    {isDetailsEditing ? (
                      <Select
                        value={detailsSurveyDraft.unitId}
                        onValueChange={(value) =>
                          setDetailsSurveyDraft((prev) => ({
                            ...(prev as SurveyRequest),
                            unitId: value,
                            participants: [],
                          }))
                        }
                      >
                        <SelectTrigger className="h-10 w-full text-sm">
                          <SelectValue placeholder="Выберите подразделение" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[min(320px,50vh)] text-sm">
                          {unitOptions.map((u) => (
                            <SelectItem key={u.id} value={u.id} className="text-sm">
                              {u.path}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm text-foreground">
                        {unitOptions.find((u) => u.id === detailsSurveyDraft.unitId)?.path ?? detailsSurveyDraft.unitId}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">Название опроса</p>
                    <Input
                      value={detailsSurveyDraft.title}
                      disabled={!isDetailsEditing}
                      onChange={(e) =>
                        setDetailsSurveyDraft((prev) =>
                          prev ? { ...prev, title: e.target.value } : prev
                        )
                      }
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">Шаблон</p>
                    {isDetailsEditing ? (
                      <Select
                        value={detailsSurveyDraft.templateId}
                        onValueChange={(value) =>
                          setDetailsSurveyDraft((prev) =>
                            prev ? { ...prev, templateId: value } : prev
                          )
                        }
                      >
                        <SelectTrigger className="h-10 w-full text-sm">
                          <SelectValue placeholder="Выберите шаблон" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[min(320px,50vh)] text-sm">
                          {SURVEY_TEMPLATES.map((template) => (
                            <SelectItem key={template.id} value={template.id} className="text-sm">
                              {template.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm text-foreground">
                        {templateById.get(detailsSurveyDraft.templateId)?.title ??
                          detailsSurveyDraft.templateId}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">Цель</p>
                    <textarea
                      disabled={!isDetailsEditing}
                      value={detailsSurveyDraft.description}
                      onChange={(e) =>
                        setDetailsSurveyDraft((prev) =>
                          prev ? { ...prev, description: e.target.value } : prev
                        )
                      }
                      className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                      placeholder="Кратко опишите цель опроса"
                    />
                  </div>

                  <div>
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">Дата старта</p>
                    <Input
                      type="date"
                      disabled={!isDetailsEditing}
                      value={detailsSurveyDraft.startDate === "—" ? "" : detailsSurveyDraft.startDate}
                      onChange={(e) =>
                        setDetailsSurveyDraft((prev) =>
                          prev ? { ...prev, startDate: e.target.value } : prev
                        )
                      }
                      className="h-10 text-sm"
                    />
                  </div>

                  <div>
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">Дата завершения</p>
                    <Input
                      type="date"
                      disabled={!isDetailsEditing}
                      value={detailsSurveyDraft.endDate === "—" ? "" : detailsSurveyDraft.endDate}
                      onChange={(e) =>
                        setDetailsSurveyDraft((prev) =>
                          prev ? { ...prev, endDate: e.target.value } : prev
                        )
                      }
                      className="h-10 text-sm"
                    />
                  </div>

                  <div>
                    <p className="mb-1.5 text-sm font-medium text-muted-foreground">Статус</p>
                    <Select
                      value={detailsSurveyDraft.status}
                      disabled={!isDetailsEditing}
                      onValueChange={(value) =>
                        setDetailsSurveyDraft((prev) =>
                          prev ? { ...prev, status: value as UnitSurveyStatus } : prev
                        )
                      }
                    >
                      <SelectTrigger className="h-10 w-full text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-sm">
                        {(Object.keys(UNIT_SURVEY_STATUS_LABELS) as UnitSurveyStatus[]).map((s) => (
                          <SelectItem key={s} value={s} className="text-sm">
                            {UNIT_SURVEY_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-medium text-muted-foreground">Участники</p>
                  <div className="flex flex-wrap gap-2">
                    {detailsSurveyParticipants.map((participantId) => {
                      const participant = staffById.get(participantId)
                      const label = participant ? formatFioMember(participant) : participantId
                      return (
                        <span
                          key={participantId}
                          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-2.5 py-1 text-sm text-foreground"
                        >
                          {label}
                          {isDetailsEditing ? (
                            <button
                              type="button"
                              className="inline-flex size-4 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeDetailsParticipant(participantId)}
                              aria-label={`Удалить участника ${label}`}
                            >
                              <X className="size-3" />
                            </button>
                          ) : null}
                        </span>
                      )
                    })}
                  </div>

                  {isDetailsEditing ? (
                    <div className="mt-4 space-y-2">
                      <Input
                        value={detailsParticipantSearch}
                        onChange={(e) => setDetailsParticipantSearch(e.target.value)}
                        className="h-10 text-sm"
                        placeholder="Поиск сотрудников для добавления"
                      />
                      <div className="max-h-44 overflow-y-auto grid gap-2 rounded-lg border border-border/70 bg-muted/20 p-2">
                        {detailsFilteredUnitEmployees.length === 0 ? (
                          <p className="px-2 py-2 text-sm text-muted-foreground">
                            Нет сотрудников для добавления.
                          </p>
                        ) : (
                          detailsFilteredUnitEmployees.map((member) => (
                            <div
                              key={member.id}
                              className="flex flex-col gap-2 rounded-md border border-border/70 bg-card p-2 text-sm md:flex-row md:items-center md:justify-between"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">{formatFioMember(member)}</p>
                                <p className="text-xs text-muted-foreground">{member.position}</p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-9 gap-1.5 text-sm"
                                onClick={() => addDetailsParticipant(member.id)}
                              >
                                <UserPlus className="size-4 shrink-0" aria-hidden />
                                Добавить
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <DialogFooter className="mt-2">
                {isDetailsEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 text-sm"
                      onClick={cancelSurveyEditing}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="button"
                      className="h-10 text-sm"
                      onClick={saveSurveyChanges}
                    >
                      Сохранить
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 text-sm"
                      onClick={closeSurveyDetails}
                    >
                      Закрыть
                    </Button>
                    <Button
                      type="button"
                      className="h-10 text-sm"
                      onClick={() => setIsDetailsEditing(true)}
                    >
                      Редактировать
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

