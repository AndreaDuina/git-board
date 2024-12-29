import axios from 'axios'
import { lastYear, todayIso } from '../helpers/utils'
import { emptyCalendar } from '~/profile/helpers/calendar'

const ENDPOINT = 'https://api.github.com'

const axiosGH = axios.create({
  baseURL: ENDPOINT,
  headers: {
    Authorization: `bearer ${import.meta.env.VITE_GITHUB_API_TOKEN}`,
    Accept: 'application/vnd.github.v3.star+json'
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

/** FIXME: Not needed + Doesn't work
 */
// export const getOneYearPushActivityGH = async (
//   username: string,
//   before: string,
//   after: string
// ): Promise<GitHubPushEvent[]> => {
//   let result: GitHubPushEvent[] = []

//   // Perform 50 requests in groups of 5
//   for (let i = 0; i < 10; i++) {
//     const promises = []
//     for (let j = 1; j <= 5; j++) {
//       promises.push(getUserPushGH(username, i + j))
//     }
//     const response = await Promise.all(promises)
//     const responseFlat = response.flat()

//     // If getting activity earlier that `before` stop
//     for (let i = 0; i < responseFlat.length; i++) {
//       if (responseFlat[i].created_at < after) {
//         result = [...result, ...responseFlat.slice(0, i)]
//         break
//       }
//     }

//     result = [...result, ...responseFlat]

//     // If at least one response is empty stop
//     if (response.some((val: any[]) => val.length == 0)) {
//       break
//     }
//   }

//   return result.filter((item: GitHubPushEvent) => item.created_at <= before)
// }

/** FIXME: Not needed + Doesn't work
 */
// const getUserPushGH = async (username: string, pageIdx = 1): Promise<GitHubPushEvent[]> => {
//   try {
//     const res = await axiosGH.get(`/users/${username}/events`, {
//       params: {
//         per_page: 100,
//         page: pageIdx
//       }
//     })
//     return res.data.filter((item: any) => item.type == 'PushEvent')
//   } catch (err) {
//     console.error(`Error getting GitHub for ${username} at page ${pageIdx}`)
//     return []
//   }
// }

/**
 * Get the user data for a given GitHub user.
 * @param username GitHub username.
 * @returns User data
 */
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

/**
 * Get the list of public repos owned by a given GitHub user.
 * @param username GitHub username.
 * @returns Repository list
 */
export const getOwnedReposByUsernameGH = async (username: string): Promise<GitHubRepository[]> => {
  const ownedRepositoriesRes = await axiosGH.get(`/users/${username}/repos`)
  const repositories = ownedRepositoriesRes.data

  const enrichedRepositories = await Promise.all(
    repositories.map(async (repo: any) => {
      try {
        const languages = await getRepoLanguagesGH(repo) // Use the existing function here
        return {
          ...repo,
          language: Object.keys(languages).reduce((a, b) => (languages[a] > languages[b] ? a : b))
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
 * Fetches all repositories (owned and joined) for a given GitHub user.
 * @param username GitHub username.
 * @returns Repository list
 */
export const getAllReposByUsernameGH = async (username: string): Promise<GitHubRepository[]> => {
  throw new Error('Function getAllReposByUsernameGH is not yet implemented')
}

/**
 * Get the list of programming languages associated to a GitHub repository.
 * @param repo GitHub repository
 * @returns
 */
const getRepoLanguagesGH = async (repo: GitHubRepository): Promise<Record<string, number>> => {
  const res = await axiosGH.get(`/repos/${repo.owner.login}/${repo.name}/languages`)
  const languages: Record<string, number> = res.data
  const totalSize = Object.values(languages).reduce((total, size) => total + size, 0)
  const adjustedLanguages: Record<string, number> = {}
  for (const language of Object.keys(languages)) {
    adjustedLanguages[language] = (languages[language] * 100) / totalSize
  }

  return adjustedLanguages
}

/**
 * Get the contributors stats associated to a GitHub repository.
 * @param repo GitHub repository
 * @returns
 */
export const getRepoContributorStatsGH = async (
  repo: GitHubRepository
): Promise<GitHubRepoContributorStats[]> => {
  const res = await axiosGH.get(`/repos/${repo.owner.login}/${repo.name}/stats/contributors`)
  return res.data
}

/**
 * Get the programming languages used by a given GitHub user.
 * @param username GitHub username.
 * @returns Language portfolio
 */
export const getLanguagePortfolioGH = async (username: string): Promise<Record<string, number>> => {
  const repos = await getOwnedReposByUsernameGH(username)

  const languagePortfolio: Record<string, number> = {}

  for (const repo of repos) {
    const owner = repo.owner.login
    const contributors = await getRepoContributorStatsGH(repo)
    const languages: Record<string, number> = await getRepoLanguagesGH(repo)

    let totalCommits = 0

    if (contributors.length > 0) {
      contributors.forEach((contributor: any) => {
        totalCommits += contributor.total
      })

      const userContributor = contributors.find(
        (contributor: any) => contributor.author.login === owner
      )
      const userCommits = userContributor ? userContributor.total : 0
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

/**
 * Get the stars associated to a certain repository.
 * @param owner Username of the repository's owner.
 * @param repo Repository name.
 */
export const getRepoStarEventsGH = async (
  owner: string,
  repo: string
): Promise<GitHubStarEvent[]> => {
  const res = await axiosGH.get(`/repos/${owner}/${repo}/stargazers`)
  return res.data
}
