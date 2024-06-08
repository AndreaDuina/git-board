import { auth } from '~/common/firebase/firebase'
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth'

const githubProvider = new GithubAuthProvider()

export const signInWithGitHub = async () => {
  try {
    const res = await signInWithPopup(auth, githubProvider)
    console.log(res)

    // Returns a GitHub Access Token, use it to access GitHub API
    const credential = GithubAuthProvider.credentialFromResult(res)
    const token = credential?.accessToken
    const user = res.user
  } catch (err: any) {
    const errorCode = err.code
    const errorMessage = err.message
    const email = err.customData.email
    const credential = GithubAuthProvider.credentialFromError(err)
    console.log(`Error ${errorCode} during GitHub authentication for ${email}`, credential)
  }
}
