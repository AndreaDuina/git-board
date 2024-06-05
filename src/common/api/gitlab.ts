import axios from 'axios'
import { lastYear } from '../helpers/utils'

const ENDPOINT = 'https://gitlab.com'

const axiosGL = axios.create({
  baseURL: 'https://gitlab.com/api/v4',
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
export const getContributionCalendarGL = async (username: string): Promise<GitLabCalendar> => {
  // TODO: wait for release https://gitlab.com/gitlab-org/gitlab/-/issues/322153
  const yearActivity = await getOneYearPushActivity(username)

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
const getOneYearPushActivity = async (username: string): Promise<GitLabPushActivity[]> => {
  let result: GitLabPushActivity[] = []

  // Perform 50 requests in groups of 5
  for (let i = 0; i < 10; i++) {
    const promises = []
    for (let j = 1; j <= 1; j++) {
      promises.push(getUserPushGL(username, i + j))
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
const getUserPushGL = async (userId: string, pageIdx = 1): Promise<GitLabPushActivity[]> => {
  const res = await axiosGL.get(`/users/${userId}/events`, {
    params: {
      action: 'pushed',
      after: lastYear(),
      per_page: 100,
      page: pageIdx
    }
  })
  return res.data
}
