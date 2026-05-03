"use client"

import { type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { StaffMemberAvatar } from "@/components/staff-member-avatar"
import { DetailCardField, DetailCardSection } from "@/components/detail-card-section"
import { cn } from "@/lib/utils"

import { type StaffMember } from "@/lib/bank-org-mock"
import { formatFioMember } from "@/lib/staff-presentation"
import {
  CRITICALITY_LETTER_TEXT_CLASSES,
  CRITICALITY_LEVEL_CLASSES,
  CRITICALITY_LEVEL_LABELS,
  FKR_STATUS_CLASSES,
  FKR_STATUS_LABELS,
  SALARY_MARKET_LEVEL_CLASSES,
  SALARY_MARKET_LEVEL_LABELS,
  SURVEY_CATEGORY_CLASSES,
  SURVEY_CATEGORY_LABELS,
  TABLE_TAG_TEXT_CLASS,
  formatMinutesToHourMinute,
  type AssessmentGradeLevel,
  type FkrStatus,
  type SalaryMarketLevel,
  type SurveyCategoryLevel,
} from "@/lib/assessment-model"

export function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <DetailCardSection title={title} variant="compact">
      {children}
    </DetailCardSection>
  )
}

export function DetailItem({
  label,
  value,
  insight,
}: {
  label: string
  value: ReactNode
  insight?: ReactNode
}) {
  return (
    <DetailCardField
      label={label}
      value={value}
      insight={insight}
      labelClassName="text-sm"
    />
  )
}

export function DetailTag({
  children,
  className,
}: {
  children: ReactNode
  className: string
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${TABLE_TAG_TEXT_CLASS} ${className}`}>
      {children}
    </span>
  )
}

export function CriticalityTag({ level }: { level: AssessmentGradeLevel }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-2 py-1 ${TABLE_TAG_TEXT_CLASS} ${CRITICALITY_LEVEL_CLASSES[level]}`}
    >
      {CRITICALITY_LEVEL_LABELS[level]}
    </span>
  )
}

export type StaffYearAssessmentSlide = {
  year: number
  isFormed: boolean
  grade: AssessmentGradeLevel | null
}

interface StaffAssessmentDetailModalProps {
  selectedStaffMember: StaffMember | null
  setSelectedStaffMember: (member: StaffMember | null) => void
  selectedStaffUnitPath: string
  selectedStaffCriticality: AssessmentGradeLevel
  selectedStaffSalaryMarketLevel: SalaryMarketLevel
  selectedStaffFkrStatus: FkrStatus
  selectedStaffSurveyResult: SurveyCategoryLevel
  selectedStaffSurveyTeam: SurveyCategoryLevel
  /** Если задано, карусель показывает оценку по каждому году; иначе — демо-вид «2026 / 2025». */
  yearAssessmentSlides?: StaffYearAssessmentSlide[] | null
}

export function StaffAssessmentDetailModal({
  selectedStaffMember,
  setSelectedStaffMember,
  selectedStaffUnitPath,
  selectedStaffCriticality,
  selectedStaffSalaryMarketLevel,
  selectedStaffFkrStatus,
  selectedStaffSurveyResult,
  selectedStaffSurveyTeam,
  yearAssessmentSlides = null,
}: StaffAssessmentDetailModalProps) {
  return (
    <Dialog
      open={selectedStaffMember !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedStaffMember(null)
      }}
    >
      <DialogContent maxWidth="wide" className="max-h-[90vh] gap-0 overflow-hidden p-0">
        {selectedStaffMember ? (
          <>
            <DialogTitle className="sr-only">
              {formatFioMember(selectedStaffMember)}
            </DialogTitle>
            <div className="max-h-[90vh] overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                  <div className="rounded-xl border border-border bg-card px-4 py-5 shadow-sm">
                    <div className="flex min-h-[200px] min-w-0 items-center gap-4">
                      <div className="flex w-36 shrink-0 items-center justify-center">
                        <StaffMemberAvatar
                          member={selectedStaffMember}
                          className="size-32 text-3xl"
                          initials="assessment"
                          fallbackTone="primary"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-foreground">
                          {formatFioMember(selectedStaffMember)}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedStaffMember.position}
                        </p>
                        <div className="mt-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted/35">
                          <p className="text-sm text-muted-foreground">Подразделение</p>
                          <p className="mt-1 text-sm leading-snug text-foreground">
                            {selectedStaffUnitPath || "Подразделение не указано"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-[200px] w-full max-w-sm items-center">
                    <Carousel
                      className="w-full px-7"
                      opts={{ align: "center", loop: false }}
                    >
                      <CarouselContent>
                        {yearAssessmentSlides && yearAssessmentSlides.length > 0 ? (
                          yearAssessmentSlides.map((slide) => (
                            <CarouselItem key={slide.year}>
                              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                  Результат оценки
                                </p>
                                <p
                                  className={cn(
                                    "text-sm font-medium uppercase tracking-wide",
                                    slide.year === yearAssessmentSlides[0]?.year
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  Период оценки · {slide.year}
                                </p>
                                {slide.isFormed && slide.grade ? (
                                  <span
                                    className={cn(
                                      "text-[clamp(3.5rem,10vw+2.5rem,6.5rem)] font-black leading-none tracking-tight",
                                      CRITICALITY_LETTER_TEXT_CLASSES[slide.grade]
                                    )}
                                    role="img"
                                    aria-label={`Результат оценки за ${slide.year}: ${CRITICALITY_LEVEL_LABELS[slide.grade]}`}
                                  >
                                    {CRITICALITY_LEVEL_LABELS[slide.grade]}
                                  </span>
                                ) : (
                                  <span
                                    className="text-[clamp(2.5rem,8vw+1.5rem,4rem)] font-black leading-none tracking-tight text-muted-foreground"
                                    role="img"
                                    aria-label={`Оценка за ${slide.year} не сформирована`}
                                  >
                                    —
                                  </span>
                                )}
                              </div>
                            </CarouselItem>
                          ))
                        ) : (
                          <>
                            <CarouselItem>
                              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                  Результат оценки
                                </p>
                                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                                  Текущий · 2026
                                </p>
                                <span
                                  className={cn(
                                    "text-[clamp(3.5rem,10vw+2.5rem,6.5rem)] font-black leading-none tracking-tight",
                                    CRITICALITY_LETTER_TEXT_CLASSES[selectedStaffCriticality]
                                  )}
                                  role="img"
                                  aria-label={`Результат оценки: ${CRITICALITY_LEVEL_LABELS[selectedStaffCriticality]}`}
                                >
                                  {CRITICALITY_LEVEL_LABELS[selectedStaffCriticality]}
                                </span>
                              </div>
                            </CarouselItem>
                            <CarouselItem>
                              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                  Результат оценки
                                </p>
                                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                                  2025
                                </p>
                                <span
                                  className={cn(
                                    "text-[clamp(3.5rem,10vw+2.5rem,6.5rem)] font-black leading-none tracking-tight",
                                    CRITICALITY_LETTER_TEXT_CLASSES[selectedStaffCriticality]
                                  )}
                                  role="img"
                                  aria-label={`Результат оценки за 2025 год: ${CRITICALITY_LEVEL_LABELS[selectedStaffCriticality]}`}
                                >
                                  {CRITICALITY_LEVEL_LABELS[selectedStaffCriticality]}
                                </span>
                              </div>
                            </CarouselItem>
                          </>
                        )}
                      </CarouselContent>
                      <CarouselPrevious
                        className="left-0"
                        variant="outline"
                        size="icon-sm"
                      />
                      <CarouselNext
                        className="right-0"
                        variant="outline"
                        size="icon-sm"
                      />
                    </Carousel>
                  </div>
                </div>

                <Tabs defaultValue="staff-profile" className="flex min-w-0 flex-col gap-4">
                  <TabsList className="h-auto w-full min-w-0 max-w-full flex flex-wrap justify-start gap-1 rounded-lg border border-border bg-muted/40 p-1">
                    <TabsTrigger value="staff-profile" className="shrink-0 text-sm">
                      Профиль
                    </TabsTrigger>
                    <TabsTrigger value="staff-workload" className="shrink-0 text-sm">
                      Нагрузка и режим
                    </TabsTrigger>
                    <TabsTrigger value="staff-surveys" className="shrink-0 text-sm">
                      Опросы
                    </TabsTrigger>
                    <TabsTrigger value="staff-external" className="shrink-0 text-sm">
                      Внешняя оценка
                    </TabsTrigger>
                    <TabsTrigger value="staff-rhythm" className="shrink-0 text-sm">
                      Оценка РИТМ
                    </TabsTrigger>
                    <TabsTrigger value="staff-compensation" className="shrink-0 text-sm">
                      Компенсация и кадровые вопросы
                    </TabsTrigger>
                    <TabsTrigger value="recommendations" className="shrink-0 text-sm">
                      Рекомендации
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="staff-profile" className="mt-0 flex flex-col gap-4">
                    <DetailSection title="Профиль">
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <DetailItem
                          label="Табельный номер"
                          value={selectedStaffMember.personnelNumber}
                          insight="Идентификатор сотрудника в кадровых системах. Помогает точно сопоставлять записи между источниками данных."
                        />
                        <DetailItem
                          label="Логин"
                          value={selectedStaffMember.login ?? "—"}
                          insight="Корпоративная учётная запись. Полезна для проверки активности и связки с ИТ-данными."
                        />
                        <DetailItem
                          label="Стаж в Банке"
                          value={selectedStaffMember.bankTenure ?? "—"}
                          insight="Показывает глубину опыта внутри банка. Длинный стаж помогает оценить экспертизу и возможную роль носителя знаний."
                        />
                        <DetailItem
                          label="Стаж в Блоке, ССП"
                          value={selectedStaffMember.blockTenure ?? "—"}
                          insight="Отражает опыт именно в текущем бизнес-контексте. Важен для оценки адаптации и устойчивости в роли."
                        />
                        <DetailItem
                          label="Возраст"
                          value={selectedStaffMember.age ?? "—"}
                          insight="Используется только как демографический контекст. Сам по себе не является оценочным выводом."
                        />
                        <DetailItem
                          label="Дней неисп. отпуска"
                          value={selectedStaffMember.unusedVacationDays ?? "—"}
                          insight="Высокий остаток отпуска может быть косвенным сигналом нагрузки, риска выгорания или проблем с планированием замещения."
                        />
                      </dl>
                    </DetailSection>
                  </TabsContent>

                  <TabsContent value="staff-workload" className="mt-0 flex flex-col gap-4">
                    <DetailSection title="Нагрузка и режим">
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <DetailItem
                          label="Переработки"
                          insight="Показывает наличие признаков повышенной нагрузки. Важно сопоставлять с режимом работы, СУРВ-данными и результативностью."
                          value={
                            (selectedStaffMember.overtimeHoursLastMonth ?? 0) > 0 ? (
                              <DetailTag className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                                ДА
                              </DetailTag>
                            ) : (
                              <DetailTag className="bg-muted text-muted-foreground">
                                НЕТ
                              </DetailTag>
                            )
                          }
                        />
                        <DetailItem
                          label="Режим работы"
                          value={selectedStaffMember.workMode ?? "—"}
                          insight="Помогает корректно трактовать офисное время и переработки: разные режимы дают разные нормы присутствия."
                        />
                        <DetailItem
                          label="Чистое время в офисе"
                          value={formatMinutesToHourMinute(selectedStaffMember.overtimeOfficeMinutesLast3Months)}
                          insight="Среднее чистое присутствие в офисе за рабочий день. Используется как один из сигналов фактической нагрузки."
                        />
                        <DetailItem
                          label="Работа за компьютером"
                          value={formatMinutesToHourMinute(selectedStaffMember.overtimeComputerMinutesLast3Months)}
                          insight="Отражает цифровую активность за рабочий день. Рост показателя без результата может сигнализировать о перегрузке или неэффективности."
                        />
                        <DetailItem
                          label="ПК + звонки"
                          value={formatMinutesToHourMinute(selectedStaffMember.overtimeComputerAndCallsMinutesLast3Months)}
                          insight="Суммарная активность за компьютером и в звонках. Помогает оценить коммуникационную и операционную нагрузку."
                        />
                      </dl>
                    </DetailSection>
                  </TabsContent>

                  <TabsContent value="staff-surveys" className="mt-0 flex flex-col gap-4">
                    <DetailSection title="Опросы">
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <DetailItem
                          label="Опрос - результат"
                          insight="Категория по вкладу в результат. Низкая категория требует сверки с фактическими задачами и ожиданиями роли."
                          value={
                            <DetailTag className={SURVEY_CATEGORY_CLASSES[selectedStaffSurveyResult]}>
                              {SURVEY_CATEGORY_LABELS[selectedStaffSurveyResult]}
                            </DetailTag>
                          }
                        />
                        <DetailItem
                          label="Опрос - команда"
                          insight="Категория по командному взаимодействию. Помогает увидеть, как сотрудник влияет на совместную работу и климат команды."
                          value={
                            <DetailTag className={SURVEY_CATEGORY_CLASSES[selectedStaffSurveyTeam]}>
                              {SURVEY_CATEGORY_LABELS[selectedStaffSurveyTeam]}
                            </DetailTag>
                          }
                        />
                      </dl>
                    </DetailSection>
                  </TabsContent>

                  <TabsContent value="staff-external" className="mt-0 flex flex-col gap-4">
                    <DetailSection title="Внешняя оценка">
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <DetailItem
                          label="Внешняя оценка"
                          insight="Показывает, есть ли подтверждённый положительный результат внешней оценки. Используется как независимый сигнал по сотруднику."
                          value={
                            selectedStaffMember.externalAssessmentResult === undefined ? (
                              "—"
                            ) : selectedStaffMember.externalAssessmentResult >= 4 ? (
                              <DetailTag className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                                ДА
                              </DetailTag>
                            ) : (
                              <DetailTag className="bg-muted text-muted-foreground">
                                НЕТ
                              </DetailTag>
                            )
                          }
                        />
                        <DetailItem
                          label="Балл внешней оценки"
                          value={selectedStaffMember.externalAssessmentResult ?? "—"}
                          insight="Числовой результат внешней оценки от 1 до 5. Помогает сопоставить внутренние и внешние оценочные сигналы."
                        />
                        <DetailItem
                          label="Провайдер"
                          value={selectedStaffMember.externalAssessmentProvider ?? "—"}
                          insight="Организация, проводившая внешнюю оценку. Важна для понимания методологии и сопоставимости результата."
                        />
                        <DetailItem
                          label="Период"
                          value={selectedStaffMember.externalAssessmentYear ?? "—"}
                          insight="Год проведения оценки. Чем старше период, тем осторожнее нужно использовать результат для текущих решений."
                        />
                        <DetailItem
                          label="Файл с результатами"
                          insight="Ссылка на первичный документ с результатами внешней оценки. Используется для проверки деталей и источника вывода."
                          value={
                            selectedStaffMember.externalAssessmentResultPdf ? (
                              <a
                                href={selectedStaffMember.externalAssessmentResultPdf}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline underline-offset-2 hover:text-primary/80"
                              >
                                {selectedStaffMember.externalAssessmentResultPdf.split("/").at(-1)}
                              </a>
                            ) : (
                              "—"
                            )
                          }
                        />
                      </dl>
                    </DetailSection>
                  </TabsContent>

                  <TabsContent value="staff-rhythm" className="mt-0 flex flex-col gap-4">
                    <DetailSection title="Оценка РИТМ">
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <DetailItem
                          label="Оценка РИТМ"
                          insight="Бинарный сигнал по результатам РИТМ: ДА означает, что актуальная оценка достигает целевого уровня."
                          value={
                            selectedStaffMember.rhythmAssessmentResult === undefined ? (
                              "—"
                            ) : selectedStaffMember.rhythmAssessmentResult >= 4 ? (
                              <DetailTag className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                                ДА
                              </DetailTag>
                            ) : (
                              <DetailTag className="bg-muted text-muted-foreground">
                                НЕТ
                              </DetailTag>
                            )
                          }
                        />
                        <DetailItem
                          label="Балл РИТМ"
                          value={selectedStaffMember.rhythmAssessmentResult ?? "—"}
                          insight="Числовой результат РИТМ от 1 до 5. Значения 4-5 трактуются как положительный сигнал."
                        />
                      </dl>
                    </DetailSection>
                  </TabsContent>

                  <TabsContent value="staff-compensation" className="mt-0 flex flex-col gap-4">
                    <DetailSection title="Компенсация и кадровые вопросы">
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <DetailItem
                          label="Уровень З/П относительно рынка"
                          insight="Сравнивает компенсацию с рыночным ориентиром. Низкий уровень при сильных оценках может усиливать риск удержания."
                          value={
                            <DetailTag className={SALARY_MARKET_LEVEL_CLASSES[selectedStaffSalaryMarketLevel]}>
                              {SALARY_MARKET_LEVEL_LABELS[selectedStaffSalaryMarketLevel]}
                            </DetailTag>
                          }
                        />
                        <DetailItem
                          label="ФКР"
                          insight="Показывает, входит ли сотрудник в кадровый резерв или фокусный кадровый контур. Важно для планирования развития и преемственности."
                          value={
                            <DetailTag className={FKR_STATUS_CLASSES[selectedStaffFkrStatus]}>
                              {FKR_STATUS_LABELS[selectedStaffFkrStatus]}
                            </DetailTag>
                          }
                        />
                        <DetailItem
                          label="Дата пересмотра должности"
                          value={selectedStaffMember.positionReviewDate ?? "—"}
                          insight="Дата последнего или планового пересмотра должности. Помогает видеть актуальность роли и возможные кадровые ожидания."
                        />
                        <DetailItem
                          label="Дата пересмотра оклада"
                          value={selectedStaffMember.salaryReviewDate ?? "—"}
                          insight="Дата последнего или планового пересмотра оклада. Важна для оценки компенсационного риска и своевременности решений."
                        />
                      </dl>
                    </DetailSection>
                  </TabsContent>

                  <TabsContent value="recommendations" className="mt-0">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <DetailSection title="Сильные стороны">
                        <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-muted-foreground">
                          <li>
                            Стаж в банке и в блоке указывает на накопленный организационный капитал:
                            сотрудник понимает внутренние процессы, стейкхолдеров и неформальные правила принятия решений.
                          </li>
                          <li>
                            Результаты РИТМ и внешней оценки дают основу для калибровки по модели evidence-based HR:
                            решения по развитию и удержанию можно опирать не только на мнение руководителя, но и на независимые сигналы.
                          </li>
                          <li>
                            Статус ФКР:{" "}
                            <DetailTag className={FKR_STATUS_CLASSES[selectedStaffFkrStatus]}>
                              {FKR_STATUS_LABELS[selectedStaffFkrStatus]}
                            </DetailTag>
                            {" "}помогает определить, стоит ли рассматривать сотрудника как элемент кадровой преемственности,
                            участника talent pool или кандидата на расширение роли.
                          </li>
                          <li>
                            При категории опроса по результату{" "}
                            <DetailTag className={SURVEY_CATEGORY_CLASSES[selectedStaffSurveyResult]}>
                              {selectedStaffSurveyResult}
                            </DetailTag>
                            {" "}важно зафиксировать конкретные поведенческие примеры вклада, чтобы сильные стороны можно было масштабировать.
                          </li>
                        </ul>
                      </DetailSection>

                      <DetailSection title="Зоны развития">
                        <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-muted-foreground">
                          <li>
                            Провести калибровочную беседу по двум осям: вклад в результат и командное взаимодействие.
                            Если оценки расходятся, использовать подход “performance x behavior”, чтобы не развивать только результат в ущерб команде.
                          </li>
                          <li>
                            Сверить СУРВ-показатели, переработки и режим работы с фактическим портфелем задач.
                            В мировой практике это часть workload review: важно понять, нагрузка создаёт ценность или маскирует неэффективность процесса.
                          </li>
                          <li>
                            Уточнить ожидания по роли и карьерному шагу, особенно если даты пересмотра должности или оклада приближаются.
                            Рекомендуется оформить 2-3 измеримых результата на следующий квартал.
                          </li>
                          <li>
                            Если баллы оценки ниже целевого уровня, не ограничиваться обучением: определить, что мешает результату —
                            навыки, полномочия, приоритеты, качество постановки задач или конфликт целей.
                          </li>
                        </ul>
                      </DetailSection>

                      <DetailSection title="Возможности">
                        <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-muted-foreground">
                          <li>
                            При положительных оценочных сигналах использовать stretch assignment: дать проект выше текущего уровня сложности,
                            но с понятным спонсором, сроком и критериями успеха.
                          </li>
                          <li>
                            Подготовить IDP на 3-6 месяцев: одна бизнес-цель, одна поведенческая компетенция,
                            один измеримый артефакт результата и регулярные check-in встречи.
                          </li>
                          <li>
                            Синхронизировать компенсационные решения с вкладом, рынком и кадровым статусом.
                            Если сотрудник ниже рынка и демонстрирует сильные сигналы, это кандидат на retention action.
                          </li>
                          <li>
                            Использовать сотрудника как носителя практик: наставничество, разбор кейсов, участие в онбординге
                            или передача экспертизы могут повысить устойчивость команды.
                          </li>
                        </ul>
                      </DetailSection>

                      <DetailSection title="Риски">
                        <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-muted-foreground">
                          <li>
                            Текущий результат оценки:{" "}
                            <CriticalityTag level={selectedStaffCriticality} />
                            . При высоком результате оценки рекомендован формат case review: руководитель, HR и при необходимости куратор функции
                            должны согласовать единый план действий и владельца решения.
                          </li>
                          <li>
                            Компенсационный риск усиливается, если уровень З/П ниже рынка при сильных оценочных сигналах.
                            В практике total rewards это зона риска удержания и снижения вовлечённости.
                          </li>
                          <li>
                            Накопленная нагрузка, переработки и неиспользованный отпуск могут указывать на риск выгорания.
                            Нужна проверка не только часов, но и управляемости задач: срочность, автономность, ясность приоритетов.
                          </li>
                          <li>
                            Если внешняя оценка, РИТМ и опросы дают разнонаправленные сигналы, нельзя принимать решение по одному показателю.
                            Нужна калибровка данных и управленческое интервью с примерами поведения.
                          </li>
                        </ul>
                      </DetailSection>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
