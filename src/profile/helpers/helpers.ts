import { getContributionCalendarGH } from '~/common/api/github'
import { getContributionCalendarGL } from '~/common/api/gitlab'

const calendarGetter: { [platform: string]: Function } = {
  github: getContributionCalendarGH,
  gitlab: getContributionCalendarGL
}

/**
 * Returns an empty calendar.
 */
const emptyCalendar = (): GitDashboardCalendar => {}

/**
 * Parse the GitHub API response to GitDashboardCalendar.
 * @param data
 */
const parseCalendarGithub = (data: GitHubCalendar): GitDashboardCalendar => {}

/**
 * Parse the GitLab API response to GitDashboardCalendar.
 * @param data
 */
const parseCalendarGitlab = (data: GitLabCalendar): GitDashboardCalendar => {}

const calendarParser: { [platform: string]: (...args: any[]) => GitDashboardCalendar } = {
  github: parseCalendarGithub,
  gitlab: parseCalendarGitlab
}

/**
 * Sum two commit calendars.
 */
const sumCalendars = (a: GitDashboardCalendar, b: GitDashboardCalendar): GitDashboardCalendar => {}

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
  await Promise.all(apiCalendars)

  // Parse calendars into GitDashboardCalendar and sum them
  let calendar: GitDashboardCalendar = emptyCalendar()
  for (const i in supportedPlatforms) {
    const platform = supportedPlatforms[i]
    const parsed = calendarParser[platform](apiCalendars[i])
    calendar = sumCalendars(calendar, parsed)
  }

  return calendar
}
