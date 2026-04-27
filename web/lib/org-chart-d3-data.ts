import {
  ORG_ROOT,
  STAFF,
  activityDirectionLabel,
  type OrgUnit,
  type StaffMember,
  getBreadcrumb,
} from "@/lib/bank-org-mock"
import { formatFioMember, orgUnitLevelLabel, staffAvatarInitials } from "@/lib/staff-presentation"

export type D3OrgChartRowKind = "unit" | "staff"

/** Плоские узлы для d3-org-chart: id + parentId (как в ORG_ROOT и STAFF). */
export type D3OrgChartRow = {
  id: string
  parentId: string | null
  name: string
  role: string
  kind: D3OrgChartRowKind
  unitLevel?: OrgUnit["level"]
  /** Инициалы для аватарки; только у `kind: "staff"`. */
  initials?: string
  /** Узел подразделения: ФИО руководителя (если есть сотрудники в демо-данных). */
  headFio?: string
  /** Руководитель подразделения в списке сотрудников на графе. */
  isUnitHead?: boolean
}

function collectUnits(
  node: OrgUnit,
  parentId: string | null,
  out: D3OrgChartRow[]
): void {
  out.push({
    id: node.id,
    parentId,
    name: node.name,
    role: "",
    kind: "unit",
    unitLevel: node.level,
  })
  for (const c of node.children) {
    collectUnits(c, node.id, out)
  }
}

export function buildD3OrgChartRows(): D3OrgChartRow[] {
  const rows: D3OrgChartRow[] = []
  collectUnits(ORG_ROOT, null, rows)
  for (const s of STAFF) {
    rows.push({
      id: s.id,
      parentId: s.unitId,
      name: formatFioMember(s),
      role: s.position,
      kind: "staff",
      initials: staffAvatarInitials(s),
      ...(s.isUnitHead ? { isUnitHead: true as const } : {}),
    })
  }

  const headByUnit = new Map<string, StaffMember>()
  for (const s of STAFF) {
    if (s.isUnitHead) headByUnit.set(s.unitId, s)
  }
  return rows.map((r) => {
    if (r.kind !== "unit") return r
    const h = headByUnit.get(r.id)
    if (!h) return r
    return { ...r, headFio: formatFioMember(h) }
  })
}

/** Текст для поиска: название, должность/роль, инициалы, цепочка подразделений. */
export function getOrgChartRowSearchBlob(row: D3OrgChartRow): string {
  const parts = [row.name]
  if (row.kind === "staff") {
    parts.push(row.role)
    if (row.isUnitHead) parts.push("руководитель")
  } else if (row.kind === "unit" && row.unitLevel) {
    parts.push(orgUnitLevelLabel(row.unitLevel))
    if (row.id !== ORG_ROOT.id) {
      parts.push(activityDirectionLabel(row.id), "направление деятельности")
    }
    if (row.headFio) parts.push(row.headFio, "руководитель")
  }
  if (row.initials) parts.push(row.initials)
  const anchorId =
    row.kind === "staff" ? (row.parentId ?? row.id) : row.id
  const path = getBreadcrumb(ORG_ROOT, anchorId)
    .filter((u) => u.id !== ORG_ROOT.id)
    .map((u) => u.name)
    .join(" ")
  parts.push(path)
  return parts.join(" ").toLowerCase()
}

export function searchOrgChartRows(
  rows: D3OrgChartRow[],
  query: string,
  limit = 30
): D3OrgChartRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return rows.filter((r) => getOrgChartRowSearchBlob(r).includes(q)).slice(0, limit)
}
