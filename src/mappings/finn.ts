/* eslint-disable prefer-const */
import { BigInt, Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { FinnContract, Transfer } from '../types/FinnSubgraph/FinnContract'
import { Trace, FINN, TransferEvent } from '../types/schema'
// import { Transfer, transfer, transferFrom } from '../types/templates/FinnContract/FinnContract'
import { SEPARATOR } from './config'
import { getEventID } from './util'

export function handleTransferEvent(event: Transfer): void {
  // ignore initial transfers for first adds
  // if (event.params.to.toHexString() == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))) {
  //   return
  // }

  // let finnContract = FinnContract.bind(event.address)
  let finn = FINN.load(event.block.number.toString())
  if (!finn) {
    finn = createFinn(event)
    // finn = createFinn(event, finnContract)
  }

  let trace = Trace.load(event.transaction.hash.toHexString())
  if (!trace) {
    trace = createTransferTrace(event)
  }

  // let finnDecimals = finnContract.decimals()
  // // convert to uint8
  // let u8FinnDecimals = new Uint8ClampedArray(1)
  // u8FinnDecimals[0] = finnDecimals
  // let outputValue = (event.params.value).div(BigInt.fromI32(10).pow(u8FinnDecimals[0]))

  // get or create transaction
  // let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.logIndex.toString(), event.transactionLogIndex.toString()])
  let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.logIndex.toString()])
  let transferEvent = TransferEvent.load(eventID)
  if (!transferEvent) {
    transferEvent = new TransferEvent(eventID)
  }
  transferEvent.finn = finn.id
  transferEvent.trace = trace.id
  transferEvent.from = event.params.from
  transferEvent.to = event.params.to
  // transferEvent.value = outputValue
  transferEvent.value = event.params.value
  transferEvent.save()
}

function createFinn(event: Transfer): FINN {
  let finn = new FINN(event.block.number.toString())
  finn.timestamp = event.block.timestamp

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

// export function handleTransferFunction(func: transfer): void {}

// export function handleTransferFromFunction(func: transferFrom): void {}
