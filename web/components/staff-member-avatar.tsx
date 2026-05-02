"use client"

import * as React from "react"
import Image from "next/image"
import { type StaffMember } from "@/lib/bank-org-mock"
import {
  assessmentDisplayInitials,
  avatarToneClass,
  formatFioMember,
  staffAvatarInitials,
} from "@/lib/staff-presentation"
import { cn } from "@/lib/utils"

export function StaffMemberAvatar({
  member,
  className = "size-9",
  initials,
  fallbackTone = "chart",
  imgSizes = "96px",
  ...spanProps
}: {
  member: StaffMember
  className?: string
  initials: "assessment" | "staff"
  /** Без фото: цвета как в матрице/орг-графе или как в крупной карточке (primary). */
  fallbackTone?: "chart" | "primary"
  /** Подсказка для `next/image` при отображении фото (`fill`). */
  imgSizes?: string
} & React.ComponentPropsWithoutRef<"span">) {
  const label = formatFioMember(member)
  const text =
    initials === "assessment"
      ? assessmentDisplayInitials(member.lastName, member.firstName, member.patronymic)
      : staffAvatarInitials(member)
  const imgAlt = spanProps["aria-hidden"] ? "" : label

  if (member.avatarUrl) {
    return (
      <span
        className={cn(
          "relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-border/30",
          className
        )}
        {...spanProps}
      >
        <Image
          src={member.avatarUrl}
          alt={imgAlt}
          fill
          className="object-cover"
          sizes={imgSizes}
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        fallbackTone === "primary"
          ? "bg-primary/15 text-primary ring-1 ring-primary/25"
          : avatarToneClass(member.id),
        className
      )}
      {...spanProps}
    >
      {text}
    </span>
  )
}
