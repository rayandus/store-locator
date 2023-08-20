/*====================================================================================
 * Handles application tasks
 * For demo purposes: all json data serve as recordsets with data relationship assumption
 *====================================================================================*/
var g_infoWindow;
var g_map;
var g_directionsService;
var g_directionsDisplay;
var g_marker = [];
var g_features;
var g_infoWindowArr = [];
var g_establishmentStats = [];
var g_curr_marker;
var g_distanceMatrixService;

function NgExer()
{
	var g_filterEstablishments;
	var g_filterSpecialties;
	var g_mapDefaultLoc;
	
	g_infoWindow = new google.maps.InfoWindow();
	
	/*====================================================================================
	 * Initialization here
	 *====================================================================================*/
	var __construct = function()
	{
		// load collections ahead
		$.ajaxSetup({async:false});
		$.getJSON('resources/app/data/collections.json', function(p_result) {
			g_filterEstablishments = p_result.establishments;
			g_filterSpecialties = p_result.specialties;
		});
		$.ajaxSetup({async:true});
	};
	
	/*====================================================================================
	 * Map initialization
	 *====================================================================================*/
	this.initMap = function(p_defaultLoc, p_mapLoadedCallback)
	{
		m_mapStyles = [
			{
				"featureType": "administrative",
				"elementType": "geometry",
				"stylers": [
				  {
					"visibility": "off"
				  }
				]
			  },
			  {
				"featureType": "poi",
				"stylers": [
				  {
					"visibility": "off"
				  }
				]
			  },
			  {
				"featureType": "road",
				"elementType": "labels.icon",
				"stylers": [
				  {
					"visibility": "off"
				  }
				]
			  },
			  {
				"featureType": "transit",
				"stylers": [
				  {
					"visibility": "off"
				  }
				]
			  }
		];

		g_mapDefaultLoc = p_defaultLoc;
		g_map = new google.maps.Map(document.getElementById('map'), {
		  zoom: 15,
		  center: p_defaultLoc, // focus on mainland cebu
		  disableDefaultUI: true
		});
		g_map.setOptions({styles: m_mapStyles});
		
		google.maps.event.addListenerOnce(g_map, 'tilesloaded', function() {
			p_mapLoadedCallback();
		});
	};

	/*====================================================================================
	 * Load restaurants
	 *====================================================================================*/
	this.loadRestaurants = function()
	{
		var m_types = [];
		
		// pull sample data
		$.ajaxSetup({async:false});
		$.getJSON('resources/app/data/cebu-resto-geojson.json', function(result) {
			g_features = result['features'];
			//markers = map.data.addGeoJson(result);
			
			$.each(g_features, function(p_key, p_val){
				// add marker
				var m_marker = new google.maps.Marker({
					position: new google.maps.LatLng(p_val.geometry.coordinates[1], p_val.geometry.coordinates[0]),
					animation: google.maps.Animation.DROP,
					icon: {
						url: 'resources/app/images/utensils.png',
						scaledSize: new google.maps.Size(16, 16),
						origin: new google.maps.Point(0, 0),
						//anchor: new google.maps.Point(32,65)
						labelOrigin: new google.maps.Point(5,25)
					},
					label: {
						text: p_val.properties.name,
						fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol",
						fontSize: '10px',
						color: 'rgb(207, 70, 12)',
						labelClass: 'marker-est-label-text'
					},
					map: g_map,
					est_id: p_val.properties.id // custom attribute (for data mapping)
				});
				
				// add restaurant info on marker click
				m_marker.addListener('click', function() {
					
					var m_getdir = '<a href="#" onclick="NgExer.getDirectionFromCurrentGeoLoc(this);" data-lat="'+p_val.geometry.coordinates[1]+'" data-lng="'+p_val.geometry.coordinates[0]+'">Get Direction</a>';
					
					NgExer.getAddressFromLatLang(p_val.geometry.coordinates[1], p_val.geometry.coordinates[0], function(p_res) {
						var m_content = '<strong>'+p_val.properties.name+'</strong><br/>'+
									p_val.properties.description+'<br/>'+
									'Location: '+p_val.geometry.coordinates[1]+', '+p_val.geometry.coordinates[0]+'<br/>'+
									'Address: '+p_res+'<br/>'+
									m_getdir;
						g_infoWindow.setContent(m_content);
						g_infoWindow.open(g_map, m_marker);
					});
				});
				
				g_marker.push(m_marker);
			});
		});
		$.ajaxSetup({async:true});
		
		
	}
	
	/*====================================================================================
	 * Show data panel
	 *====================================================================================*/
	this.showDataPanel = function()
	{
		// add panel restaurant type
		var m_datapanel = $('#data-panel');
		// position data panel
		g_map.controls[google.maps.ControlPosition.LEFT_TOP].push(m_datapanel[0]);

		// click event for origin radio option
		$('input[name="origin"]').click(function (p_evt) {
			const value = p_evt.currentTarget.value;

			if (value === 'your-location') {
				NgExer.showUserGeoLocation(null);
			} else {
				const location = {lat: $(this).data('lat'), lng: $(this).data('lng')};
				NgExer.showUserGeoLocation(location, location);
			}
		});
	}

	/*====================================================================================
	 * Show data panel
	 *====================================================================================*/
	this.showFilterEstablishments = function()
	{
		var size = g_filterEstablishments.length;
		for(i=0; i<size; i++) {
			var m_type = g_filterEstablishments[i].type;
			var m_count = g_filterEstablishments[i].count;
			var m_obj = $('<div class=""><input type="checkbox" checked="checked" name="est-type" value="'+m_type+'"/><label>'+m_type+'</label> <label class="est-count">('+m_count+')<label></div>');
			$('#data-panel .data-panel-filters-est-type').append(m_obj);
		}
		
		// add selection/click event
		$('#data-panel .data-panel-filters-est-type').on('click', ':checkbox', function(p_obj, p_evt) {
			var m_state = $(this).is(':checked');
			var m_val = $(this).val();
			$.each(g_marker, function(p_key, p_val) {
				if( m_val == g_features[p_key].properties.type ) {
					p_val.setVisible(m_state);
				}
			});
		});
	}
	
	/*====================================================================================
	 * Show data panel
	 *====================================================================================*/
	this.showFilterSpecialties = function()
	{
		var size = g_filterSpecialties.length;
		for(i=0; i<size; i++) {
			var m_lbl = g_filterSpecialties[i];
			var m_obj = $('<div class=""><input type="checkbox" checked="checked" name="est-specialties" value="'+m_lbl+'"/><label>'+m_lbl+'</label></div>');
			$('#data-panel .data-panel-filters-specialties').append(m_obj);
		}
		
		$('[name=est-specialties]').click(function(p_evt) {
			alert('Under Construction...');
		});
	}
	
	/*====================================================================================
	 * For drawing a circle on the map
	 *====================================================================================*/
	this.initToolInspectLocationByRadius = function(p_defaultLoc)
	{
		var m_radius;
		$('#btn_inspect_loc').click(function(p_evt) {
			if( $('#btn_inspect_loc').html() == 'Reset') {
				m_radius.setMap(null);
				$('#btn_inspect_loc').html('Get stores within');
				$('#inspect_loc_details').css('display','none');
				
				// close open windows that were opened by inspect radius
				$.each(g_infoWindowArr, function(p_key, p_val) {
					this.close();
				});
			}
			else {
				if( m_radius == null ) {
					m_radius = new google.maps.Circle({
						editable: true,
						draggable: true,
						center: g_curr_marker.getPosition(),
						fillColor: '#99f',
						strokeColor: '#99f',
						clickable: true,
						map: g_map
					});
					// event when circle is resized
					m_radius.addListener('radius_changed', function(p_evt) {
						if( $('#option-show-visits').is(':checked') )
							NgExer.showProximityDetails( NgExer.updateInspectAreaDetails(m_radius, m_radius.getCenter()) );
					});
					// event when circle is moved
					m_radius.addListener('dragend', function(p_evt) {
						if( $('#option-show-visits').is(':checked') )
							NgExer.showProximityDetails( NgExer.updateInspectAreaDetails(m_radius, m_radius.getCenter()) );
					});
					// event when radius text field changes
					$('#tf_inspect_loc_radius').bind('keyup change', function(p_evt) {
						m_radius.setRadius( parseInt($(this).val()) );
					});
				}
				m_radius.setCenter(g_curr_marker.getPosition());
				m_radius.setMap(g_map);
				m_radius.setRadius( parseInt($('#tf_inspect_loc_radius').val()) );
				$('#btn_inspect_loc').html('Reset');
				$('#inspect_loc_details').css('display','block');
			}
		});
		
		$('#option-show-visits').change(function(p_evt) {
			console.log(g_establishmentStats);
		});
	}
	
	/*====================================================================================
	 * Initialize current geolocation
	 *====================================================================================*/
	this.initCurrentLocation = function(p_fk_location)
	{
		NgExer.showUserGeoLocation(p_fk_location);
	}
	
	/*====================================================================================
	 * Initialize fixed origin address/location
	 *====================================================================================*/
	this.initDirectionOrigin = function()
	{
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition( function(p_pos) {
				NgExer.getAddressFromLatLang(p_pos.coords.latitude, p_pos.coords.longitude, function(p_res) {
					$('#inp-direction-origin').val(p_res).attr('data-lat', p_pos.coords.latitude).attr('data-lng', p_pos.coords.longitude);
				});
			}, function() {
				$('#inp-direction-origin').val(p_res);
			});
		}
		else {
			// browser doesn't support geolocation
			$('#inp-direction-origin').val('Browser doesn\'t support geolocation');
		}
	}
	
	/*====================================================================================
	 * Initialize fixed destination(s)
	 *====================================================================================*/
	this.initDirectionDestination = function()
	{
		// load all available establishments
		$('#sel-direction-destination-est').append( $('<option>').val('').html('-- Select Establishment --') );
		$.each(g_features, function(p_key, p_val){
			var m_obj = $('<option>').val(p_val.properties.name).html(p_val.properties.name).attr('data-lat', p_val.geometry.coordinates[1]).attr('data-lng', p_val.geometry.coordinates[0]);
			$('#sel-direction-destination-est').append( m_obj );
		});
		
		$('#sel-direction-destination-est').change(function(p_evt) {
			if( $(this).val() == '' ) {
				$('#data-panel-text-directions').html(''); // reset text directions panel
				if( g_directionsDisplay != null ) g_directionsDisplay.setMap(null);
			} else {
				var m_origin = { lat: $('#inp-direction-origin').data('lat'), lng: $('#inp-direction-origin').data('lng') };
				var m_dest = { lat: $(this).find(':selected').data('lat'), lng: $(this).find(':selected').data('lng') };
				NgExer.calculateAndDisplayRoute(m_origin, m_dest);
			}
		});
	}
	
	/*====================================================================================
	 * Initialize loading of establishment stats
	 *====================================================================================*/
	this.initRestaurantsStats = function()
	{
		// load collections ahead
		$.getJSON('resources/app/data/est-stats-geojson.json', function(p_result) {
			
			$.each(p_result.establishments, function(p_key, p_val) {
				g_establishmentStats[p_val.id] = p_val.stats;
			});
		});
	}
	
	__construct();
};

/*====================================================================================
 * Get direction of restaurant from current geolocation
 *====================================================================================*/
NgExer.updateInspectAreaDetails = function(p_radius, p_defaultLoc)
{
	var m_cnt = 0;
	var m_est = [];
	var m_specialties = [];
	var m_markers = [];
	
	$.each(g_marker, function(p_key, p_val) {
		var m_defaultLoc = new google.maps.LatLng(p_defaultLoc.lat(), p_defaultLoc.lng());
		var m_markerLoc = new google.maps.LatLng(g_features[p_key].geometry.coordinates[1], g_features[p_key].geometry.coordinates[0]);
		
		if( NgExer.isWithinRadius(p_radius.getRadius(), m_defaultLoc, m_markerLoc) ) {
			// get all establishment types
			if ( !m_est.includes(g_features[p_key].properties.type) )
					m_est.push(g_features[p_key].properties.type);
			// get all establishment specialties
			m_specialties = m_specialties.concat(g_features[p_key].properties.specialties).filter(function(item, pos, self) { return self.indexOf(item) == pos; });
			// count establishments
			m_cnt++;
			
			m_markers.push(this); // markers within radius
		}
	});
	$('#inspect_loc_count').html(m_cnt);
	$('#inspect_loc_est').html(m_est.join(', '));
	$('#inspect_loc_specialties').html(m_specialties.join(', '));
	
	return m_markers;
}

/*====================================================================================
 * Show current user geolocation (or fake)
 *====================================================================================*/
NgExer.showUserGeoLocation = function(p_fk_location, p_center)
{
	// use fake location
	if(p_fk_location != null) {
		// show fake geolocation
		if(g_curr_marker != null) g_curr_marker.setMap(null);
		g_curr_marker = new google.maps.Marker({
			position: new google.maps.LatLng(p_fk_location.lat, p_fk_location.lng),
			animation: google.maps.Animation.DROP,
			map: g_map
		});
		g_map.setCenter(p_center);
		
		g_curr_marker.addListener('click', function() {
			NgExer.getAddressFromLatLang(p_fk_location.lat, p_fk_location.lng, function(p_res) {
				var m_content = '<strong>Your sample location</strong><br/>'+
							'Location: '+p_fk_location.lat+', '+p_fk_location.lng+'<br/>'+
							'Address: '+p_res+'<br/>';
				g_infoWindow.setContent(m_content);
				g_infoWindow.open(g_map, g_curr_marker);
				$('#inp-direction-origin').val(p_res).attr('data-lat', p_fk_location.lat).attr('data-lng', p_fk_location.lng);
			});
		});
		google.maps.event.trigger(g_curr_marker, 'click'); // show infoWindow
				
	}
	// use user geolocation
	else {
		console.log('*** navigator.geolocation', navigator.geolocation);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition( function(p_pos) {
				// show current location marker
				if(g_curr_marker != null) g_curr_marker.setMap(null);
				g_curr_marker = new google.maps.Marker({
					position: new google.maps.LatLng(p_pos.coords.latitude, p_pos.coords.longitude),
					animation: google.maps.Animation.DROP,
					map: g_map
				});
				 g_map.setCenter(g_curr_marker.getPosition());
				
				g_curr_marker.addListener('click', function() {
					NgExer.getAddressFromLatLang(p_pos.coords.latitude, p_pos.coords.longitude, function(p_res) {
						var m_content = '<strong>Your actual location</strong><br/>'+
									'Location: '+p_pos.coords.latitude+', '+p_pos.coords.longitude+'<br/>'+
									'Address: '+p_res+'<br/>';
						g_infoWindow.setContent(m_content);
						g_infoWindow.open(g_map, g_curr_marker);
						$('#inp-direction-origin').val(p_res).attr('data-lat', p_pos.coords.latitude).attr('data-lng', p_pos.coords.longitude);
					});
				});
				google.maps.event.trigger(g_curr_marker, 'click'); // show infoWindow
				
			}, function() {
				$('#inp-direction-origin').val(p_res);
			});
		}
		else {
			// browser doesn't support geolocation
			$('#inp-direction-origin').val('Browser doesn\'t support geolocation');
			alert('Browser doesn\'t support geolocation');
		}
	}
	
	if( !$('.data-panel-direction').parent().hasClass('show') )
		$('.data-panel-direction').parent().parent().find('.toggle').click();
}

/*====================================================================================
 * Show visit count on marker
 *====================================================================================*/
NgExer.showProximityDetails = function(p_markers)
{
	// close open windows that were opened by inspect radius
	$.each(g_infoWindowArr, function(p_key, p_val) {
		this.close();
	});
	
	$('#inspect_loc_est').html('');
	g_distanceMatrixService = new google.maps.DistanceMatrixService();
	
	// open new windows opened by inspect radius
	/*$.each(p_markers, function(p_key, p_val){
		var m_infoWindow = new google.maps.InfoWindow();
		m_num = g_establishmentStats[p_val.est_id].total_visits.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
		m_infoWindow.setContent( '<span style="font-size: 8px;">'+p_val.label.text+'</span><br/><span>'+m_num+'</span> <span style="font-size: 8px;">total customers</span>' );
		m_infoWindow.open(g_map, this);
		g_infoWindowArr.push(m_infoWindow);
	});*/
	
	var m_arrDestination = [];
	$.each(p_markers, function(p_key, p_val) {
		m_arrDestination.push(this.getPosition());
	});
	
	g_distanceMatrixService.getDistanceMatrix({
		origins: [g_curr_marker.getPosition()],
		destinations: m_arrDestination,
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem: google.maps.UnitSystem.METRIC,
		avoidHighways: false,
		avoidTolls: false
	}, function(m_response, m_status) {
		// update infoWindow to show distance matrix data & other details
		if(m_status != google.maps.DistanceMatrixStatus.OK) {
			alert('Error: '+m_status);
		} else {
			//console.log(m_response);
			var i = 0;
			
			$.each(m_response['destinationAddresses'], function(p_key, p_val) {
				// show details on infoWindow
				var m_infoWindow = new google.maps.InfoWindow();
				m_num = g_establishmentStats[p_markers[i].est_id].total_visits.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
				
				//console.log(p_markers[i].est_id);
				console.log( m_response['rows'][0].elements[i].distance.text );
				var m_content = '<strong>&bull; '+p_markers[i].label.text+'</strong><br/>'+
								m_num+' total customers<br/>'+
								'Address: '+p_val+'<br/>'+
								'Distance: '+ m_response['rows'][0].elements[i].distance.text+'<br/>'+
								'Travel Duration: '+ m_response['rows'][0].elements[i].duration.text;
				
				$('#inspect_loc_est').append('<div>'+m_content+'</div>');
				m_infoWindow.setContent( m_content );
				m_infoWindow.open(g_map, p_markers[i]);
				g_infoWindowArr.push(m_infoWindow);
				i++;
			});
		}
	});
	
}

/*====================================================================================
 * Get direction of restaurant from current geolocation
 *====================================================================================*/
/*NgExer.getDirectionFromCurrentGeoLoc = function(p_obj)
{
	var g_markerLoc = { lat: $(p_obj).data('lat'), lng: $(p_obj).data('lng') };
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition( function(p_pos) {
			var m_currLoc = { lat: p_pos.coords.latitude, lng: p_pos.coords.longitude };
			NgExer.calculateAndDisplayRoute(m_currLoc, g_markerLoc);
		}, function() {
			NgExer.handleLocationError(true, g_infoWindow, g_markerLoc);
		});
	}
	else {
		// browser doesn't support geolocation
		NgExer.handleLocationError(false, g_infoWindow, g_markerLoc);
	}
}*/

/*====================================================================================
 * Get direction of restaurant from current geolocation
 *====================================================================================*/
NgExer.getDirectionFromCurrentGeoLoc = function(p_obj)
{
	var g_markerLoc = { lat: $(p_obj).data('lat'), lng: $(p_obj).data('lng') };
	NgExer.calculateAndDisplayRoute(g_curr_marker.getPosition(), g_markerLoc);
}

/*====================================================================================
 * Get string address of location
 *====================================================================================*/
NgExer.getAddressFromLatLang = function(p_lat, p_lng, p_callback)
{
	var m_geocoder = new google.maps.Geocoder();
	var m_latLng = new google.maps.LatLng(p_lat, p_lng);
	
	m_geocoder.geocode( { 'latLng': m_latLng }, function(p_res, p_status) {
		if( p_status == google.maps.GeocoderStatus.OK ) {
			if( p_res[0] ) {
				p_callback(p_res[0].formatted_address);
			}
			else
				p_callback("Unable to get address for the following reason: " + p_status);
		}
		else
			p_callback("Unable to get address for the following reason: " + p_status);
	});
}

/*====================================================================================
 * Handle geolocation error
 *====================================================================================*/
NgExer.handleLocationError = function(p_geoLocIsSupported, p_infoWindow, p_markerLoc)
{
	p_infoWindow.setPosition(p_markerLoc);
	p_infoWindow.setContent(p_geoLocIsSupported ?
						    'Error: The Geolocation service failed.' :
						    'Error: Your browser doesn\'t support geolocation.');
	p_infoWindow.open(g_map);
}

/*====================================================================================
 * Calculate and display route and text directions
 *====================================================================================*/
NgExer.calculateAndDisplayRoute = function(p_currpos, p_destpos)
{
	g_directionsService = new google.maps.DirectionsService;
	
	if( g_directionsDisplay != null ) g_directionsDisplay.setMap(null);
	g_directionsDisplay = new google.maps.DirectionsRenderer({ map: g_map });
	
	g_directionsService.route({
		origin: p_currpos,
		destination: p_destpos,
		travelMode: google.maps.TravelMode.DRIVING
	},
	function(p_response, p_status) {
		if( p_status === google.maps.DirectionsStatus.OK ) {
			g_directionsDisplay.setDirections(p_response);
			$('#data-panel-text-directions').html(''); // reset text directions panel
			g_directionsDisplay.setPanel( $('#data-panel-text-directions')[0] );
			if(g_infoWindow != null) g_infoWindow.close();
		}
		else {
			g_infoWindow.setPosition(p_destpos);
			g_infoWindow.setContent('Directions request failed due to ' + p_status);
			g_infoWindow.open(g_map);
		}
	});
}

/*====================================================================================
 * Check if marker is within radius
 *====================================================================================*/
NgExer.isWithinRadius = function(p_radVal, p_radLoc, p_markerLoc)
{
	return (google.maps.geometry.spherical.computeDistanceBetween(p_radLoc, p_markerLoc)) < p_radVal;
}
