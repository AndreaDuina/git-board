import axios from 'axios'

const ENDPOINT = 'https://gitlab.com'

/**
 * Get the daily contributions for a given GitLab user.
 * @param username GitLab username.
 * @returns Contributions by day
 */
export const getContributionCalendarGL = async (
  username: string
): Promise<{ [date: string]: number }> => {
  return (await axios.get(`${ENDPOINT}/users/${username}/calendar.json`)).data
}
