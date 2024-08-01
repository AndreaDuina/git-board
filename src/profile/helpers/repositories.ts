import { getOwnedReposByUsernameGH } from '~/common/api/github'
import { getOwnedReposByUsernameGL } from '~/common/api/gitlab'
import { parseRepoGH, parseRepoGL } from '~/common/api/macro'

const reposListGetter: { [platform: string]: Function } = {
  github: (username: string) => getOwnedReposByUsernameGH(username),
  gitlab: (username: string) => getOwnedReposByUsernameGL(username)
}

function sumReposList(element1: GitRepository[], element2: GitRepository[]): GitRepository[] {
  return [...element1, ...element2]
}

const parseRepoListGithub = (repoList: any[]): GitRepository[] => {
  return repoList.map(parseRepoGH)
}

const parseRepoListGitlab = (repoList: any[]): GitRepository[] => {
  return repoList.map(parseRepoGL)
}

const repoParser: { [platform: string]: (...args: any[]) => GitRepository[] } = {
  github: parseRepoListGithub,
  gitlab: parseRepoListGitlab
}

/**
 * Get the list of public repositories across the given platforms.
 * @param usernames Object mapping the platform name and the username on that platform.
 * @returns
 */
export const getFullOwnedReposList = async (usernames: {
  [platform: string]: string[]
}): Promise<GitRepository[]> => {
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

  let repos: GitRepository[] = []
  for (let i = 0, k = 0; i < supportedPlatforms.length; i++) {
    const platform = supportedPlatforms[i]
    for (let j = 0; j < usernames[platform].length; j++) {
      console.log(resolvedApiReposList[k])
      const parsed = repoParser[platform](resolvedApiReposList[k])
      repos = sumReposList(repos, parsed)
      k++
    }
  }

  console.log(repos)

  return repos
}
