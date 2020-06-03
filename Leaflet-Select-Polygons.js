/*Style for layers*/

var stylelayer = {
    defecto: {
        color: "DarkOrange",
        opacity: 1,
        fillcolor: "DarkOrange",
        fillOpacity: 0,
        weight: 0.5
    },
    reset: {
        color: "DarkOrange",
        opacity: 0.4,
        weight: 1
    },
    highlight: {
        weight: 5,
        color: '#0D8BE7',
        dashArray: '',
        fillOpacity: 0.7
    },
    selected: {
        color: "blue",
        opacity: 0.3,
        weight: 0.5
    }

}

/*Initial map and add layer for mapbox*/
var map = L.map('map').setView([-35.202108, 149.625924], 12);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'my company',
    id: 'mapbox.light'
});

var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

/*Esri_WorldTopoMap.addTo(map)*/
Esri_WorldImagery.addTo(map)

/*declarando variables globales*/
var placenames = new Array();
var cadids = new Object();

$.each(statesData.features, function(index, feature) {
    var name = `Lot ${feature.properties.lotnumber} in DP ${feature.properties.plannumber} `
    placenames.push(name);
    cadids[name] = feature.properties.cadid;
});

/* area de busqueda */
$('#places').typeahead({
    source: placenames,
    afterSelect: function(b) {
        redraw(b)
    }
});

var arrayBounds = [];
function redraw(b) {
    geojson.eachLayer(function(layer) {
        if (layer.feature.properties.cadid == cadids[b]) {
            selectTypeaheadFeature(layer)
        }
    })
}

var geojson = L.geoJson(statesData, {
    style: stylelayer.defecto,
    onEachFeature: onEachFeature
}).addTo(map);

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
            //dblclick : selectFeature
    });
}

var popupLayer;
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(stylelayer.highlight);
    info.update(layer.feature.properties);
}


function resetHighlight(e) {
    var layer = e.target;
    var feature = e.target.feature;
    if (checkExistsLayers(feature)) {
        setStyleLayer(layer, stylelayer.highlight)
    } else {
        setStyleLayer(layer, stylelayer.defecto)
    }
    /* Para agregar evento al la capa y mostrar detalles */
    /* popupLayer.on('mouseout', function(e) {
                this.closePopup();
            })*/
}

var featuresSelected = []
function zoomToFeature(e) {

    var layer = e.target;
    var feature = e.target.feature;

    if (checkExistsLayers(feature)) {
        removerlayers(feature, setStyleLayer, layer, stylelayer.defecto)
        removeBounds(layer)

    } else {
        addLayers(feature, setStyleLayer, layer, stylelayer.highlight)
        addBounds(layer)
    }
    map.fitBounds(arrayBounds);
    detailsselected.update(featuresSelected)

}


function selectTypeaheadFeature(layer) {
    var layer = layer;
    var feature = layer.feature;

    if (checkExistsLayers(feature)) {
        removerlayers(feature, setStyleLayer, layer, stylelayer.defecto)

        removeBounds(layer)

    } else {
        addLayers(feature, setStyleLayer, layer, stylelayer.highlight)
        addBounds(layer)
    }
    map.fitBounds(arrayBounds.length != 0 ? arrayBounds : initbounds)
    detailsselected.update(featuresSelected)

}

var corner1 = L.latLng(53.62, 2.931),
    corner2 = L.latLng(50.763, 7.182)
var initbounds = L.latLngBounds(corner1, corner2)
var arrayBounds = [];

function addBounds(layer) {
    arrayBounds.push(layer.getBounds())
}

function removeBounds(layer) {
    arrayBounds = arrayBounds.filter(bounds => bounds != layer.getBounds())
}

function setStyleLayer(layer, styleSelected) {
    layer.setStyle(styleSelected)
}

function removerlayers(feature, callback) {
    featuresSelected = featuresSelected.filter(obj => obj.cadid != feature.properties.cadid)
    callback(arguments[2], arguments[3])
}

function addLayers(feature, callback) {
    featuresSelected.push({
        cadid: feature.properties.cadid,
        feature: feature
    })
    callback(arguments[2], arguments[3])
}

function checkExistsLayers(feature) {
    var result = false
    for (var i = 0; i < featuresSelected.length; i++) {
        if (featuresSelected[i].cadid == feature.properties.cadid) {
            result = true;
            break;
        }

    };
    return result
}

/*show info layers*/
/*var info = L.control({
    position: 'bottomleft'
});

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function(properties) {
    this._div.innerHTML =

        '<h4>Properties</h4>' + (properties ?
            `
                Aantal: ${properties.amount}<br>
                Gemeente: ${properties.municipality}<br>
                Provincie:${properties.province}<br>
                Plaats:${properties.town}<br>
                Postcode:${properties.cadid}
                
                    ` : 'Hover over a state');;
};

info.addTo(map);
*/

var detailsselected = L.control();
detailsselected.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info scroler');
    this.update();
    return this._div;
};


var detailshow = function() {
    var result = ''
    var total = 0
    for (var i = 0; i < featuresSelected.length; i++) {

        var properties = featuresSelected[i].feature.properties
        result +=
        `
        Lot ${properties.lotnumber}
        in DP ${properties.plannumber}
        <a href="#" onclick=dellayer(${properties.cadid})>Delete</a>
        <hr>`;
        total += properties.amount


    }
    return {
        result: result,
        total: total
    };
}

detailsselected.update = function(arrayselected) {

    var details = detailshow()
    this._div.innerHTML = '<b>Lot and DPs: ' + '</b><br>' + details.result;
    $('#suma', window.parent.document).val(details.total);


};

detailsselected.addTo(map);

function dellayer(cadid) {
    geojson.eachLayer(function(layer) {
        if (layer.feature.properties.cadid == cadid) {
            selectTypeaheadFeature(layer)
        }
    })
}
