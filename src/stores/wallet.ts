import { KeyRole } from 'hive-tx/helpers/PrivateKey'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sessionDelete, sessionRead } from '~/core/helpers/browser'
import { isOperation } from '~/core/helpers/utils'
import { Auth } from '~/core/modules/auth'
import { Operation } from '~/core/modules/hive'
import { WalletSettings } from '~/core/modules/wallet'
import { PendingSignature } from '~/core/schema/peakVaultEvents'
import { useAccountStore } from '~/stores/accounts'

export const useWalletStore = defineStore('wallet', () => {
  const accounts = useAccountStore()

  const auth = ref(new Auth())
  const settings = ref<WalletSettings>({
    darkMode: true
  })

  const hasPendingSig = ref(false)
  const newPendingSig: PendingSignature = {
    account: '',
    operations: [],
    keyRole: 'posting',
    meta: {
      broadcast: false,
      displayMessage: '',
      resId: -1,
      sourceUrl: '',
      rpc: 'https://api.hive.blog'
    }
  }
  const pendingSig = ref<PendingSignature>(newPendingSig)

  // Only to be used for in wallet transactions
  const hasLocalPendingSig = ref(false)
  const localPendingSig = ref<PendingSignature>(newPendingSig)

  const unlock = async (password: string, active: string = '') => {
    // Testing
    if (import.meta.env.DEV) {
      accounts.active = 'muwave'
      accounts.available = ['muwave', 'asgarth']
      auth.value.isLogged = true
      return
    }

    if (!password) {
      password = await sessionRead('password')
    }
    await auth.value.login(password)
    accounts.available = Object.keys(auth.value.accounts)

    if (active) {
      accounts.active = active
    } else {
      const account = Object.keys(auth.value.accounts)[0]
      accounts.active = account
    }
  }

  /**
   * Check if there is a transaction that needs to be signed.
   * If so store it in memory and remove it from session storage.
   * @returns
   */
  const checkForPendingSig = async () => {
    const res: PendingSignature | undefined = await sessionRead('pendingSig')
    await sessionDelete('pendingSig')
    if (res && res.keyRole && res.operations.length) {
      for (const op of res.operations) {
        if (!isOperation(op)) {
          console.error(`Invalid operation ${op}`)
          hasPendingSig.value = false
          return
        }
      }
      pendingSig.value = res
      hasPendingSig.value = true
      return
    }
    pendingSig.value = newPendingSig
    hasPendingSig.value = false
  }

  /**
   * Read desctructively the pending signature transaction.
   * @returns
   */
  const readPendingSig = () => {
    let result: PendingSignature = newPendingSig
    if (pendingSig.value.keyRole && pendingSig.value.operations.length) {
      result = pendingSig.value
      pendingSig.value = newPendingSig
    }
    hasPendingSig.value = false
    return result
  }

  const setLocalPendingSig = (pending: PendingSignature) => {
    hasLocalPendingSig.value = true
    localPendingSig.value = pending
  }

  const readLocalPendingSig = () => {
    let result: PendingSignature = newPendingSig
    if (localPendingSig.value.keyRole && localPendingSig.value.operations.length) {
      result = localPendingSig.value
      localPendingSig.value = newPendingSig
    }
    hasLocalPendingSig.value = false
    return result
  }

  return {
    auth,
    settings,
    unlock,
    hasPendingSig,
    checkForPendingSig,
    readPendingSig,
    hasLocalPendingSig,
    setLocalPendingSig,
    readLocalPendingSig
  }
})
