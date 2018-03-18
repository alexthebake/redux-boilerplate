import createReducer from './createReducer';
import promiseActionCreator from './promiseActionCreator';
import axiosActionCreator, {
  setupAxiosActionCreator,
} from './axiosActionCreator';
import axiosActionHandlers from './axiosActionHandlers';
import requestKey from './requestKey';
import BasicStore from './basicStore';
import ThunkStore from './thunkStore';
import PromiseStore from './promiseStore';
import AxiosStore from './axiosStore';
import ResourceStore from './resourceStore';
import StoreIndex from './storeIndex';
import {
  removeById,
  unionById,
  addOrUpdateById,
} from './dataUpdaters';
import {
  AJAX_INITIAL_STATE,
} from './constants';

export {
  // Action creators
  promiseActionCreator,
  axiosActionCreator,
  setupAxiosActionCreator,
  // Data updaters
  axiosActionHandlers,
  removeById,
  unionById,
  addOrUpdateById,
  // Constants
  AJAX_INITIAL_STATE,
  // Misc
  requestKey,
  createReducer,
  // Stores
  BasicStore,
  ThunkStore,
  PromiseStore,
  AxiosStore,
  ResourceStore,
  StoreIndex,
};
