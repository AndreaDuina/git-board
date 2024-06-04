import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { geckoNames, getCoinGeckoPriceAndChange } from '~/common/api/generalApi'
import { getHETokenMetrics, getHETokensInfo } from '~/core/api/hiveEngineApi'
import { timeFrame } from '~/common/helpers/formater'
import { arrayToHashed, toDouble } from '~/common/helpers/utils'
import { HETokenInfo, HETokenMetric } from '~/common/types/hiveEngine'
import { TokenInfo, TokenPrice } from '~/common/types/peakvault'
import hiveLogo from '~/assets/hive.svg'
import hbdLogo from '~/assets/hbd.svg'

export const useTokenStore = defineStore('token', () => {
  const hivePrice = ref(0)
  const priceValues = ref<{ [symbol: string]: TokenPrice }>({})
  const changes = ref<{ [symbol: string]: number }>({})
  const info: { [symbol: string]: TokenInfo } = {}
  const cacheMap: { [symbol: string]: number } = {}

  const specialIconsMap: { [symbol: string]: string } = {
    SPS: 'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/shop/cl/img_sps-shard_128.png',
    DEC: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/img_dec_fx_256.png',
    BEE: 'https://s3.amazonaws.com/steem-engine/images/icon_steem-engine_gradient.svg'
  }

  const prices = computed((): { [symbol: string]: TokenPrice } => {
    for (const symbol in priceValues.value) {
      priceValues.value[symbol].usd = priceValues.value[symbol].hive * hivePrice.value
    }
    return priceValues.value
  })

  // FIXME: Check values. Max and circualting supply can be approximated using coin gecko market cap
  info['HIVE'] = {
    type: 'core',
    url: 'https://hive.io/',
    description: '',
    icon: hiveLogo,
    name: 'Hive',
    circulatingSupply: '0',
    delegatioEnabled: true,
    issuer: 'Hive',
    maxSupply: '',
    precision: 6,
    stakingEnabled: true,
    supply: '',
    symbol: 'HIVE',
    undelegationCooldown: 0,
    unstakingCooldown: 0
  }
  info['HBD'] = {
    type: 'core',
    url: 'https://hive.io/',
    description: 'Stable coin pegged to  $1',
    icon: hbdLogo,
    name: 'Hive backed dollar',
    circulatingSupply: '0',
    delegatioEnabled: false,
    issuer: 'Hive',
    maxSupply: '',
    precision: 6,
    stakingEnabled: false,
    supply: '',
    symbol: 'HBD',
    undelegationCooldown: 0,
    unstakingCooldown: 0
  }

  /**
   * Update the tokens specified in symbols
   * @param symbols market symbols
   * @param force ignore cache
   */
  const updateTokens = async (symbols: string[] | 'all', force = false) => {
    if (symbols == 'all') {
      symbols = Object.keys(changes.value)
    }

    const matchHiveHbd = ['HIVE', 'HBD'].filter(s => symbols.indexOf(s) >= 0)
    const geckoPromise =
      matchHiveHbd.length > 0
        ? updateGeckoCoin(matchHiveHbd as ['HIVE' | 'HBD'] | ['HIVE', 'HBD'])
        : {}

    await Promise.all([geckoPromise, updateHETokens(symbols, force)])
  }

  /**
   * Update the Hive Engine tokens specified in symbols
   * @param symbols market symbols
   * @param force ignore cache
   */
  const updateHETokens = async (symbols: string[], force: boolean = false) => {
    symbols = symbols.filter(s => s != 'HIVE' && s != 'HBD')
    try {
      const [metrics, infoRes] = await Promise.all([
        getHETokenMetrics(symbols.filter(s => s != 'SWAP.HIVE' && s != 'SWAP.HBD')),
        getHETokensInfo(symbols)
      ])
      const newPrices: { [symbol: string]: TokenPrice } = {}
      const newChanges: { [symbol: string]: number } = {}

      // Hive engine tokens
      for (const metric of metrics) {
        const symbol = metric.symbol
        newPrices[symbol] = {
          usd: toDouble(metric.lastPrice) * hivePrice.value,
          hive: toDouble(metric.lastPrice)
        }
        newChanges[symbol] = parseFloat(metric.priceChangePercent)
      }

      for (const item of infoRes) {
        const metadata = JSON.parse(item.metadata)
        info[item.symbol] = {
          type: 'he',
          // FIXME: some tokens have already the full image link. Using /^http/ breaks other images
          icon: specialIconsMap[item.symbol]
            ? specialIconsMap[item.symbol]
            : 'https://images.hive.blog/36x0/' + metadata.icon,
          url: metadata.url,
          description: metadata.desc,
          ...item
        }
      }

      // Merge all data
      priceValues.value = {
        ...priceValues.value,
        ...newPrices
      }
      changes.value = {
        ...changes.value,
        ...newChanges
      }
    } catch (err) {
      console.error('Error updating HE tokens', err)
    }
  }

  /**
   * Get Coin Gecko API name for selected coins
   * @param symbol market symbols
   * @returns
   */
  const getGeckoName = (symbol: 'HIVE' | 'HBD'): string => {
    const res = geckoNames[symbol]
    if (!res) {
      throw `Unknown Coin Gecko name for ${symbol}`
    }
    return res
  }

  /**
   * Update HIVE and/or HBD price from Coin Gecko
   * @param symbols market symbols
   * @returns
   */
  const updateGeckoCoin = async (symbols: ['HIVE' | 'HBD'] | ['HIVE', 'HBD']) => {
    const geckoNames = symbols.map(s => getGeckoName(s))
    // Hive price is required to compute other prices
    if (!geckoNames.some(name => name == 'hive')) {
      geckoNames.push('hive')
    }

    let gecko: { [key: string]: any } = {}
    try {
      gecko = await getCoinGeckoPriceAndChange(geckoNames)
    } catch (err) {
      console.error(err)
    }

    if (Object.keys(gecko).length == 0) {
      console.error(`Couldn't update ${symbols}`)
      return
    }

    if (!gecko['hive']) {
      console.error(`Couldn't update ${symbols}: couldn't get Hive price from Coin Gecko`)
      return
    }

    // Hive and SWAP.HIVE
    const newPrices = {
      HIVE: { hive: 1, usd: gecko['hive'].usd },
      'SWAP.HIVE': { hive: 1, usd: gecko['hive'].usd }
    }
    const newChanges = {
      HIVE: gecko['hive'].usd_24h_change,
      'SWAP.HIVE': gecko['hive'].usd_24h_change
    }
    priceValues.value = { ...priceValues.value, ...newPrices }
    changes.value = { ...changes.value, ...newChanges }
    hivePrice.value = gecko['hive'].usd

    // HBD
    if (gecko['hive_dollar']) {
      priceValues.value['HBD'] = {
        hive: gecko.hive_dollar.usd / gecko['hive'].usd,
        usd: gecko.hive_dollar.usd
      }
      changes.value['HBD'] = gecko['hive_dollar'].usd_24h_change
    }
  }

  return {
    hivePrice,
    prices,
    changes,
    info,
    updateTokens
  }
})
