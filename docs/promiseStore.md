# PromiseStore
The PromiseStore allows you to define promise based actions, as well as thunk
and basic actions.

## Examples
### Basic Promise
```javascript
const randomPromise = Promise.resolve('data');

const randomPromiseStore = new PromiseStore({
  name: 'randomPromiseStore',
  initialState: { data: null },
  actions: {
    call: {
      promiseCallback: () => randomPromise(),
      successReducer: (state, action) => ({
        ...state,
        data: action.payload,
      }),
    },
  },
});
```

### Async Request
```javascript
const resourceStore = new PromiseStore({
  name: 'resource',
  initialState: {
    loaded: false,
    loading: false,
    data: null,
    error: null,
  },
  actions: {
    index: {
      promiseCallback: () => axios.get('/api/resource/'),
      loadingReducer: (state) => ({
        ...state,
        loading: true,
      }),
      successReducer: (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        data: action.payload.data,
      }),
      failureReducer: (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        error: action.payload,
      }),
    },
  },
});
```
