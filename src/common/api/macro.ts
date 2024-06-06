import { searchUserGH } from '~/common/api/github'
import { searchUserGL } from '~/common/api/gitlab'

const searchUserMap: { [platform: string]: (username: string) => any } = {
  github: searchUserGH,
  gitlab: searchUserGL
}

const parseUserGH = (data: GitHubUserSearchResponse): UserMacroAPI[] => {
  const result: UserMacroAPI[] = []
  for (const item of data.items) {
    result.push({
      platform: 'github',
      imgUrl: item.avatar_url,
      username: item.login,
      id: item.id,
      name: item.login,
      pageUrl: item.html_url
    })
  }
  return result
}

const parseUserGL = (data: GitLabUser[]): UserMacroAPI[] => {
  const result: UserMacroAPI[] = []
  for (const user of data) {
    result.push({
      platform: 'gitlab',
      imgUrl: user.avatar_url,
      username: user.username,
      id: user.id,
      name: user.name,
      pageUrl: user.web_url
    })
  }
  return result
}

const parseUserMap: { [platform: string]: (data: any) => UserMacroAPI[] } = {
  github: parseUserGH,
  gitlab: parseUserGL
}

export const searchUser = async (platforms: string[], username: string) => {
  const users: UserMacroAPI[] = []

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
