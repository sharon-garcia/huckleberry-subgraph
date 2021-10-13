/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal, store, Address, ethereum } from '@graphprotocol/graph-ts'
import { FinnContract } from '../types/FinnSubgraph/FinnContract'
import {
  FINN,
  Transfer as TransferEvent
} from '../types/schema'
import { Transfer } from '../types/templates/FinnContract/FinnContract'
import { SEPARATOR } from './config'
import { getEventID } from './util'


export function handleTransfer(event: Transfer): void {
  // ignore initial transfers for first adds
  // if (event.params.to.toHexString() == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))) {
  //   return
  // }

  let finn = FINN.load(event.block.number.toString())
  if (!finn) {
    finn = new FINN(event.block.number.toString())
    finn.transfers = [];
    finn.timestamp = event.block.timestamp
  }
  let finnContract = FinnContract.bind(event.address)
  finn.totalFees =  finnContract.totalFees()
  let finnDecimals = finnContract.decimals()
  // convert to uint8
  let u8FinnDecimals = new Uint8ClampedArray(1)
  u8FinnDecimals[0] = finnDecimals
  let outputValue = (event.params.value).div(BigInt.fromI32(10).pow(u8FinnDecimals[0]))

  // get or create transaction
  let eventID = getEventID(SEPARATOR, [event.transaction.hash.toHexString(), event.logIndex.toString(), event.transactionLogIndex.toString()])
  let transaction = TransferEvent.load(eventID)
  if (!transaction) {
    transaction = new TransferEvent(eventID)
    transaction.from = event.params.from
    transaction.to = event.params.to
    transaction.value = outputValue
    transaction.save()
    finn.transfers.push(transaction.id);
    finn.save()
    transaction.finn = finn.id
    transaction.save()
  }

  finn.save()

}

export function fetchFinnTotalFees(finnAddress: Address): BigInt {
  let finnContract = FinnContract.bind(finnAddress)
  let totalFees = finnContract.totalFees()
  return totalFees
}

export function fetchFinnDecimals(finnAddress: Address): BigInt {
  let finnContract = FinnContract.bind(finnAddress)
  let decimals = finnContract.decimals()
  return BigInt.fromI32(decimals)
}
