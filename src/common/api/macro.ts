export const parseUserGH = (item: GitHubUser): GitUser => {
  return {
    platform: 'github',
    imgUrl: item.avatar_url,
    username: item.login,
    id: item.id,
    name: item.login,
    pageUrl: item.html_url
  }
}

export const parseRepoGH = (repo: GitHubRepository): GitRepository => {
  console.log(repo)
  return {
    id: repo.id,
    name: repo.name,
    owner: parseUserGH(repo.owner),
    language: repo.language,
    lastActivity: repo.updated_at
  }
}

export const parseUserGL = (user: GitLabUser): GitUser => {
  return {
    platform: 'gitlab',
    imgUrl: user.avatar_url,
    username: user.username,
    id: user.id,
    name: user.name,
    pageUrl: user.web_url
  }
}

export const parseRepoGL = (repo: GitLabRepository): GitRepository => {
  console.log(repo)
  return {
    id: repo.id,
    name: repo.name,
    owner: parseUserGL(repo.owner),
    language: repo.language,
    lastActivity: repo.last_activity_at
  }
}
