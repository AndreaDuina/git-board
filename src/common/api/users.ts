import { db } from '~/common/firebase/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const getUserData = async (uid: string): Promise<Account> => {
  return (await (await getDoc(doc(db, 'users', uid))).data()) as Account
}

export const setUserData = async (uid: string, data: Account): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), data)
    console.log('User data successfully written!')
  } catch (error) {
    console.error('Error writing user data: ', error)
    throw error
  }
}
