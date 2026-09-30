export type YearlyDataPoint = {
  year: number
  count: number
  share: number
}

export type TopName = {
  name: string
  gender: 'M' | 'F'
  peakYear: number
  /** [p10Year, p50Year, p90Year] — birth year range for 80% of people with this name */
  predictedRange: [number, number, number]
  yearlyData: YearlyDataPoint[]
}

export type ComebackName = {
  name: string
  gender: 'M' | 'F'
  /** [year, share of all births] pairs, 1910 to latest year */
  yearlyData: [number, number][]
  originalPeakYear: number
  troughYear: number
  comebackYear: number
  originalPeakShare: number
  recoveryShare: number
}

export type UnisexYearlyPoint = {
  year: number
  maleShare: number
  femaleShare: number
}

export type UnisexName = {
  name: string
  crossoverYear: number | null
  yearlyData: UnisexYearlyPoint[]
}

export type RegionalHighlight = {
  name: string
  gender: 'M' | 'F'
  state: string
  stateShare: number
  nationalShare: number
  ratio: number
}

/** Top 10 names for one year: [name, count] pairs in rank order */
export type YearlyTop = {
  year: number
  F: [string, number][]
  M: [string, number][]
}

export type BabyNamesData = {
  metadata: {
    totalNames: number
    yearsRange: [number, number]
    fetchedAt: string
    totalBirths: number
  }
  topNames: TopName[]
  yearlyTop: YearlyTop[]
  comebackNames: ComebackName[]
  unisexNames: UnisexName[]
  regionalHighlights: RegionalHighlight[]
}
