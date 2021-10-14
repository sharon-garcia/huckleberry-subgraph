/* eslint-disable prefer-const */
import { BigInt, Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { FinnContract, Transfer } from '../types/FinnSubgraph/FinnContract'
import { Trace, FINN, TransferEvent } from '../types/schema'
// import { Transfer, transfer, transferFrom } from '../types/templates/FinnContract/FinnContract'
import { SEPARATOR } from './config'
import { getEventID } from './util'


// export function handleTransferEventV2(event: Transfer): void {
//   // ignore initial transfers for first adds
//   // if (event.params.to.toHexString() == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))) {
//   //   return
//   // }

//   let finn = FINN.load(event.block.number.toString())
//   if (!finn) {
//     finn = new FINN(event.block.number.toString())
//     // finn.transfers = [];
//     finn.timestamp = event.block.timestamp
//   }

//   let transactionHash = event.transaction.hash.toHexString();
//   let trace = Trace.load(transactionHash)
//   if (!trace) {
//     trace = new Trace(transactionHash)
//     trace.input = event.transaction.input
//     trace.from = event.transaction.from
//     trace.to = event.transaction.to
//     trace.value = event.transaction.value
//     trace.save()
//   }

//   let finnContract = FinnContract.bind(event.address)
//   finn.totalFees =  finnContract.totalFees()
//   finn.save()

//   let finnDecimals = finnContract.decimals()
//   // convert to uint8
//   let u8FinnDecimals = new Uint8ClampedArray(1)
//   u8FinnDecimals[0] = finnDecimals
//   let outputValue = (event.params.value).div(BigInt.fromI32(10).pow(u8FinnDecimals[0]))

//   // get or create transaction
//   // let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.logIndex.toString(), event.transactionLogIndex.toString()])
//   let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.transactionLogIndex.toString()])
//   let transferEvent = new TransferEvent(eventID)
//   transferEvent.from = event.params.from
//   transferEvent.to = event.params.to
//   transferEvent.value = outputValue
//   transferEvent.finn = finn.id
//   transferEvent.trace = BigInt.fromString(trace.id)
//   transferEvent.save()

//   // finn.transfers.push(transferEvent.id);
//   // finn.save()
//   // transferEvent.save()

// }

export function handleTransferEvent(event: Transfer): void {
  // ignore initial transfers for first adds
  // if (event.params.to.toHexString() == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))) {
  //   return
  // }

  let finn = FINN.load(event.block.number.toString())
  if (finn == null) {
    finn = createFinn(event)
  }

  let trace = Trace.load(event.transaction.hash.toHexString())
  if (trace == null) {
    trace = createTransferTrace(event)
  }

  let finnContract = FinnContract.bind(event.address)
  let finnDecimals = finnContract.decimals()
  // convert to uint8
  let u8FinnDecimals = new Uint8ClampedArray(1)
  u8FinnDecimals[0] = finnDecimals
  let outputValue = (event.params.value).div(BigInt.fromI32(10).pow(u8FinnDecimals[0]))

  // get or create transaction
  // let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.logIndex.toString(), event.transactionLogIndex.toString()])
  let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.transactionLogIndex.toString()])
  let transferEvent = new TransferEvent(eventID)
  transferEvent.finn = finn.id
  transferEvent.trace = trace.id
  transferEvent.from = event.params.from
  transferEvent.to = event.params.to
  transferEvent.value = outputValue
  transferEvent.save()
}

function createFinn(event: Transfer): FINN {
  let finn = new FINN(event.block.number.toString())
  finn.timestamp = event.block.timestamp
    // finn.transfers = [];

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
  if (event.transaction.to) {
    trace.to = event.transaction.to
  }
  trace.value = event.transaction.value
  trace.save()
  return trace
}

// function createTransfer(event: Transfer): void {
//   // ignore initial transfers for first adds
//   // if (event.params.to.toHexString() == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))) {
//   //   return
//   // }

//   let finn = FINN.load(event.block.number.toString())
//   if (!finn) {
//     finn = createFinn(event)
//   }

//   let transactionHash = event.transaction.hash.toHexString();
//   let trace = Trace.load(transactionHash)
//   if (!trace) {
//     trace = createTransferTrace(event)
//   }

//   let finnContract = FinnContract.bind(event.address)

//   let finnDecimals = finnContract.decimals()
//   // convert to uint8
//   let u8FinnDecimals = new Uint8ClampedArray(1)
//   u8FinnDecimals[0] = finnDecimals
//   let outputValue = (event.params.value).div(BigInt.fromI32(10).pow(u8FinnDecimals[0]))

//   // get or create transaction
//   // let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.logIndex.toString(), event.transactionLogIndex.toString()])
//   let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.transactionLogIndex.toString()])
//   let transferEvent = new TransferEvent(eventID)
//   transferEvent.from = event.params.from
//   transferEvent.to = event.params.to
//   transferEvent.value = outputValue
//   transferEvent.finn = finn.id.toString()
//   transferEvent.trace = BigInt.fromString(trace.id)
//   transferEvent.save()
// }

// export function handleTransferFunction(func: transfer): void {}

// export function handleTransferFromFunction(func: transferFrom): void {}

// export function fetchFinnTotalFees(finnAddress: Address): BigInt {
//   let finnContract = FinnContract.bind(finnAddress)
//   let totalFees = finnContract.totalFees()
//   return totalFees
// }

// export function fetchFinnDecimals(finnAddress: Address): BigInt {
//   let finnContract = FinnContract.bind(finnAddress)
//   let decimals = finnContract.decimals()
//   return BigInt.fromI32(decimals)
// }
