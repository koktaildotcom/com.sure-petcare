# Sure Petcare

## Introduction
This app integrate the `Sure Petcare` products into Homey.
Manage the state of your pet- or catflap and keep track of your pets!  

Do you like the app? You can make me happy by buying me a beer! [![](https://img.shields.io/badge/paypal-donate-green.svg)](https://www.paypal.me/koktaildotcom)

## Q&amp;A

> **Q1** Why is the `Pet feeder connect` not available?

* _I don't have that device to test the functionality_

## Cards

### Trigger
1. Lock mode change
1. Log error message
1. Pet away
1. Pet home
1. Specific pet away
1. Specific pet home

### Condition
1. Lock mode is

### Action
1. Set lock mode

## Usage
1. Install app
1. Go to the the settings of the app 
1. Login with your `Sure Petcare` credentials.
1. Add device to Homey.

## History
### v1.0.0 - 02.01.2020
  * first alpha
  * add support for Sureflap Pet Door 
### v1.0.1 - 03.01.2020
  * add support for Sureflap Cat Flap
### v1.0.2 - 03.01.2020
  * update metadata
  * change readme after review
### v1.0.3 - 09.01.2020
  * add trigger, condition and action cards
### v1.0.4 - 09.01.2020
  * add new metadata
  * add communityId
  * resolve login issue
### v1.0.5 - 20.01.2020
  * fixed typo that will resolve [trigger action issue](https://github.com/koktaildotcom/com.sure-petcare/issues/1)
### v1.0.6 - 16.01.2020
  * add new metadata
  * add communityId
  * change category
  * add sync process for polling state
  * add cards for presence detection for pets
### v1.0.10 - 03.02.2020
  * don't try to render profile image is not exist
  * set location of pet if change manually
  * fixed translation and optimize icon
### v1.0.11 - 03.02.2020
  * fixed bug when lockstate is in curfew mode
### v1.0.12 - 03.02.2020
  * prevent the case that the position is unknown
  * fixed bug that you cannot find new devices [trigger action issue](https://github.com/koktaildotcom/com.sure-petcare/issues/5)
  * fixed bug [profile image cannot be null](https://github.com/koktaildotcom/com.sure-petcare/issues/5)
### v1.0.13 - 
  * improve readme
