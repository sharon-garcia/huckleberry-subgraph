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
      fetchPolicy: 'cache-first',
    })

    let data = result.data.finns
    let oldestTotalFees = new BigNumber(data[0].totalFees)
    let latestTotalFees = new BigNumber(data[data.length - 1].totalFees)
    let totalTransferAmount = data.reduce((reduced, next) => {
      for (let transfer of next.transfers) {
        reduced = reduced.plus(new BigNumber(transfer.value));
      }
      return reduced;
    }, new BigNumber(0));

    let apy = latestTotalFees.minus(oldestTotalFees).multipliedBy(oneYearPercent).dividedBy(totalTransferAmount).dividedBy(new BigNumber(historyDay))
    return apy.toString(10)
  } catch (err) {
    console.log('error: ', err)
  }
}
