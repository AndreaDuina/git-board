import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getSpCards, getSpMarketGrouped, getSpSettings } from '~/common/api/splinterlandsApi'
import { getSpCardImg, getSpHash } from '~/common/helpers/splinterlandsHelpers'
import { SpCard, SpMarketHashedItem } from '~/common/types/splinterlands'

const CACHE_TIME = import.meta.env.VITE_CACHE_TIME
const ASSETS = import.meta.env.VITE_SPLINTERLANDS_ASSETS

export const useNftStore = defineStore('nft', () => {
  const splinterlands = ref({
    cards: {} as { [spHash: string]: SpCard },
    market: {} as { [spHash: string]: SpMarketHashedItem },
    settings: {} as any
  })

  const initSplinterlands = async () => {
    if (Object.keys(splinterlands.value.settings).length > 0) {
      console.log(`Using cached splinterlands`)
      return
    }
    const [cardsRes, settings, market] = await Promise.all([
      getSpCards(),
      getSpSettings(),
      getSpMarketGrouped()
    ])
    const cards: { [spHash: string]: SpCard } = {}
    const marketHashed: { [spHash: string]: SpMarketHashedItem } = {}

    // Card information
    for (const res of cardsRes) {
      res.editions = res.editions.split(',')
      for (const edition of res.editions) {
        const hash = getSpHash(res.id, false, parseInt(edition))
        const card: SpCard = {
          hash: hash,
          cardDetailId: res.id,
          gold: false,
          edition: parseInt(edition),
          rarity: res.rarity,
          name: res.name,
          img: ASSETS + getSpCardImg(res.name, parseInt(edition), false, res.tier),
          tier: res.tier
        }
        cards[hash] = card
        cards[getSpHash(res.id, true, parseInt(edition))] = {
          ...card,
          gold: true,
          img: ASSETS + getSpCardImg(res.name, parseInt(edition), true, res.tier)
        }
      }
    }

    // Market information
    for (const item of market) {
      marketHashed[getSpHash(item.card_detail_id, item.gold, item.edition)] = {
        low_price: parseFloat(item.low_price),
        low_price_bcx: parseFloat(item.low_price_bcx)
      }
    }
    // Fill market holes
    for (const hash in cards) {
      if (!marketHashed[hash]) {
        marketHashed[hash] = {
          low_price: 0,
          low_price_bcx: 0
        }
      }
    }

    splinterlands.value.settings = settings
    splinterlands.value.cards = cards
    splinterlands.value.market = marketHashed
  }

  return {
    splinterlands,
    initSplinterlands
  }
})
