import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ORG_ROOT, STAFF, getBreadcrumb } from "@/lib/bank-org-mock"

function formatFio(lastName: string, firstName: string, patronymic: string): string {
  return `${lastName} ${firstName} ${patronymic}`
}

export default function AssessmentPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <Tabs defaultValue="mine" className="flex w-full flex-1 flex-col gap-4">
        <TabsList className="group-data-horizontal/tabs:h-8 flex h-8 w-full overflow-hidden rounded-lg border border-border bg-muted p-px divide-x divide-border">
          <TabsTrigger
            value="mine"
            className="h-full rounded-none rounded-l-md border-0 px-1 py-0 text-sm leading-none shadow-none data-active:rounded-md"
          >
            Моя оценка
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="h-full rounded-none rounded-r-md border-0 px-1 py-0 text-sm leading-none shadow-none data-active:rounded-md"
          >
            Оценка команды
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="flex flex-1 flex-col py-6" />
        <TabsContent value="team" className="flex min-h-0 flex-1 flex-col py-6">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-border bg-card">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-sm">
                <colgroup>
                  <col className="w-4/12" />
                  <col className="w-3/12" />
                  <col className="w-5/12" />
                </colgroup>
                <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 backdrop-blur-sm">
                  <tr className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">ФИО</th>
                    <th className="px-3 py-2 font-medium">Должность</th>
                    <th className="px-3 py-2 font-medium">Подразделение</th>
                  </tr>
                </thead>
                <tbody>
                  {STAFF.map((s) => {
                    const unitPath = getBreadcrumb(ORG_ROOT, s.unitId)
                      .filter((u) => u.id !== ORG_ROOT.id)
                      .map((u) => u.name)
                      .join(" / ")
                    return (
                      <tr key={s.id} className="border-b border-border/80 hover:bg-muted/40">
                        <td className="min-w-0 px-3 py-2 align-middle">
                          <span className="block truncate font-medium">
                            {formatFio(s.lastName, s.firstName, s.patronymic)}
                          </span>
                        </td>
                        <td className="min-w-0 px-3 py-2 align-middle text-muted-foreground">
                          <span className="line-clamp-2 break-words">{s.position}</span>
                        </td>
                        <td className="min-w-0 px-3 py-2 align-middle text-muted-foreground">
                          <span className="line-clamp-2 break-words leading-snug">{unitPath}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
