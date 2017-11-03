import { ajaxActionType } from './actionTypes';
import createReducer from './createReducer';
import dispatchAjaxAction from './dispatchAjaxAction';
import handleAjaxAction from './handleAjaxAction';
import {
  removeById,
  unionById,
  addOrUpdateById,
} from './dataUpdaters';

export {
  createReducer,
  dispatchAjaxAction,
  handleAjaxAction,
  // Action types
  ajaxActionType,
  // Data updaters
  removeById,
  unionById,
  addOrUpdateById,
};
