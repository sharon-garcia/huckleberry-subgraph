// const { getFinnAPY } = require('./contexts/FinnTransferHistory')
import { getFinnAPY } from './contexts/FinnTransferHistory.js'

async function test() {
  console.log("TEST:", JSON.stringify(await getFinnAPY("https://rpc.moonriver.moonbeam.network", 1)));
}

test()
