export default (state, action) => {
	const { type, payload } = action;

	switch (type) {
		case 'LOG_USER_IN':
			return {
				...state,
				user: payload,
				isAuthenticated: true
			}
		case 'LOG_USER_OUT':
			return {
				...state,
				user: null,
				isAuthenticated: false
			}
		default:
			return state;
	}
}