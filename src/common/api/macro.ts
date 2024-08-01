import { searchUserGH } from '~/common/api/github'
import { searchUserGL } from '~/common/api/gitlab'

const searchUserMap: { [platform: string]: (username: string) => any } = {
  github: searchUserGH,
  gitlab: searchUserGL
}

export const parseSingleUserGH = (item: GitHubUser): GitUser => {
  return {
    platform: 'github',
    imgUrl: item.avatar_url,
    username: item.login,
    id: item.id,
    name: item.login,
    pageUrl: item.html_url
  }
}

export const parseSingleUserGL = (user: GitLabUser): GitUser => {
  return {
    platform: 'gitlab',
    imgUrl: user.avatar_url,
    username: user.username,
    id: user.id,
    name: user.name,
    pageUrl: user.web_url
  }
}

const parseUserListGH = (data: GitHubUserSearchResponse): GitUser[] => {
  return data.items.map(parseSingleUserGH)
}

const parseUserListGL = (data: GitLabUser[]): GitUser[] => {
  return data.map(parseSingleUserGL)
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
