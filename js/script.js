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
    console.log("Sorry, something went wrong. Please try reloading the page.");
    $("#map").html("<div id='mapError'>Whoops, this is embarassing. Something went wrong; please reload the page.</div>");
};

var MapItem = function(data) {
    var self=this;

    this.title = ko.observable(data.title);
    this.shortname = ko.observable(data.shortname);
    this.imgSrc = ko.observable(data.imgSrc);
    this.artist = ko.observable(data.artist);
    this.imgDesc = ko.observable(data.imgDesc);
    this.description = ko.observable(data.description);
    
    var keywords = self.title() +" " + self.artist() + " " + self.description();
    keywords = keywords.toLowerCase();

    this.keywords = ko.observable(keywords);

    this.marker = new google.maps.Marker({
        position: data.geo,
        title: data.title,
        map:map
    });

    this.foursquareList = ko.observableArray([]);
    this.foursquareError = ko.observable("");
    this.foursquareErrorVisible = ko.observable(false);
    this.getFoursquareData = function(item, event){
        getFoursquareData(item, event);
    }

    bounds.extend(this.marker.position);

    this.marker.addListener("click", function(e){
        getFoursquareData(self, e);
        self.highlightMarker();
    });

    // pan to the marker and scroll to/highlight the corresponding sidebar item
    this.highlightMarker = function(){


        var latlng = self.marker.getPosition();
        map.panTo(latlng);
        map.setZoom(14);
        infoWindow.setContent(self.title());
        infoWindow.open(map, self.marker);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            self.marker.setAnimation(null);
        }, 1400);

        var scrollPos = $("#" + self.shortname()).offset().top;
        var scrollTop = $("#sidebar").scrollTop();
        var navHeight = $("#nav").outerHeight(true);

        scrollPos = scrollPos + scrollTop - navHeight;

        $("#sidebar").animate({
            scrollTop: scrollPos},
            1000 );

    };

    // set the marker and corresponding sidebar entry to visible
    this.setVisible = function(){
        self.marker.setVisible(true);
    };

    // set the marker and corresponding sidebar entry to hidden
    this.setHidden = function(){
        self.marker.setVisible(false);
    };
};


var ViewModel = function(data){
    var self = this;

    this.itemList = ko.observableArray([]);
    mapItems.forEach(function(mapItem){
        self.itemList.push( new MapItem(mapItem));
    });

    this.selectMarker = function(item, event){
        this.highlightMarker();
        getFoursquareData(item, event);
    };

    this.searchText = ko.observable("");
    
    this.filteredList = ko.computed(function(){
        var searchString = self.searchText().toLowerCase();
        
        if (!searchString){
            self.itemList().forEach(function(item){
                item.setVisible();
            });
            return self.itemList();
        } else {
            return ko.utils.arrayFilter(self.itemList(), function(item){
                if (item.keywords().indexOf(searchString) > -1){
                    item.setVisible();
                    return true;
                } else {
                    item.setHidden();
                    return false;
                }
            })
        };
    });

    map.fitBounds(bounds);

    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
    });

};

var getFoursquareData = function(item, event){
    var position = item.marker.position;
    var id = item.shortname();

    var dataType;
    if ($(event.currentTarget).attr("type") === "button"){
        dataType = $(event.currentTarget).attr("name");
    } else {
        dataType = "food";
    };

    var url = "https://api.foursquare.com/v2/venues/explore?ll=" + position.lat() +"," + position.lng();
    url += "&client_id=" + foursquare_client_id + "&client_secret=" + foursquare_secret + "&v=20131016&query="+dataType;

    $.ajax({
        url:url,
        success: function(data){
            item.foursquareError("");
            item.foursquareErrorVisible(false);

            var response = data;
            response=response.response.groups[0].items;
            
            item.foursquareList.removeAll();
            for (var i=0;i<5;i++){
                item.foursquareList.push({"link":"https://foursquare.com/v/a/" + response[i].venue.id.toString(), "name":response[i].venue.name});
            };
        },
        error: function(error){
            console.log(error);
            item.foursquareError("Sorry, the search failed. Please try again later.");
            item.foursquareErrorVisible(true);
        }
    });
};