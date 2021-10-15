/* eslint-disable prefer-const */
import { BigInt, Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { FinnContract, Transfer } from '../types/FinnSubgraph/FinnContract'
import { Trace, FINN, TransferEvent, FinnState } from '../types/schema'
// import { Transfer, transfer, transferFrom } from '../types/templates/FinnContract/FinnContract'
import { SEPARATOR, FINN_ADDRESS, LATEST_BLOCK } from './config'
import { getEventID } from './util'

const ZERO = BigInt.fromI32(0)

export function handleTransferEvent(event: Transfer): void {

  let lastFinnId = findAndUpdateLastFinnId(event.block.number)

  let finn = FINN.load(event.block.number.toString())
  if (!finn) {
    finn = createFinn(event, lastFinnId)
  }

  let trace = Trace.load(event.transaction.hash.toHexString())
  if (!trace) {
    trace = createTransferTrace(event)
  }

  // get or create transaction
  let rollbackEventValue = ZERO
  let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.logIndex.toString()])
  let transferEvent = TransferEvent.load(eventID)
  if (!transferEvent) {
    transferEvent = new TransferEvent(eventID)
  } else {
    rollbackEventValue = transferEvent.value
  }

  transferEvent.finn = finn.id
  transferEvent.trace = trace.id
  transferEvent.from = event.params.from
  transferEvent.to = event.params.to
  transferEvent.value = event.params.value
  transferEvent.save()

  let eventValue = event.params.value
  finn.transferAmount = finn.transferAmount.plus(eventValue).minus(rollbackEventValue)
  if (lastFinnId.equals(ZERO)) {
    finn.totalTransferAmount = finn.transferAmount
  } else {
    let lastFinn = FINN.load(lastFinnId.toString())
    if (!lastFinn) {
      throw new Error("FINN doesn't exist: " + lastFinnId.toString())
    }
    finn.totalTransferAmount = lastFinn.totalTransferAmount.plus(finn.transferAmount)
  }
  finn.save()
}

function createFinn(event: Transfer, lastFinnId: BigInt): FINN {
  let finn = new FINN(event.block.number.toString())
  finn.timestamp = event.block.timestamp
  finn.lastFinnId = lastFinnId
  finn.transferAmount = BigInt.fromI32(0)
  finn.totalTransferAmount = BigInt.fromI32(0)
  let finnContract = FinnContract.bind(event.address)
  finn.totalFees =  finnContract.totalFees()
  finn.save()
  return finn
}

function createTransferTrace(event: Transfer): Trace {
  let transactionHash = event.transaction.hash.toHexString();
  let trace = new Trace(transactionHash)
  trace.input = event.transaction.input
  trace.from = event.transaction.from
  trace.to = event.transaction.to
  trace.value = event.transaction.value
  trace.save()
  return trace
}

function findAndUpdateLastFinnId(newId: BigInt): BigInt {
  let finnState = FinnState.load(LATEST_BLOCK)
  if (!finnState) {
    finnState = new FinnState(LATEST_BLOCK)
    finnState.lastFinnId = ZERO
    finnState.finnId = newId
  } else if (finnState.finnId.notEqual(newId)) {
    finnState.lastFinnId = finnState.finnId
    finnState.finnId = newId
  }
  finnState.save()
  return finnState.lastFinnId
}

// function createTotalFees(block: ethereum.Block): TotalFees {
//   let totalFees = new TotalFees(block.number)
//   let finnContract = FinnContract.bind(FINN_ADDRESS)
//   totalFees.timestamp = block.timestamp
//   totalFees.totalFees = finnContract.totalFees()
//   totalFees.save()
// }

// export function handleBlockFinnTotalFees(block: ethereum.Block): void {
//   let totalFees = TotalFees.load(block.number)
//   if (!totalFees) {
//     createTotalFees(block)
//   } else {
//     let finnContract = FinnContract.bind(FINN_ADDRESS)
//     totalFees.timestamp = block.timestamp
//     totalFees.totalFees = finnContract.totalFees()
//     totalFees.save()
//   }
// }

// export function handleTransferFunction(func: transfer): void {}

// export function handleTransferFromFunction(func: transferFrom): void {}
