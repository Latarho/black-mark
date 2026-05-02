import { HomeDashboard } from "@/components/home-dashboard"
import {
  DEMO_SESSION_STAFF_ID,
  ORG_ROOT,
  STAFF,
  getBreadcrumb,
  getStaffLineManagers,
  getStaffMemberById,
  getUnitColleaguesExcludingSelf,
} from "@/lib/bank-org-mock"
import { APP_NAV } from "@/lib/nav-config"

function homeSectionLinks() {
  const links: { href: string; label: string; description: string }[] = []
  for (const group of APP_NAV) {
    for (const item of group.items) {
      if (item.href === "/") continue
      links.push({
        href: item.href,
        label: item.label,
        description: item.tooltip,
      })
    }
  }
  return links
}

export default function HomePage() {
  const me = getStaffMemberById(DEMO_SESSION_STAFF_ID)
  if (!me) {
    throw new Error("Демо-пользователь не найден в справочнике сотрудников")
  }
  const team = getUnitColleaguesExcludingSelf(me)
  const path = getBreadcrumb(ORG_ROOT, me.unitId)
  const unitTrail = path
    .filter((u) => u.id !== ORG_ROOT.id)
    .map((u) => u.name)
    .join(" · ")
  const departmentName =
    path.length >= 2 && path[0]?.id === ORG_ROOT.id ? (path[1]?.name ?? "—") : "—"
  const orgProfile = {
    unitTrail,
    departmentName,
    managers: getStaffLineManagers(me, STAFF),
  }

  return (
    <HomeDashboard
      me={me}
      team={team}
      orgProfile={orgProfile}
      sectionLinks={homeSectionLinks()}
    />
  )
}
