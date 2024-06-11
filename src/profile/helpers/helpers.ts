import {
  getContributionCalendarGH,
  getLanguagePortfolioGH,
  getRepoStarsGH,
  getStarsHistoryGH
} from '~/common/api/github'
import { getContributionCalendarGL, getLanguagePortfolioGL } from '~/common/api/gitlab'
import { getNextSunday, getPreviousSunday, lastYear, todayIso } from '~/common/helpers/utils'

const calendarGetter: { [platform: string]: Function } = {
  github: (username: string, from: string, to: string) =>
    getContributionCalendarGH(username, from, to),
  gitlab: (username: string, from: string, to: string) =>
    getContributionCalendarGL(username, from, to)
}

const langPortfolioGetter: { [platform: string]: Function } = {
  github: (username: string) => getLanguagePortfolioGH(username),
  gitlab: (username: string) => getLanguagePortfolioGL(username)
}

const starHistoryGetter: { [platform: string]: Function } = {
  github: (username: string) => getStarsHistoryGH(username)
  // gitlab: (username: string) => getStarsHistoryGL(username)
}

/**
 * Returns an empty calendar.
 */
export const emptyCalendar = (from = lastYear(), to = todayIso()): GitDashboardCalendar => {
  // const nextSundayISO = getNextSunday(to)
  // const nextSunday = new Date(nextSundayISO)
  const previousSundayISO = getPreviousSunday(from)
  const previousSunday = new Date(previousSundayISO)

  const calendar: GitDashboardCalendar = {
    total: 0,
    weeks: []
  }

  let calendarWeek: { days: GitDashboardCalendarDay[]; firstDay: string } = {
    days: [],
    firstDay: from.split('T')[0]
  }

  const fromDate = new Date(from)
  const toDate = new Date(to)

  for (let d = new Date(previousSunday); d <= toDate; d.setDate(d.getDate() + 1)) {
    const calendarDay: GitDashboardCalendarDay = {
      count: d < fromDate || d > toDate ? -1 : 0,
      date: d.toISOString().split('T')[0]
    }
    calendarWeek.days.push(calendarDay)

    if (calendarWeek.days.length === 7) {
      calendarWeek.firstDay = calendarWeek.days[0].date
      calendar.weeks.push(calendarWeek)
      calendarWeek = { days: [], firstDay: '' }
    }
  }

  if (calendarWeek.days.length > 0) {
    calendarWeek.firstDay = calendarWeek.days[0].date
    calendar.weeks.push(calendarWeek)
  }

  return calendar
}

/**
 * Parse the GitHub API response to GitDashboardCalendar.
 * @param data
 */
export const parseCalendarGithub = (
  data: GitHubCalendar,
  from: string,
  to: string
): GitDashboardCalendar => {
  const calendar: GitDashboardCalendar = emptyCalendar(from, to)
  calendar.total = data.totalContributions

  const githubDays: { [key: string]: number } = {}

  data.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      githubDays[day.date] = day.contributionCount
    })
  })

  const calendarDays: GitDashboardCalendarDay[] = calendar.weeks.flatMap(week => week.days)

  calendarDays.forEach(calendarDay => {
    const date = calendarDay.date
    calendarDay.count = githubDays[date]
  })

  return calendar
}

/**
 * Parse the GitLab API response to GitDashboardCalendar.
 * @param data
 */
const parseCalendarGitlab = (
  data: GitLabCalendar,
  from: string,
  to: string
): GitDashboardCalendar => {
  const calendar: GitDashboardCalendar = emptyCalendar(from, to)
  const calendarDays: GitDashboardCalendarDay[] = calendar.weeks.flatMap(week => week.days)

  let total = 0

  calendarDays.forEach(calendarDay => {
    const date = calendarDay.date
    if (data[date]) {
      calendarDay.count = data[date]
      total += data[date]
    }
  })

  calendar.total = total

  return calendar
}

const calendarParser: { [platform: string]: (...args: any[]) => GitDashboardCalendar } = {
  github: parseCalendarGithub,
  gitlab: parseCalendarGitlab
}

/**
 * Sum two commit calendars.
 */
const sumCalendars = (
  a: GitDashboardCalendar,
  b: GitDashboardCalendar,
  from: string,
  to: string
): GitDashboardCalendar => {
  const sumCalendar: GitDashboardCalendar = emptyCalendar(from, to)

  let total = 0
  sumCalendar.weeks.forEach((week, wIndex) => {
    week.days.forEach((day, dIndex) => {
      const countA = a.weeks[wIndex]?.days[dIndex]?.count || 0
      const countB = b.weeks[wIndex]?.days[dIndex]?.count || 0
      const sumDay = countA + countB
      day.count = sumDay
      total += sumDay
    })
  })

  sumCalendar.total = total

  return sumCalendar
}

/**
 * Get the calendar sum of the commits across the given platforms.
 * @param usernames Object mapping the platform name and the username on that platform.
 * @returns
 */
export const getFullCalendar = async (
  usernames: { [platform: string]: string[] },
  from = lastYear(),
  to = todayIso()
): Promise<GitDashboardCalendar> => {
  const supportedPlatforms = Object.keys(usernames)

  // Get calendars from API
  const promisesCalendars: any[] = []
  for (const platform of supportedPlatforms) {
    if (calendarGetter[platform]) {
      usernames[platform].forEach((username: string) =>
        promisesCalendars.push(calendarGetter[platform](username, from, to))
      )
    }
  }
  const resCalendars = await Promise.all(promisesCalendars)

  // Parse calendars into GitDashboardCalendar and sum them
  let calendar: GitDashboardCalendar = emptyCalendar(from, to)
  for (let i = 0, k = 0; i < supportedPlatforms.length; i++) {
    const platform = supportedPlatforms[i]
    for (let j = 0; j < usernames[platform].length; j++) {
      const parsed = calendarParser[platform](resCalendars[k], from, to)
      calendar = sumCalendars(calendar, parsed, from, to)
      k++
    }
  }

  return calendar
}

/**
 * Sum two language portfolios.
 */
function sumLangProfs(
  element1: GitDashboardLanguageProficiency,
  element2: GitDashboardLanguageProficiency
): GitDashboardLanguageProficiency {
  const result: GitDashboardLanguageProficiency = { ...element1 }
  for (const key in element2) {
    if (result[key]) {
      result[key] += element2[key]
    } else {
      result[key] = element2[key]
    }
  }
  return result
}

/**
 * Get the language portfolio across the given platforms.
 * @param usernames Object mapping the platform name and the username on that platform.
 * @returns
 */
export const getFullLanguagePortfolio = async (usernames: {
  [platform: string]: string[]
}): Promise<GitDashboardLanguageProficiency> => {
  const supportedPlatforms = Object.keys(usernames)

  const apiLangProfs: any[] = []
  for (const platform of supportedPlatforms) {
    if (langPortfolioGetter[platform]) {
      usernames[platform].forEach((username: string) =>
        apiLangProfs.push(langPortfolioGetter[platform](username))
      )
    }
  }
  const resolvedApiLangProfs = await Promise.all(apiLangProfs)

  let langs: GitDashboardLanguageProficiency = {}
  for (let i = 0, k = 0; i < supportedPlatforms.length; i++) {
    const platform = supportedPlatforms[i]
    for (let j = 0; j < usernames[platform].length; j++) {
      const parsed = resolvedApiLangProfs[k]
      langs = sumLangProfs(langs, parsed)
      k++
    }
  }

  let sortedLangs = Object.fromEntries(
    Object.entries(langs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  )

  const totalSize = Object.values(sortedLangs).reduce((total, size) => total + size, 0)

  const normalizedLangs: Record<string, number> = {}

  for (const language of Object.keys(sortedLangs)) {
    normalizedLangs[language] = (sortedLangs[language] * 100) / totalSize
  }

  return normalizedLangs
}

/**
 * Parse the GitHub API response when getting a user star history.
 * @param data
 */
export const parseStarHistoryGithub = (data: GitHubStarEvent[]): GitDashboardStarHistory => {
  let history: GitDashboardStarHistory = {}

  for (const event of data) {
    const date: string = event.starred_at.substring(0, 7)
    if (history[date]) {
      history[date] += 1
    } else {
      history[date] = 1
    }
  }

  return history
}

export const parseStarHistoryGitlab = (data: GitLabStarEvent[]): GitDashboardStarHistory => {
  let history: GitDashboardStarHistory = {}
  return history
}

const starHistoryParser: { [platform: string]: (...args: any[]) => GitDashboardStarHistory } = {
  github: parseStarHistoryGithub,
  gitlab: parseStarHistoryGitlab
}

/**
 * Sum two star events to get the star history.
 */
function sumStarHistory(
  history1: GitDashboardStarHistory,
  history2: GitDashboardStarHistory
): GitDashboardStarHistory {
  const result: GitDashboardStarHistory = { ...history1 }
  for (const key in history2) {
    if (result[key]) {
      result[key] += history2[key]
    } else {
      result[key] = history2[key]
    }
  }
  return result
}

/**
 * Get the starring history across the given platforms.
 * @param usernames Object mapping the platform name and the username on that platform.
 * @returns
 */
export const getFullStarHistory = async (usernames: {
  [platform: string]: string[]
}): Promise<GitDashboardStarHistory> => {
  const supportedPlatforms = Object.keys(usernames)

  const apiStarHistory: any[] = []
  for (const platform of supportedPlatforms) {
    if (starHistoryGetter[platform]) {
      usernames[platform].forEach((username: string) =>
        apiStarHistory.push(starHistoryGetter[platform](username))
      )
    }
  }
  const resolvedApiStarHistory = await Promise.all(apiStarHistory)

  let starHistory: GitDashboardStarHistory = {}
  for (let i = 0, k = 0; i < supportedPlatforms.length; i++) {
    const platform = supportedPlatforms[i]
    for (let j = 0; j < usernames[platform].length; j++) {
      const parsed = starHistoryParser[platform](resolvedApiStarHistory[k])
      starHistory = sumStarHistory(starHistory, parsed)
      k++
    }
  }

  const formatDate = (year: number, month: number): string => {
    return `${year}-${month.toString().padStart(2, '0')}`
  }

  // Find the first and last dates in the data
  const dates = Object.keys(starHistory).sort()
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]

  // Extract year and month from first and last dates
  const [startYear, startMonth] = firstDate.split('-').map(Number)
  const [endYear, endMonth] = lastDate.split('-').map(Number)

  // Iterate over all months between the first and last dates
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      // Skip months before the start date and after the end date
      if (year === startYear && month < startMonth) continue
      if (year === endYear && month > endMonth) break

      const formattedDate = formatDate(year, month)

      // Fill in missing months with 0
      if (!starHistory[formattedDate]) {
        starHistory[formattedDate] = 0
      }
    }
  }

  let sortedStarHistory = Object.fromEntries(
    Object.entries(starHistory).sort(([a], [b]) => a.localeCompare(b))
  )

  let cumulativeStars = 0
  for (const date in sortedStarHistory) {
    if (sortedStarHistory[date]) {
      cumulativeStars += sortedStarHistory[date]
    }
    sortedStarHistory[date] = cumulativeStars
  }

  return sortedStarHistory
}
