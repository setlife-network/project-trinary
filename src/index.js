import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from '@apollo/client'
import { offsetLimitPagination } from '@apollo/client/utilities';

import './styles/index.scss'
import App from './App'
import { API_ROOT } from './constants'

const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                getIssuesByProjectId: offsetLimitPagination()
            }
        }
    }
})
const uri = `${API_ROOT}/graph`
const link = createHttpLink({
    uri,
    credentials: 'include'
})
const client = new ApolloClient({
    link,
    cache,
    connectToDevTools: true
})

ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <BrowserRouter basename='/build-v1'>
                <App />
            </BrowserRouter>
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
