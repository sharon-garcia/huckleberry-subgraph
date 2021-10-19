import gql from 'graphql-tag'

export const FINN_HISTORY_QUERY = gql`
  query finns($timestampFrom: Int!, $timestampTo: Int!) {
    minFinn: finns(
      orderBy: timestamp
      orderDirection: asc
      where: {timestamp_gt: $timestampFrom, timestamp_lte: $timestampTo}
      first:1
    ) {
      id
      totalFees
    }
    maxFinn:finns(
      orderBy: timestamp
      orderDirection: desc
      where: {timestamp_gt: $timestampFrom, timestamp_lte: $timestampTo}
      first:1
    ) {
      id
      totalFees
    }
  }
`