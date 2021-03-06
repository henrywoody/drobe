import React, { Component } from 'react';
import { connect } from 'react-redux';
import uploadImage from '../../../Modules/upload-image';
import './style.css';

class ImageInput extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: false,
			isDragging: false,
			message: '',
			imageData: '',
		};
		this.imageTooLargeMessage = 'Image is too large, file size must be less than 16 MB.';
		this.generalErrorMessage = 'There was a problem with the image upload, please try again or select a different image.'
		this.uploadId = 0;
	}

	handleFileDrop = event => {
		event.preventDefault();
		this.setState({isDragging: false});
		this.handleFileChange(event.dataTransfer.files[0]);
	}

	handleFileSelect = event => {
		this.handleFileChange(event.target.files[0]);
	}

	async handleFileChange(file) {
		if (!file) {
			return;
		} else if (file.size >= 16 * 1024 * 1024) { // max file size 16MB
			this.setState({message: this.imageTooLargeMessage});
		} else {
			this.setState({message: ''});
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => this.setState({imageData: reader.result});
			reader.onerror = () => this.setState({message: this.generalErrorMessage});
			this.upload(file);
		}
	}

	async upload(image) {
		this.setState({isLoading: true});
		const { user, handleChange, toggleUploadingStatus } = this.props;
		handleChange('');
		toggleUploadingStatus();
		const { responseData, responseStatus, uploadId } = await uploadImage(image, user.token, ++this.uploadId);
		const uploadIsCurrent = uploadId === this.uploadId;
		let nextState = { isLoading: false };
		if (uploadIsCurrent) {
			const imageTooLargeStatus = 413;
			if (responseStatus === imageTooLargeStatus) {
				nextState.message = this.imageTooLargeMessage;
			} else if (responseData.error || responseStatus !== 200) {
				nextState.message = this.generalErrorMessage;
			} else {
				handleChange(responseData.imageUrl);
			}
		}
		this.setState(nextState);
		toggleUploadingStatus();
	}

	clearImage = event => {
		event.preventDefault();
		this.uploadId++;
		const { handleChange } = this.props;
		handleChange('');
		this.setState({
			imageData: ''
		});
	}

	render() {
		const { imageUrl } = this.props;
		const { isDragging, message, imageData } = this.state;

		// Icon made by Gregor Cresnar from www.flaticon.com
		// from https://www.flaticon.com/free-icon/upload_126477#term=upload&page=1&position=2
		const activeIconData = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDg2LjMgNDg2LjMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4Ni4zIDQ4Ni4zOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGNsYXNzPSIiPjxnPjxnPgoJPGc+CgkJPHBhdGggZD0iTTM5NS41LDEzNS44Yy01LjItMzAuOS0yMC41LTU5LjEtNDMuOS04MC41Yy0yNi0yMy44LTU5LjgtMzYuOS05NS0zNi45Yy0yNy4yLDAtNTMuNyw3LjgtNzYuNCwyMi41ICAgIGMtMTguOSwxMi4yLTM0LjYsMjguNy00NS43LDQ4LjFjLTQuOC0wLjktOS44LTEuNC0xNC44LTEuNGMtNDIuNSwwLTc3LjEsMzQuNi03Ny4xLDc3LjFjMCw1LjUsMC42LDEwLjgsMS42LDE2ICAgIEMxNi43LDIwMC43LDAsMjMyLjksMCwyNjcuMmMwLDI3LjcsMTAuMyw1NC42LDI5LjEsNzUuOWMxOS4zLDIxLjgsNDQuOCwzNC43LDcyLDM2LjJjMC4zLDAsMC41LDAsMC44LDBoODYgICAgYzcuNSwwLDEzLjUtNiwxMy41LTEzLjVzLTYtMTMuNS0xMy41LTEzLjVoLTg1LjZDNjEuNCwzNDkuOCwyNywzMTAuOSwyNywyNjcuMWMwLTI4LjMsMTUuMi01NC43LDM5LjctNjkgICAgYzUuNy0zLjMsOC4xLTEwLjIsNS45LTE2LjRjLTItNS40LTMtMTEuMS0zLTE3LjJjMC0yNy42LDIyLjUtNTAuMSw1MC4xLTUwLjFjNS45LDAsMTEuNywxLDE3LjEsM2M2LjYsMi40LDEzLjktMC42LDE2LjktNi45ICAgIGMxOC43LTM5LjcsNTkuMS02NS4zLDEwMy02NS4zYzU5LDAsMTA3LjcsNDQuMiwxMTMuMywxMDIuOGMwLjYsNi4xLDUuMiwxMSwxMS4yLDEyYzQ0LjUsNy42LDc4LjEsNDguNyw3OC4xLDk1LjYgICAgYzAsNDkuNy0zOS4xLDkyLjktODcuMyw5Ni42aC03My43Yy03LjUsMC0xMy41LDYtMTMuNSwxMy41czYsMTMuNSwxMy41LDEzLjVoNzQuMmMwLjMsMCwwLjYsMCwxLDBjMzAuNS0yLjIsNTktMTYuMiw4MC4yLTM5LjYgICAgYzIxLjEtMjMuMiwzMi42LTUzLDMyLjYtODRDNDg2LjIsMTk5LjUsNDQ3LjksMTQ5LjYsMzk1LjUsMTM1Ljh6IiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBjbGFzcz0iYWN0aXZlLXBhdGgiIHN0eWxlPSJmaWxsOiMxQkI4RDEiIGRhdGEtb2xkX2NvbG9yPSIjMWJiOGQxIj48L3BhdGg+CgkJPHBhdGggZD0iTTMyNC4yLDI4MGM1LjMtNS4zLDUuMy0xMy44LDAtMTkuMWwtNzEuNS03MS41Yy0yLjUtMi41LTYtNC05LjUtNHMtNywxLjQtOS41LDRsLTcxLjUsNzEuNWMtNS4zLDUuMy01LjMsMTMuOCwwLDE5LjEgICAgYzIuNiwyLjYsNi4xLDQsOS41LDRzNi45LTEuMyw5LjUtNGw0OC41LTQ4LjV2MjIyLjljMCw3LjUsNiwxMy41LDEzLjUsMTMuNXMxMy41LTYsMTMuNS0xMy41VjIzMS41bDQ4LjUsNDguNSAgICBDMzEwLjQsMjg1LjMsMzE4LjksMjg1LjMsMzI0LjIsMjgweiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojMUJCOEQxIiBkYXRhLW9sZF9jb2xvcj0iIzFiYjhkMSI+PC9wYXRoPgoJPC9nPgo8L2c+PC9nPiA8L3N2Zz4=";
		const inactiveIconData = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDg2LjMgNDg2LjMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4Ni4zIDQ4Ni4zOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGNsYXNzPSIiPjxnPjxnPgoJPGc+CgkJPHBhdGggZD0iTTM5NS41LDEzNS44Yy01LjItMzAuOS0yMC41LTU5LjEtNDMuOS04MC41Yy0yNi0yMy44LTU5LjgtMzYuOS05NS0zNi45Yy0yNy4yLDAtNTMuNyw3LjgtNzYuNCwyMi41ICAgIGMtMTguOSwxMi4yLTM0LjYsMjguNy00NS43LDQ4LjFjLTQuOC0wLjktOS44LTEuNC0xNC44LTEuNGMtNDIuNSwwLTc3LjEsMzQuNi03Ny4xLDc3LjFjMCw1LjUsMC42LDEwLjgsMS42LDE2ICAgIEMxNi43LDIwMC43LDAsMjMyLjksMCwyNjcuMmMwLDI3LjcsMTAuMyw1NC42LDI5LjEsNzUuOWMxOS4zLDIxLjgsNDQuOCwzNC43LDcyLDM2LjJjMC4zLDAsMC41LDAsMC44LDBoODYgICAgYzcuNSwwLDEzLjUtNiwxMy41LTEzLjVzLTYtMTMuNS0xMy41LTEzLjVoLTg1LjZDNjEuNCwzNDkuOCwyNywzMTAuOSwyNywyNjcuMWMwLTI4LjMsMTUuMi01NC43LDM5LjctNjkgICAgYzUuNy0zLjMsOC4xLTEwLjIsNS45LTE2LjRjLTItNS40LTMtMTEuMS0zLTE3LjJjMC0yNy42LDIyLjUtNTAuMSw1MC4xLTUwLjFjNS45LDAsMTEuNywxLDE3LjEsM2M2LjYsMi40LDEzLjktMC42LDE2LjktNi45ICAgIGMxOC43LTM5LjcsNTkuMS02NS4zLDEwMy02NS4zYzU5LDAsMTA3LjcsNDQuMiwxMTMuMywxMDIuOGMwLjYsNi4xLDUuMiwxMSwxMS4yLDEyYzQ0LjUsNy42LDc4LjEsNDguNyw3OC4xLDk1LjYgICAgYzAsNDkuNy0zOS4xLDkyLjktODcuMyw5Ni42aC03My43Yy03LjUsMC0xMy41LDYtMTMuNSwxMy41czYsMTMuNSwxMy41LDEzLjVoNzQuMmMwLjMsMCwwLjYsMCwxLDBjMzAuNS0yLjIsNTktMTYuMiw4MC4yLTM5LjYgICAgYzIxLjEtMjMuMiwzMi42LTUzLDMyLjYtODRDNDg2LjIsMTk5LjUsNDQ3LjksMTQ5LjYsMzk1LjUsMTM1Ljh6IiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBjbGFzcz0iYWN0aXZlLXBhdGgiIHN0eWxlPSJmaWxsOiNEOUUxRTIiIGRhdGEtb2xkX2NvbG9yPSIjZDllMWUyIj48L3BhdGg+CgkJPHBhdGggZD0iTTMyNC4yLDI4MGM1LjMtNS4zLDUuMy0xMy44LDAtMTkuMWwtNzEuNS03MS41Yy0yLjUtMi41LTYtNC05LjUtNHMtNywxLjQtOS41LDRsLTcxLjUsNzEuNWMtNS4zLDUuMy01LjMsMTMuOCwwLDE5LjEgICAgYzIuNiwyLjYsNi4xLDQsOS41LDRzNi45LTEuMyw5LjUtNGw0OC41LTQ4LjV2MjIyLjljMCw3LjUsNiwxMy41LDEzLjUsMTMuNXMxMy41LTYsMTMuNS0xMy41VjIzMS41bDQ4LjUsNDguNSAgICBDMzEwLjQsMjg1LjMsMzE4LjksMjg1LjMsMzI0LjIsMjgweiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojRDlFMUUyIiBkYXRhLW9sZF9jb2xvcj0iI2Q5ZTFlMiI+PC9wYXRoPgoJPC9nPgo8L2c+PC9nPiA8L3N2Zz4=";

		const hasImage = !!(imageData || imageUrl);
		const imageSrc = imageData || imageUrl;

		return (
			<div className='input-container'>
				<span className='danger'>{ message }</span>
				<label htmlFor='image'>Image <span className='optional'>optional</span></label>
				<label
					htmlFor='image'
					className='image-input'
					onDragEnter={ () => this.setState({isDragging: true}) }
					onDragLeave={ () => this.setState({isDragging: false}) }
					onDragOver={ e => e.preventDefault() }
					onDrop={ this.handleFileDrop }
				>
					<div className='image-container'>
							<div className='icon-container-container'>
								<div className='icon-container'>
									{ (isDragging || !hasImage) && (
										<img alt='upload' className='icon' src={ isDragging ? activeIconData : inactiveIconData}/>
									)}
								</div>
							</div>
						{ hasImage && <img alt='uploaded' src={ imageSrc }/> }
					</div>
					<input id='image' name='image' type='file' accept='image/*' onChange={ this.handleFileSelect }/>
				</label>

				{ hasImage && (
					<button className='btn-secondary btn-clear-image' onClick={ this.clearImage }>Clear Image</button>
				)}
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default connect(mapStateToProps)(ImageInput);