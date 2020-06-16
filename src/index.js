import React, { createContext } from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import App from './components/App';
import rootReducer from './reducers';
import './index.css';

// const logger = function({ dispatch, getState }) {
//   return function(next) {
//     return function(action) {
//       // my middlware
//       console.log('ACTION', action);
//       next(action);
//     };
//   };
// };

const logger = ({ dispatch, getState }) => (next) => (action) => {
  // my middlware
  console.log('ACTION', action);
  next(action);
};

// const thunk = store => next => action => {
//   if (typeof action === 'function') {
//     return action(store.dispatch);
//   }

//   next(action);
// };

const store = createStore(rootReducer, applyMiddleware(logger, thunk));
// console.log(store);
console.log('state', store.getState());

export const StoreContext = createContext();

console.log('StoreContext', StoreContext);

class Provider extends React.Component {
  render() {
    const { store } = this.props;
    return (
      <StoreContext.Provider value={store}>
        {this.props.children}
      </StoreContext.Provider>
    );
  }
}

// const connectedComponent = connect(callback)(App);
export function connect(callback = (state)=>({})) { 
    /*callback function should be given a default value as a funtion that
     returns an empty object on being called */
  return function (Component) {
    class ConnectedComponent extends React.Component {
      constructor(props) {
        super(props);
        this.unsubscribe = this.props.store.subscribe(() => {
          this.forceUpdate();
        });
      }

      componentWillUnmount() {
        this.unsubscribe();
      }
      render() {
        /* destructure the props this component recieves into 2, 
        since we shouldn't be passing the store to the Component
         calling the connect function, for abstraction reasons */
        const { store, ...restProps } = this.props;
        const state = store.getState();
        let dataToBeSentAsProps = callback(state);

        return <Component dispatch={store.dispatch} {...dataToBeSentAsProps} {...restProps} />;
      }
    }

    class ConnectedComponentWrapper extends React.Component {
      render() {
        /** Pass any props the top-level ConnectedComponentWrapper recieves,
         *  to the ConnectedComponent, which will separate the rest of the props and the 'store'
         * and pass the rest of the props to the Component calling the connect function  */   
        return (
          <StoreContext.Consumer>
            {(store) => {
              return <ConnectedComponent store={store} {...this.props} /*Passing the props*/ />; 
            }}
          </StoreContext.Consumer>
        );
      }
    }
    return ConnectedComponentWrapper;
  };
}

// update store by dispatching actions
// store.dispatch({
//   type: 'ADD_MOVIES',
//   movies: moviesList
// });
// console.log('state', store.getState());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
