export type OrgLevel = "department" | "management" | "office"

/** Направление деятельности подразделения (тег на графе и в списках). */
export type ActivityDirection =
  | "finance"
  | "risk"
  | "hr"
  | "it"
  | "operations"
  | "other"

export const ACTIVITY_DIRECTION_LABELS: Record<ActivityDirection, string> = {
  finance: "Финансы",
  risk: "Риски",
  hr: "HR",
  it: "IT",
  operations: "Операции",
  other: "Прочее",
}

/**
 * Определяет направление по id узла (иерархия демо-дерева: корпоратив, риски, ИТ, операции).
 * HR и «Прочее» — для корня и нераспознанных id.
 */
export function getActivityDirection(unitId: string): ActivityDirection {
  if (unitId === "root") return "other"
  /** Демо: региональные клиенты — отдельный тег HR. */
  if (unitId === "m-corp-regional") return "hr"
  if (
    unitId === "d-corp" ||
    unitId.startsWith("m-corp") ||
    unitId.startsWith("o-corp")
  ) {
    return "finance"
  }
  if (
    unitId === "d-risk" ||
    unitId.startsWith("m-risk") ||
    unitId.startsWith("o-risk")
  ) {
    return "risk"
  }
  if (unitId === "d-it" || unitId.startsWith("m-it") || unitId.startsWith("o-it")) {
    return "it"
  }
  if (
    unitId === "d-ops" ||
    unitId.startsWith("m-ops") ||
    unitId.startsWith("o-ops")
  ) {
    return "operations"
  }
  return "other"
}

export function activityDirectionLabel(unitId: string): string {
  return ACTIVITY_DIRECTION_LABELS[getActivityDirection(unitId)]
}

export interface OrgUnit {
  id: string
  level: OrgLevel
  name: string
  children: OrgUnit[]
}

export interface StaffMember {
  id: string
  unitId: string
  lastName: string
  firstName: string
  patronymic: string
  position: string
  personnelNumber: string
  /** Руководитель своего подразделения (первый в списке сотрудников узла). */
  isUnitHead?: boolean
  /** Демо-профиль для карточки / дроуера */
  login?: string
  timezone?: string
  /** Человекочитаемо, напр. «10 лет 2 месяца» */
  bankTenure?: string
  /** Человекочитаемо, напр. «3 года 7 месяцев» */
  blockTenure?: string
  /** Возраст сотрудника */
  age?: number
  /** Количество дней неиспользованного отпуска */
  unusedVacationDays?: number
  /** Переработки за последний календарный месяц в часах */
  overtimeHoursLastMonth?: number
  /** Чистое время в офисе за 3 последних календарных месяца (в минутах) */
  overtimeOfficeMinutesLast3Months?: number
  /** Общее время работы за компьютером за 3 последних календарных месяца (в минутах) */
  overtimeComputerMinutesLast3Months?: number
  /** Работа за ПК + звонки за 3 последних календарных месяца (в минутах) */
  overtimeComputerAndCallsMinutesLast3Months?: number
  /** Режим работы */
  workMode?: string
  /** Уровень З/П относительно рынка */
  salaryMarketLevel?: "below-median" | "between-median-and-target" | "above-market-max"
  /** Результат опроса по вкладу в результат */
  surveyResultCategory?: "top" | "middle" | "bottom"
  /** Результат опроса по командному взаимодействию */
  surveyInteractionCategory?: "top" | "middle" | "bottom"
  /** Результаты оценки РИТМ */
  rhythmAssessmentResult?: number
  /** Внешняя оценка */
  externalAssessmentResult?: number
  /** Ссылка на PDF с результатами внешней оценки */
  externalAssessmentResultPdf?: string
  /** Провайдер внешней оценки */
  externalAssessmentProvider?: string
  /** Год проведения внешней оценки */
  externalAssessmentYear?: number
  /** Дата пересмотра должности */
  positionReviewDate?: string
  /** Дата пересмотра оклада */
  salaryReviewDate?: string
  /** Флаг участия в ФКР */
  fkrStatus?: "included" | "not-included"
  /** Критичность ситуации */
  criticalitySituation?: "high" | "medium" | "low"
  /** Тестовая демонстрационная оценка сотрудника для 12-box: категория сотрудника */
  managerEmployeeCategory?: "key" | "core" | "second-chance" | "ineffective" | "not-evaluated"
  /** Тестовая демонстрационная оценка сотрудника для 12-box: вероятность увольнения */
  managerResignationProbability?: "low" | "medium" | "high" | "not-evaluated"
  /** Человекочитаемо, напр. «9 октября» */
  birthday?: string
  contacts?: {
    workEmail: string
    cityPhone: string
    internalPhone: string
    address: string
  }
}

const MONTHS_GEN = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const

function pluralRuYears(n: number): string {
  const m = n % 100
  if (m >= 11 && m <= 14) return "лет"
  const r = n % 10
  if (r === 1) return "год"
  if (r >= 2 && r <= 4) return "года"
  return "лет"
}

function pluralRuMonths(n: number): string {
  const m = n % 100
  if (m >= 11 && m <= 14) return "месяцев"
  const r = n % 10
  if (r === 1) return "месяц"
  if (r >= 2 && r <= 4) return "месяца"
  return "месяцев"
}

const EXTERNAL_ASSESSMENT_YEAR = new Date().getFullYear()

function demoProfileForStaff(
  _unitId: string,
  i: number,
  base: number
): Pick<
  StaffMember,
  | "login"
  | "timezone"
  | "bankTenure"
  | "blockTenure"
  | "age"
  | "overtimeHoursLastMonth"
  | "overtimeOfficeMinutesLast3Months"
  | "overtimeComputerMinutesLast3Months"
  | "overtimeComputerAndCallsMinutesLast3Months"
  | "workMode"
  | "unusedVacationDays"
  | "salaryMarketLevel"
  | "surveyResultCategory"
  | "surveyInteractionCategory"
  | "rhythmAssessmentResult"
  | "externalAssessmentResult"
  | "externalAssessmentResultPdf"
  | "externalAssessmentProvider"
  | "externalAssessmentYear"
  | "positionReviewDate"
  | "salaryReviewDate"
  | "fkrStatus"
  | "criticalitySituation"
  | "managerEmployeeCategory"
  | "managerResignationProbability"
  | "birthday"
  | "contacts"
> {
  const h = base + i * 13
  const day = 1 + (h % 28)
  const monthIx = h % 12
  const years = 2 + (h % 28)
  const months = h % 12
  const blockYears = 1 + (h % 11)
  const blockMonths = (h * 2) % 12
  const age = 22 + (h % 37)
  const unusedVacationDays = 5 + (h % 45)
  const overtimeHoursLastMonth = h % 30
  const overtimeOfficeMinutesLast3Months = 120 + (h % 540)
  const overtimeComputerMinutesLast3Months = overtimeOfficeMinutesLast3Months + 45 + (h % 120)
  const overtimeComputerAndCallsMinutesLast3Months =
    overtimeComputerMinutesLast3Months + 30 + (h % 180)
  const workMode = ["гибкий режим", "офисный режим", "гибридный режим"][h % 3]
  const salaryMarketLevel: StaffMember["salaryMarketLevel"] = ([
    "below-median",
    "between-median-and-target",
    "above-market-max",
  ] as const)[h % 3]
  const surveyResultCategory: StaffMember["surveyResultCategory"] = (["top", "middle", "bottom"] as const)[h % 3]
  const surveyInteractionCategory: StaffMember["surveyInteractionCategory"] = (["bottom", "middle", "top"] as const)[h % 3]
  const rhythmAssessmentResult = 1 + (h % 5)
  const externalAssessmentResult = 1 + ((h + 2) % 5)
  const externalAssessmentResultPdf = `/reports/external-assessment-${h}.pdf`
  const externalAssessmentProvider = ["РРК", "Korn Ferry", "Hays", "Mercer"][h % 4]
  const externalAssessmentYear = EXTERNAL_ASSESSMENT_YEAR
  const positionReviewDate = `${String(1 + (h % 28)).padStart(2, "0")}.${String((h % 12) + 1).padStart(2, "0")}.${EXTERNAL_ASSESSMENT_YEAR - (h % 3)}`
  const salaryReviewDate = `${String(1 + ((h + 10) % 28)).padStart(2, "0")}.${String((h * 2 % 12) + 1).padStart(2, "0")}.${EXTERNAL_ASSESSMENT_YEAR - ((h + 1) % 2)}`
  const fkrStatus: StaffMember["fkrStatus"] = h % 2 === 0 ? "included" : "not-included"
  const criticalitySituation: StaffMember["criticalitySituation"] = (["high", "medium", "low"] as const)[h % 3]
  const managerEmployeeCategory: NonNullable<StaffMember["managerEmployeeCategory"]> = ([
    "not-evaluated",
    "key",
    "core",
    "second-chance",
    "ineffective",
  ] as const)[h % 5]
  const managerResignationProbability: NonNullable<StaffMember["managerResignationProbability"]> = ([
    "not-evaluated",
    "low",
    "medium",
    "high",
  ] as const)[h % 4]
  const emailLocal = `user${(h % 90000) + 10000}`
  const tenureParts = [`${years} ${pluralRuYears(years)}`]
  if (months > 0) tenureParts.push(`${months} ${pluralRuMonths(months)}`)
  const blockTenureParts = [`${blockYears} ${pluralRuYears(blockYears)}`]
  if (blockMonths > 0) blockTenureParts.push(`${blockMonths} ${pluralRuMonths(blockMonths)}`)
  return {
    login: `gpbu\\${emailLocal}`,
    timezone: "МСК +0",
    bankTenure: tenureParts.join(" "),
    blockTenure: blockTenureParts.join(" "),
    age,
    unusedVacationDays,
    overtimeHoursLastMonth,
    overtimeOfficeMinutesLast3Months,
    overtimeComputerMinutesLast3Months,
    overtimeComputerAndCallsMinutesLast3Months,
    workMode,
    salaryMarketLevel,
    surveyResultCategory,
    surveyInteractionCategory,
    rhythmAssessmentResult,
    externalAssessmentResult,
    externalAssessmentResultPdf,
    externalAssessmentProvider,
    externalAssessmentYear,
    positionReviewDate,
    salaryReviewDate,
    fkrStatus,
    criticalitySituation,
    managerEmployeeCategory,
    managerResignationProbability,
    birthday: `${day} ${MONTHS_GEN[monthIx]}`,
    contacts: {
      workEmail: `${emailLocal}@corp.bank`,
      cityPhone: `+7 (495) ${200 + (h % 800)}-${String(10 + (h % 89)).padStart(2, "0")}-${String(10 + (h % 89)).padStart(2, "0")}`,
      internalPhone: `${100 + (h % 900)}-${String(10 + (h % 89)).padStart(2, "0")}-${String(10 + (h % 89)).padStart(2, "0")}`,
      address: "Москва, Пресненская наб., 12",
    },
  }
}

export const ORG_ROOT: OrgUnit = {
  id: "root",
  level: "department",
  name: "Головной ОФИС",
  children: [
      {
        id: "d-corp",
        level: "department",
        name: "Департамент корпоративного бизнеса",
        children: [
          {
            id: "m-corp-credit",
            level: "management",
            name: "Управление корпоративного кредитования",
            children: [
              {
                id: "o-corp-deals",
                level: "office",
                name: "Отдел сопровождения сделок",
                children: [],
              },
              {
                id: "o-corp-struct",
                level: "office",
                name: "Отдел структурного финансирования",
                children: [],
              },
            ],
          },
          {
            id: "m-corp-regional",
            level: "management",
            name: "Управление региональных корпоративных клиентов",
            children: [],
          },
          {
            id: "m-corp-treasury-sales",
            level: "management",
            name: "Управление казначейских продуктов для юрлиц",
            children: [
              {
                id: "o-corp-deriv",
                level: "office",
                name: "Отдел производных инструментов",
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: "d-risk",
        level: "department",
        name: "Департамент управления рисками",
        children: [
          {
            id: "m-risk-credit",
            level: "management",
            name: "Управление кредитных рисков",
            children: [
              {
                id: "o-risk-underwriting",
                level: "office",
                name: "Отдел андеррайтинга",
                children: [],
              },
              {
                id: "o-risk-portfolio",
                level: "office",
                name: "Отдел портфельного контроля",
                children: [],
              },
            ],
          },
          {
            id: "m-risk-market",
            level: "management",
            name: "Управление рыночных рисков",
            children: [],
          },
        ],
      },
      {
        id: "d-it",
        level: "department",
        name: "Департамент информационных технологий",
        children: [
          {
            id: "m-it-dev",
            level: "management",
            name: "Управление разработки",
            children: [
              {
                id: "o-it-payments",
                level: "office",
                name: "Отдел платёжных сервисов",
                children: [],
              },
              {
                id: "o-it-channels",
                level: "office",
                name: "Отдел дистанционных каналов",
                children: [],
              },
            ],
          },
          {
            id: "m-it-infra",
            level: "management",
            name: "Управление инфраструктуры и эксплуатации",
            children: [],
          },
          {
            id: "m-it-security",
            level: "management",
            name: "Управление информационной безопасности",
            children: [
              {
                id: "o-it-soc",
                level: "office",
                name: "Отдел мониторинга SOC",
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: "d-ops",
        level: "department",
        name: "Департамент операций и расчётов",
        children: [
          {
            id: "m-ops-payments",
            level: "management",
            name: "Управление платёжных операций",
            children: [
              {
                id: "o-ops-rko",
                level: "office",
                name: "Отдел расчётно-кассового обслуживания",
                children: [],
              },
              {
                id: "o-ops-swift",
                level: "office",
                name: "Отдел межбанковских сообщений и ВЭД",
                children: [],
              },
            ],
          },
          {
            id: "m-ops-cards",
            level: "management",
            name: "Управление карточного бизнеса",
            children: [],
          },
        ],
      },
    ],
}

const LAST_NAMES = [
  "Иванов",
  "Смирнов",
  "Кузнецов",
  "Попов",
  "Васильев",
  "Петров",
  "Соколов",
  "Михайлов",
  "Новиков",
  "Фёдоров",
  "Морозов",
  "Волков",
  "Алексеев",
  "Лебедев",
  "Семёнов",
  "Егоров",
  "Павлов",
  "Козлов",
  "Степанов",
  "Николаев",
]

const FIRST_NAMES_M = [
  "Александр",
  "Дмитрий",
  "Максим",
  "Сергей",
  "Андрей",
  "Алексей",
  "Илья",
  "Кирилл",
  "Михаил",
  "Никита",
  "Павел",
  "Роман",
  "Евгений",
  "Артём",
  "Игорь",
]

const FIRST_NAMES_F = [
  "Анна",
  "Мария",
  "Елена",
  "Ольга",
  "Татьяна",
  "Наталья",
  "Ирина",
  "Светлана",
  "Екатерина",
  "Юлия",
  "Виктория",
  "Дарья",
  "Полина",
  "Алина",
  "София",
]

const PATRONYMICS_M = [
  "Александрович",
  "Дмитриевич",
  "Сергеевич",
  "Андреевич",
  "Игоревич",
  "Павлович",
  "Николаевич",
  "Владимирович",
  "Алексеевич",
  "Михайлович",
]

const PATRONYMICS_F = [
  "Александровна",
  "Дмитриевна",
  "Сергеевна",
  "Андреевна",
  "Игоревна",
  "Павловна",
  "Николаевна",
  "Владимировна",
  "Алексеевна",
  "Михайловна",
]

const POSITIONS: Record<string, string[]> = {
  "o-corp-deals": [
    "Ведущий менеджер сопровождения сделок",
    "Менеджер по работе с крупными заёмщиками",
    "Специалист кредитной документации",
    "Аналитик сделок LMA",
  ],
  "o-corp-struct": [
    "Руководитель направления структурного финансирования",
    "Финансовый аналитик",
    "Менеджер проектного финансирования",
  ],
  "m-corp-regional": [
    "Руководитель клиентской группы",
    "Менеджер корпоративного бизнеса",
    "Старший менеджер по привлечению",
    "Клиентский менеджер МСБ+",
  ],
  "o-corp-deriv": [
    "Дилер казначейских продуктов",
    "Специалист по хеджированию",
    "Аналитик рыночных рисков (казначейство)",
  ],
  "o-risk-underwriting": [
    "Андеррайтер корпоративного сегмента",
    "Ведущий андеррайтер",
    "Специалист кредитного анализа",
  ],
  "o-risk-portfolio": [
    "Специалист портфельного мониторинга",
    "Аналитик качества кредитного портфеля",
  ],
  "m-risk-market": [
    "Риск-менеджер рыночных рисков",
    "Специалист по лимитам и VaR",
    "Аналитик ликвидности",
    "Валютный контролёр",
  ],
  "o-it-payments": [
    "Инженер по платёжным системам",
    "Разработчик backend (платежи)",
    "Системный аналитик (СБП, СМЭВ)",
    "QA-инженер платёжного контура",
  ],
  "o-it-channels": [
    "Frontend-разработчик (ИБ)",
    "Product owner дистанционных каналов",
    "UX-исследователь",
  ],
  "m-it-infra": [
    "Инженер эксплуатации ЦОД",
    "SRE-инженер",
    "Администратор СУБД",
    "Специалист сетевой инфраструктуры",
  ],
  "o-it-soc": [
    "Аналитик SOC",
    "Инженер ИБ (мониторинг)",
    "Специалист реагирования на инциденты",
  ],
  "o-ops-rko": [
    "Операционист РКО",
    "Контролёр кассовых операций",
    "Специалист по валютному контролю",
  ],
  "o-ops-swift": [
    "Специалист SWIFT/ВЭД",
    "Операционист межбанка",
    "Контролёр платёжных сообщений",
  ],
  "m-ops-cards": [
    "Менеджер по продукту «Карты»",
    "Специалист процессинга",
    "Аналитик фрода по картам",
    "Специалист chargeback",
  ],
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function headTitleForUnitLevel(level: OrgLevel): string {
  switch (level) {
    case "department":
      return "Директор департамента"
    case "management":
      return "Руководитель управления"
    case "office":
      return "Начальник отдела"
    default:
      return "Руководитель подразделения"
  }
}

function makeStaffForUnit(unitId: string, count: number): StaffMember[] {
  const positions = POSITIONS[unitId] ?? [
    "Специалист",
    "Ведущий специалист",
    "Старший специалист",
  ]
  const out: StaffMember[] = []
  const base = hashString(unitId)
  const unitNode = findUnit(ORG_ROOT, unitId)
  const headTitle = headTitleForUnitLevel(unitNode?.level ?? "office")
  for (let i = 0; i < count; i++) {
    const female = (base + i) % 3 !== 0
    const ln = LAST_NAMES[(base + i * 7) % LAST_NAMES.length]
    const fn = female
      ? FIRST_NAMES_F[(base + i * 5) % FIRST_NAMES_F.length]
      : FIRST_NAMES_M[(base + i * 5) % FIRST_NAMES_M.length]
    const pat = female
      ? PATRONYMICS_F[(base + i * 3) % PATRONYMICS_F.length]
      : PATRONYMICS_M[(base + i * 3) % PATRONYMICS_M.length]
    const isHead = i === 0
    const pos = isHead
      ? headTitle
      : positions[(base + i) % positions.length]
    const num = String(10000 + ((base + i * 11) % 90000))
    out.push({
      id: `${unitId}-e-${i + 1}`,
      unitId,
      lastName: ln,
      firstName: fn,
      patronymic: pat,
      position: pos,
      personnelNumber: num,
      ...(isHead ? { isUnitHead: true as const } : {}),
      ...demoProfileForStaff(unitId, i, base),
    })
  }
  return out
}

/** Подразделения всех уровней, к которым «прикреплены» сотрудники в демо-данных */
const UNIT_COUNTS: Record<string, number> = {
  "d-corp": 6,
  "d-risk": 5,
  "d-it": 8,
  "d-ops": 5,
  "m-corp-credit": 5,
  "o-corp-deals": 14,
  "o-corp-struct": 11,
  "m-corp-regional": 16,
  "m-corp-treasury-sales": 6,
  "o-corp-deriv": 10,
  "m-risk-credit": 6,
  "o-risk-underwriting": 18,
  "o-risk-portfolio": 9,
  "m-risk-market": 12,
  "m-it-dev": 7,
  "o-it-payments": 17,
  "o-it-channels": 13,
  "m-it-infra": 15,
  "m-it-security": 5,
  "m-ops-payments": 6,
  "o-it-soc": 8,
  "o-ops-rko": 20,
  "o-ops-swift": 11,
  "m-ops-cards": 14,
}

/** Явно заданный тестовый сотрудник (помимо сгенерированных по UNIT_COUNTS). */
const STAFF_DEMO_POMYTKIN: StaffMember = {
  id: "staff-demo-pomytkin-so",
  unitId: "o-it-soc",
  lastName: "Помыткин",
  firstName: "Сергей",
  patronymic: "Олегович",
  position: "Аналитик SOC",
  personnelNumber: "91337",
  ...demoProfileForStaff("o-it-soc", 42, hashString("staff-demo-pomytkin-so")),
}

export const STAFF: StaffMember[] = [
  ...Object.entries(UNIT_COUNTS).flatMap(([unitId, n]) =>
    makeStaffForUnit(unitId, n)
  ),
  STAFF_DEMO_POMYTKIN,
]

export function findUnit(node: OrgUnit, id: string): OrgUnit | null {
  if (node.id === id) return node
  for (const c of node.children) {
    const f = findUnit(c, id)
    if (f) return f
  }
  return null
}

/** Листовые узлы (без детей) — там сотрудники */
export function collectLeafIds(node: OrgUnit): string[] {
  if (node.children.length === 0) return [node.id]
  return node.children.flatMap(collectLeafIds)
}

/** Все узлы поддерева (включая текущий), когда сотрудники есть на любом уровне. */
export function collectUnitIds(node: OrgUnit): string[] {
  return [node.id, ...node.children.flatMap(collectUnitIds)]
}

export function countStaffInSubtree(
  node: OrgUnit,
  staff: StaffMember[]
): number {
  const ids = collectUnitIds(node)
  const set = new Set(ids)
  return staff.filter((s) => set.has(s.unitId)).length
}

export function countStaffDirect(node: OrgUnit, staff: StaffMember[]): number {
  return staff.filter((s) => s.unitId === node.id).length
}

export function getBreadcrumb(root: OrgUnit, id: string): OrgUnit[] {
  const path: OrgUnit[] = []
  function walk(n: OrgUnit): boolean {
    if (n.id === id) {
      path.push(n)
      return true
    }
    for (const c of n.children) {
      if (walk(c)) {
        path.unshift(n)
        return true
      }
    }
    return false
  }
  walk(root)
  return path
}

/**
 * Линейные руководители: главы подразделений по пути от текущего узла к корню
 * (ближайший — первый), без самого просматриваемого сотрудника.
 */
export function getStaffLineManagers(
  viewed: StaffMember,
  staff: StaffMember[]
): StaffMember[] {
  const path = getBreadcrumb(ORG_ROOT, viewed.unitId).filter(
    (u) => u.id !== ORG_ROOT.id
  )
  const seen = new Set<string>()
  const out: StaffMember[] = []
  for (let i = path.length - 1; i >= 0; i--) {
    const unitId = path[i].id
    const head = staff.find((s) => s.unitId === unitId && s.isUnitHead)
    if (head && head.id !== viewed.id && !seen.has(head.id)) {
      seen.add(head.id)
      out.push(head)
    }
  }
  return out
}
