import { describe, expect, it } from "vitest"

import type { StaffMember } from "@/lib/bank-org-mock"
import {
  formatMinutesToHourMinute,
  getAssessmentGrade,
  getMatrixCellRows,
  makeNineBoxBuckets,
} from "@/lib/assessment-model"

function staffMember(overrides: Partial<StaffMember>): StaffMember {
  return {
    id: "s-1",
    unitId: "u-1",
    lastName: "Иванов",
    firstName: "Иван",
    patronymic: "Иванович",
    position: "Специалист",
    personnelNumber: "0001",
    ...overrides,
  }
}

describe("assessment model", () => {
  it("keeps matrix row ordering compatible with the current UI", () => {
    expect(getMatrixCellRows(3, 3, false)).toEqual([
      [6, 7, 8],
      [3, 4, 5],
      [0, 1, 2],
    ])

    expect(getMatrixCellRows(4, 3, true)).toEqual([
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
    ])
  })

  it("maps manager assessment inputs to the same A-E scale", () => {
    expect(getAssessmentGrade("key", "high")).toBe("A")
    expect(getAssessmentGrade("core", "low")).toBe("C")
    expect(getAssessmentGrade("second-chance", "high")).toBe("D")
    expect(getAssessmentGrade("not-evaluated", "low")).toBe("E")
  })

  it("formats overtime minutes as HH:mm", () => {
    expect(formatMinutesToHourMinute(125)).toBe("02:05")
    expect(formatMinutesToHourMinute()).toBe("00:00")
    expect(formatMinutesToHourMinute(-1)).toBe("00:00")
  })

  it("buckets survey matrix members by result and interaction categories", () => {
    const member = staffMember({
      surveyResultCategory: "top",
      surveyInteractionCategory: "bottom",
    })

    const buckets = makeNineBoxBuckets([member], "survey-nine-box", {}, {}, {})

    expect(buckets[2]).toEqual([member])
    expect(buckets.flat()).toHaveLength(1)
  })
})
