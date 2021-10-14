import gql from 'graphql-tag'
// // all info
// export const FINN_HISTORY_QUERY = gql`
//   query finns($timestampFrom: Int!, $timestampTo: Int!) {
//     finns(
//       orderBy: timestamp
//       orderDirection: asc
//       where: { timestamp_gt: $timestampFrom, timestamp_lte: $timestampTo }
//     ) {
//       id
//       timestamp
//       totalFees
//       transfers {
//         id
//         from
//         to
//         value
//         trace {
//           id
//           from
//           to
//           input
//         }
//       }
//     }
//   }
// `

export const FINN_HISTORY_QUERY = gql`
  query finns($timestampFrom: Int!, $timestampTo: Int!) {
    finns(
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lte: $timestampTo }
    ) {
      id
      totalFees
      transfers {
        value
      }
    }
  }
`