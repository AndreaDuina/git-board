import { getContributionCalendarGH } from '~/common/api/github'
import { getContributionCalendarGL } from '~/common/api/gitlab'
import { lastYear, todayIso } from '~/common/helpers/utils'

const calendarGetter: { [platform: string]: Function } = {
  github: getContributionCalendarGH,
  gitlab: getContributionCalendarGL
}

/**
 * Returns an empty calendar.
 */
export const emptyCalendar = (from = lastYear(), to = todayIso()): GitDashboardCalendar => {
  const calendar: GitDashboardCalendar = {
    total: 0,
    weeks: []
  }

  let calendarWeek: { days: GitDashboardCalendarDay[]; firstDay: string } = {
    days: [],
    firstDay: from.split('T')[0]
  }

  for (let d = new Date(from); d <= new Date(to); d.setDate(d.getDate() + 1)) {
    const calendarDay: GitDashboardCalendarDay = {
      count: 0,
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
  const githubDays: GitHubContributionDay[] = data.weeks.flatMap(week => week.contributionDays)
  const calendarDays: GitDashboardCalendarDay[] = calendar.weeks.flatMap(week => week.days)
  githubDays.forEach((githubDay, index) => {
    if (calendarDays[index]) {
      calendarDays[index].count = githubDay.contributionCount
    }
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
  usernames: { [platform: string]: string },
  from = lastYear(),
  to = todayIso()
): Promise<GitDashboardCalendar> => {
  const supportedPlatforms = Object.keys(usernames)

  // Get calendars from API
  const apiCalendars = []
  for (const platform of supportedPlatforms) {
    if (calendarGetter[platform]) {
      apiCalendars.push(calendarGetter[platform](usernames[platform], from, to))
    }
  }
  const resolvedApiCalendars = await Promise.all(apiCalendars)

  // Parse calendars into GitDashboardCalendar and sum them
  let calendar: GitDashboardCalendar = emptyCalendar(from, to)
  for (const i in supportedPlatforms) {
    const platform = supportedPlatforms[i]
    const parsed = calendarParser[platform](resolvedApiCalendars[i], from, to)
    calendar = sumCalendars(calendar, parsed, from, to)
  }

  return calendar
}
