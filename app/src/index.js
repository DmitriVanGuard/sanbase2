import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { composeWithDevTools } from 'redux-devtools-extension'
import createRavenMiddleware from 'raven-for-redux'
import ApolloClient from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { from } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from 'react-apollo'
import App from './App'
import reducers from './reducers/rootReducers.js'
import epics from './epics/rootEpics.js'
import { loadState, saveState } from './utils/localStorage'
import { getOrigin } from './utils/utils'
import detectNetwork from './utils/detectNetwork'
import getRaven from './utils/getRaven'
import { changeNetworkStatus, launchApp } from './actions/rootActions'
import uploadLink from './apollo/upload-link'
import errorLink from './apollo/error-link'
import authLink from './apollo/auth-link'
// Look at 42 line. ;)
// import * as serviceWorker from './serviceWorker'

import 'semantic-ui-css/semantic.min.css'
import './index.css'

const run = (client, store, App) => {
  ReactDOM.render(
    <ApolloProvider client={client}>
      <Provider store={store}>
        <Router>
          <Route path='/' component={App} />
        </Router>
      </Provider>
    </ApolloProvider>,
    document.getElementById('root'))

  // TODO: 2018-04-25 Yura Z.: Need to change deploy logic for frontend
  // Until we don't use s3 for static, we have problem with webworkers,
  // after each updates.
  /* serviceWorker.register({
    onUpdate: registration => {
      console.log('App updated... Refresh your browser, please.')
    },
    onSuccess: registration => {
      console.log('Your browser makes cached SANbase version')
    }
  }) */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister()
    })
  }
}

const handleLoad = () => {
  const httpLink = createHttpLink({ uri: `${getOrigin()}/graphql` })
  const client = new ApolloClient({
    link: from([authLink, errorLink, uploadLink, httpLink]),
    shouldBatch: true,
    cache: new InMemoryCache()
  })

  const middleware = [
    createEpicMiddleware(epics, {
      dependencies: {
        client
      }
    }),
    createRavenMiddleware(getRaven())
  ]

  const store = createStore(reducers,
    {user: loadState()} || {},
    composeWithDevTools(applyMiddleware(...middleware))
  )

  store.subscribe(() => {
    saveState(store.getState().user)
  })

  store.dispatch(launchApp())

  detectNetwork(({online = true}) => {
    store.dispatch(changeNetworkStatus(online))
  })

  if (!window.Intl) {
    require.ensure([
      'intl',
      'intl/locale-data/jsonp/en.js'
    ], () => {
      require('intl')
      require('intl/locale-data/jsonp/en.js')
      run(client, store, App)
    })
  } else {
    run(client, store, App)
  }
}

if (process.env.NODE_ENV === 'development') {
  handleLoad()
} else {
  const script = document.createElement('script')
  script.src = `/env.js?${process.env.REACT_APP_VERSION}`
  script.async = false
  document.body.appendChild(script)
  script.addEventListener('load', handleLoad)
}
