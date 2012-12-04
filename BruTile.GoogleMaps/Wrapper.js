﻿/**
* Brutile GoogleV3
*
* Copyright 2012 Peter Löfås
* 
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU Lesser General Public
* License as published by the Free Software Foundation; either 
* version 2.1 of the License, or (at your option) any later version.
* 
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
* Lesser General Public License for more details.
* 
* You should have received a copy of the GNU Lesser General Public 
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
* 
**/

function getOLVersion() { return OpenLayers.VERSION_NUMBER; }

var map;
function init() {
    
    var map_options = {
        units: 'm',
        controls: [],
        maxResolution: 156543.0339,
        theme: null
    };
    var initExt = new OpenLayers.Bounds(253351.88636639, 7494072.399048, 3168965.8928703, 10497741.862124);
    map = new OpenLayers.Map('map', map_options);

    gl = new OpenLayers.Layer.Google("Google", { layers: "0", format: "PNG24", numZoomLevels: 20 }, { buffer: 1 });
    map.addLayer(gl);
    map.zoomToExtent(initExt);
    map.events.register("movestart", map, function () { zoomDone = false; });

    google.maps.event.addListener(gl.mapObject, "tilesloaded", function () {
        // wait for tiles to fade in completely
        setTimeout(function () {
            zoomDone = true;
        },
                150);
    });

    loaded = true;
}

zoomDone = false;
loaded = false;

function isZoomDone() {
    return zoomDone;
}

function isLoaded() {
    return loaded;
}

function matrixToArray(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}

function getExtent() {
    return map.getExtent().toBBOX();
}

function setExtent(xmin, ymin, xmax, ymax, level) {
    zoomDone = false;
    //var ext = new OpenLayers.Bounds(xmin, ymin, xmax, ymax);
    //map.zoomTo(level);
    map.setCenter(new OpenLayers.LonLat((xmin+xmax)/2, (ymin+ymax)/2),level,true,false);
    //map.zoomToExtent(ext, true);
    
}

function getTileURLs() {

    var els = document.getElementById('map').getElementsByTagName('img');
    var images = {};
    var mapNode = document.getElementById('map')
    idx = 0;
    matrixOffset = null;
    //alert(els.length);
    for (i = 0; i < els.length; i++) {
        //if (els[i].id == "" && els[i].style.width == "256px" && els[i].style.height == "256px") {

            var n = els[i].parentNode.parentNode;
            if (matrixOffset == null) {
                offsetX = 0;
                offsetY = 0;
                do {
                    offsetX += n.offsetLeft;
                    offsetY += n.offsetTop;
                    if (n.style.webkitMatrix != null) {
                        matrix = matrixToArray(n.style.webkitMatrix);
                        offsetX += parseInt(matrix[4]);
                        offsetY += parseInt(matrix[5]);
                    }
                    n = n.parentNode;
                } while (n != null && n != mapNode);

                matrixOffset = { x: offsetX, y: offsetY };
            }
            oX = els[i].parentNode.offsetLeft + matrixOffset.x;
            oY = els[i].parentNode.offsetTop + matrixOffset.y;

            images["item_" + idx] = { url: els[i].src,
                left: oX,
                top: oY,
                index: i
            };
            idx++;
        //}
    }
    images.length = idx;

    return images;
}

function getResolutions() {
    ret = "";
    for (i = 0; i < map.layers[0].resolutions.length; i++) {
        if (ret != "") {
            ret += ",";
        }
        ret += map.layers[0].resolutions[i];
    }
    return ret;
}

function getOLCenter() {
    return map.getCenter().toString();
}

function getOLExtent() {
    return map.getExtent().toBBOX();
}



function updateSize(w, h) {
    zoomDone = false;
    var c = map.getCenter();
    var z = map.getZoom();
    document.getElementById("map").style.width = w + "px";
    document.getElementById("map").style.height = h + "px";
    
    map.updateSize();
    map.setCenter(c, z, true, false);
    return map.getSize().w + "," + map.getSize().h;
}
