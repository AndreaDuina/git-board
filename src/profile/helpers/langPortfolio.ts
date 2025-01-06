import { getLanguagePortfolioGH } from '~/common/api/github'
import { getLanguagePortfolioGL } from '~/common/api/gitlab'

const langPortfolioGetter: { [platform: string]: Function } = {
  github: (username: string) => getLanguagePortfolioGH(username),
  gitlab: (username: string) => getLanguagePortfolioGL(username)
}

/**
 * Sum two language portfolios.
 */
function sumLangProfs(
  element1: GitLanguagePortfolio,
  element2: GitLanguagePortfolio
): GitLanguagePortfolio {
  const result: GitLanguagePortfolio = { ...element1 }
  for (const key in element2) {
    if (result[key]) {
      result[key] += element2[key]
    } else {
      result[key] = element2[key]
    }
  }
  return result
}

/**
 * Get the language portfolio across the given platforms.
 * @param usernames Object mapping the platform name and the username on that platform.
 * @returns
 */
export const getFullLanguagePortfolio = async (usernames: {
  [platform: string]: string[]
}): Promise<GitLanguagePortfolio> => {
  const supportedPlatforms = Object.keys(usernames)

  const apiLangProfs: any[] = []
  for (const platform of supportedPlatforms) {
    if (langPortfolioGetter[platform]) {
      usernames[platform].forEach((username: string) =>
        apiLangProfs.push(langPortfolioGetter[platform](username))
      )
    }
  }
  const resolvedApiLangProfs = await Promise.all(apiLangProfs)

  let langs: GitLanguagePortfolio = {}
  for (let i = 0, k = 0; i < supportedPlatforms.length; i++) {
    const platform = supportedPlatforms[i]
    for (let j = 0; j < usernames[platform].length; j++) {
      const parsed = resolvedApiLangProfs[k]
      langs = sumLangProfs(langs, parsed)
      k++
    }
  }

  let sortedLangs = Object.fromEntries(
    Object.entries(langs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  )

  const totalSize = Object.values(sortedLangs).reduce((total, size) => total + size, 0)

  const normalizedLangs: Record<string, number> = {}

  for (const language of Object.keys(sortedLangs)) {
    normalizedLangs[language] = (sortedLangs[language] * 100) / totalSize
  }

  return normalizedLangs
}
