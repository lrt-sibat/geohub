import type { IntervalLegendColorMapRow } from '$lib/types'

export const getMaxValueOfCharsInIntervals = (colorMapRows: IntervalLegendColorMapRow[]) => {
  // for each of the start and end of the colormap rows get the maximum
  // generate rowWidth based on the maximum
  return Math.max(
    ...colorMapRows.map((row) => {
      return Math.max(row.start.toString().length, row.end.toString().length)
    }),
  )
}