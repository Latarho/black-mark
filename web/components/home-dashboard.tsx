"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  BriefcaseIcon,
  ClipboardListIcon,
  NetworkIcon,
  SettingsIcon,
  SnowflakeIcon,
  TargetIcon,
  UserRoundSearchIcon,
} from "lucide-react"

import { DetailCardSection } from "@/components/detail-card-section"
import { StaffMemberAvatar } from "@/components/staff-member-avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { StaffMember } from "@/lib/bank-org-mock"
import { formatFioMember, unitHeadTagClass } from "@/lib/staff-presentation"
import { cn } from "@/lib/utils"

export type HomeSectionLink = {
  href: string
  label: string
  description: string
}

export type HomeOrgProfile = {
  /** Цепочка названий подразделений (без корня). */
  unitTrail: string
  /** Департамент / крупное подразделение из иерархии. */
  departmentName: string
  managers: StaffMember[]
}

function ProfileAttrRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 min-w-0 break-words text-sm leading-snug text-foreground">{children}</div>
    </div>
  )
}

const iconByHref: Record<string, typeof ClipboardListIcon> = {
  "/assessment": ClipboardListIcon,
  "/cabinet/staff": NetworkIcon,
  "/admin": SettingsIcon,
  "/assessment-center": UserRoundSearchIcon,
  "/tselepolaganie": TargetIcon,
  "/tselepolaganie-kold": SnowflakeIcon,
  "/career": BriefcaseIcon,
}

export function HomeDashboard({
  me,
  team,
  orgProfile,
  sectionLinks,
}: {
  me: StaffMember
  team: StaffMember[]
  orgProfile: HomeOrgProfile
  sectionLinks: HomeSectionLink[]
}) {
  const c = me.contacts
  const dash = "—"

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-4">
      <section className="flex min-h-0 flex-1 flex-col py-6 md:py-8">
        <div className="flex flex-col items-center px-3 text-center">
          <StaffMemberAvatar
            member={me}
            initials="staff"
            fallbackTone="primary"
            imgSizes="192px"
            className="size-[168px] text-5xl ring-0 md:size-48 md:text-6xl"
          />
          <h1 className="mt-5 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl lg:text-4xl">
            {formatFioMember(me)}
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-foreground md:text-lg">{me.position}</p>
        </div>

        <Tabs defaultValue="profile" className="mt-6 flex min-h-0 w-full flex-1 flex-col gap-4">
          <TabsList className="group-data-horizontal/tabs:h-9 flex h-9 w-full min-w-0 overflow-hidden rounded-lg border border-border bg-muted p-px divide-x divide-border">
            <TabsTrigger
              value="profile"
              className="h-full flex-1 rounded-none rounded-l-md border-0 px-2 py-0 text-sm leading-none shadow-none data-active:rounded-md"
            >
              Мой профиль
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="h-full flex-1 rounded-none rounded-r-md border-0 px-2 py-0 text-sm leading-none shadow-none data-active:rounded-md"
            >
              Моя команда
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0 min-h-0 w-full min-w-0 flex-1 text-left">
            <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-4">
              <aside className="min-w-0 rounded-lg border border-border bg-card px-3 py-3 lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Профиль
                </p>
                <div className="mt-2 space-y-2 text-sm">
                  <ProfileAttrRow label="Должность">{me.position}</ProfileAttrRow>
                  <ProfileAttrRow label="Подразделение">{orgProfile.departmentName}</ProfileAttrRow>
                  <ProfileAttrRow label="Логин">{me.login ?? dash}</ProfileAttrRow>
                  <ProfileAttrRow label="Часовой пояс">{me.timezone ?? dash}</ProfileAttrRow>
                  <ProfileAttrRow label="Стаж в банке">{me.bankTenure ?? dash}</ProfileAttrRow>
                  <ProfileAttrRow label="День рождения">{me.birthday ?? dash}</ProfileAttrRow>
                  <ProfileAttrRow label="Табельный номер">{me.personnelNumber}</ProfileAttrRow>
                  <ProfileAttrRow label="Иерархия">
                    <span className="text-muted-foreground">{orgProfile.unitTrail}</span>
                  </ProfileAttrRow>
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Контакты
                  </p>
                  <div className="mt-2 space-y-2 text-sm">
                    <ProfileAttrRow label="Рабочая электронная почта">
                      {c?.workEmail ? (
                        <a
                          href={`mailto:${c.workEmail}`}
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {c.workEmail}
                        </a>
                      ) : (
                        dash
                      )}
                    </ProfileAttrRow>
                    <ProfileAttrRow label="Городской номер">{c?.cityPhone ?? dash}</ProfileAttrRow>
                    <ProfileAttrRow label="Внутренний номер">{c?.internalPhone ?? dash}</ProfileAttrRow>
                    <ProfileAttrRow label="Адрес">{c?.address ?? dash}</ProfileAttrRow>
                  </div>
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Руководители
                  </p>
                  {orgProfile.managers.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {orgProfile.managers.map((m) => (
                        <li key={m.id} className="flex min-w-0 items-center gap-2">
                          <StaffMemberAvatar
                            member={m}
                            initials="staff"
                            className="size-9 shrink-0 text-sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium leading-tight text-foreground">
                              {formatFioMember(m)}
                            </p>
                            <p className="mt-0.5 truncate text-xs leading-tight text-muted-foreground">
                              {m.position}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">{dash}</p>
                  )}
                </div>
              </aside>
              <div className="min-w-0 lg:col-span-3">
                <DetailCardSection title="Разделы" variant="compact" surface="panel">
                  <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {sectionLinks.map(({ href, label, description }) => {
                      const Icon = iconByHref[href] ?? ClipboardListIcon
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            className={cn(
                              "group flex min-h-[5.5rem] flex-col justify-between rounded-md border border-border bg-muted/20 p-3 transition-colors",
                              "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-4"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors group-hover:bg-muted/50">
                                <Icon className="size-4" aria-hidden />
                              </span>
                              <div className="min-w-0">
                                <span className="block font-medium text-foreground">{label}</span>
                                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                                  {description}
                                </span>
                              </div>
                            </div>
                            <span className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">
                              Перейти
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </DetailCardSection>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-0 min-h-0 w-full min-w-0 flex-1 text-left">
            <DetailCardSection title="Моя команда" variant="compact" surface="panel">
              <p className="mb-3 text-xs text-muted-foreground">
                Коллеги в вашем подразделении — всего {team.length}
              </p>
              <ul className="max-h-[min(26rem,50vh)] space-y-2 overflow-y-auto overscroll-contain pr-1">
                {team.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-muted/20 px-2 py-2 transition-colors hover:bg-muted/40"
                  >
                    <StaffMemberAvatar
                      member={member}
                      initials="staff"
                      className="size-10 text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {formatFioMember(member)}
                        </span>
                        {member.isUnitHead ? (
                          <span className={cn("shrink-0", unitHeadTagClass)}>Руководитель</span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{member.position}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/cabinet/staff"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                <NetworkIcon className="size-4" aria-hidden />
                Организационная структура
              </Link>
            </DetailCardSection>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
