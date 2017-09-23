var map,
    infoWindow,
    bounds;

var initMap = function(){
    map = new google.maps.Map(document.getElementById('map'),{
        center: {lat:45.74,lng:-72.0},
        zoom:8
      });

    infoWindow = new google.maps.InfoWindow();

    bounds = new google.maps.LatLngBounds();

    ko.applyBindings(new ViewModel());
};

var mapError = function(){
    console.log("Sorry, something went wrong. Please try reloading the page.")
}


var MapItem = function(data) {
    var self=this;

    this.title = ko.observable(data.title);
    this.shortname = ko.observable(data.shortname);
    this.imgSrc = ko.observable(data.imgSrc);
    this.artist = ko.observable(data.artist);
    this.imgDesc = ko.observable(data.imgDesc)
    this.description = ko.observable(data.description);

    this.marker = new google.maps.Marker({
        position: data.geo,
        title: data.title,
        map:map
    });

    bounds.extend(this.marker.position);

    this.marker.addListener("click", function(e){
        self.highlightMarker();
    });

    // pan to the marker and scroll to/highlight the corresponding sidebar item
    this.highlightMarker = function(){

        //reset
        $(".infoResults").css("display","none");
        $(".item").css("background-color","transparent");

        var latlng = self.marker.getPosition();
        map.panTo(latlng);
        map.setZoom(14);
        infoWindow.setContent(self.title());
        infoWindow.open(map, self.marker);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            self.marker.setAnimation(null);
        }, 1500);

        var scrollPos = $("#" + self.shortname()).offset().top;
        var scrollTop = $("#sidebar").scrollTop();
        var navHeight = $("#nav").outerHeight(true);

        scrollPos = scrollPos + scrollTop - navHeight;

        $("#sidebar").animate({
            scrollTop: scrollPos},
            1000 );

        $("#" + self.shortname()).css("background-color","mediumorchid");


    };

    // search this item's keywords for the entered search terms.
    this.searchFilter = function(textList){
        var keywords = self.title() + " " + self.artist() + " " + self.description();
        keywords = keywords.toLowerCase();

        var match = true;
        for (var i=0;i<textList.length;i++){
            if (!keywords.includes(textList[i])){
                match = false;
            }
        }

        if (match === true){
            self.setVisible();
        } else {
            self.setHidden();
        }
    };

    // set the marker and corresponding sidebar entry to visible
    this.setVisible = function(){
        self.marker.setVisible(true);
        $("#" + self.shortname()).css("display","block");
        return true;
    };

    // set the marker and corresponding sidebar entry to hidden
    this.setHidden = function(){
        self.marker.setVisible(false);
        $("#" + self.shortname()).css("display","none");
        return false;
    };


};

var ViewModel = function(data){
    var self = this;

    this.itemList = ko.observableArray([]);
    mapItems.forEach(function(mapItem){
        self.itemList.push( new MapItem(mapItem));
    });

    map.fitBounds(bounds);

    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
    });

    this.selectMarker = function(){
        this.highlightMarker();
    };

    this.muralSearch = function(){
        map.fitBounds(bounds);

        $("#searchError").css("display","none");
        var searchTerm = $("#muralSearch").val().toLowerCase();

        // make sure the input field wasn't blank before searching
        if (searchTerm === ""){
            $("#searchError").css("display","block").text("Sorry, I didn't catch that. Try your search again!");
        } else {
            searchList = searchTerm.split(" ").filter(i => i);
            self.itemList().forEach(function(item){
                item.searchFilter(searchList);
            });
        }

        if($(".item:visible").length === 0){
            $("#searchError").css("display","block").text("Your search didn't return any results! Clear it or try again.");
        }
    };

    // clear the search and set all items to visible
    this.clearSearch = function(){
        $("#searchError").css("display","none");
        self.itemList().forEach(function(item){
            item.setVisible();
        });
    };


    this.getRestaurants = function(){

        //reset results block
        var resultsBlock = $("#" + this.shortname()).find(".infoResults");
        resultsBlock.text("");

        var results = self.getFoursquareData("#"+ this.shortname(), "food", this.marker.position);

        resultsBlock.css("display","block").text(results);
    };

    this.getDrinks = function(){
        var resultsBlock = $("#" + this.shortname()).find(".infoResults");

        resultsBlock.text("");

        var results = self.getFoursquareData("#" + this.shortname(), "drinks", this.marker.position);
    };

    this.getHotels = function(){
        var resultsBlock = $("#" + this.shortname()).find(".infoResults");

        resultsBlock.text("");
        var results = self.getFoursquareData("#" + this.shortname(), "hotel", this.marker.position);

    };

    this.getFoursquareData = function(id, dataType, position){

        var url = "https://api.foursquare.com/v2/venues/explore?ll=" + position.lat() +"," + position.lng();
        url += "&client_id=" + foursquare_client_id + "&client_secret=" + foursquare_secret + "&v=20131016&query="+dataType;

        // var url = "http://respons.json";

        $.ajax({
            url:url,
            success: function(data){
                var response = data;
                response=response.response.groups[0].items;

                var formattedResponse = "<ul>";
                for (var i=0;i<5;i++){
                    var item = "<li><span><a href='https://foursquare.com/v/a/" + response[i].venue.id + "' target='_blank'>" + response[i].venue.name + "</a></span></li>";
                    formattedResponse += item;
                }
                formattedResponse += "</ul>";

                self.populateResults(id, formattedResponse);

            },
            error: function(error){
                console.log(error);
                self.populateResults(id, "<span>Sorry, the search failed. Please try again later.</span>");
            }
        });
    };

    this.populateResults = function(id, response){
        var resultsBlock = $(id).find(".infoResults");
        resultsBlock.css("display","block").html(response);
    };
};
