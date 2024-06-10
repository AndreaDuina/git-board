interface GitHubCalendar {
  totalContributions: number
  weeks: {
    contributionDays: GitHubContributionDay[]
    firstDay: string
  }[]
}

interface GitHubContributionDay {
  contributionCount: number
  date: string
}

interface GitHubPushEvent {
  created_at: string
  repo: {
    id: number
    name: string
    url: string
  }
  public: boolean
  [key: string]: any
}

interface GitHubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  score: number
}

interface GitHubUserSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubUser[]
}

interface GitHubRepository {
  id: number
  name: string
  owner: GitHubUser
}

interface GitHubRepoContributorStats {
  author: GitHubUser
  total: number
  weeks: {
    a: number
    c: number
    d: number
    w: number //week in some format
  }[]
}
