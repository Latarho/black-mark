"use client"

import type { ReactNode } from "react"
import { DetailCardField, DetailCardSection } from "@/components/detail-card-section"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type {
  PsychCategoryGroup,
  PsychCompetenceColor,
  PsychKeyCompetence,
  PsychPersonalReport,
  PsychScaleCategory,
  PsychSection,
} from "@/lib/psych-report-types"
import {
  Building2,
  CalendarClock,
  ClipboardList,
  Mail,
  User,
  Weight,
} from "lucide-react"

function colorBarClass(c: PsychCompetenceColor) {
  switch (c) {
    case "red":
      return "bg-red-500 dark:bg-red-600"
    case "yellow":
      return "bg-amber-500 dark:bg-amber-500"
    case "green":
      return "bg-emerald-600 dark:bg-emerald-500"
  }
}

function colorSoftClass(c: PsychCompetenceColor) {
  switch (c) {
    case "red":
      return "border-red-500/40 bg-red-500/5"
    case "yellow":
      return "border-amber-500/40 bg-amber-500/5"
    case "green":
      return "border-emerald-600/40 bg-emerald-500/5"
  }
}

function colorBadgeVariant(c: PsychCompetenceColor): "default" | "secondary" | "destructive" | "outline" {
  switch (c) {
    case "red":
      return "destructive"
    case "yellow":
      return "secondary"
    case "green":
      return "default"
  }
}

const STEN_MAX = 9

function ReportDetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <DetailCardSection title={title}>{children}</DetailCardSection>
}

function ReportDetailField({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  icon?: Parameters<typeof DetailCardField>[0]["icon"]
}) {
  return <DetailCardField label={label} value={value} icon={Icon} />
}

function TPointScale({
  label,
  description,
  tPoint,
  poleLeft,
  poleRight,
  groupPoleLeft,
  groupPoleRight,
}: {
  label: string
  description: string
  tPoint: number
  poleLeft: string
  poleRight: string
  groupPoleLeft?: string
  groupPoleRight?: string
}) {
  const left = poleLeft || groupPoleLeft || "Слабее"
  const right = poleRight || groupPoleRight || "Сильнее"
  const clamped = Math.min(STEN_MAX, Math.max(1, tPoint))
  const pct = ((clamped - 0.5) / STEN_MAX) * 100

  return (
    <div className="space-y-2 rounded-lg border border-border/80 bg-muted/15 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-base font-semibold leading-snug text-foreground">{label}</p>
        <Badge variant="outline" className="normal-case font-mono text-sm tabular-nums">
          T = {tPoint}
        </Badge>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="relative pt-1">
        <div className="relative">
          <div className="flex h-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-900/20 via-muted to-rose-900/20 dark:from-sky-500/15 dark:to-rose-500/15">
            {Array.from({ length: STEN_MAX }).map((_, i) => (
              <div
                key={i}
                className="h-full flex-1 border-r border-background/50 last:border-r-0"
                aria-hidden
              />
            ))}
          </div>
        <div
          className="absolute bottom-full flex w-6 -translate-x-1/2 translate-y-1 flex-col items-center"
          style={{ left: `${pct}%` }}
        >
            <span className="mb-0.5 rounded bg-foreground px-1.5 py-0.5 text-sm font-semibold text-background tabular-nums">
              {clamped}
            </span>
            <div className="h-0 w-0 border-x-[6px] border-x-transparent border-t-[7px] border-t-foreground" />
          </div>
        </div>
        <div className="mt-5 flex justify-between gap-2 text-sm leading-tight text-muted-foreground">
          <span className="max-w-[45%]">{left}</span>
          <span className="max-w-[45%] text-right">{right}</span>
        </div>
      </div>
    </div>
  )
}

function GroupBlock({ group }: { group: PsychCategoryGroup }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card/40 p-4">
      <div>
        <h4 className="text-base font-bold tracking-tight text-foreground">{group.name}</h4>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{group.description}</p>
        {(group.legend_left || group.legend_right) && (
          <p className="mt-2 text-sm text-muted-foreground">
            {group.legend_left ? (
              <span>
                <span className="font-medium text-foreground/80">Шкала группы:</span> {group.legend_left}
                {group.legend_right ? ` — ${group.legend_right}` : ""}
              </span>
            ) : group.legend_right ? (
              <span>
                <span className="font-medium text-foreground/80">Шкала группы:</span> {group.legend_right}
              </span>
            ) : null}
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {group.categories.map((cat: PsychScaleCategory) => (
          <TPointScale
            key={cat.name}
            label={cat.name}
            description={cat.description}
            tPoint={cat.t_point}
            poleLeft={cat.legend_left}
            poleRight={cat.legend_right}
            groupPoleLeft={group.legend_left}
            groupPoleRight={group.legend_right}
          />
        ))}
      </div>
    </div>
  )
}

function LieScale({ value }: { value: number }) {
  const v = Math.min(STEN_MAX, Math.max(1, value))
  const pct = ((v - 0.5) / STEN_MAX) * 100
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-muted/40 to-card p-4">
      <div className="flex items-center gap-2">
        <Weight className="size-4 text-muted-foreground" aria-hidden />
        <h3 className="text-base font-bold text-foreground">Социальная желательность (lie scale)</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Чем выше значение, тем сильнее склонность давать социально ожидаемые ответы. Оценка в стенах (шкала 1–9).
      </p>
      <div className="relative mt-4 pt-1">
        <div className="relative">
          <div className="flex h-3 overflow-hidden rounded-full bg-muted">
            {Array.from({ length: STEN_MAX }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-full flex-1 border-r border-background/40 last:border-r-0",
                  i < 3 && "bg-emerald-500/35",
                  i >= 3 && i < 6 && "bg-amber-500/35",
                  i >= 6 && "bg-red-500/30"
                )}
                aria-hidden
              />
            ))}
          </div>
          <div
            className="absolute bottom-full flex w-8 -translate-x-1/2 translate-y-1 flex-col items-center"
            style={{ left: `${pct}%` }}
          >
            <span className="mb-0.5 rounded bg-foreground px-1.5 py-0.5 text-sm font-bold tabular-nums text-background">
              {v}
            </span>
            <div className="h-0 w-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-foreground" />
          </div>
        </div>
        <div className="mt-5 flex justify-between text-sm text-muted-foreground">
          <span>1 — низкая</span>
          <span>9 — высокая</span>
        </div>
      </div>
    </div>
  )
}

function CompetenceSparklines({ items }: { items: PsychKeyCompetence[] }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
        <ClipboardList className="size-4 text-muted-foreground" aria-hidden />
        Свод по ключевым компетенциям
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Заполнение полосы соответствует значению в процентах от 0 до 100%.
      </p>
      <div className="mt-4 space-y-2">
        {items.map((c) => (
          <div key={c.name} className="flex items-center gap-2">
            <span className="w-[min(42%,11rem)] shrink-0 truncate text-sm text-foreground" title={c.name}>
              {c.name}
            </span>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", colorBarClass(c.color))}
                style={{
                  width: `${Math.min(100, Math.max(0, c.average_percentage))}%`,
                }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
              {c.average_percentage}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreferredRoleMatrix({
  data,
  hideApiTitle = false,
}: {
  data: PsychPersonalReport["preferred_role"]
  hideApiTitle?: boolean
}) {
  const title = data.name ?? data.mame ?? "Предпочитаемая роль"
  return (
    <div className="space-y-4">
      <div>
        {hideApiTitle ? null : (
          <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
        )}
        <p
          className={cn(
            "text-sm leading-relaxed text-muted-foreground",
            !hideApiTitle && "mt-1"
          )}
        >
          {data.description}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-stretch">
        <div className="hidden flex-col items-center justify-center gap-1 md:flex md:w-28 md:pr-2">
          <span className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {data.vertical_legend_left}
          </span>
          <div className="flex-1 border-x border-dashed border-border" />
          <span className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {data.vertical_legend_right}
          </span>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-center text-sm leading-tight text-muted-foreground">
            <span>{data.horizontal_legend_left_up}</span>
            <span>{data.horizontal_legend_right_up}</span>
            <span>{data.horizontal_legend_left_down}</span>
            <span className="text-muted-foreground/70">—</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.squares.map((sq) => (
              <div
                key={sq.name}
                className="rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/30"
              >
                <h4 className="text-base font-bold tracking-tight text-foreground">{sq.name}</h4>
                <p className="mt-0.5 text-sm text-muted-foreground">{sq.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {sq.small_squares.map((cell) => (
                    <div
                      key={cell.name}
                      className="flex flex-col gap-1 rounded-lg border border-border/70 bg-background/60 p-2"
                    >
                      <span className="text-sm font-medium leading-tight text-foreground">{cell.name}</span>
                      <div className="relative h-14 w-full overflow-hidden rounded-md bg-muted">
                        <div
                          className="absolute inset-x-0 bottom-0 bg-primary/50 transition-all dark:bg-primary/40"
                          style={{ height: `${Math.min(100, Math.max(0, cell.percentage))}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-foreground drop-shadow-sm">
                          {cell.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground md:hidden">
            <p>
              <span className="font-medium text-foreground/80">{data.vertical_legend_left}</span>
              {" · "}
              <span className="font-medium text-foreground/80">{data.vertical_legend_right}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.conclusions.map((block) => (
          <div key={block.name} className="rounded-xl border border-border bg-card/60 p-4">
            <h4 className="text-base font-bold tracking-tight text-foreground">{block.name}</h4>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              {block.texts.map((t, i) => (
                <li key={i} className="marker:text-primary">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ExternalAssessmentPersonalReport({ data }: { data: PsychPersonalReport }) {
  const { participant, report, short_conclusions, key_competences, sections, preferred_role } = data

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="rounded-xl border border-border bg-card px-4 py-5 shadow-sm">
        <p className="text-lg font-semibold text-foreground">{participant.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {participant.position} · {participant.role}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{participant.industry}</p>
        <div className="mt-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted/35">
          <p className="text-sm text-muted-foreground">Отчёт сформирован</p>
          <p className="mt-1 text-sm leading-snug text-foreground">{report.created_at}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex min-w-0 flex-col gap-4">
        <TabsList className="h-auto w-full min-w-0 max-w-full flex flex-wrap justify-start gap-1 rounded-lg border border-border bg-muted/40 p-1">
          <TabsTrigger value="overview" className="shrink-0 text-sm">
            Участник и метаданные
          </TabsTrigger>
          <TabsTrigger value="conclusions" className="shrink-0 text-sm">
            Краткие выводы
          </TabsTrigger>
          <TabsTrigger value="competences" className="shrink-0 text-sm">
            Компетенции
          </TabsTrigger>
          <TabsTrigger value="scales" className="shrink-0 text-sm">
            Шкалы и разделы
          </TabsTrigger>
          <TabsTrigger value="role" className="shrink-0 text-sm">
            Роль
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 flex flex-col gap-4">
          <ReportDetailSection title="Участник и прохождение">
            <dl className="grid gap-3 sm:grid-cols-2">
              <ReportDetailField label="E-mail" value={participant.email} icon={Mail} />
              <ReportDetailField label="Компания" value={participant.company} icon={Building2} />
              <ReportDetailField label="UUID" value={participant.uuid} icon={User} />
              <ReportDetailField
                label="Приглашение отправлено"
                value={participant.invitation_email_sent_datetime}
                icon={CalendarClock}
              />
              <ReportDetailField
                label="Переход по ссылке анкеты"
                value={participant.questionnaire_link_clicked_datetime}
                icon={CalendarClock}
              />
              <ReportDetailField
                label="Напоминаний отправлено"
                value={String(participant.remainder_qnt)}
                icon={ClipboardList}
              />
            </dl>
          </ReportDetailSection>

          <ReportDetailSection title="Метаданные отчёта">
            <div className="grid gap-4 md:grid-cols-2">
              <ReportDetailField label="Дата создания" value={report.created_at} />
              <LieScale value={report.lie_points} />
            </div>
          </ReportDetailSection>
        </TabsContent>

        <TabsContent value="conclusions" className="mt-0 flex flex-col gap-4">
          <ReportDetailSection title="Краткие выводы по блокам">
            <div className="flex w-full min-w-0 flex-col gap-4">
              {short_conclusions.map((block) => (
                <div
                  key={block.title}
                  className="w-full min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <h4 className="text-base font-bold tracking-tight text-foreground">{block.title}</h4>
                  <div className="mt-3 space-y-3">
                    {block.conclusion_texts.map((ct, j) => (
                      <div key={j} className="rounded-lg bg-muted/30 p-3">
                        <p className="text-sm leading-relaxed text-foreground">{ct.text}</p>
                        {ct.recommendations_texts.length > 0 ? (
                          <div className="mt-3 border-t border-border pt-3">
                            <p className="text-sm font-semibold text-foreground">Рекомендации</p>
                            <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                              {ct.recommendations_texts.map((r, k) => (
                                <li key={k}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ReportDetailSection>
        </TabsContent>

        <TabsContent value="competences" className="mt-0 flex flex-col gap-4">
          <ReportDetailSection title="Ключевые компетенции">
            <div className="flex flex-col gap-4">
              <CompetenceSparklines items={key_competences} />
              <div className="space-y-4">
                {key_competences.map((comp) => (
                  <div
                    key={comp.name}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-card/40",
                      colorSoftClass(comp.color),
                      "border-border"
                    )}
                  >
                    <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold tracking-tight text-foreground">{comp.name}</h4>
                          <Badge variant={colorBadgeVariant(comp.color)} className="normal-case tabular-nums">
                            {comp.average_percentage}%
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{comp.description}</p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted sm:mt-0 sm:h-2 sm:w-32">
                        <div
                          className={cn("h-full rounded-full", colorBarClass(comp.color))}
                          style={{ width: `${Math.min(100, comp.average_percentage)}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      {comp.indicators_data.map((ind) => (
                        <div
                          key={ind.name}
                          className="rounded-lg border border-border/60 bg-background/50 p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">{ind.name}</span>
                            <Badge variant={colorBadgeVariant(ind.color)} className="normal-case tabular-nums">
                              {ind.average_percentage}%
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ind.description}</p>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full", colorBarClass(ind.color))}
                              style={{ width: `${Math.min(100, ind.average_percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ReportDetailSection>
        </TabsContent>

        <TabsContent value="scales" className="mt-0 flex flex-col gap-4">
          {sections.map((sec: PsychSection) => (
            <ReportDetailSection key={sec.name} title={sec.name}>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{sec.description}</p>
              <div className="space-y-4">
                {sec.categories_groups.map((g: PsychCategoryGroup) => (
                  <GroupBlock key={g.name} group={g} />
                ))}
              </div>
            </ReportDetailSection>
          ))}
        </TabsContent>

        <TabsContent value="role" className="mt-0 flex flex-col gap-4">
          <ReportDetailSection title="Предпочитаемая роль (модель ролей)">
            <PreferredRoleMatrix data={preferred_role} hideApiTitle />
          </ReportDetailSection>
        </TabsContent>
      </Tabs>
    </div>
  )
}
