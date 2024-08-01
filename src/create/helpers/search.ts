import { searchUserGH } from '~/common/api/github'
import { searchUserGL } from '~/common/api/gitlab'
import { parseUserGH, parseUserGL } from '~/common/api/macro'

const searchUserMap: { [platform: string]: (username: string) => any } = {
  github: searchUserGH,
  gitlab: searchUserGL
}

const parseUserListGH = (data: GitHubUserSearchResponse): GitUser[] => {
  return data.items.map(parseUserGH)
}

const parseUserListGL = (data: GitLabUser[]): GitUser[] => {
  return data.map(parseUserGL)
}

const parseUserMap: { [platform: string]: (data: any) => GitUser[] } = {
  github: parseUserListGH,
  gitlab: parseUserListGL
}

export const searchUser = async (platforms: string[], username: string) => {
  const users: GitUser[] = []

  const promises = []
  for (const platform of platforms) {
    promises.push(searchUserMap[platform](username))
  }
  const apiRes = await Promise.all(promises)

  for (const i in platforms) {
    const platform = platforms[i]
    users.push(...parseUserMap[platform](apiRes[i]))
  }

  return users
}
