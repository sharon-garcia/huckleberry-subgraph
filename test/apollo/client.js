import fetch from 'node-fetch'
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const finnClient = new ApolloClient.ApolloClient({
  link: new HttpLink({
    uri: 'http://127.0.0.1/subgraphs/name/huckleberry/huckleberry-apy-test-subgraph',
    fetch
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})
