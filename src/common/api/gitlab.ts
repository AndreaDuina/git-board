import axios from 'axios'
import { lastYear, todayIso } from '../helpers/utils'
import { join } from 'path'

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

// #############################################

/**
 * Get GitLab 100 joined project events for a given user.
 * @param userId GitLab username.
 * @param pageIdx page index.
 * @returns
 */
const getUserJoinedProjectEvents = async (
  userId: number,
  pageIdx = 1
): Promise<GitLabJoinedProjectEvent[]> => {
  try {
    const res = await axiosGL.get(`/users/${userId}/events`, {
      params: {
        action: 'joined',
        per_page: 100,
        page: pageIdx
      }
    })
    return res.data
  } catch (err) {
    console.error(`Error getting GitLab merge requests for user ${userId} at page ${pageIdx}`)
    return []
  }
}

/**
 * Get the ids of all the projects in which a user is involved.
 * @param userId GitLab user id.
 * @returns
 */
const getProjectIdsByUserIdGL = async (userId: number): Promise<number[]> => {
  const ownedProjectsRes = await axiosGL.get(`/users/${userId}/projects`)
  const ownedProjects: GitLabProject[] = ownedProjectsRes.data
  const ownedProjectsIds: number[] = [
    ...new Set(ownedProjects.map((project: GitLabProject) => project.id))
  ]

  let joinedProjectEvents: GitLabJoinedProjectEvent[] = []
  const promises = []
  for (let i = 1; i <= 5; i++) {
    promises.push(getUserJoinedProjectEvents(userId, i))
    const response = await Promise.all(promises)
    joinedProjectEvents = [...joinedProjectEvents, ...response.flat()]
    // If at least one response is empty stop
    if (response.some((val: any[]) => val.length == 0)) {
      break
    }
  }

  const joinedProjectsIds: number[] = [
    ...new Set(joinedProjectEvents.map((event: any) => event.project_id))
  ]

  const allProjectIds = [...ownedProjectsIds, ...joinedProjectsIds]
  return allProjectIds
}

const getProjectLanguagesGL = async (projectId: number): Promise<Record<string, number>> => {
  const resLanguages = await axiosGL.get(`/projects/${projectId}/languages`)
  const languages = resLanguages.data
  const adjustedLanguages: Record<string, number> = {}

  for (const language in languages) {
    adjustedLanguages[language] = languages[language] / 100
  }

  return adjustedLanguages
}

const getProjectContributorStatsGL = async (projectId: number): Promise<GitLabContributor[]> => {
  const res = await axiosGL.get(`/projects/${projectId}/repository/contributors`)
  return res.data
}

/**
 * Get the programming languages used by a given GitLab user.
 * @param username Gitlab username.
 * @returns Language portfolio
 */
export const getLanguagePortfolioGL = async (username: string): Promise<Record<string, number>> => {
  const userAccount = await searchUserGL(username)
  const userId = userAccount[0].id
  const userFullName = userAccount[0].name
  const projectIds = await getProjectIdsByUserIdGL(userId)

  const languagePortfolio: Record<string, number> = {}

  for (const projectId of projectIds) {
    const contributors: GitLabContributor[] = await getProjectContributorStatsGL(projectId)
    const languages: Record<string, number> = await getProjectLanguagesGL(projectId)

    let totalCommits = 0

    if (contributors.length > 0) {
      contributors.forEach((contributor: GitLabContributor) => {
        totalCommits += contributor.commits
      })

      const userContributor = contributors.find(
        (contributor: any) => contributor.name === username || contributor.name === userFullName
      )
      const userCommits = userContributor ? userContributor.commits : 0
      const userShare = (userCommits * userCommits) / totalCommits

      for (const [language, percentage] of Object.entries(languages)) {
        if (!languagePortfolio[language]) {
          languagePortfolio[language] = 0
        }
        const proficiency = percentage * userShare
        languagePortfolio[language] += proficiency
      }
    }
  }

  return languagePortfolio
}
