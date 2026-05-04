import type { TeamMatrixFilterTag } from "@/lib/assessment/team-matrix-filter-tags"

export function TeamMatrixFilterTags({
  tags,
}: {
  tags: TeamMatrixFilterTag[]
}) {
  if (tags.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm uppercase text-foreground"
        >
          <span className="min-w-0 truncate">{tag.label}</span>
          {tag.onClear ? (
            <button
              type="button"
              className="cursor-pointer rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label={`Убрать фильтр: ${tag.label}`}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                tag.onClear?.()
              }}
            >
              x
            </button>
          ) : null}
        </span>
      ))}
    </div>
  )
}
