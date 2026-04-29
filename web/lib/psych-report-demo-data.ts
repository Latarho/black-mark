import rawPsychReportDemo from "@/lib/psych-report-demo.json"
import type { PsychPersonalReport } from "@/lib/psych-report-types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function assertPsychPersonalReport(
  value: unknown
): asserts value is PsychPersonalReport {
  if (!isRecord(value)) {
    throw new Error("Psych report demo must be an object")
  }

  const requiredKeys = [
    "participant",
    "report",
    "short_conclusions",
    "key_competences",
    "sections",
    "preferred_role",
  ] as const

  for (const key of requiredKeys) {
    if (!(key in value)) {
      throw new Error(`Psych report demo is missing "${key}"`)
    }
  }

  if (
    !isRecord(value.participant) ||
    !isRecord(value.report) ||
    !Array.isArray(value.short_conclusions) ||
    !Array.isArray(value.key_competences) ||
    !Array.isArray(value.sections) ||
    !isRecord(value.preferred_role)
  ) {
    throw new Error("Psych report demo has an unexpected top-level shape")
  }
}

assertPsychPersonalReport(rawPsychReportDemo)

export const psychReportDemo = rawPsychReportDemo
