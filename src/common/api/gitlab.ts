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
): Promise<GitLabPushEvent[]> => {
  let result: GitLabPushEvent[] = []

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
): Promise<GitLabPushEvent[]> => {
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

/**
 * Get the user data for a given GitLab user.
 * @param username GitLab username.
 * @returns User data
 */
export const searchUserGL = async (username: string): Promise<GitLabUser[]> => {
  try {
    const res = await axiosGL.get(`/users?username=${username}`)
    return res.data
  } catch (err) {
    console.warn(`GitLab user ${username} not found`)
    return []
  }
}

/**
 * Fetcj the list of public repos owned by a given GitLab user.
 * @param username GitLab username.
 * @returns Repository list
 */
export const getOwnedReposByUsernameGL = async (username: string): Promise<GitLabRepository[]> => {
  const userAccount = await searchUserGL(username)
  const userId = userAccount[0].id
  const ownedRepositoriesRes = await axiosGL.get(`/users/${userId}/projects`)
  const repositories = ownedRepositoriesRes.data

  const enrichedRepositories = await Promise.all(
    repositories.map(async (repo: any) => {
      try {
        const languagesRes = await axiosGL.get(`/projects/${encodeURIComponent(repo.id)}/languages`)
        return {
          ...repo,
          language: Object.keys(languagesRes.data).reduce((a, b) =>
            languagesRes.data[a] > languagesRes.data[b] ? a : b
          )
        }
      } catch (error) {
        console.error(`Failed to fetch languages for project ${repo.id}:`, error)
        return {
          ...repo,
          languages: {}
        }
      }
    })
  )

  return enrichedRepositories
}

/**
 * Fetches all repositories (owned and joined) for a given GitLab user.
 * @param username GitLab username.
 * @returns A promise that resolves to a list of GitLab repositories.
 */
const getAllReposByUsernameGL = async (username: string): Promise<GitLabRepository[]> => {
  const ownedProjects: GitLabRepository[] = await getOwnedReposByUsernameGL(username)

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
      console.error(`Error getting GitLab joined requests for user ${userId} at page ${pageIdx}`)
      return []
    }
  }

  const userAccount = await searchUserGL(username)
  const userId = userAccount[0].id

  let joinedProjectEvents: GitLabJoinedProjectEvent[] = []
  const promises = []
  for (let i = 1; i <= 5; i++) {
    promises.push(getUserJoinedProjectEvents(userId, i))
  }
  const responses = await Promise.all(promises)
  joinedProjectEvents = responses.flat()

  const joinedProjects: GitLabRepository[] = []
  try {
    await Promise.all(
      joinedProjectEvents.map(async joinedEvent => {
        const res = await axiosGL(`/projects/${joinedEvent.project_id}`)
        joinedProjects.push(res.data)
      })
    )
  } catch (error) {
    console.error('Error fetching joined repos:', error)
  }

  const allProjects = [...ownedProjects, ...joinedProjects]

  return allProjects
}

/**
 * Get the list of programming languages associated to a GitLab repository.
 * @param repo GitLab repository
 * @returns
 */
const getRepoLanguagesGL = async (repo: GitLabRepository): Promise<Record<string, number>> => {
  const resLanguages = await axiosGL.get(`/projects/${repo.id}/languages`)
  const languages = resLanguages.data

  return languages
}

/**
 * Get the contributors stats associated to a GitLab repository.
 * @param repo GitLab repository
 * @returns
 */
const getRepoContributorStatsGL = async (repo: GitLabRepository): Promise<GitLabContributor[]> => {
  const res = await axiosGL.get(`/projects/${repo.id}/repository/contributors`)
  return res.data
}

/**
 * Get the programming languages used by a given GitLab user.
 * @param username Gitlab username.
 * @returns Language portfolio
 */
export const getLanguagePortfolioGL = async (username: string): Promise<Record<string, number>> => {
  const userAccount = await searchUserGL(username)
  const userFullName = userAccount[0].name
  const repos: GitLabRepository[] = await getAllReposByUsernameGL(username)

  const languagePortfolio: Record<string, number> = {}

  for (const repo of repos) {
    const contributors: GitLabContributor[] = await getRepoContributorStatsGL(repo)
    const languages: Record<string, number> = await getRepoLanguagesGL(repo)

    const adjustedLanguages: Record<string, number> = {}

    for (const language in languages) {
      adjustedLanguages[language] = languages[language] / 100
    }

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

      for (const [language, percentage] of Object.entries(adjustedLanguages)) {
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
