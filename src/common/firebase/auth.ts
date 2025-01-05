import { db } from '~/common/firebase/firebase'
import { GithubAuthProvider, signInWithPopup, User, getAuth, signOut } from 'firebase/auth'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'

const githubProvider = new GithubAuthProvider()
const usersRef = collection(db, 'users')

export const signInWithGitHub = async () => {
  try {
    const auth = getAuth()
    const res = await signInWithPopup(auth, githubProvider)
    const credential = GithubAuthProvider.credentialFromResult(res)
    const token = credential?.accessToken
    const user = res.user

    //FIXME: Firestore db rules
    await onSignIn(user, token)
  } catch (err: any) {
    const errorCode = err.code
    const credential = GithubAuthProvider.credentialFromError(err)
    console.log(`Error ${errorCode} during GitHub authentication`, credential)
  }
}

export const signOutFromGithub = async () => {
  const auth = getAuth()
  signOut(auth)
}

const onSignIn = async (user: User, token: string | undefined = undefined) => {
  const docSnap = await getDoc(doc(usersRef, user.uid))
  if (!docSnap.exists()) {
    const accountData: Account = {
      username: (user as any).reloadUserInfo.screenName,
      name: user.displayName || '',
      email: user.email || '',
      imgUrl: user.photoURL || '',
      platforms: {
        github: [(user as any).reloadUserInfo.screenName]
      },
      socials: {}
    }
    await setDoc(doc(usersRef, user.uid), accountData)
  }
}
