declare module "d3-org-chart" {
  export class OrgChart {
    constructor()
    container(c: string | HTMLElement): this
    data(rows: unknown[]): this
    layout(s: string): this
    compact(v: boolean): this
    initialExpandLevel(n: number): this
    nodeWidth(fn: (n?: unknown) => number): this
    nodeHeight(fn: (n?: unknown) => number): this
    childrenMargin(fn: (n?: unknown) => number): this
    siblingsMargin(fn: (n?: unknown) => number): this
    neighbourMargin(fn: (n?: unknown) => number): this
    nodeContent(
      fn: (d: { data: Record<string, unknown> }, ...rest: unknown[]) => string
    ): this
    onNodeClick(fn: (node: { data: Record<string, unknown> }) => void): this
    nodeButtonWidth(fn: (n?: unknown) => number): this
    nodeButtonHeight(fn: (n?: unknown) => number): this
    nodeButtonX(fn: (n?: unknown) => number): this
    nodeButtonY(fn: (n?: unknown) => number): this
    buttonContent(): (args: { node: unknown; state: unknown }) => string
    buttonContent(
      fn: (args: { node: unknown; state: unknown }) => string
    ): this
    svgWidth(w: number): this
    svgHeight(h: number): this
    fit(opts?: {
      animate?: boolean
      nodes?: unknown
      scale?: boolean
      onCompleted?: () => void
    }): this
    onZoom(fn: (event: { transform: { k: number; x: number; y: number } }) => void): this
    onZoomEnd(fn: (event: { transform: { k: number; x: number; y: number } }) => void): this
    render(): this
    clear(): void
    getChartState(): {
      data: Record<string, unknown>[]
      root?: unknown
      allNodes?: unknown[]
      lastTransform?: { k: number; x: number; y: number }
    }
    setHighlighted(nodeId: string | number): this
    clearHighlighting(): this
  }
}
