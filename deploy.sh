ACTIVE_PROJECT=$(gcloud config list | grep -e 'project\s=\s.*')
if [[ $ACTIVE_PROJECT != "project = drobe-1529715129105" ]]
then
	echo "Switching Google Cloud Project to 'drobe-1529715129105'."
	gcloud config set project drobe-1529715129105
fi

npm run-script build --prefix ./client
gcloud app deploy --version='current' --stop-previous-version --quiet