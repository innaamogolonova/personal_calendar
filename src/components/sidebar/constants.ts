export const PROJECT_ROW_PADDING = 16
export const PAGE_BASE_PADDING = PROJECT_ROW_PADDING + 14
export const PAGE_DEPTH_STEP = 8

export function pagePaddingLeft(depth: number): number {
  return PAGE_BASE_PADDING + depth * PAGE_DEPTH_STEP
}
