// Wrap everything in lejog "namespace" (http://appendto.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/)
(function(lejog, $, undefined) {

	lejog.summaryMsgs = [
		["Some way to go yet!", "Just getting started!", "A long way to go yet!"], // 0%
		["A great start!", "Underway now!", "Just getting warmed up!"], // 10%
		["Around quarter distance", "Get the rhythm now!", "In the groove!"], // 20%
		["Making progress!", "Carvin' up the miles!", "In the flow!"], // 30%
		["Approaching half way!", "Going strong!", "Making progress!"], // 40%
		["Over half way!", "Broken the back of it now!", "Entering the second half"], // 50%
		["Going strong!", "Wow!", "Full of momentum now!"], // 60%
		["Really getting there!", "Not too far to go now!", "C'mon!"], // 70%
		["Into the last quarter now!", "Not far now!", "Keep giving!"], // 80%
		["On the home straight now!", "Can almost walk from here!", "Just one final push!"], // 90%
		["Amazing job!", "Wow! Done it!", "Superb effort!"] // 100%
	];

	// Max of 10 waypoints, as array of [Lat, Lng]
	lejog.routeWaypoints = [
		[50.0662735, -5.7143464],
		[50.263195, -5.051041],
		[51.209347, -2.6445979],
		[51.6980375, -2.6813804],
		[52.628385, -2.481324],
		[53.5768647, -2.4282192],
		[54.204919, -2.60171],
		[54.942631, -2.736329],
		[55.653071, -3.193642],
		[58.6373368, -3.0688997]
	];

	lejog.ROUTE_DISTANCE = 1000; // Set to fix distance of route. Set to null to calculate via Google Map
	lejog.CURRENCY_TO_DISTANCE = 1.0; // One unit of donation corresponds to this many units of distance

	lejog.DISTANCE_UNIT_NAME = "miles"; 
	lejog.DISTANCE_UNIT_TO_METRES = 1609.34;
	//lejog.DISTANCE_UNIT_NAME = "km";
	//lejog.DISTANCE_UNIT_TO_METRES = 1000;

	lejog.markerIcons = [
		"https://pedalthe.bike/images/cycle-anim-n.gif",	// North
		"https://pedalthe.bike/images/cycle-anim-ne.gif", 	// North-East
		"https://pedalthe.bike/images/cycle-anim-e.gif",	// East
		
		// Sorry, too lazy to generate images I didn't need, so just a placeholder for these directions
		"https://pedalthe.bike/images/cycle-anim-e.gif",	// South-East
		"https://pedalthe.bike/images/cycle-anim-e.gif",	// South
		"https://pedalthe.bike/images/cycle-anim-e.gif",	// South-West
		"https://pedalthe.bike/images/cycle-anim-e.gif",	// West
		"https://pedalthe.bike/images/cycle-anim-n.gif"		// North-West
	];

	// Set your own URL here. Currently only supports JustGiving. Set page size to 100 to get all donations in one hit
	lejog.fundraiserUrl = "https://api.justgiving.com/334bc1c7/v1/fundraising/pages/gndean/donations?pagesize=100";
}
( window.lejog = window.lejog || {}, jQuery ));