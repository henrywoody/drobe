import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import GoogleLogin from 'react-google-login';
import { withRouter } from 'react-router-dom';
import userStorage from '../../Modules/user-storage';
import './style.css';

const logUserIn = (appName, history) => async response => {
	const loginResponse = await fetch(`/users/login/${appName}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ...response })
	});

	if (Math.floor(loginResponse.status / 100) === 2) {
		const jsonResponse = await loginResponse.json();
		userStorage.logUserIn(jsonResponse.user, jsonResponse.token);		
		history.replace('/');
	}
}

const FacebookAuthButton = props => {
	const { history } = props;

	return <FacebookLogin
				appId='358311631577560'
				fields=''
				callback={ logUserIn('facebook', history) }
				render={ renderProps => {
					return (
						<div className='btn-facebook' onClick={ renderProps.onClick }>
							<span className='icon'>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 216" class="_5h0m" color="#FFFFFF">
									<path fill="#FFFFFF" d="M204.1 0H11.9C5.3 0 0 5.3 0 11.9v192.2c0 6.6 5.3 11.9 11.9 11.9h103.5v-83.6H87.2V99.8h28.1v-24c0-27.9 17-43.1 41.9-43.1 11.9 0 22.2.9 25.2 1.3v29.2h-17.3c-13.5 0-16.2 6.4-16.2 15.9v20.8h32.3l-4.2 32.6h-28V216h55c6.6 0 11.9-5.3 11.9-11.9V11.9C216 5.3 210.7 0 204.1 0z"></path>
								</svg>
							</span>
							<span className='button-text'>Continue with Facebook</span>
						</div>
					)
				}}
			/>
}
const FacebookAuthButtonWithRouter = withRouter(FacebookAuthButton);

const GoogleAuthButton = props => {
	const { history } = props;

	return <GoogleLogin
					clientId='811972714927-7k6mtt0ejaeq7q96c4g2477hmg6ir90o.apps.googleusercontent.com'
					onSuccess={ logUserIn('google', history) }
					onFailure={ () => {} }
					render={ renderProps => {
						return (
							<div className='btn-google' onClick={ renderProps.onClick }>
								<span className='icon'></span>
								<span className='button-text'>Sign in with Google</span>
							</div>
						)
					}}
				/>
}
const GoogleAuthButtonWithRouter = withRouter(GoogleAuthButton);

export default props => {
	return (
		<div className='social-auth-buttons-container'>
			<FacebookAuthButtonWithRouter/>
			<GoogleAuthButtonWithRouter/>
		</div>
	)
}