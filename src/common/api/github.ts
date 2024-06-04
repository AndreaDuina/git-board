import axios from 'axios'

const ENDPOINT = 'https://api.github.com/graphql'

const config = {
  headers: {
    Authorization: `bearer ${import.meta.env.VITE_GITHUB_API_TOKEN}`
  }
}

/**
 * Get the daily contributions (grouped by week) for a given GitHub user.
 * @param username GitHub username.
 * @returns Contribution calendar
 */
export const getContributionCalendarGH = async (
  username: string
): Promise<GitHubCalendar | null> => {
  const body = {
    query: `query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            colors
              totalContributions
              weeks {
                contributionDays {
                  color
                  contributionCount
                  date
                  weekday
                }
              firstDay
            }
          }
        }
      }
    }`
  }

  const res = await axios.post(ENDPOINT, body, config)
  const calendar = res.data.data.user.contributionsCollection.contributionCalendar
  return calendar
}
