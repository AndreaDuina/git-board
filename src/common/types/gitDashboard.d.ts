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
