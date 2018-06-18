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

This project is written in the MERN stack. MongoDB serves as the database, the back-end is built with Express and Node, and the front-end is written in React.