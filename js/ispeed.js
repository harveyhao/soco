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
                    
                mark_poi_map(poi[idx]);
                    
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

//the original thought was that I can use the secondary point to figure out the travel direction
//and then only display the POIs in the travelling direction. The calculation is actually pretty simple
//if ((poi_lng-sec_lng)*(sec_lng_lng) >=0 and (poi_lat-sec_lat)*(sec_lat-lat) >=0) will tell.
//for now, does not seem to be value add. Abandon the idea
/*
	setTimeout(function() {
	        navigator.geolocation.getCurrentPosition (function (pos)
	 		{
				var sec_lat = pos.coords.latitude;
  				var sec_lng = pos.coords.longitude;
  				$("#lats").text (sec_lat);
  				$("#lngs").text (sec_lng);
  			});	 
  		 },10000);
  */		 
  		 	
//	navigator.compass.watchHeading (function (heading)
	//{
		//var rotation = Math.round(heading.magneticHeading)+"deg";
		//$("#heading").text(rotation);
//	});
  		 
}


//This function is used to calculate the distance between to geolocations. Not used

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371000; // m
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad(); 
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d;
}
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
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
 
    return map;

}

//This function is to find the address from a given GEOCoding (lat, lng) and locate it in the google map map

function codeLatLng(lat, lng) {
 
    var latlng = new google.maps.LatLng(lat, lng);
    var  geocoder = new google.maps.Geocoder();
    var street;
    
    geocoder.geocode({'latLng': latlng}, function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
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
	
    remove_poi();
    
    for (var i = 0; i < results.length; i++) {
    	create_poi(i);
	}
	
	 
	refresh_poi();
	    
  }
}

function refresh_poi()
{
	//need to refresh list view
	
	  for (var i=0; i<displayType.length;i++)
       {
       		     			
           			var tag = '#' + displayType[i];
            
       				$(tag).listview('refresh');
       			
       }
}

function remove_poi()
{
	//need to remove list view
	
	  for (var i=0; i<displayType.length;i++)
       {
       		     			
           			var tag = '#' + displayType[i] + ' >li';
            
       				$(tag).remove();
       			
       }
}



function create_poi(poi_idx) {

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
function mark_poi_on_map(place) {

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
// not used any more

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