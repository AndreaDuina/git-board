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
  // Get user data from db
  const docSnap = await getDoc(doc(usersRef, user.uid))
  if (docSnap.exists()) {
    const data = docSnap.data()
    // console.log(data)
  } else {
    console.log(`Data for user ${user.uid} not found. Creating new user.`)
    await setDoc(doc(usersRef, user.uid), {
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
      platforms: {
        github: [user.reloadUserInfo.screenName]
      }
    })
  }
}
