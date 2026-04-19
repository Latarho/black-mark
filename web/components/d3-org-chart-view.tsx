"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Building2Icon, SearchIcon, UserIcon } from "lucide-react"
import { OrgChart } from "d3-org-chart"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  ORG_ROOT,
  STAFF,
  countStaffDirect,
  countStaffInSubtree,
  findUnit,
  getBreadcrumb,
  getStaffLineManagers,
  activityDirectionLabel,
  type OrgUnit,
  type StaffMember,
} from "@/lib/bank-org-mock"
import {
  buildD3OrgChartRows,
  searchOrgChartRows,
  type D3OrgChartRow,
} from "@/lib/org-chart-d3-data"
import { cn } from "@/lib/utils"

const sspVspTagClass =
  "inline-flex shrink-0 items-center rounded border border-border bg-muted/60 px-1.5 py-px text-[10px] font-semibold leading-none text-muted-foreground"

/** Тег «Руководитель» — те же доли primary, что и в карточках D3 (см. headTagStyle). */
const unitHeadTagClass =
  "inline-flex shrink-0 items-center rounded-md border border-primary/45 bg-primary/12 px-1.5 py-px text-[10px] font-semibold leading-none text-primary"
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

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

function StaffAvatar({
  member,
  className,
}: {
  member: StaffMember
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        avatarToneClass(member.id),
        className
      )}
      aria-hidden
    >
      {staffInitials(member)}
    </div>
  )
}

function staffAvatarTone(id: string, dark: boolean): { bg: string; fg: string } {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const ix = Math.abs(h) % 5
  const light = [
    { bg: "oklch(0.93 0.06 251)", fg: "oklch(0.52 0.18 262)" },
    { bg: "oklch(0.93 0.06 38)", fg: "oklch(0.5 0.16 38)" },
    { bg: "oklch(0.93 0.05 145)", fg: "oklch(0.45 0.12 145)" },
    { bg: "oklch(0.93 0.05 300)", fg: "oklch(0.48 0.16 300)" },
    { bg: "oklch(0.93 0.04 200)", fg: "oklch(0.42 0.12 200)" },
  ]
  const drk = [
    { bg: "oklch(0.32 0.08 251 / 0.55)", fg: "oklch(0.82 0.1 262)" },
    { bg: "oklch(0.32 0.08 38 / 0.55)", fg: "oklch(0.88 0.12 48)" },
    { bg: "oklch(0.32 0.06 145 / 0.55)", fg: "oklch(0.85 0.08 145)" },
    { bg: "oklch(0.32 0.07 300 / 0.55)", fg: "oklch(0.85 0.1 300)" },
    { bg: "oklch(0.32 0.06 200 / 0.55)", fg: "oklch(0.82 0.08 200)" },
  ]
  return (dark ? drk : light)[ix]
}

function resetChartNodeFlags(chart: OrgChart) {
  const st = chart.getChartState()
  for (const r of st.data) {
    const row = r as Record<string, unknown>
    row._centered = false
    row._centeredWithDescendants = false
  }
}

function focusNodeOnChart(chart: OrgChart, row: D3OrgChartRow) {
  resetChartNodeFlags(chart)
  chart.clearHighlighting()
  chart.setHighlighted(row.id)
  chart.render()
}

export function D3OrgChartView() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<OrgChart | null>(null)
  const searchWrapRef = React.useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const chartData = React.useMemo(() => buildD3OrgChartRows(), [isDark])

  const [search, setSearch] = React.useState("")
  const [listOpen, setListOpen] = React.useState(false)

  const [detailOpen, setDetailOpen] = React.useState(false)
  const [detailUnit, setDetailUnit] = React.useState<OrgUnit | null>(null)
  const [detailStaff, setDetailStaff] = React.useState<StaffMember | null>(
    null
  )

  const onDetailOpenChange = React.useCallback((open: boolean) => {
    setDetailOpen(open)
    if (!open) {
      setDetailUnit(null)
      setDetailStaff(null)
    }
  }, [])

  const matches = React.useMemo(
    () => searchOrgChartRows(chartData, search),
    [chartData, search]
  )

  const showList = listOpen && search.trim().length > 0

  const staffLineManagers = React.useMemo(
    () => (detailStaff ? getStaffLineManagers(detailStaff, STAFF) : []),
    [detailStaff]
  )

  const [zoomPercent, setZoomPercent] = React.useState(100)

  const syncZoomFromChart = React.useCallback(() => {
    const c = chartRef.current
    if (!c) return
    const k = c.getChartState().lastTransform?.k ?? 1
    setZoomPercent(Math.round(k * 100))
  }, [])

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = searchWrapRef.current
      if (!el?.contains(e.target as Node)) setListOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  React.useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.innerHTML = ""

    const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"
    const cardBg = isDark ? "oklch(0.22 0.006 56)" : "oklch(1 0 0)"
    const muted = isDark ? "oklch(0.72 0.01 56)" : "oklch(0.55 0.013 58)"
    const title = isDark ? "oklch(0.98 0.001 106)" : "oklch(0.15 0.004 49)"
    const staffBg = isDark ? "oklch(0.26 0.007 34)" : "oklch(0.97 0.001 106)"
    /** Как `unitHeadTagClass`: 10px, semibold, py-px px-1.5, rounded-md. */
    const headTagStyle =
      "position:absolute;top:3px;right:4px;z-index:1;flex-shrink:0;font-size:10px;font-weight:600;line-height:1;padding:1px 6px;border-radius:var(--radius-md);border:1px solid color-mix(in oklch, var(--primary) 45%, transparent);color:var(--primary);background:color-mix(in oklch, var(--primary) 12%, transparent);"

    const rect0 = el.getBoundingClientRect()
    const svgW0 = rect0.width > 0 ? rect0.width : 800
    const svgH0 = rect0.height > 0 ? rect0.height : 480

    const chart = new OrgChart()
    const defaultButtonContent = chart.buttonContent()

    chart
      .svgWidth(svgW0)
      .svgHeight(svgH0)
      .container(el)
      .data(chartData)
      .layout("top")
      .compact(true)
      .initialExpandLevel(2)
      .nodeButtonWidth(() => 60)
      .nodeButtonHeight(() => 60)
      .nodeButtonX(() => -30)
      .nodeButtonY(() => -30)
      .buttonContent(({ node, state }) => {
        const inner = defaultButtonContent({ node, state })
        return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"><div style="transform:scale(1.5);transform-origin:center center">${inner}</div></div>`
      })
      .nodeWidth((n) => {
        const row = (n as { data?: D3OrgChartRow } | undefined)?.data
        return row?.kind === "staff" ? 232 : 260
      })
      .nodeHeight((n) => {
        const row = (n as { data?: D3OrgChartRow } | undefined)?.data
        if (!row) return 78
        if (row.kind === "staff") return 80
        return row.headFio ? 94 : 78
      })
      .childrenMargin(() => 40)
      .siblingsMargin(() => 16)
      .neighbourMargin(() => 24)
      .nodeContent((d: { data: Record<string, unknown> }) => {
        const row = d.data as D3OrgChartRow
        const isStaff = row.kind === "staff"
        const bg = isStaff ? staffBg : cardBg

        if (isStaff && row.initials) {
          const { bg: avBg, fg: avFg } = staffAvatarTone(row.id, isDark)
          const head = row.isUnitHead
          const headTagBlock = head
            ? `<span style="${headTagStyle}">Руководитель</span>`
            : ""
          return `
          <div style="position:relative;padding:3px 8px;width:100%;height:100%;box-sizing:border-box;border:1px solid ${border};border-radius:8px;background:${bg};display:flex;flex-direction:row;align-items:center;gap:6px;">
            ${headTagBlock}
            <div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;line-height:1;background:${avBg};color:${avFg};border:1px solid ${border};">${esc(row.initials)}</div>
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:1px;${head ? "padding-right:76px;padding-top:2px;box-sizing:border-box;" : ""}">
              <div style="font-size:11px;font-weight:600;line-height:1.15;color:${title};">${esc(row.name)}</div>
              <div style="font-size:11px;line-height:1.22;color:${muted};overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${esc(row.role)}</div>
            </div>
          </div>`
        }

        const showActivityTag = row.id !== ORG_ROOT.id && row.unitLevel != null
        const tag = showActivityTag ? activityDirectionLabel(row.id) : ""
        const tagBg = isDark
          ? "rgba(255,255,255,0.07)"
          : "rgba(0,0,0,0.05)"
        const tagBlock = showActivityTag
          ? `<span style="flex-shrink:0;font-size:10px;font-weight:600;line-height:1;padding:1px 6px;border-radius:var(--radius-sm);border:1px solid ${border};color:${muted};background:${tagBg};">${esc(tag)}</span>`
          : ""
        const headBlock = row.headFio
          ? `<div style="margin-top:3px;font-size:11px;line-height:1.25;color:${muted};overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;"><span style="font-weight:600;color:var(--primary);">Руководитель: </span>${esc(row.headFio)}</div>`
          : ""
        return `
          <div style="padding:7px 12px;width:100%;height:100%;box-sizing:border-box;border:2px solid ${border};border-radius:10px;background:${bg};display:flex;flex-direction:column;justify-content:center;">
            <div style="display:flex;align-items:flex-start;gap:8px;min-width:0;">
              <div style="flex:1;min-width:0;font-size:14px;font-weight:600;line-height:1.22;color:${title};">${esc(row.name)}</div>${tagBlock}
            </div>${headBlock}
          </div>`
      })
      .onNodeClick((node) => {
        const row = node.data as D3OrgChartRow
        if (row.kind === "staff") {
          const s = STAFF.find((m) => m.id === row.id)
          if (!s) return
          setDetailStaff(s)
          setDetailUnit(null)
          setDetailOpen(true)
          return
        }
        const u = findUnit(ORG_ROOT, row.id)
        if (!u) return
        setDetailStaff(null)
        setDetailUnit(u)
        setDetailOpen(true)
      })
      .onZoom(() => {
        syncZoomFromChart()
      })
      .onZoomEnd(() => {
        syncZoomFromChart()
      })
      .render()
    chart.fit({ animate: false })
    {
      const k = chart.getChartState().lastTransform?.k ?? 1
      setZoomPercent(Math.round(k * 100))
    }

    chartRef.current = chart

    const ro = new ResizeObserver(() => {
      const c = chartRef.current
      if (!c) return
      const r = el.getBoundingClientRect()
      if (r.width <= 0) return
      c.svgWidth(r.width)
      c.svgHeight(r.height > 0 ? r.height : 480)
      c.render()
      c.fit({ animate: false })
      const k = c.getChartState().lastTransform?.k ?? 1
      setZoomPercent(Math.round(k * 100))
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      chart.clear()
      chartRef.current = null
      el.innerHTML = ""
    }
  }, [isDark, chartData, syncZoomFromChart])

  const onPickMatch = React.useCallback((row: D3OrgChartRow) => {
    const chart = chartRef.current
    if (!chart) return
    focusNodeOnChart(chart, row)
    setSearch("")
    setListOpen(false)
    requestAnimationFrame(() => {
      syncZoomFromChart()
    })
  }, [syncZoomFromChart])

  const onSearchKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setListOpen(false)
        return
      }
      if (e.key === "Enter" && matches.length > 0) {
        e.preventDefault()
        onPickMatch(matches[0])
      }
    },
    [matches, onPickMatch]
  )

  return (
    <div className="flex min-h-[min(70vh,720px)] min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-muted/15">
      <div className="border-b border-border px-4 py-3">
        <div ref={searchWrapRef} className="relative mx-auto w-full max-w-md">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setListOpen(true)
              }}
              onFocus={() => setListOpen(true)}
              onKeyDown={onSearchKeyDown}
              placeholder="Подразделение или сотрудник…"
              className="h-8 pl-8 text-sm"
              aria-autocomplete="list"
              aria-expanded={showList}
              aria-controls="org-chart-search-results"
            />
          </div>
          {showList ? (
            <div
              id="org-chart-search-results"
              className="absolute top-full right-0 left-0 z-50 mt-1 max-h-72 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md"
              role="listbox"
            >
              {matches.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-muted-foreground">
                  Ничего не найдено.
                </p>
              ) : (
                <ul className="flex flex-col gap-0 p-1">
                  {matches.map((row) => (
                    <li key={row.id} role="option">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto w-full justify-start gap-2 rounded-sm px-2 py-2 text-left"
                        onClick={() => onPickMatch(row)}
                      >
                        {row.kind === "staff" ? (
                          <UserIcon
                            data-icon="inline-start"
                            className="mt-0.5 shrink-0 text-muted-foreground"
                          />
                        ) : (
                          <Building2Icon
                            data-icon="inline-start"
                            className="mt-0.5 shrink-0 text-muted-foreground"
                          />
                        )}
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex min-w-0 items-center gap-2">
                            {row.kind === "unit" &&
                            row.unitLevel &&
                            row.id !== ORG_ROOT.id ? (
                              <span className={sspVspTagClass} title="Направление деятельности">
                                {activityDirectionLabel(row.id)}
                              </span>
                            ) : null}
                            {row.kind === "staff" && row.isUnitHead ? (
                              <span
                                className={unitHeadTagClass}
                                title="Руководитель подразделения"
                              >
                                Руководитель
                              </span>
                            ) : null}
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              {row.name}
                            </span>
                          </span>
                          {row.role.trim() ? (
                            <span className="line-clamp-2 text-sm text-muted-foreground">
                              {row.role}
                            </span>
                          ) : null}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          ref={containerRef}
          className="min-h-[480px] min-h-0 min-w-0 flex-1 w-full bg-background"
        />
        <div
          className="pointer-events-none absolute right-2 bottom-2 z-10 rounded-md border border-border bg-background/95 px-2 py-1 text-xs tabular-nums text-muted-foreground shadow-sm backdrop-blur-sm"
          aria-live="polite"
        >
          Масштаб {zoomPercent}%
        </div>
      </div>

      <Sheet open={detailOpen} onOpenChange={onDetailOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md"
        >
          {detailStaff ? (
            <>
              <SheetHeader>
                <div className="flex flex-row items-start gap-4">
                  <StaffAvatar
                    member={detailStaff}
                    className="size-14 text-base"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <SheetTitle className="flex flex-wrap items-center gap-2 text-base leading-snug">
                      {formatFio(detailStaff)}
                      {detailStaff.isUnitHead ? (
                        <span className={unitHeadTagClass}>Руководитель</span>
                      ) : null}
                    </SheetTitle>
                  </div>
                </div>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Должность</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detailStaff.position}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Подразделение
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getBreadcrumb(ORG_ROOT, detailStaff.unitId)
                      .filter((u) => u.id !== ORG_ROOT.id)
                      .map((u) => u.name)
                      .join(" / ")}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground">Логин</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detailStaff.login ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Часовой пояс
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detailStaff.timezone ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Стаж в банке
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detailStaff.bankTenure ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    День рождения
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detailStaff.birthday ?? "—"}
                  </p>
                </div>
                <Separator />
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-foreground">Контакты</p>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Рабочая электронная почта
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detailStaff.contacts?.workEmail ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Городской номер
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detailStaff.contacts?.cityPhone ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Внутренний номер
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detailStaff.contacts?.internalPhone ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Адрес
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detailStaff.contacts?.address ?? "—"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-foreground">
                    Руководители
                  </p>
                  {staffLineManagers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {staffLineManagers.map((m) => (
                        <li key={m.id}>
                          <div className="flex min-w-0 items-start gap-3">
                            <StaffAvatar
                              member={m}
                              className="size-10 shrink-0 text-sm"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-snug">
                                {formatFio(m)}
                              </p>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {m.position}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : detailUnit ? (
            <>
              <SheetHeader>
                <SheetTitle className="pr-8 text-base leading-snug">
                  {detailUnit.name}
                </SheetTitle>
                <SheetDescription className="text-sm">
                  {unitLabel(detailUnit)}
                  {detailUnit.id !== ORG_ROOT.id
                    ? ` · ${activityDirectionLabel(detailUnit.id)}`
                    : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Путь</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getBreadcrumb(ORG_ROOT, detailUnit.id)
                      .filter((u) => u.id !== ORG_ROOT.id)
                      .map((u) => u.name)
                      .join(" / ")}
                  </p>
                </div>
                {(() => {
                  const h = STAFF.find(
                    (s) => s.unitId === detailUnit.id && s.isUnitHead
                  )
                  return h ? (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-primary">
                          Руководитель
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatFio(h)} — {h.position}
                        </p>
                      </div>
                    </>
                  ) : null
                })()}
                <Separator />
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>
                    В поддереве:{" "}
                    <span className="font-medium tabular-nums text-foreground">
                      {countStaffInSubtree(detailUnit, STAFF)}
                    </span>{" "}
                    чел.
                  </p>
                  <p>
                    На узле:{" "}
                    <span className="font-medium tabular-nums text-foreground">
                      {countStaffDirect(detailUnit, STAFF)}
                    </span>{" "}
                    чел.
                  </p>
                  <p>
                    Дочерних подразделений:{" "}
                    <span className="font-medium tabular-nums text-foreground">
                      {detailUnit.children.length}
                    </span>
                  </p>
                </div>
                {detailUnit.children.length > 0 ? (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Входит в состав
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                        {detailUnit.children.map((c) => (
                          <li key={c.id}>· {c.name}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
