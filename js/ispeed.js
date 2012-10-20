var displayType = ['restaurant', 'gas_station'];
var map;
var poi;
var markersArray = [];



//register change event for sessions page TBD: move this to document ready()
$("#sessions").live("pageshow", onPageShow);

function onPageShow(e, data)
{
            google.maps.event.trigger(map, 'resize');
}
  
 //here I need to create a binding between click and the displaying the marker on the map
 
function registerFunction(tag, idx)
{ 
           
  	$(tag).children().each(function(){
            var anchor = $(this).find('a');
            if(anchor)
            {
                anchor.click(function(){
                    
                markPoiOnMap(poi[idx]);
                    
                changePage();
               });
             } //end if
        });
 }    
        
function get_current_location()
{
	navigator.geolocation.getCurrentPosition (function (pos)
	{
	    var lat = pos.coords.latitude;
  		var lng = pos.coords.longitude;
		$("#lat").text (lat);
  		$("#lng").text (lng);
  		
  		//for test purpose, fix the coors
  		
  		lat = 30.458144;
  		lng = -97.788723;

  		map=create_map(lat, lng);
  		codeLatLng(lat, lng);
  		
  		displayPOI(lat, lng);
  
	});
	
//	navigator.compass.watchHeading (function (heading)
	//{
		//var rotation = Math.round(heading.magneticHeading)+"deg";
		//$("#heading").text(rotation);
//	});
}


function create_map(lat, lng) {

  	var latlng = new google.maps.LatLng (lat, lng);
  	var options = { 
    				zoom : 10, 
    				center : latlng, 
    				mapTypeId : google.maps.MapTypeId.ROADMAP 
  				  };
  
  	var content = $("#sessions div:jqmData(role=collapsible)");
  	content.height (screen.height);
  	content.width (screen.width);
  	
  	
  	var map = new google.maps.Map (content[0], options);
  	//var map = new google.maps.Map ($("#map"), options);
  	//use this for no display 
  	//var map = new google.maps.Map (document.getElementById("map_canvas", options));
  	//google.maps.event.trigger(map, 'resize');
 
 
    return map;

}

//This function is to find the address from a given GEOCoding (lat, lng) and locate it in the google map map

function codeLatLng(lat, lng) {
    //var infowindow = new google.maps.InfoWindow();
    //var marker;

    var latlng = new google.maps.LatLng(lat, lng);
    var  geocoder = new google.maps.Geocoder();
    var street;
    
    geocoder.geocode({'latLng': latlng}, function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              //marker = new google.maps.Marker({
                //  								position: latlng,
                  //								map: map
             // });
              
             // infowindow.setContent(results[1].formatted_address);
             // infowindow.open(map, marker);
  			  $("#street").text ( results[0].formatted_address);
            } else {
              alert('No results found');
            }
          } else {
            alert('Geocoder failed due to: ' + status);
          }
        });
}

//This function is to display the POI information
function displayPOI(lat, lng)
{
    var latlng = new google.maps.LatLng(lat, lng);
	
	  		var request = {
         	location: latlng,
    		radius: '500',
    		//rankBy:	google.maps.places.RankBy.DISTANCE,
    		types: ['store', 'restaurant']
  			};

  	service = new google.maps.places.PlacesService(map);
  	service.search(request, callback);
}  	

function callback(results, status) {
  	if (status == google.maps.places.PlacesServiceStatus.OK) {
    
    //assign to global variable poi
	poi = results;
	
    removeMarker();
    
    for (var i = 0; i < results.length; i++) {
    	createMarker(i);
	}
	
	 
	refreshMarker();
	    
  }
}

function refreshMarker()
{
	//need to refresh list view
	
	  for (var i=0; i<displayType.length;i++)
       {
       		     			
           			var tag = '#' + displayType[i];
            
       				$(tag).listview('refresh');
       			
       }
}

function removeMarker()
{
	//need to remove list view
	
	  for (var i=0; i<displayType.length;i++)
       {
       		     			
           			var tag = '#' + displayType[i] + ' >li';
            
       				$(tag).remove();
       			
       }
}



function createMarker(poi_idx) {

 	  var place = poi[poi_idx];
           
        
       for (var i=0; i<displayType.length;i++)
       {
       		if($.inArray(displayType[i], place.types)!=-1) {   
      
       				var rating;
       
       				if (typeof place.rating == "undefined") 
           				rating = 0;
           			else{
           				rating = Math.ceil(2*parseFloat(place.rating));
           			}
           			
           			var tag = '#' + displayType[i];
            
      				$(tag).append('<li><a href="#sessions" id=' + poi_idx + ' data-transition="fade"></a>' + place.name + stars[rating] + '<br/><font size=1>'+ place.vicinity + '</font></li>');
					registerFunction(tag, poi_idx);
       				
       			}
       			
       }    
   
}


//THis function will mark a place in the map created
function markPoiOnMap(place) {

 	    /*var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });*/

        //google.maps.event.addListener(marker, 'click', function() {
          //infowindow.setContent(place.name);
          //infowindow.open(map, this);
       // });
       
        var placeLoc = place.geometry.location;
        var infowindow = new google.maps.InfoWindow();
        
        clearOverlays();
        
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
        
         markersArray.push(marker);
        
        infowindow.setContent(place.name);
        infowindow.open(map, marker);

    //    google.maps.event.addListener(marker, 'click', function() {
      //    infowindow.setContent(place.name);
        //  infowindow.open(map, marker);
       // });
      
   
}

//clear map overlay
function clearOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
  }
}

//This URL utility need to move out to its own area

$.extend({
  getUrlParms: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlParm: function(name){
    return $.getUrlParms()[name];
  }
});