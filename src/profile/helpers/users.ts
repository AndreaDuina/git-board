import { db } from '~/common/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { emptyAccount } from '~/common/helpers/utils'

export const getUserData = async (uid: string): Promise<Account> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const accountData: Account = {
        username: userData.username || '',
        name: userData.name || 'Unknown',
        email: userData.email || '',
        imgUrl: userData.photoUrl || '',
        platforms: userData.platforms || {
          github: [],
          gitlab: []
        },
        socials: userData.socials || {}
      }
      return accountData
    } else {
      console.log('No user data found for UID:', uid)
      return emptyAccount()
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}
