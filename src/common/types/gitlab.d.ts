interface GitLabCalendar {
  [date: string]: number
}

interface GitLabPushEvent {
  author_username: string
  created_at: string
  [key: string]: any
}

interface GitLabUser {
  id: number
  username: string
  name: string
  avatar_url: string
  web_url: string
}

interface GitLabRepository {
  id: number
  name: string
  owner: GitLabUser
  languages: { [key: string]: number }
  last_activity_at: Date
}

//

interface GitLabContributor {
  additions: number
  commits: number
  deletions: number
  email: string
  name: string
}

interface GitLabJoinedProjectEvent {
  id: number
  project_id: number
  title: string
}
