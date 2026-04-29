import { describe, expect, it } from "vitest"

import type { OrgUnit } from "@/lib/bank-org-mock"
import { collectUnitOptions, getSelectedUnitsLabel } from "@/lib/unit-options"

const orgTree: OrgUnit = {
  id: "root",
  level: "department",
  name: "Банк",
  children: [
    {
      id: "dep",
      level: "department",
      name: "Департамент",
      children: [
        {
          id: "office",
          level: "office",
          name: "Отдел",
          children: [],
        },
      ],
    },
  ],
}

describe("unit options", () => {
  it("collects child units with full breadcrumb path", () => {
    expect(collectUnitOptions(orgTree)).toEqual([
      { id: "dep", path: "Банк / Департамент" },
      { id: "office", path: "Банк / Департамент / Отдел" },
    ])
  })

  it("formats selected unit label without leaking implementation details", () => {
    const options = collectUnitOptions(orgTree)

    expect(getSelectedUnitsLabel([], options)).toBe("Все подразделения")
    expect(getSelectedUnitsLabel(["office"], options)).toBe("Банк / Департамент / Отдел")
    expect(getSelectedUnitsLabel(["dep", "office"], options)).toBe("Выбрано подразделений: 2")
  })
})
