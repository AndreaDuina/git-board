interface GitLabCalendar {
  [date: string]: number
}

interface GitLabPushActivity {
  author_username: string
  created_at: string
  [key: string]: any
}
