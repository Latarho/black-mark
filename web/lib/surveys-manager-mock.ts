/**
 * Каталог опросов, созданных на уровне организации (HR / ЦО).
 * Руководитель не создаёт новые — только выбирает из списка и подключает к своему подразделению.
 */

export type SurveyTemplate = {
  id: string
  title: string
  description: string
  /** Кем заведён шаблон (для подписи в UI) */
  owner: string
}

export type UnitSurveyStatus = "draft" | "in_progress" | "completed"

export type UnitSurveyAssignment = {
  id: string
  unitId: string
  templateId: string
  status: UnitSurveyStatus
  startDate: string
  endDate: string
  /** ISO-подобная метка добавления для отображения */
  createdAtLabel: string
}

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: "tmpl-climate-q1",
    title: "Климат в команде (Q1 2026)",
    description:
      "Короткий опрос по вовлечённости, ясности целей и качеству обратной связи в команде.",
    owner: "HR ЦА",
  },
  {
    id: "tmpl-load-bal",
    title: "Баланс нагрузки и режима",
    description:
      "Оценка перегрузки, гибкости графика и достаточности ресурсов на выполнение задач.",
    owner: "HR ЦА",
  },
  {
    id: "tmpl-change-readiness",
    title: "Готовность к изменениям",
    description:
      "Опрос по восприятию изменений, прозрачности коммуникаций и поддержке со стороны руководства.",
    owner: "Управление трансформации",
  },
  {
    id: "tmpl-leadership-360-lite",
    title: "Обратная связь о руководстве (лайт)",
    description:
      "Анонимный срез по качеству постановки задач, справедливости и развитию сотрудников.",
    owner: "HR ЦА",
  },
  {
    id: "tmpl-wellbeing-pulse",
    title: "Пульс благополучия",
    description:
      "Быстрый чек по стрессу, ресурсу и способности концентрироваться на приоритетах.",
    owner: "СУРВ",
  },
]

export const UNIT_SURVEY_STATUS_LABELS: Record<UnitSurveyStatus, string> = {
  draft: "ЧЕРНОВИК",
  in_progress: "В ПРОЦЕССЕ",
  completed: "ЗАВЕРШЕН",
}
