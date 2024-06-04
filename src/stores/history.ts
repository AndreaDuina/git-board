import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccountHistory } from '~/core/api/hiveApi'
import { useAccountStore } from '~/stores/accounts'

const CACHE_TIME = import.meta.env.VITE_CACHE_TIME

export const useHistoryStore = defineStore('history', () => {
  const data = ref([])
  let lastAccount = ''
  let lastCache = 0

  /**
   * Update account transaction history
   * @param from
   * @param limit
   * @param force ignore cache
   * @returns
   */
  const updateHistory = async (
    account: string,
    from: number = 0,
    limit: number = 1000,
    force: boolean = false
  ): Promise<void> => {
    if (!account) {
      console.error(`Couldn't update history: empty account`)
      return
    }
    // Check cache
    const now = new Date().getTime()
    if (account == lastAccount && !force && now - lastCache < CACHE_TIME) {
      console.info(`Using cached history`)
      return
    }

    /*const op = utils.operationOrders
    const operationsBitmask = utils.makeBitMaskFilter([
      op.transfer,
      op.transfer_to_vesting,
      op.withdraw_vesting,
      op.interest,
      op.liquidity_reward,
      op.transfer_to_savings,
      op.transfer_from_savings,
      op.escrow_transfer,
      op.cancel_transfer_from_savings,
      op.escrow_approve,
      op.escrow_dispute,
      op.escrow_release,
      op.fill_convert_request,
      op.fill_order,
      op.claim_reward_balance
    ])*/
    const res = await getAccountHistory(
      account,
      from,
      limit
      //operationsBitmask as [number, number]
    )
    // TODO: merge logic based on first number
    data.value = res
    lastCache = now
  }

  return {
    data,
    updateHistory
  }
})
