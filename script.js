map.on("click", async function(e){

var lat = e.latlng.lat;
var lon = e.latlng.lng;

if(marker){
map.removeLayer(marker);
}

marker = L.marker([lat, lon]).addTo(map);

var response = await fetch(
"https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+"&lon="+lon
);

var data = await response.json();

var place = data.display_name || "Selected Location";

marker.bindPopup(place).openPopup();

});
async function findPlaces(type){

var center = map.getCenter();

var lat = center.lat;
var lon = center.lng;

var query = `
[out:json];
node
["amenity"="${type}"]
(around:2000,${lat},${lon});
out;
`;

var url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

let response = await fetch(url);
let data = await response.json();

data.elements.forEach(place => {

var placeLat = place.lat;
var placeLon = place.lon;

var name = place.tags.name || type;

L.marker([placeLat, placeLon])
.addTo(map)
.bindPopup(name);

});

}
async function autoSuggest(){

var query = document.getElementById("searchBox").value;

if(query.length < 3){
document.getElementById("suggestions").innerHTML="";
return;
}

let response = await fetch(
"https://nominatim.openstreetmap.org/search?format=json&q="+query
);

let data = await response.json();

let suggestionsDiv = document.getElementById("suggestions");

suggestionsDiv.innerHTML="";

data.slice(0,5).forEach(place => {

let div = document.createElement("div");

div.className="suggestion-item";

div.innerText = place.display_name;

div.onclick = function(){

document.getElementById("searchBox").value = place.display_name;

suggestionsDiv.innerHTML="";

map.setView([place.lat, place.lon],13);

if(marker){
map.removeLayer(marker);
}

marker = L.marker([place.lat, place.lon]).addTo(map);

};

suggestionsDiv.appendChild(div);

});

}
function startNavigation(){

if(routeCoords.length==0){
alert("Please generate route first");
return;
}

if(navMarker){
map.removeLayer(navMarker);
}

navIndex=0;

navMarker=L.marker(routeCoords[0]).addTo(map);

let interval=setInterval(()=>{

if(navIndex>=routeCoords.length){
clearInterval(interval);
return;
}

navMarker.setLatLng(routeCoords[navIndex]);

map.panTo(routeCoords[navIndex]);

navIndex++;

},500);

}