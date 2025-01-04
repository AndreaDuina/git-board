import { db } from '~/common/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const fetchUserData = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      console.log(userData)
      return userData
    } else {
      console.log('No user data found for UID:', uid)
      return null
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}
