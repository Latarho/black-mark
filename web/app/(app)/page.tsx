import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function AssessmentPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <Tabs defaultValue="mine" className="flex w-full flex-1 flex-col gap-4">
        <TabsList className="flex w-full overflow-hidden rounded-lg border border-border bg-muted p-[3px] divide-x divide-border">
          <TabsTrigger
            value="mine"
            className="rounded-none rounded-l-md border-0 shadow-none data-active:rounded-md"
          >
            Моя оценка
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-none rounded-r-md border-0 shadow-none data-active:rounded-md"
          >
            Оценка команды
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="flex flex-1 flex-col py-6" />
        <TabsContent value="team" className="flex flex-1 flex-col py-6" />
      </Tabs>
    </div>
  )
}
