# ThunkStore
The ThunkStore allows you to define redux-thunk based actions, as well as basic
actions.

## Examples
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
