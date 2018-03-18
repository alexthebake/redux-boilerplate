# PromiseStore
The PromiseStore allows you to define axios based actions, as well as promise,
thunk, and basic actions.

## Examples
```javascript
const resourceStore = new AxiosStore({
  name: 'resource',
  actions: {
    fetch: {
      request: { url: `/api/resource/` }
    },
  },
});
```
