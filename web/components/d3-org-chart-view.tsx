"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Building2Icon, SearchIcon, UserIcon, XIcon } from "lucide-react"
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
import { buildOrgChartNodeHtml } from "@/lib/d3-org-chart-node-html"
import {
  formatFioMember,
  sspVspTagClass,
  unitHeadTagClass,
  unitLabel,
} from "@/lib/staff-presentation"
import { StaffMemberAvatar } from "@/components/staff-member-avatar"
import { cn } from "@/lib/utils"

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
  const chartData = React.useMemo(() => buildD3OrgChartRows(), [])

  const [search, setSearch] = React.useState("")
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [listOpen, setListOpen] = React.useState(false)

  const closeSearchPanel = React.useCallback(() => {
    setSearchOpen(false)
    setListOpen(false)
    setSearch("")
  }, [])

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
      if (!el?.contains(e.target as Node)) {
        setListOpen(false)
        setSearchOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  React.useEffect(() => {
    if (!searchOpen) return
    const id = requestAnimationFrame(() => {
      document.getElementById("org-chart-search-input")?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [searchOpen])

  React.useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.innerHTML = ""

    const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"
    const cardBg = isDark ? "oklch(0.22 0.006 56)" : "oklch(1 0 0)"
    const muted = isDark ? "oklch(0.72 0.01 56)" : "oklch(0.55 0.013 58)"
    const title = isDark ? "oklch(0.98 0.001 106)" : "oklch(0.15 0.004 49)"
    const staffBg = isDark ? "oklch(0.26 0.007 34)" : "oklch(0.97 0.001 106)"
    const rect0 = el.getBoundingClientRect()
    /** Не подставлять 800px при width=0 — иначе SVG шире колонки и появляется горизонтальный скролл страницы. */
    const svgW0 = rect0.width > 0 ? rect0.width : 320
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
        /** Высота карточки сотрудника (иконка руководителя — внутри той же высоты) */
        if (row.kind === "staff") return 70
        return row.headFio ? 94 : 78
      })
      .childrenMargin(() => 40)
      .siblingsMargin(() => 16)
      .neighbourMargin(() => 24)
      .nodeContent((d: { data: Record<string, unknown> }) =>
        buildOrgChartNodeHtml({
          raw: d.data,
          isDark,
          theme: { border, cardBg, muted, title, staffBg },
        })
      )
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
      .nodeUpdate(function nodeHighlightStyle(this: SVGGElement) {
        const baseRect = this.querySelector(".node-rect")
        if (!baseRect) return
        baseRect.setAttribute("stroke", "none")
        this.querySelector(".node-highlight-ring")?.remove()
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
    setSearchOpen(false)
    requestAnimationFrame(() => {
      syncZoomFromChart()
    })
  }, [syncZoomFromChart])

  const onSearchKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setListOpen(false)
        setSearchOpen(false)
        setSearch("")
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
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div
          ref={containerRef}
          className="min-h-[480px] min-h-0 min-w-0 flex-1 w-full overflow-hidden bg-background"
        />
        <div className="pointer-events-none absolute top-2 right-2 left-2 z-30 flex justify-end">
          <div
            ref={searchWrapRef}
            className={cn(
              "pointer-events-auto relative",
              searchOpen && "w-full max-w-md"
            )}
          >
            {!searchOpen ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shrink-0 border-border bg-background/95 shadow-sm backdrop-blur-sm"
                aria-label="Открыть поиск по органиграмме"
                aria-expanded={false}
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon className="size-4" />
              </Button>
            ) : (
              <div className="flex animate-in fade-in slide-in-from-right-3 duration-200 flex-row items-center gap-1 rounded-md border border-border bg-background/95 p-0.5 pr-0 shadow-sm backdrop-blur-sm">
                <div className="relative min-w-0 flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="org-chart-search-input"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setListOpen(true)
                    }}
                    onFocus={() => setListOpen(true)}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Подразделение или сотрудник…"
                    className="h-8 border-0 bg-transparent pl-8 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                    aria-autocomplete="list"
                    aria-expanded={showList}
                    aria-controls="org-chart-search-results"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Закрыть поиск"
                  onClick={closeSearchPanel}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            )}
            {showList && searchOpen ? (
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
                      <li key={row.id} role="option" aria-selected={false}>
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
        <div
          className="pointer-events-none absolute right-2 bottom-2 z-10 rounded-md border border-border bg-background/95 px-2 py-1.5 text-sm tabular-nums text-muted-foreground shadow-sm backdrop-blur-sm"
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
                  <StaffMemberAvatar
                    member={detailStaff}
                    className="size-14 text-base"
                    initials="staff"
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <SheetTitle className="flex flex-wrap items-center gap-2 text-base leading-snug">
                      {formatFioMember(detailStaff)}
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
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Рабочая электронная почта
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detailStaff.contacts?.workEmail ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Городской номер
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detailStaff.contacts?.cityPhone ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Внутренний номер
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detailStaff.contacts?.internalPhone ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
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
                            <StaffMemberAvatar
                              member={m}
                              className="size-10 shrink-0 text-sm"
                              initials="staff"
                              aria-hidden
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-snug">
                                {formatFioMember(m)}
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
                          {formatFioMember(h)} — {h.position}
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
