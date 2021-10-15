import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import BigNumber from 'bignumber.js'
import { finnClient } from '../apollo/client.js'
import { FINN_HISTORY_QUERY } from '../apollo/queries.js'

export const getFinnAPY = async function getFinnAPY(historyDay = 7) {
  dayjs.extend(utc)

  const oneYearPercent = new BigNumber(36000)
  const utcCurrentTime = dayjs()
  const utcHistoryDayBack = utcCurrentTime.subtract(historyDay, 'day').unix()
  console.log("utcHistoryDayBack:", utcHistoryDayBack, "utcCurrentTime:", utcCurrentTime.unix())

  try {
    // get the current data
    let result = await finnClient.query({
      query: FINN_HISTORY_QUERY,
      variables: {
        timestampFrom: utcHistoryDayBack,
        timestampTo: utcCurrentTime.unix(),
      },
      // fetchPolicy: 'cache-first',
      fetchPolicy: 'no-cache',
    })

    console.log("result:", JSON.stringify(result))
    let apy = new BigNumber(0)
    let {minFinn, maxFinn} = result.data
    if (!!minFinn.length && !!maxFinn.length) {
      // console.log("all totalFees:", data.map(v => v.totalFees))
      let oldestTotalFees = new BigNumber(minFinn[0].totalFees)
      let oldestTotalTransfered = new BigNumber(minFinn[0].totalTransferAmount)
      let latestTotalFees = new BigNumber(maxFinn[0].totalFees)
      let latestTotalTransfered = new BigNumber(maxFinn[0].totalTransferAmount)
      // console.log("oldestTotalFees:", oldestTotalFees.toString(10))
      // console.log("oldestTotalTransfered:", oldestTotalTransfered.toString(10))
      // console.log("latestTotalFees:", latestTotalFees.toString(10))
      // console.log("latestTotalTransfered:", latestTotalTransfered.toString(10))

      apy = latestTotalFees.minus(oldestTotalFees).multipliedBy(oneYearPercent).dividedBy(latestTotalTransfered.minus(oldestTotalTransfered)).dividedBy(new BigNumber(historyDay))
    }
    return apy.toString(10)
  } catch (err) {
    console.log('error: ', err)
  }
}
