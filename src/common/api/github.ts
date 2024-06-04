import { Octokit } from 'octokit'

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_API_TOKEN
})

export const getIssues = (username: string) => {
  return octokit.request(`GET /users/${username}/events`, {
    owner: 'octocat',
    repo: 'Spoon-Knife'
  })
}
