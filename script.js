let pin1Icon = L.icon({
    "iconUrl": "pin1.svg",
    "iconSize": [30, 30],
    "iconAnchor": [15, 15]
});

let pin2Icon = L.icon({
    "iconUrl": "pin2.svg",
    "iconSize": [30, 30],
    "iconAnchor": [15, 15]
});

let anythingSelected = false;
let map;
let pins;

async function init() {
    let response = await fetch("./data.json");
    pins = await response.json()

    console.log(pins);

    map = L.map('map', {
        zoomSnap: 0,
        zoomDelta: 0.25,
        wheelPxPerZoomLevel: 120
    }).setView([55.6292, 12.1725], 14)
    .on("click", onMapClick);

    const mtLayer = L.maptilerLayer({
        apiKey: "76VMRaNGXOGL6jfPCLib",
        style: "9748c3c4-a881-43cc-9577-e1177c07bcce" // optional
    }).addTo(map);

    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);

    document.querySelector(".leaflet-control-container > .leaflet-bottom.leaflet-right").remove();
    document.querySelector("#map > a[href=\"https://www.maptiler.com\"]").remove();

    for (const [index, pin] of pins.entries()) {
        console.log(pin);
        console.log(pin["latlng"]);
        let pinIcon;
        let target;
        if (pin["type"] == "station") {
            pinIcon = pin1Icon;
            target = "stationer";
        }
        else {
            pinIcon = pin2Icon;
            target = "attraktioner";
        }

        L.marker(pin["latlng"], { "icon": pinIcon }).addTo(map)
            .on("mouseover", function (ev) { onHover(index); })
            .on("mouseout", function (ev) { onHoverLeave(); })
            .on("click", function(ev) { onClick(index); })
            .bindTooltip((index + 1).toString(), {permanent: true, direction: 'center', offset: L.point(0, 1)});
        addToList(target, index, pin["title"]);
    }

    document.querySelector(".resizableHorizontal").addEventListener("transitionend", function() { map.invalidateSize(true); })
}

function onHover(index) {
    if (anythingSelected) {
        return;
    }

    changeCard(index);
    showCard();
}

function onHoverLeave() {
    if (anythingSelected) {
        return;
    }

    hideCard()
}

function onClick(index) {
    anythingSelected = true;

    changeCard(index);
}

function hideCard() {
    document.getElementById("contentWrapper").classList.remove("expand")
    document.getElementById("contentWrapper").classList.add("contract");
}

function showCard() {
    document.getElementById("contentWrapper").classList.remove("contract");
    document.getElementById("contentWrapper").classList.add("expand");
}

// Changes the content of the card
function changeCard(index) {
    let title = pins[index]["title"];
    let content = pins[index]["content"];
    let html = `<h1>${title}</h1><p>${content}</p>`;

    document.getElementById("content").innerHTML = html;
}

function onMapClick(event) {
    if(event.originalEvent.target.className != "leaflet-gl-layer maplibregl-map") {
        return;
    }
    console.log(event.latlng)
    console.log(event.latlng["lat"] + ", " + event.latlng["lng"]);
    anythingSelected = false;
    hideCard();
}

function addToList(id, num, title) {
    let pinUrl;
    if(id == "stationer") {
        pinUrl = "./pin1.svg";
    }
    else {
        pinUrl = "./pin2.svg";
    }
    element = new DOMParser().parseFromString(
        `<div class="listItem"><div class="pin"><img src="${pinUrl}" /><span>${num}</span></div>${title}</div>`,
        "text/html"
    ).body.childNodes[0];
    document.getElementById(id).appendChild(element);
}

function listTransition() {
    let element = document.querySelector(".resizableHorizontal");
    if (element.classList.contains("expand")) {
        element.classList.remove("expand");
        element.classList.add("contract");
    }
    else {
        element.classList.add("expand");
        element.classList.remove("contract");
    }
}