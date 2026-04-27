import { ORG_ROOT, type OrgUnit, type StaffMember } from "@/lib/bank-org-mock"

/** Классы тона букв/аватаров (по id сотрудника) — согласовано между страницей оценки и орг-структурой. */
export const STAFF_TONE_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
] as const

export const STAFF_TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export const sspVspTagClass =
  "inline-flex shrink-0 items-center rounded border border-sky-400/40 bg-sky-500/10 px-1.5 py-px text-sm font-semibold uppercase leading-none text-sky-700 dark:border-sky-500/45 dark:bg-sky-500/15 dark:text-sky-300"

/** Тег «Руководитель» (списки, дроуер, маркер на карточке оргграфа). */
export const unitHeadTagClass =
  "inline-flex shrink-0 items-center rounded-md border border-primary/45 bg-primary/12 px-1.5 py-px text-sm font-semibold uppercase leading-none text-primary"

export function orgUnitLevelLabel(level: OrgUnit["level"]): string {
  switch (level) {
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

export function unitLabel(unit: OrgUnit): string {
  if (unit.id === ORG_ROOT.id) return "Структура"
  return orgUnitLevelLabel(unit.level)
}

export function formatFioMember(s: StaffMember): string {
  return `${s.lastName} ${s.firstName} ${s.patronymic}`
}

export function formatFioParts(
  lastName: string,
  firstName: string,
  patronymic: string
): string {
  return `${lastName} ${firstName} ${patronymic}`
}

/** Две буквы — фамилия и имя; для списков и «орг»-аватаров. */
export function staffAvatarInitials(s: StaffMember): string {
  const a = s.lastName.trim().at(0) ?? ""
  const b = s.firstName.trim().at(0) ?? ""
  return `${a}${b}`.toUpperCase()
}

/**
 * До двух инициалов из частей ФИО (как в таблице оценки).
 * Сознательно отличается от {@link staffAvatarInitials} — иначе поменяется отображение.
 */
export function assessmentDisplayInitials(
  lastName: string,
  firstName: string,
  patronymic: string
): string {
  const parts = [lastName, firstName, patronymic].filter(Boolean)
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2)
}

export function avatarToneClass(staffId: string): string {
  let hash = 0
  for (let i = 0; i < staffId.length; i++) {
    hash = (hash * 31 + staffId.charCodeAt(i)) | 0
  }
  const ix = Math.abs(hash) % STAFF_TONE_CLASSES.length
  return STAFF_TONE_CLASSES[ix]
}
