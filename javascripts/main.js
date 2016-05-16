var DEG_TO_RAD = 0.0174533;

var map;
var route;
var marker;
var markerTimerHandle = null
var infoWindow;
var markerLatLngHistory = []

// The following are populated on response to the fundraiser API
var totalDonations = null;
var lastDonorName = null;
	

function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });

    var myOptions = {
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	  directionsDisplay.setMap(map);
    calcRoute(directionsDisplay);
   
    // Make async request to populate fundraising details
    getFundraiserDetails();
	
	// Set up replay option
	$("#play_animation").click(function() { startAnimation(); return(false); } );
}

function calcRoute(directionsDisplay) {

	
	start = new google.maps.LatLng(routeWaypoints[0][0], routeWaypoints[0][1]);
	end = new google.maps.LatLng(routeWaypoints[routeWaypoints.length - 1][0], routeWaypoints[routeWaypoints.length - 1][1]);
    var waypts = [];
	for (w = 1;w < routeWaypoints.length - 1;w++) {
		waypts.push({
			location: new google.maps.LatLng(routeWaypoints[w][0], routeWaypoints[w][1]),
			stopover: true
		});
	}
    
    createMarker(map, start);
        
    var request = {
        origin: start,
        destination: end,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.DirectionsTravelMode.BICYCLING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
    };

    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            route = response.routes[0];
        }
    });
}

function createMarker(map, latlng) {
    
    marker = new google.maps.Marker({
        position: latlng,
        map: map,
        icon: {
        	url: markerIcons[2], // Start facing East
          anchor: new google.maps.Point(18, 26)
        },
        optimized:true // Set to false to animate the gif
    });
}

function startAnimation() {
  var targetDist = totalDonations * CURRENCY_TO_DISTANCE;
  targetDist *= DISTANCE_UNIT_TO_METRES;
  
  // Validate stuff
  if (!route || !route.legs) {
  	return
  }
  
  if (ROUTE_DISTANCE) {
	  totalDist = ROUTE_DISTANCE * DISTANCE_UNIT_TO_METRES;
  }
  else {
	  var totalDist = 0;
	  for (l = 0;l < route.legs.length;l++) {
		totalDist += route.legs[l].distance.value;
	  }
  }

  // Clamp targetDist to known bounds
  targetDist = Math.min(totalDist, targetDist)
  targetDist = Math.max(0, targetDist)
  
  // Clear any existing info window
  if (infoWindow) {
	  infoWindow.close();
  }
  
  $("#play_animation").hide();
  
  // Cancel any previous animation
  if (markerTimerHandle) {
  	clearTimeout(markerTimerHandle);
  }
  // Start movement of marker
  animateMarker(targetDist, 0, totalDist)
  marker.optimized = false; // Set GIF animating
  // Reset history of marker positions
  markerLatLngHistory = []; 
}

// Return the initial bearing from a great circle from lat1,lng1 to lat2,lng2
// Inputs and return in degrees
// Returns in the range [0, 360) where 0 is North
function getBearing(lat1, lng1, lat2, lng2)
{
	// Convert degrees to radians
  var lt1 = lat1 * DEG_TO_RAD;
  var lg1 = lng1 * DEG_TO_RAD;
  var lt2 = lat2 * DEG_TO_RAD;
  var lg2 = lng2 * DEG_TO_RAD;
  
  var y = Math.sin(lt2-lt1) * Math.cos(lg2);
  var x = Math.cos(lg1)*Math.sin(lg2) -
          Math.sin(lg1)*Math.cos(lg2)*Math.cos(lt2-lt1);
  return (Math.atan2(x, y) / DEG_TO_RAD + 360) % 360;
}

function animateMarker(targetDist, step, totalDist)
{
	stepDist = step * targetDist / 100;
  markerLatLng = getLatLngFromDistance(stepDist);
  
  marker.setPosition(markerLatLng);
  markerLatLngHistory.push(markerLatLng);
  
  if (step < 100) {
    // Calculate approximate bearing based on recent movements
    var BEARING_STEPS = 10; // Look back this many steps
    
    var startStep = Math.max(0, step - BEARING_STEPS);
    if (step > startStep) {
    	var bearing = getBearing(markerLatLngHistory[startStep].lat(), markerLatLngHistory[startStep].lng(), markerLatLng.lat(), markerLatLng.lng());
		
		// Convert bearing into most appropriate icon
		var iconIndex = Math.floor((bearing + 22) * 8 / 360) % 8;
		marker.icon.url = markerIcons[iconIndex];
	}
      
	step++;
    
    markerTimerHandle = setTimeout(function(){animateMarker(targetDist, step, totalDist)}, 100);
  }
  else {
  	// Stop animation and show default icon
  	marker.icon.url = "https://pedalthe.bike/images/cycle-anim-e.gif";
  	marker.optimized = true;
    
    // Display a summary message
    infoMsg = Math.round(totalDonations * CURRENCY_TO_DISTANCE) + " out of " + Math.round(totalDist / DISTANCE_UNIT_TO_METRES) + " " + DISTANCE_UNIT_NAME + " sponsored so far...";
	
	// Choose an appropriate message
	var msgIndex = Math.floor(targetDist * (summaryMsgs.length - 1) / totalDist);
	msgIndex = Math.min(summaryMsgs.length - 1, msgIndex);
	msgIndex = Math.max(0, msgIndex);
  
    infoMsg += "<br/>" + summaryMsgs[msgIndex][Math.floor(Math.random() * summaryMsgs[msgIndex].length)];
    infoMsg += "<p>Thanks so much to <em>";
	infoMsg += lastDonorName ? lastDonorName : "secret squirrel";
	infoMsg += "</em> for the recent sponsor<br/>and to everyone for your support.</p>"
    infoWindow = new google.maps.InfoWindow({
    	content: infoMsg
    });
    infoWindow.open(map, marker);
	
	// Show option to replay awesome animation
	$("#play_animation").show(1000);
  }
}

function getLatLngFromDistance(targetDist)
{
 	// Find the path node closest to the desired distance
  var pathLatLng = null;
  var cumDist = 0
  for (l = 0;l < route.legs.length;l++) {
  	var leg = route.legs[l]
  	for (s = 0; s < leg.steps.length;s++) {
    	var step = leg.steps[s];
      
    	if (cumDist + step.distance.value >= targetDist) {
      	// The moveToDist occurs within this step. Make a guess as to which node with the path we are closest to
        var pathNodeNum = Math.min(step.path.length -1, (targetDist - cumDist) / Math.max(1, step.distance.value) * step.path.length);
        pathLatLng = step.path[Math.floor(pathNodeNum)];

        break;
      }
      // Accumulate distance of this step and continue looping
      cumDist += step.distance.value;
    }
    // Are we done?
    if (pathLatLng) {
    	break;
    }
  } 
  if (!pathLatLng) {
  	// We didn't find a path node, choose the final one
    var lastLeg = route.legs[route.legs.length - 1];
    var lastStep = lastLeg.steps[lastLeg.steps.length - 1];
    pathLatLng = lastStep.path[lastStep.path.length - 1];
  }
  
  return pathLatLng;
}

function getFundraiserDetails()
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
    {
      var ret = JSON.parse(xmlHttp.responseText);
      var don = ret.donations;
      don = don.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} );
      
      totalDonations = 0;
      for (d = 0;d < don.length;d++) {
      	totalDonations += parseFloat(don[d].amount);
        lastDonorName = don[d].donorDisplayName;
      }
	  
	  // Start the animation in a little bit
	  setTimeout(function(){ startAnimation(); }, 3000);
    }
  }
  xmlHttp.open("GET", fundraiserUrl, true); // true for asynchronous 
  xmlHttp.setRequestHeader("Accept", "application/json");
  xmlHttp.send(null);
}
