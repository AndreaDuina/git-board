import { auth, firestore } from '~/common/firebase/firebase'
import { GithubAuthProvider, signInWithPopup, User } from 'firebase/auth'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'

const githubProvider = new GithubAuthProvider()

const usersRef = collection(firestore, 'users')

export const signInWithGitHub = async () => {
  try {
    const res = await signInWithPopup(auth, githubProvider)
    console.log(res)

    // Returns a GitHub Access Token, use it to access GitHub API
    const credential = GithubAuthProvider.credentialFromResult(res)
    const token = credential?.accessToken
    const user = res.user

    await onSignIn(user, token)
  } catch (err: any) {
    const errorCode = err.code
    const errorMessage = err.message
    const email = err.customData.email
    const credential = GithubAuthProvider.credentialFromError(err)
    console.log(`Error ${errorCode} during GitHub authentication for ${email}`, credential)
  }
}

const onSignIn = async (user: User, token: string | undefined = undefined) => {
  // Get user data from db
  const docSnap = await getDoc(doc(usersRef, user.uid))

  if (docSnap.exists()) {
    const data = docSnap.data()
    console.log(data)
  } else {
    console.log(`Data for user ${user.uid} not found`)
    // Add user to db
    await setDoc(doc(usersRef, user.uid), {
      name: user.displayName,
      email: user.email
    })
  }
}
