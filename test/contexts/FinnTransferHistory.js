import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import BigNumber from 'bignumber.js'
import { finnClient } from '../apollo/client.js'
import { FINN_HISTORY_QUERY } from '../apollo/queries.js'
import multiCall from '@makerdao/multicall'

async function getCirculationAmount(rpcUrl) {
  const multiCallAddr = "0x1Fe0C23940FcE7f440248e00Ce2a175977EE4B16".toLowerCase();
  const huckleberryFarmAddr = "0x1f4b7660b6AdC3943b5038e3426B33c1c0e343E6".toLowerCase();
  const huckleberryAirDropAddr = "0xc95a4bc5C14CC6a23AF46BA50D3785d5fd55446d".toLowerCase();
  const huckleberryFinnAddr = "0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756".toLowerCase();

  const calls = [
    {
      target: huckleberryFinnAddr,
      call: ['balanceOf(address)(uint256)', huckleberryFarmAddr],
      returns: [['farmBalance', val => new BigNumber(val)]]
    },
    {
      target: huckleberryFinnAddr,
      call: ['balanceOf(address)(uint256)', huckleberryAirDropAddr],
      returns: [['airDropBalance', val => new BigNumber(val)]]
    },
    {
      target: huckleberryFinnAddr,
      call: ['totalSupply()(uint256)'],
      returns: [['totalFinnSupply', val => new BigNumber(val)]]
    }
  ];

  const multiCallConfig = {
    rpcUrl: rpcUrl,
    multicallAddress: multiCallAddr,
  };
  let multiCallResult = await multiCall.aggregate(calls, multiCallConfig);

  let {transformed} = multiCallResult.results;
  let {farmBalance, airDropBalance, totalFinnSupply} = transformed;
  const circulationAmount = totalFinnSupply.minus(farmBalance).minus(airDropBalance);
  return circulationAmount;
}

export const getFinnAPY = async function getFinnAPY(rpcUrl = "https://rpc.moonriver.moonbeam.network", historyDay = 7) {
  dayjs.extend(utc)

  const oneYearPercent = new BigNumber(36000)
  const utcCurrentTime = dayjs()
  const utcHistoryDayBack = utcCurrentTime.subtract(historyDay, 'day').unix()

  try {
    // get the current data
    let result = await finnClient.query({
      query: FINN_HISTORY_QUERY,
      variables: {
        timestampFrom: utcHistoryDayBack,
        timestampTo: utcCurrentTime.unix(),
      },
      fetchPolicy: 'no-cache',
    })

    let apy = new BigNumber(0)
    let {minFinn, maxFinn} = result.data
    if (!!minFinn.length && !!maxFinn.length) {
      let oldestTotalFees = new BigNumber(minFinn[0].totalFees)
      let latestTotalFees = new BigNumber(maxFinn[0].totalFees)
      let circulationAmount = await getCirculationAmount(rpcUrl);

      apy = latestTotalFees.minus(oldestTotalFees).multipliedBy(oneYearPercent).dividedBy(circulationAmount).dividedBy(new BigNumber(historyDay))
    }
    return apy.toString(10)
  } catch (err) {
    console.log('error: ', err)
  }
}
