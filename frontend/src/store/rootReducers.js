import authReducer from './Reducers/authReducer.js';
import cartReducer from "./Reducers/cartReducer";
import { combineReducers } from 'redux';

const rootReducer = {
    auth : authReducer,
    cart: cartReducer
}

export default combineReducers(rootReducer);