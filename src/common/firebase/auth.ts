import { firestore, auth } from '~/common/firebase/firebase'
import { GithubAuthProvider, signInWithPopup, User, getAuth, signOut } from 'firebase/auth'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'

const githubProvider = new GithubAuthProvider()
const usersRef = collection(firestore, 'users')

export const signInWithGitHub = async () => {
  try {
    const res = await signInWithPopup(auth, githubProvider)
    const credential = GithubAuthProvider.credentialFromResult(res)
    const token = credential?.accessToken
    const user = res.user

    //FIXME: Error permission-denied during GitHub auth
    // await onSignIn(user, token)
  } catch (err: any) {
    const errorCode = err.code
    const credential = GithubAuthProvider.credentialFromError(err)
    console.log(`Error ${errorCode} during GitHub authentication`, credential)
  }
}

export const signOutFromGithub = async () => {
  signOut(auth)
    .then(() => {
      console.log('User signed out successfully.')
    })
    .catch(error => {
      console.error('Error signing out: ', error)
    })
}

// const onSignIn = async (user: User, token: string | undefined = undefined) => {
//   // Get user data from db
//   console.log('Here', user)
//   const docSnap = await getDoc(doc(usersRef, user.uid))
//   console.log(docSnap)

//   if (docSnap.exists()) {
//     const data = docSnap.data()
//     console.log(data)
//   } else {
//     console.log(`Data for user ${user.uid} not found`)
//     await setDoc(doc(usersRef, user.uid), {
//       name: user.displayName,
//       email: user.email
//     })
//   }
// }
