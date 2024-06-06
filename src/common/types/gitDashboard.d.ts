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

interface UserMacroAPI {
  platform: string
  imgUrl: string
  username: string
  id: number
  name: string
  pageUrl: string
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
