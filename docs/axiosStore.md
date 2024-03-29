# AxiosStore
The AxiosStore allows you to define axios based actions, as well as promise,
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

### Setting Axios Config
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
  config: {
    headers: { /** ... */ }
  }
});
```

### Setting Global Axios Config
Sometimes you want to set defaults for all axios requests. Setting a default
config on AxiosStore will also affect the ResourceStore.
```javascript
import { AxiosStore } from '@thebasement/redux-boilerplate';

AxiosStore.setConfig({
  headers: { /** ... */ },
});
```
I'm not sure if this great, or horrible...
