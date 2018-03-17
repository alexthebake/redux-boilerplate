import axios from 'axios';
import requestKey from './requestKey';
import promiseActionCreator from './promiseActionCreator';

export function setupAxiosActionCreator(config) {
  return args => {
    let finalArgs = { ...args };
    if (_.has(args, 'config')) {
      finalArgs = {
        ...finalArgs,
        config: { ...args.config, ...config }
      };
    } else {
      finalArgs.config = config;
    }
    return axiosActionCreator(finalArgs);
  }
}

export default function axiosActionCreator({
  actionType,
  url,
  data = {},
  method = 'GET',
  config = {}
}) {
  const key = requestKey({ url, data, method });
  return promiseActionCreator({
    actionType,
    promiseCallback: () => axios.request({ url, data, method, ...config }),
    loadingContext: (promise) => ({ key, promise, status: 'loading' }),
    successContext: (request) => ({ key, request, status: 'success' }),
    failureContext: (request) => ({ key, request, status: 'failure' }),
  });
}
