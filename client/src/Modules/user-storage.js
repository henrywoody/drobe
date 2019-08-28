import updateUser from './update-user';
import { store } from '../redux-store';
import { logUserIn, logUserOut } from '../redux-actions';

class UserStorage {
	logUserIn = async (user, token) => {
		await store.dispatch(logUserIn({...user, token}));
		this.storeUserInfo({...user, token});
	}

	storeUserInfo(user) {
		localStorage.setItem('user', JSON.stringify(user));
		localStorage.setItem('lastRefresh', Date.now().toString());
	}

	clearUserInfo() {
		localStorage.setItem('user', null);
		localStorage.setItem('lastRefresh', null);
	}

	updateUser = async (user) => {
		const { ok, data: updatedUser } = await updateUser(user.id, user.token, { user });
		if (!ok) {
			return;
		}
		this.storeUserInfo({...updatedUser, token: user.token});
		store.dispatch(logUserIn({...updatedUser, token: user.token}));
	}

	logUserOut = () => {
		store.dispatch(logUserOut());
		this.clearUserInfo();
	}
}

export default new UserStorage();