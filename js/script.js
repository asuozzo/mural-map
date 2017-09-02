var mapItems = [
    {
        "title": "Tapna Yoga",
        "artist":"Clark Derbes",
        "shortname":"tapna",
        "description":"This new Burlington mural was funded by a $3,000 grant from Burlington City Arts.",
        "imgSrc": "https://media1.fdncms.com/sevendaysvt/imager/u/blog/7674183/sota2-1-858bda70d3fcfbfd.jpg",
        "geo": {
            "lat": 44.471659,
            "lng": -73.215599
        }
    },
    {
        "title": "Milton Gardener's Supply Warehouse",
        "artist":"Sarah C. Rutherford",
        "shortname":"gardenersupply",
        "description":"The Milton Artists' Guild is on a mission to beautify the small northern Vermont town.",
        "imgSrc": "https://media1.fdncms.com/sevendaysvt/imager/u/blog/7674184/sota2-2-4d7526841ba5632a.jpg",
        "geo": {
            "lat": 44.599052,
            "lng": -73.164227
        }
    },
    {
        "title":"Dealer.com Silos",
        "artist":"Mary Lacy",
        "shortname":"dealersilos",
        "description":"These urban silos sport the recognizable geometric stylings of Vermont artist Mary Lacy.",
        "imgSrc": "https://media1.fdncms.com/sevendaysvt/imager/u/slideshow/2869652/episode412.jpg",
        "geo": {
            "lat": 44.465498,
            "lng": -73.214417
        }
    },
    {
        "title":"Simon's Downtown Mobil",
        "artist":"Anthill Collective",
        "shortname":"simonmobil",
        "description":"It took a few tries to get the right mural for this spot.",
        "imgSrc":"https://media1.fdncms.com/sevendaysvt/imager/u/big/2933578/visualart1-1-7024f7f783c4c1f1.jpg",
        "geo":{
            "lat": 44.477873,
            "lng": -73.211210
        }
    },
    {
        "title":"Jeffersonville Silos",
        "artist":"Sarah C. Rutherford",
        "shortname":"jeffsilos",
        "description":"These massive murals stand out on two silos that once belonged to the Bell-Gates Lumber Corporation.",
        "imgSrc":"https://media2.fdncms.com/sevendaysvt/imager/u/blog/3549564/artnews1-1-4caa0ac1bde58ba6.jpg",
        "geo":{
            "lat": 44.647701,
            "lng": -72.829485
        }
    },
    {
        "title":"\"Everyone Loves a Parade\", Church Street Marketplace",
        "artist":"Pierre Hardy",
        "shortname":"churchst",
        "description":"Oddly enough, Edward James Olmos has a cameo in the 124-foot-long mural.",
        "imgSrc":"https://media2.fdncms.com/sevendaysvt/imager/u/blog/3632860/wtf1-1-2157cc1e91458592.jpg",
        "geo":{
            "lat": 44.478640,
            "lng": -73.212469
        }
    },
    {
        "title":"\"You Are Loved\"",
        "artist":"Alex Cook",
        "shortname":"cherrystlove",
        "description":"The Boston-based artist has painted more than 120 murals bearing this positive slogan.",
        "imgSrc":"https://media1.fdncms.com/sevendaysvt/imager/u/blog/6212172/file_jun_12_12_44_57_pm.jpeg",
        "geo":{
            "lat": 44.479312,
            "lng": -73.212308
        }
    },
    {
        "title":"Hummingbird",
        "artist":"Mary Lacy",
        "shortname":"hummingbird",
        "description":"This ruby-throated hummingbird decorates a wall right next to City Hall Park.",
        "imgSrc":"https://media1.fdncms.com/sevendaysvt/imager/mary-lacy/u/big/2613588/visualarts1-1.jpg",
        "geo":{
            "lat": 44.476979,
            "lng": -73.214278
        }
    }
];

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


var MapItem = function(data) {
    var self=this;

    this.title = ko.observable(data.title);
    this.shortname = ko.observable(data.shortname);
    this.imgSrc = ko.observable(data.imgSrc);
    this.artist = ko.observable(data.artist);
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

        $(".item").css("background-color","transparent");

        $("#" + self.shortname()).css("background-color","mediumorchid");


    };

    // search this item's keywords for the entered search terms.
    this.searchFilter = function(textList){
        var keywords = self.title() + " " + self.artist() + " " + self.description();
        keywords = keywords.toLowerCase();

        var match = true;
        for (i=0;i<textList.length;i++){
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
        };
    };

    // clear the search and set all items to visible
    this.clearSearch = function(){
        $("#searchError").css("display","none");
        self.itemList().forEach(function(item){
            item.setVisible();
        });
    };

};

