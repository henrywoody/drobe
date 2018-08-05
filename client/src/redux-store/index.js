import { createStore } from 'redux';
import reducer from '../redux-reducers';

const initialState = {
	user: null,
	isAuthenticated: false
}

export const store = createStore(reducer, initialState);