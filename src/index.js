import { ajaxActionType, promiseActionType } from './actionTypes';
import createReducer from './createReducer';
import dispatchAjaxAction from './dispatchAjaxAction';
import handleAjaxAction from './handleAjaxAction';
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
import {
  removeById,
  unionById,
  addOrUpdateById,
} from './dataUpdaters';
import {
  AJAX_INITIAL_STATE,
} from './constants';

export {
  createReducer,
  dispatchAjaxAction,
  handleAjaxAction,
  promiseActionCreator,
  axiosActionCreator,
  axiosActionHandlers,
  setupAxiosActionCreator,
  // Action types
  ajaxActionType,
  promiseActionType,
  // Data updaters
  removeById,
  unionById,
  addOrUpdateById,
  // Constants
  AJAX_INITIAL_STATE,
  // Misc
  requestKey,
  BasicStore,
  ThunkStore,
  PromiseStore,
  AxiosStore,
  ResourceStore,
};
