import { getContributionCalendarGH, getGitHubLanguageProficiency } from '~/common/api/github'
import { getContributionCalendarGL, getGitLabLanguageProficiency } from '~/common/api/gitlab'
import { getNextSunday, getPreviousSunday, lastYear, todayIso } from '~/common/helpers/utils'

const calendarGetter: { [platform: string]: Function } = {
  github: (username: string, from: string, to: string) =>
    getContributionCalendarGH(username, from, to),
  gitlab: (username: string, from: string, to: string) =>
    getContributionCalendarGL(username, from, to)
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

const langProfsGetter: { [platform: string]: Function } = {
  github: (username: string) => getGitHubLanguageProficiency(username),
  gitlab: (username: string) => getGitLabLanguageProficiency(username)
}

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
 * Get the calendar sum of the commits across the given platforms.
 * @param usernames Object mapping the platform name and the username on that platform.
 * @returns
 */
export const getFullLanguageProficiency = async (usernames: {
  [platform: string]: string[]
}): Promise<GitDashboardLanguageProficiency> => {
  const supportedPlatforms = Object.keys(usernames)

  const apiLangProfs: any[] = []
  for (const platform of supportedPlatforms) {
    if (langProfsGetter[platform]) {
      usernames[platform].forEach((username: string) =>
        apiLangProfs.push(langProfsGetter[platform](username))
      )
    }
  }
  const resolvedApiLangProfs = await Promise.all(apiLangProfs)

  let langs: GitDashboardLanguageProficiency = {}
  for (let i = 0, k = 0; i < supportedPlatforms.length; i++) {
    const platform = supportedPlatforms[i]
    for (let j = 0; j < usernames[platform].length; j++) {
      const parsed = resolvedApiLangProfs[k] //TODO: parsers & normalization
      langs = sumLangProfs(langs, parsed)
      k++
    }
  }

  return langs
}
