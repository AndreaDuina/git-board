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
  avatar_url: string
  html_url: string
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
  languages: { [key: string]: number }
  updated_at: Date
}

//

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

interface GitHubStarEvent {
  starred_at: string
  user: GitHubUser
}
