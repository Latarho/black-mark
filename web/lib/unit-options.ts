import type { OrgUnit } from "@/lib/bank-org-mock"

export type UnitOption = {
  id: string
  path: string
}

export function collectUnitOptions(root: OrgUnit): UnitOption[] {
  const options: UnitOption[] = []

  const walk = (node: OrgUnit, path: string[]) => {
    for (const child of node.children) {
      const childPath = [...path, child.name]
      options.push({ id: child.id, path: childPath.join(" / ") })
      walk(child, childPath)
    }
  }

  walk(root, [root.name])
  return options
}

export function getSelectedUnitsLabel(
  selectedUnitIds: string[],
  unitOptions: UnitOption[]
): string {
  if (selectedUnitIds.length === 0) return "Все подразделения"
  if (selectedUnitIds.length === 1) {
    const [unitId] = selectedUnitIds
    return unitOptions.find((unit) => unit.id === unitId)?.path || unitId
  }
  return `Выбрано подразделений: ${selectedUnitIds.length}`
}
