import { describe, expect, it } from "vitest"

import { searchOrgChartRows, type D3OrgChartRow } from "@/lib/org-chart-d3-data"

const rows: D3OrgChartRow[] = [
  {
    id: "staff-1",
    parentId: "unit-1",
    name: "Иванов Иван",
    role: "Аналитик",
    kind: "staff",
    initials: "ИИ",
  },
  {
    id: "staff-2",
    parentId: "unit-1",
    name: "Петров Пётр",
    role: "Разработчик",
    kind: "staff",
    initials: "ПП",
    isUnitHead: true,
  },
]

describe("org chart search", () => {
  it("searches by role, initials and head marker", () => {
    expect(searchOrgChartRows(rows, "аналитик")).toEqual([rows[0]])
    expect(searchOrgChartRows(rows, "ПП")).toEqual([rows[1]])
    expect(searchOrgChartRows(rows, "руководитель")).toEqual([rows[1]])
  })

  it("respects result limit", () => {
    expect(searchOrgChartRows(rows, "staff", 1)).toHaveLength(0)
    expect(searchOrgChartRows(rows, "п", 1)).toHaveLength(1)
  })
})
