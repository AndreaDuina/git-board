interface GitDashboardCalendar {
  total: number
  weeks: {
    days: GitDashboardCalendarDay[]
    firstDay: string
  }[]
}

interface GitDashboardCalendarDay {
  count: number
  date: string
}

interface PushMap {
  [date: string]: number
}

interface Account {
  username: string
  name: string
  email: string
  imgUrl: string
  platforms: {
    [key: string]: string[]
  }
  socials: {
    [key: string]: string
  }
}

interface GitUser {
  platform: string
  imgUrl: string
  username: string
  id: number
  name: string
  pageUrl: string
}

interface GitRepository {
  id: number
  name: string
  owner: GitUser
}

//

interface GitDashboardLanguageProficiency {
  [language: string]: number
}

interface GitDashboardStarEvent {
  date: string
  count: number
}
