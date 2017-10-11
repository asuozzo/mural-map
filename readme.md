This is a map of Vermont murals, created using Knockout JS, JQuery, Foursquare and Bootstrap.

To get nearby location suggestions working, head to [Foursquare's developer site](https://developer.foursquare.com/) and create a new app. put your keys in ```js/vars.js``` with variable names ```foursquare_client_id``` and ```foursquare_secret```.

Once you're all set up with that, run the project locally by navigating to this directory in your terminal and typing `python -m SimpleHTTPServer`. This will start up a local webserver at http://localhost:8000; just navigate there and you'll see the app running.

If you'd instead like to get this working on the web, head to the Google Developers console and create a new api key enabled for the Google Maps Javascript API. Substitute that key in the the Google Maps API call in `index.html`— and don't forget to restrict the key's HTTP referrers before you put it online!


## todo
### quick
√ declare local vars for loop helper variables

### a little less quick
* [x] load data from separate file 
* [x] call map fitbounds on window resize
* [x] load foursquare data on initial markerinfo load
* [x] use knockout bindings for foursquare data
* [x] add foursquare attribution
* [x] add alt text to mural photos
* [x] implement map error handling 

### refactor
* SEARCH
    * [x] get search value using knockout binding
    * [x]make search into a live filter
    * [x]filter should show/hide locations in an mvvm pattern

### possible but not required
* [ ] load data from a json file with ajax