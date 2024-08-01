import { getOwnedReposByUsernameGH } from '~/common/api/github'
import { getOwnedReposByUsernameGL } from '~/common/api/gitlab'

const reposListGetter: { [platform: string]: Function } = {
  github: (username: string) => getOwnedReposByUsernameGH(username),
  gitlab: (username: string) => getOwnedReposByUsernameGL(username)
}

function sumReposList(
  element1: GitDashboardRepository[],
  element2: GitDashboardRepository[]
): GitDashboardRepository[] {
  return [...element1, ...element2]
}

/**
 * Get the list of public repositories across the given platforms.
 * @param usernames Object mapping the platform name and the username on that platform.
 * @returns
 */
export const getFullOwnedReposList = async (usernames: {
  [platform: string]: string[]
}): Promise<GitDashboardRepository[]> => {
  const supportedPlatforms = Object.keys(usernames)

  const apiReposList: any[] = []
  for (const platform of supportedPlatforms) {
    if (reposListGetter[platform]) {
      usernames[platform].forEach((username: string) =>
        apiReposList.push(reposListGetter[platform](username))
      )
    }
  }

  const resolvedApiReposList = await Promise.all(apiReposList)

  let repos: GitDashboardRepository[] = []
  for (let i = 0, k = 0; i < supportedPlatforms.length; i++) {
    const platform = supportedPlatforms[i]
    for (let j = 0; j < usernames[platform].length; j++) {
      const parsed = resolvedApiReposList[k]
      repos = sumReposList(repos, parsed)
      k++
    }
  }

  return repos
}
