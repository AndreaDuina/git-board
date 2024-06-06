interface GitLabCalendar {
  [date: string]: number
}

interface GitLabPushActivity {
  author_username: string
  created_at: string
  [key: string]: any
}

interface GitLabUser {
  id: number
  username: string
  name: string
  state: string
  avatar_url: string
  web_url: string
  [key: string]: any
}
