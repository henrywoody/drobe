# Drobe

## Introduction

Drobe is an application for the modern person who has no time to spend those ~5 mins every day picking what to wear. Over the course of a year, that's about 30 hours—30 hours that could be spent writing software like this. 

Of course, if you like picking outfits each day, or, on the other end of the spectrum, you don't care at all and just grab the shirt at the top of the pile, then you don't need Drobe in your life. But for the rest of us, Drobe is revolutionary. No longer will the first thing you have to do in the morning be making a decision that a machine could just make for you.

## Description

Drobe is basically a CRUD app designed as a digital wardrobe for a user. The focus of the application, however, is to suggest outfits for the user to wear each day.

The selection process involves (will involve) a few factors:

- Which articles of clothing go with others
  - user set
- The weather
  - temperature (relevant for people who don't live right on the equator)
  - rain (relevant for people in Seattle)
  - snow (relevant for people in places colder than Seattle)
- The rating of each article
  - user set
- The user's outfit history
  - prefering articles that have not been worn in a while

Eventually there will be an Alexa Skill for this so you can just ask Alexa what you should wear in the morning.

## Setup

Sounds great so far doesn't it?

Well here's the catch. It's gonna take some time to set up. You have to upload your whole wardrobe to use it—or at least the parts of it that you care about / wear regularly. But also maybe this might inspire you to clean out that wardrobe that's getting a bit cluttered.

After that though, it'll be smooth sailing.

## Tech

Postgres is the DBMS, the back-end is built with Express and Node, and the front-end is written in React. The database used to be in Mongo, but this project has a lot of many-to-many relations and those aren't really great with Mongo, but perfect for Postgres.

For weather data, this project uses the [Dark Sky API](https://darksky.net/dev). To get coordinates for users (for use in the Dark Sky API), this project uses the [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro).

### Deployment

Drobe is deployed on Google Cloud Platform [App Engine](https://cloud.google.com/appengine/) . The database is also hosted on GCP [Cloud SQL](https://cloud.google.com/sql/docs/postgres/). Images are stored on [AWS S3](https://aws.amazon.com/s3/).

#### Config

Environment variables are stored in `app.yaml`. For that reason `app.yaml` must be excluded from source control. The `template-app.yaml` shows how `app.yaml` should be formatted, but does not contain any values for the listed environment variables.

#### Connecting to production DB on local

[Using Cloud SQL for PostgreSQL](https://cloud.google.com/appengine/docs/standard/nodejs/using-cloud-sql-postgres) as a reference. See those docs for download of `cloud_sql_proxy`.

To connect to the database on GCP, get the database instance connection name with:

```shell
gcloud sql instances describe [YOUR_INSTANCE_NAME] | grep connectionName
```

In my case, `YOUR_INSTANCE_NAME` is `drobe-db`.

Then make sure postgres is not running (`brew services stop postgres`) and run:

```shell
./cloud_sql_proxy -instances="[YOUR_INSTANCE_CONNECTION_NAME]"=tcp:5432
```

#### Connecting in the Cloud Console

Enter:

```shell
PGDATABASE=[database_name] gcloud sql connect sql_instance_name --user=database_user
```

