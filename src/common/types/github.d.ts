interface GitHubCalendar {
  colors: string[]
  totalContributions: number
  weeks: {
    contributionDays: GitHubContributionDay[]
    firstDay: string
  }[]
}

interface GitHubContributionDay {
  color: string
  contributionCount: number
  date: string
  weekday: number
}
