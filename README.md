
<h1 align="left">
  <a href="http://www.amitmerchant.com/electron-markdownify"><img src="src/app/images/shop-locator-logo.png" alt="Markdownify" width="200"></a>
  <div style="font-size: 15px">Store Locator Demo</div>
</h1>

## About the Project

Store locator is a demo project powered by Google Maps API. I made this for a simple demo a couple years back when I was still learning Google Maps API (more than 6 years ago). Fast forward to 2023, I wanted to share it in it's original form (mostly). It is written in plain Javascript, jQuery, HTML, CSS (all static), which I hope would be much easier to grasp, or so I hope 😆😛

Google Maps API is a collection of maps services provided by Google that allow developers to integrate Google Maps into their applications. What I specifically used for this project are limited to:
- Maps Javascript API
- Geocoding API
- Directions API
- Distance Matrix API

There are a bunch of other APIs and other tech stack support other than Javascript. You can read further about these APIs in their developer documentation [here](https://developers.google.com/maps)

### [Demo Page](https://rayandus.github.io/store-locator)

## Prerequisites

1. [Node Package Manager (npm)](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
1. [Node Version Manager (nvm)](https://css-tricks.com/how-to-install-npm-node-nvm/)

   > You can skip nvm. Just make sure to use `Node v14.20.0`. You can use any other node version, but compatibility may not be guaranteed, hence you may need to make the necessary code adjustments.

1. [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)
1. [Google Maps Developer Key](https://developers.google.com/maps/documentation/javascript/get-api-key)

   > Unlike before, getting a developer API key nowadays will require payment details already such as credit card. I restricted my key, so you won't be able to use it in your local simply because I want to protect my key from over-usage and/or quota theft.
   >
   > So, please secure your own key. Free credits are provided which will be enough for exploring. I also recommend that you also restrict access to your API or limit the API usage. Tips about API security [here](https://developers.google.com/maps/api-security-best-practices).

## How to Set up

1. Clone this repository into your local

1. Locate and open `index.html` in the root directory. Somewhere at the bottom, replace API-KEY with your developer key

   `<script async defer src="https://maps.googleapis.com/maps/api/js?key=API-KEY&libraries=geometry&callback=initApp"></script>`

1. Go to project root directory and install

   ```bash
   cd gmaps-assignment
   nvm install # optional if you did not install nvm
   yarn install
   ```

1. Run it

   ```bash
   yarn start
   ```
   
   > App will run at http://localhost:8000
