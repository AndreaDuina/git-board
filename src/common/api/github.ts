import axios from 'axios'
import { lastYear, todayIso } from '../helpers/utils'
import { emptyCalendar } from '~/profile/helpers/helpers'

const ENDPOINT = 'https://api.github.com'

const axiosGH = axios.create({
  baseURL: ENDPOINT,
  headers: {
    Authorization: `bearer ${import.meta.env.VITE_GITHUB_API_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
})

/**
 * Get the daily contributions (grouped by week) for a given GitHub user.
 * @param username GitHub username.
 * @returns Contribution calendar
 */
export const getContributionCalendarGH = async (
  username: string,
  from = lastYear(),
  to = todayIso()
): Promise<GitHubCalendar | null> => {
  const body = {
    query: `query {
      user(login: "${username}") {
        contributionsCollection(from: "${from}", to: "${to}") {
          contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
            }
          }
        }
      }
    }`
  }

  try {
    const res = await axiosGH.post(`/graphql`, body)
    const calendar = res.data.data.user.contributionsCollection.contributionCalendar
    return calendar
  } catch (err) {
    console.error(`Error getting GitHub calendar for ${username}`, err)
    const reference = emptyCalendar(from, to)
    const empty: GitHubCalendar = { totalContributions: 0, weeks: [] }

    for (let i = 0; i < reference.weeks.length; i++) {
      const week: any = {
        contributionDays: [],
        firstDay: reference.weeks[i].firstDay
      }
      for (const day of reference.weeks[i].days) {
        week.contributionDays.push({
          contributionCount: day.count,
          date: day.date
        })
      }
      empty.weeks.push(week)
    }
    return empty
  }
}

export const getOneYearPushEventsGH = async (
  username: string,
  before: string,
  after: string
): Promise<GitHubPushEvent[]> => {
  let result: GitHubPushEvent[] = []

  // Perform 50 requests in groups of 5
  for (let i = 0; i < 10; i++) {
    const promises = []
    for (let j = 1; j <= 5; j++) {
      promises.push(getUserPushGH(username, i + j))
    }
    const response = await Promise.all(promises)
    const responseFlat = response.flat()

    // If getting activity earlier that `before` stop
    for (let i = 0; i < responseFlat.length; i++) {
      if (responseFlat[i].created_at < after) {
        result = [...result, ...responseFlat.slice(0, i)]
        break
      }
    }

    result = [...result, ...responseFlat]

    // If at least one response is empty stop
    if (response.some((val: any[]) => val.length == 0)) {
      break
    }
  }

  return result.filter((item: GitHubPushEvent) => item.created_at <= before)
}

const getUserPushGH = async (username: string, pageIdx = 1): Promise<GitHubPushEvent[]> => {
  try {
    const res = await axiosGH.get(`/users/${username}/events`, {
      params: {
        per_page: 100,
        page: pageIdx
      }
    })
    return res.data.filter((item: any) => item.type == 'PushEvent')
  } catch (err) {
    console.error(`Error getting GitHub for ${username} at page ${pageIdx}`)
    return []
  }
}

export const searchUserGH = async (username: string): Promise<GitHubUserSearchResponse> => {
  try {
    const res = await axiosGH.get(`/search/users?q=${encodeURIComponent(username)}&per_page=5`)
    return res.data
  } catch (err) {
    console.warn(`GitHub user ${username} not found`)
    return {
      total_count: 0,
      incomplete_results: true,
      items: []
    }
  }
}

// ##########################################################################################################################################################################################

export const getRepositories = async (username: string): Promise<GitHubRepo[]> => {
  const ownedRes = await axiosGH.get(`/users/${username}/repos`)
  return ownedRes.data
}

export const getRepoLanguages = async (
  owner: string,
  repo: string
): Promise<Record<string, number>> => {
  const res = await axiosGH.get(`/repos/${owner}/${repo}/languages`)
  return res.data
}

export const getRepoContributorStats = async (
  owner: string,
  repo: string
): Promise<GitHubRepoContributorStats[]> => {
  const res = await axiosGH.get(`/repos/${owner}/${repo}/stats/contributors`)
  return res.data
}

export const getGitHubLanguageProficiency = async (
  username: string
): Promise<GitHubUserLanguageProficiency> => {
  const repos = await getRepositories(username)

  const userProficiency: GitHubUserLanguageProficiency = {}

  for (const repo of repos) {
    const repoName = repo.name
    const owner = repo.owner.login
    const contributors = await getRepoContributorStats(owner, repoName)
    const languages: GitHubRepoLanguages = await getRepoLanguages(owner, repoName)

    let totalCommits = 0

    if (contributors.length > 0) {
      contributors.forEach((contributor: any) => {
        totalCommits += contributor.total
      })

      const ownerContributor = contributors.find(
        (contributor: any) => contributor.author.login === owner
      )
      const ownerCommits = ownerContributor ? ownerContributor.total : 0
      const ownerShare = ownerCommits / totalCommits

      for (const [language, kbOfCode] of Object.entries(languages)) {
        if (!userProficiency[language]) {
          userProficiency[language] = 0
        }
        const proficiency = kbOfCode * ownerShare
        userProficiency[language] += proficiency
      }
    }
  }

  return userProficiency
}
