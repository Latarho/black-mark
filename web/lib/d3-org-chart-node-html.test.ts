import { describe, expect, it } from "vitest"

import { buildOrgChartNodeHtml, escapeOrgChartHtml } from "@/lib/d3-org-chart-node-html"

const theme = {
  border: "border",
  cardBg: "card",
  muted: "muted",
  title: "title",
  staffBg: "staff",
}

describe("d3 org chart node html", () => {
  it("escapes dynamic text before embedding into d3 html templates", () => {
    expect(escapeOrgChartHtml(`<script data-x="1">&</script>`)).toBe(
      "&lt;script data-x=&quot;1&quot;&gt;&amp;&lt;/script&gt;"
    )
  })

  it("renders staff nodes with escaped name and role", () => {
    const html = buildOrgChartNodeHtml({
      raw: {
        id: "staff-1",
        parentId: "unit-1",
        kind: "staff",
        name: `<Иванов>`,
        role: `Разработка & "поддержка"`,
        initials: "ИИ",
      },
      isDark: false,
      theme,
    })

    expect(html).toContain("&lt;Иванов&gt;")
    expect(html).toContain("Разработка &amp; &quot;поддержка&quot;")
    expect(html).not.toContain("<Иванов>")
  })
})
