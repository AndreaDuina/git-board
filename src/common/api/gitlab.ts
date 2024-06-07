import axios from 'axios'
import { lastYear, todayIso } from '../helpers/utils'

const ENDPOINT = 'https://gitlab.com/api/v4'

const axiosGL = axios.create({
  baseURL: ENDPOINT,
  headers: {
    'PRIVATE-TOKEN': import.meta.env.VITE_GITLAB_API_TOKEN,
    'Content-Type': 'application/json'
  }
})

/**
 * Get the daily contributions for a given GitLab user.
 * @param username GitLab username.
 * @returns Contributions by day
 */
export const getContributionCalendarGL = async (
  username: string,
  from = lastYear(),
  to = todayIso()
): Promise<GitLabCalendar> => {
  // TODO: wait for release https://gitlab.com/gitlab-org/gitlab/-/issues/322153
  const yearActivity = await getOneYearPushActivityGL(username, from, to)

  const days: { [date: string]: number } = {}
  for (const push of yearActivity) {
    const date = push.created_at.substring(0, 10)
    if (!days[date]) {
      days[date] = 0
    }
    days[date]++
  }

  return days
}

/**
 * Get one year of push activity for a given GitLab user.
 * @param username GitLab username.
 * @returns
 */
export const getOneYearPushActivityGL = async (
  username: string,
  from: string,
  to: string
): Promise<GitLabPushActivity[]> => {
  let result: GitLabPushActivity[] = []

  // Perform 50 requests in groups of 5
  for (let i = 0; i < 10; i++) {
    const promises = []
    for (let j = 1; j <= 5; j++) {
      promises.push(getUserPushGL(username, from, to, i + j))
    }
    const response = await Promise.all(promises)
    result = [...result, ...response.flat()]
    // If at least one response is empty stop
    if (response.some((val: any[]) => val.length == 0)) {
      break
    }
  }
  return result
}

/**
 * Get GitLab 100 items of push activity for a given user. Stops at last year.
 * @param userId GitLab username.
 * @param pageIdx page index.
 * @returns
 */
const getUserPushGL = async (
  userId: string,
  from: string,
  to: string,
  pageIdx = 1
): Promise<GitLabPushActivity[]> => {
  try {
    const res = await axiosGL.get(`/users/${userId}/events`, {
      params: {
        action: 'pushed',
        per_page: 100,
        page: pageIdx,
        after: from,
        before: to
      }
    })
    return res.data
  } catch (err) {
    console.error(`Error getting GitLab for ${userId} at page ${pageIdx}`)
    return []
  }
}

export const searchUserGL = async (username: string): Promise<GitLabUser[]> => {
  try {
    const res = await axiosGL.get(`/users?username=${username}`)
    return res.data
  } catch (err) {
    console.warn(`GitLab user ${username} not found`)
    return []
  }
}

export const getGitLabLanguageProficiency = async (username: string): Promise<any> => {
  return {}
}
