/** Типы персонального отчёта внешней психодиагностики (структура JSON API). */

export type PsychCompetenceColor = "red" | "yellow" | "green"

export type PsychParticipant = {
  email: string
  company: string
  uuid: string
  name: string
  position: string
  industry: string
  role: string
  invitation_email_sent_datetime: string
  questionnaire_link_clicked_datetime: string
  remainder_qnt: number
}

export type PsychReportMeta = {
  created_at: string
  lie_points: number
}

export type PsychConclusionBloc = {
  title: string
  conclusion_texts: Array<{
    text: string
    recommendations_texts: string[]
  }>
}

export type PsychIndicator = {
  name: string
  average_percentage: number
  description: string
  color: PsychCompetenceColor
}

export type PsychKeyCompetence = {
  name: string
  description: string
  average_percentage: number
  color: PsychCompetenceColor
  indicators_data: PsychIndicator[]
}

export type PsychScaleCategory = {
  name: string
  description: string
  t_point: number
  legend_left: string
  legend_right: string
}

export type PsychCategoryGroup = {
  name: string
  description: string
  legend_left: string
  legend_right: string
  categories: PsychScaleCategory[]
}

export type PsychSection = {
  name: string
  description: string
  categories_groups: PsychCategoryGroup[]
}

export type PsychSmallSquare = {
  name: string
  percentage: number
}

export type PsychRoleSquare = {
  name: string
  description: string
  small_squares: PsychSmallSquare[]
}

export type PsychPreferredRole = {
  /** Опечатка в исходном API */
  mame?: string
  name?: string
  description: string
  squares: PsychRoleSquare[]
  conclusions: Array<{ name: string; texts: string[] }>
  horizontal_legend_left_up: string
  horizontal_legend_left_down: string
  horizontal_legend_right_up: string
  vertical_legend_left: string
  vertical_legend_right: string
}

export type PsychPersonalReport = {
  participant: PsychParticipant
  report: PsychReportMeta
  short_conclusions: PsychConclusionBloc[]
  key_competences: PsychKeyCompetence[]
  sections: PsychSection[]
  preferred_role: PsychPreferredRole
}
