# ThunkStore
The ThunkStore allows you to define redux-thunk based actions, as well as basic
actions.

## Examples
### Basic Thunk
```javascript
const counter = new ThunkStore({
  name: 'counter',
  initialState: { counter: 1 },
  actions: {
    // First we define basic actions to be used in our thunk
    increment: {
      reducer: (state) => ({
        ...state,
        counter: state.counter + 1,
      }),
    },
    decrement: {
      reducer: (state) => ({
        ...state,
        counter: state.counter - 1,
      }),
    },
    plusMinus: {
      thunk: () => (actions) => (dispatch) => {
        // Here we have access to all actions defined for this store by name
        dispatch(actions.increment());
        dispatch(actions.decrement());
      }
    }
  },
});
```

### Async Request
```javascript
const resourceStore = new ThunkStore({
  name: 'resource',
  initialState: {
    loaded: false,
    loading: false,
    data: null,
    error: null,
  },
  actions: {
    indexLoading: {
      payload: (id) => id,
      reducer: (state, action) => ({
        ...state,
        loading: true
      }),
    },
    indexSuccess: {
      payload: (data) => data,
      reducer: (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        data: action.payload.data,
      }),
    },
    indexFailure: {
      payload: (error) => error,
      reducer: (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        error: action.payload
      }),
    },
    index: {
      thunk: (id) => (actions) => (dispatch) => {
        dispatch(actions.indexLoading(id));
        return axios.get('/api/variables/')
          .then(response => {
            dispatch(actions.indexSuccess(response));
            return response;
          })
          .catch(error => {
            dispatch(actions.indexFailure(error));
            return error;
          });
      }
    }
  },
});
```
