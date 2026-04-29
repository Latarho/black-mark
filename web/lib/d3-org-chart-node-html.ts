import { ORG_ROOT, activityDirectionLabel } from "@/lib/bank-org-mock"
import type { D3OrgChartRow } from "@/lib/org-chart-d3-data"

/** Lucide `shield-user` — маркер руководителя в карточке сотрудника (foreignObject). */
const STAFF_HEAD_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M6.376 18.91a6 6 0 0 1 11.249.003"/><circle cx="12" cy="11" r="4"/></svg>`

const STAFF_HEAD_ICON_WRAP_STYLE =
  "position:absolute;top:2px;right:3px;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:22px;height:22px;border-radius:var(--radius-md);border:1px solid color-mix(in oklch, var(--primary) 45%, transparent);color:var(--primary);background:color-mix(in oklch, var(--primary) 12%, transparent);"

export const HIGHLIGHT_STROKE = "#e11d48"
export const HIGHLIGHT_RING_WIDTH_PX = 2

export type OrgChartNodeHtmlTheme = {
  border: string
  cardBg: string
  muted: string
  title: string
  staffBg: string
}

export function escapeOrgChartHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
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

export function buildOrgChartNodeHtml({
  raw,
  isDark,
  theme,
}: {
  raw: Record<string, unknown>
  isDark: boolean
  theme: OrgChartNodeHtmlTheme
}): string {
  const row = raw as D3OrgChartRow
  const isStaff = row.kind === "staff"
  const bg = isStaff ? theme.staffBg : theme.cardBg
  const hi = Boolean(raw._highlighted || raw._upToTheRootHighlighted)
  const hiRing = hi
    ? `box-shadow:0 0 0 ${HIGHLIGHT_RING_WIDTH_PX}px ${HIGHLIGHT_STROKE};`
    : ""

  if (isStaff && row.initials) {
    const { bg: avBg, fg: avFg } = staffAvatarTone(row.id, isDark)
    const head = row.isUnitHead
    const headIconBlock = head
      ? `<span role="img" title="Руководитель подразделения" aria-label="Руководитель подразделения" style="${STAFF_HEAD_ICON_WRAP_STYLE}">${STAFF_HEAD_ICON_SVG}</span>`
      : ""
    return `
          <div style="position:relative;display:flex;flex-direction:column;justify-content:flex-start;width:100%;height:fit-content;max-height:100%;box-sizing:border-box;border:1px solid ${theme.border};border-radius:8px;background:${bg};padding:7px 6px 7px;${hiRing}">
            ${headIconBlock}
            <div style="display:flex;width:100%;flex-direction:row;align-items:flex-start;gap:5px;flex:0 0 auto;">
            <div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;line-height:1;background:${avBg};color:${avFg};border:1px solid ${theme.border};">${escapeOrgChartHtml(row.initials)}</div>
            <div style="flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:flex-start;gap:1px;${head ? "padding-right:28px;box-sizing:border-box;" : ""}">
              <div style="font-size:11px;font-weight:600;line-height:1.15;color:${theme.title};">${escapeOrgChartHtml(row.name)}</div>
              <div style="font-size:11px;line-height:1.22;color:${theme.muted};overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeOrgChartHtml(row.role)}</div>
            </div>
            </div>
          </div>`
  }

  const showActivityTag = row.id !== ORG_ROOT.id && row.unitLevel != null
  const tag = showActivityTag ? activityDirectionLabel(row.id) : ""
  const tagBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"
  const tagBlock = showActivityTag
    ? `<span style="flex-shrink:0;font-size:14px;font-weight:600;line-height:1;padding:1px 6px;border-radius:var(--radius-sm);border:1px solid ${theme.border};color:${theme.muted};background:${tagBg};">${escapeOrgChartHtml(tag)}</span>`
    : ""
  const headBlock = row.headFio
    ? `<div style="margin-top:3px;font-size:11px;line-height:1.25;color:${theme.muted};overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;"><span style="font-weight:600;color:var(--primary);">Руководитель: </span>${escapeOrgChartHtml(row.headFio)}</div>`
    : ""
  return `
          <div style="padding:7px 12px;width:100%;height:100%;box-sizing:border-box;border:2px solid ${theme.border};border-radius:10px;background:${bg};display:flex;flex-direction:column;justify-content:center;${hiRing}">
            <div style="display:flex;align-items:flex-start;gap:8px;min-width:0;">
              <div style="flex:1;min-width:0;font-size:14px;font-weight:600;line-height:1.22;color:${theme.title};">${escapeOrgChartHtml(row.name)}</div>${tagBlock}
            </div>${headBlock}
          </div>`
}
