interface GitHubCalendar {
  totalContributions: number
  weeks: {
    contributionDays: GitHubContributionDay[]
  }[]

interface GitHubContributionDay {
  contributionCount: number
  [date]: string
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
