import { db } from '~/common/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const getUserData = async (uid: string): Promise<Account> => {
  return (await (await getDoc(doc(db, 'users', uid))).data()) as Account
}
