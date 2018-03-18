# PromiseStore
The PromiseStore allows you to define axios based actions, as well as promise,
thunk, and basic actions.

## Examples
### No Args Required
```javascript
const resourceStore = new AxiosStore({
  name: 'resource',
  actions: {
    fetch: {
      request: {
        url: '/api/resource/',
      },
    },
  },
});
```

### Args Required
```javascript
const resourceStore = new AxiosStore({
  name: 'resource',
  actions: {
    fetch: {
      request: (id) => ({
        url: `/api/resource/${id}/`,
      }),
    },
  },
});
```

### Handling Success/Failure
```javascript
const resourceStore = new AxiosStore({
  name: 'resource',
  actions: {
    fetch: {
      request: {
        url: `/api/resource/${id}/`,
      },
      success: (response) => {
        // Do something with response data
      },
      failure: (error) => {
        // Do something with error
      },
    },
  },
});
```
