"use client"

import * as React from "react"
import {
  Building2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { D3OrgChartView } from "@/components/d3-org-chart-view"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ORG_ROOT,
  STAFF,
  type OrgUnit,
  type StaffMember,
  collectLeafIds,
  countStaffDirect,
  countStaffInSubtree,
  findUnit,
  getBreadcrumb,
  activityDirectionLabel,
} from "@/lib/bank-org-mock"
import { cn } from "@/lib/utils"

const sspVspTagClass =
  "inline-flex shrink-0 items-center rounded border border-border bg-muted/60 px-1.5 py-px text-[10px] font-semibold leading-none text-muted-foreground"

function unitLabel(unit: OrgUnit): string {
  if (unit.id === ORG_ROOT.id) return "Структура"
  switch (unit.level) {
    case "department":
      return "Департамент"
    case "management":
      return "Управление"
    case "office":
      return "Отдел"
    default:
      return ""
  }
}

function formatFio(s: StaffMember): string {
  return `${s.lastName} ${s.firstName} ${s.patronymic}`
}

const AVATAR_TONES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
] as const

function staffInitials(s: StaffMember): string {
  const a = s.lastName.trim().at(0) ?? ""
  const b = s.firstName.trim().at(0) ?? ""
  return `${a}${b}`.toUpperCase()
}

function avatarToneClass(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length]
}

function StaffAvatar({ member }: { member: StaffMember }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        avatarToneClass(member.id)
      )}
      aria-hidden
    >
      {staffInitials(member)}
    </div>
  )
}

function TreeNodeRow({
  node,
  depth,
  expanded,
  onToggle,
  selectedId,
  onSelect,
  unitQuery,
}: {
  node: OrgUnit
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  selectedId: string
  onSelect: (id: string) => void
  unitQuery: string
}) {
  const hasChildren = node.children.length > 0
  const isOpen = expanded.has(node.id)
  const isSelected = selectedId === node.id
  const q = unitQuery.trim().toLowerCase()

  const subtree = React.useMemo(() => countStaffInSubtree(node, STAFF), [node])
  const direct = React.useMemo(() => countStaffDirect(node, STAFF), [node])

  const matchesSelf = !q || node.name.toLowerCase().includes(q)

  const visibleChildren = React.useMemo(() => {
    if (!q) return node.children
    return node.children.filter((c) => subtreeHasMatch(c, q))
  }, [node.children, q])

  if (q && !matchesSelf && visibleChildren.length === 0) return null

  return (
    <div className="min-w-0">
      <div
        className={cn(
          "flex min-w-0 items-center gap-0.5 rounded-md py-0.5 pr-1",
          isSelected && "bg-sidebar-accent text-sidebar-accent-foreground"
        )}
        style={{ paddingLeft: Math.max(0, depth) * 12 + 4 }}
      >
        <button
          type="button"
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground",
            !hasChildren && "invisible pointer-events-none"
          )}
          aria-expanded={hasChildren ? isOpen : undefined}
          onClick={(e) => {
            e.stopPropagation()
            if (hasChildren) onToggle(node.id)
          }}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )
          ) : null}
        </button>
        <button
          type="button"
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm px-1.5 py-0.5 text-left text-sm/relaxed hover:bg-muted/80",
            isSelected && "hover:bg-transparent"
          )}
          onClick={() => onSelect(node.id)}
        >
          {node.id !== ORG_ROOT.id ? (
            <span className={sspVspTagClass} title="Направление деятельности">
              {activityDirectionLabel(node.id)}
            </span>
          ) : null}
          <span className="min-w-0 flex-1 truncate font-medium">{node.name}</span>
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {direct > 0 ? `${direct} / ` : ""}
            {subtree}
          </span>
        </button>
      </div>
      {hasChildren && isOpen && (
        <div>
          {(q ? visibleChildren : node.children).map((c) => (
            <TreeNodeRow
              key={c.id}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              selectedId={selectedId}
              onSelect={onSelect}
              unitQuery={unitQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function subtreeHasMatch(node: OrgUnit, q: string): boolean {
  if (node.name.toLowerCase().includes(q)) return true
  return node.children.some((c) => subtreeHasMatch(c, q))
}

function staffForSelection(
  unit: OrgUnit,
  includeSubunits: boolean
): StaffMember[] {
  const leaves = includeSubunits
    ? collectLeafIds(unit)
    : unit.children.length === 0
      ? [unit.id]
      : []
  const leafSet = new Set(leaves)
  return STAFF.filter((s) => leafSet.has(s.unitId))
}

export function StaffOrgExplorer() {
  const [selectedId, setSelectedId] = React.useState<string>(ORG_ROOT.id)
  const [includeSubunits, setIncludeSubunits] = React.useState(true)
  const [unitQuery, setUnitQuery] = React.useState("")
  const [staffQuery, setStaffQuery] = React.useState("")

  const initialExpanded = React.useMemo(() => {
    const s = new Set<string>()
    s.add(ORG_ROOT.id)
    for (const d of ORG_ROOT.children) {
      s.add(d.id)
      for (const m of d.children) s.add(m.id)
    }
    return s
  }, [])

  const [expanded, setExpanded] = React.useState(() => initialExpanded)

  const selected = React.useMemo(
    () => findUnit(ORG_ROOT, selectedId) ?? ORG_ROOT,
    [selectedId]
  )

  const baseStaff = React.useMemo(
    () => staffForSelection(selected, includeSubunits),
    [selected, includeSubunits]
  )

  const filteredStaff = React.useMemo(() => {
    const q = staffQuery.trim().toLowerCase()
    if (!q) return baseStaff
    return baseStaff.filter((s) => {
      const blob = [
        formatFio(s),
        s.position,
        s.personnelNumber,
        getBreadcrumb(ORG_ROOT, s.unitId)
          .map((u) => u.name)
          .join(" "),
      ]
        .join(" ")
        .toLowerCase()
      return blob.includes(q)
    })
  }, [baseStaff, staffQuery])

  const breadcrumb = React.useMemo(
    () => getBreadcrumb(ORG_ROOT, selected.id),
    [selected.id]
  )

  const onToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const subtreeTotal = countStaffInSubtree(selected, STAFF)
  const directTotal = countStaffDirect(selected, STAFF)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 py-4">
      <Tabs
        defaultValue="staff"
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-4"
      >
        <TabsList className="flex w-full overflow-hidden rounded-lg border border-border bg-muted p-[3px] divide-x divide-border">
          <TabsTrigger
            value="staff"
            className="rounded-none rounded-l-md border-0 shadow-none data-active:rounded-md"
          >
            Подразделения и сотрудники
          </TabsTrigger>
          <TabsTrigger
            value="orgchart"
            className="rounded-none rounded-r-md border-0 shadow-none data-active:rounded-md"
          >
            Органограмма
          </TabsTrigger>
        </TabsList>
        <TabsContent value="staff" className="mt-0 flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-[min(70vh,720px)] flex-1 gap-4 lg:grid-cols-[minmax(260px,320px)_1fr]">
            <aside className="flex min-h-0 flex-col rounded-lg border border-border bg-card">
              <div className="border-b border-border px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2Icon className="size-3.5" />
                  Структура
                </div>
                <div className="relative mt-2">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={unitQuery}
                    onChange={(e) => setUnitQuery(e.target.value)}
                    placeholder="Поиск по названию…"
                    className="h-8 pl-8 text-sm"
                  />
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-2">
                <TreeNodeRow
                  node={ORG_ROOT}
                  depth={0}
                  expanded={expanded}
                  onToggle={onToggle}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  unitQuery={unitQuery}
                />
              </div>
            </aside>

            <section className="flex min-h-0 min-w-0 flex-col rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <nav className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm text-muted-foreground">
                  {breadcrumb.map((u, i) => (
                    <React.Fragment key={u.id}>
                      {i > 0 && (
                        <span className="text-muted-foreground/70">/</span>
                      )}
                      <span
                        className={cn(
                          i === breadcrumb.length - 1 &&
                            "font-medium text-foreground"
                        )}
                      >
                        {u.name}
                      </span>
                    </React.Fragment>
                  ))}
                </nav>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                {selected.id !== ORG_ROOT.id ? (
                  <span className={sspVspTagClass} title="Направление деятельности">
                    {activityDirectionLabel(selected.id)}
                  </span>
                ) : null}
                    <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      {unitLabel(selected)}
                    </span>
                    <div className="inline-flex rounded-md border border-border p-[2px]">
                      <Button
                        type="button"
                        size="sm"
                        variant={includeSubunits ? "secondary" : "ghost"}
                        className="h-7 rounded-sm px-2 text-sm"
                        onClick={() => setIncludeSubunits(true)}
                      >
                        С подразделениями
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!includeSubunits ? "secondary" : "ghost"}
                        className="h-7 rounded-sm px-2 text-sm"
                        onClick={() => setIncludeSubunits(false)}
                      >
                        Только выбранный уровень
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground tabular-nums">
                    <span className="flex items-center gap-1.5">
                      <UsersIcon className="size-3.5" />
                      {staffQuery.trim()
                        ? `${filteredStaff.length} из ${baseStaff.length}`
                        : `${filteredStaff.length}`}
                    </span>
                    <span className="text-muted-foreground/80">
                      в поддереве: {subtreeTotal}
                      {directTotal > 0 && (
                        <span> · на узле: {directTotal}</span>
                      )}
                    </span>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={staffQuery}
                    onChange={(e) => setStaffQuery(e.target.value)}
                    placeholder="Поиск: ФИО, должность, табельный номер…"
                    className="h-8 pl-8 text-sm"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                {!includeSubunits && baseStaff.length === 0 && (
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    {selected.children.length > 0
                      ? "Сотрудники закреплены в дочерних подразделениях. Включите «С подразделениями» или выберите конкретный отдел / управление без вложенных отделов."
                      : "В выбранном подразделении нет записей сотрудников в демо-данных."}
                  </p>
                )}
                <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm">
                  <colgroup>
                    <col className="w-5/12" />
                    <col className="w-4/12" />
                    <col className="w-1/12" />
                    <col className="w-2/12" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 backdrop-blur-sm">
                    <tr className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-medium">ФИО</th>
                      <th className="px-3 py-2 font-medium">Должность</th>
                      <th className="px-3 py-2 font-medium">Таб. №</th>
                      <th className="px-3 py-2 font-medium">Подразделение</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((s) => {
                      const path = getBreadcrumb(ORG_ROOT, s.unitId)
                      const pathStr = path
                        .filter((u) => u.id !== ORG_ROOT.id)
                        .map((u) => u.name)
                        .join(" → ")
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-border/80 hover:bg-muted/40"
                        >
                          <td className="min-w-0 px-3 py-2 align-middle">
                            <div className="flex min-w-0 items-center gap-3">
                              <StaffAvatar member={s} />
                              <span className="min-w-0 truncate font-medium">
                                {formatFio(s)}
                              </span>
                            </div>
                          </td>
                          <td className="min-w-0 px-3 py-2 align-middle text-muted-foreground">
                            <span className="line-clamp-2 break-words">
                              {s.position}
                            </span>
                          </td>
                          <td className="min-w-0 px-3 py-2 align-middle tabular-nums text-muted-foreground">
                            <span className="block truncate">
                              {s.personnelNumber}
                            </span>
                          </td>
                          <td className="min-w-0 px-3 py-2 align-middle text-muted-foreground">
                            <span className="line-clamp-2 break-words leading-snug">
                              {pathStr}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredStaff.length === 0 && baseStaff.length > 0 && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Нет сотрудников по заданным условиям.
                  </p>
                )}
              </div>
            </section>
          </div>
        </TabsContent>
        <TabsContent
          value="orgchart"
          className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <D3OrgChartView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
