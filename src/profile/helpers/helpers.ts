import { getContributionCalendarGH } from '~/common/api/github'
import { getContributionCalendarGL } from '~/common/api/gitlab'

const calendarGetter: { [platform: string]: Function } = {
  github: getContributionCalendarGH
  // gitlab: getContributionCalendarGL
}

/**
 * Returns an empty calendar.
 */
export const emptyCalendar = (): GitDashboardCalendar => {
  const today = new Date()
  const firstDay = new Date()
  firstDay.setDate(today.getDate() - 367) //TODO: leapyears

  const calendar: GitDashboardCalendar = {
    total: 0,
    weeks: []
  }

  let calendarWeek: { days: GitDashboardCalendarDay[]; firstDay: string } = {
    days: [],
    firstDay: firstDay.toISOString().split('T')[0]
  }

  for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
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
export const parseCalendarGithub = (data: GitHubCalendar): GitDashboardCalendar => {
  const calendar: GitDashboardCalendar = emptyCalendar()
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
const parseCalendarGitlab = (data: GitLabCalendar): GitDashboardCalendar => {
  const calendar: GitDashboardCalendar = emptyCalendar()
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
const sumCalendars = (a: GitDashboardCalendar, b: GitDashboardCalendar): GitDashboardCalendar => {
  const sumCalendar: GitDashboardCalendar = emptyCalendar()

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
export const getFullCalendar = async (usernames: {
  [platform: string]: string
}): Promise<GitDashboardCalendar> => {
  const supportedPlatforms = Object.keys(calendarGetter)

  // Get calendars from API
  const apiCalendars = []
  for (const platform of supportedPlatforms) {
    apiCalendars.push(calendarGetter[platform](usernames[platform]))
  }
  const resolvedApiCalendars = await Promise.all(apiCalendars)

  // Parse calendars into GitDashboardCalendar and sum them
  let calendar: GitDashboardCalendar = emptyCalendar()
  for (const i in supportedPlatforms) {
    const platform = supportedPlatforms[i]
    const parsed = calendarParser[platform](resolvedApiCalendars[i])
    calendar = sumCalendars(calendar, parsed)
  }

  return calendar
}
