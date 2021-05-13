# Sure Petcare

## Introduction
This app integrate the `Sure Petcare` products into Homey.
Manage the state of your pet- or catflap and keep track of your pets!  

Do you like the app? You can make me happy by buying me a beer! [![](https://img.shields.io/badge/paypal-donate-green.svg)](https://www.paypal.me/koktaildotcom)

## Sureflap cards
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

## Surefeed cards
####Trigger
1. Pet has eating
1. Specific pet has eating
1. Weight changed
1. Bowl has been refilled

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
### v1.0.13 - 07.05.2020
  * add battery capability and percentage
  * always run synchronize trigger
  * improve readme
### v1.0.14 - 07.05.2020
  * run compose before publish
### v1.0.15 - 07.11.2020
  * add surefeed device trigger card `weight changed`
### v1.0.16 - 08.11.2020
  * extend trigger capabilities `weight changed`
### v1.0.17 - 08.11.2020
  * trigger `weight changed` after pet eats
### v1.0.18 - 08.11.2020
  * implement multiple bowl types
### v1.0.19 - 08.11.2020
  * add bowl settings
### v1.0.20 - 08.11.2020
  * bugfix login call failed
  * bugfix logout button
### v1.0.21 - 08.11.2020
  * prevent sending initial value
### v1.0.22 - 09.11.2020
  * bugfix in sending the initial value
  * simplify analysing pet data
### v1.0.23 - 29.12.2020
  * bugfix when the image location isn't set
### v1.0.24 - 30.12.2020
  * bugfix getting the profile image
### v2.0.0 - 14.11.2020
  * update to SDK 3.0
### v2.0.1 - 16.02.2021
  * fixed trigger bug when weight is < 0
  * fixed bug switching bowl types
### v2.0.2 - 21.02.2021
  * add trigger card: Bowl has been refilled
### v2.0.3 - 13.05.2021
  * ceil the value to prevent triggering 0.01 grams change
  * improve authentication handling
  * add new logo for login screen
  * remove known devices from the list
  * allow selecting multiple in pairing process
