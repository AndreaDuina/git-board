import { defineStore } from 'pinia'
import { ComputedRef, computed, ref } from 'vue'
import { getAccount, getRCPercent } from '~/core/api/hiveApi'
import { getAccountHEBalances } from '~/core/api/hiveEngineApi'
import { vestsToHive } from '~/common/helpers/hiveHelpers'
import { HEAccountBalance } from '~/common/types/hiveEngine'
import { useTokenStore } from './token'
import { Balance } from '~/common/types/peakvault'
import { Account } from '~/common/modules/Account'
import { Auth } from '~/core/modules/auth'
import { useHistoryStore } from './history'

//const tokens = useTokenStore()

export const useAccountStore = defineStore('account', () => {
  const history = useHistoryStore()

  const byUsername: { [username: string]: Account } = {}
  const active = ref('')
  const available = ref<string[]>([])

  const getAccount = async (username: string): Promise<Account> => {
    if (byUsername[username] == undefined) {
      const account = new Account(username)
      await account.updateAccount()
      byUsername[username] = account
      return account
    } else {
      await byUsername[username].updateAccount()
      return byUsername[username]
    }
  }

  /**
   * Update the current account's history.
   * @param from
   * @param limit
   * @param force ignore cache
   * @returns
   */
  const updateActiveHistory = async (
    from: number = 0,
    limit: number = 1000,
    force: boolean = false
  ): Promise<void> => {
    return history.updateHistory(active.value, from, limit, force)
  }

  return {
    active,
    available,
    getAccount,
    updateActiveHistory
  }
})
