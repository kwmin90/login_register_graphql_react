import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { createStore } from "redux";
import { rootReducer } from "./redux/";
import { Provider } from "react-redux";

const link = createHttpLink({
  uri: "http://localhost:4000/graphql",
});
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

const store = createStore(rootReducer);

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Provider store={store}>
        <App />
      </Provider>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
