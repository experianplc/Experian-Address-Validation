function showEnrichmentSpinner() {
    const enrichmentElement = document.querySelector("#enrichment");
    if (!enrichmentElement) {
        return;
    }

    enrichmentElement.classList.remove("hidden");
    const contentElement = enrichmentElement.querySelector(".content");
    if (!contentElement) {
        return;
    }

    let loaderElement = contentElement.querySelector("#enrichment-loader");
    if (!loaderElement) {
        loaderElement = document.createElement("div");
        loaderElement.setAttribute("id", "enrichment-loader");
        loaderElement.className = "loader loader-inline";
        loaderElement.innerHTML = '<div class="spinner">Loading...</div>';
        contentElement.prepend(loaderElement);
    }
    loaderElement.classList.remove("hidden");
}

function hideEnrichmentSpinner() {
    const loaderElement = document.querySelector("#enrichment-loader");
    if (loaderElement) {
        loaderElement.classList.add("hidden");
    }
}

address.events.on("pre-enrichment", function () {
    showEnrichmentSpinner();
});

// Hide enrichment spinner if enrichment request fails or token is unauthorized for enrichment.
address.events.on("request-error", function () {
    hideEnrichmentSpinner();
});

address.events.on("request-error-401", function () {
    hideEnrichmentSpinner();
});

// Display a map with the lat/long details after a data enrichment lookup
address.events.on("post-enrichment", function (data) {
    hideEnrichmentSpinner();

    let enrichmentElement = document.querySelector("#enrichment");
    if (address.geocodes.detailsMap.size > 0 || (data.result.what3words && data.result.what3words.latitude) || address.cvHousehold.detailsMap.size > 0) {
        document.querySelector(".metadata #what3words-key").classList.add("hidden");
        document.querySelector(".metadata #what3words-value").classList.add("hidden");

        enrichmentElement.classList.remove("hidden");
        // populate cv household attributes
        populateAddressAdditionalInfo(address.cvHousehold.detailsMap, enrichmentElement, address.cvHousehold.title, 1);

        // populate geocodes attributes
        populateAddressAdditionalInfo(address.geocodes.detailsMap, enrichmentElement, address.geocodes.title, 2);

        let w3wLat, w3wLong, w3wLatLong;
        if (data.result.what3words && data.result.what3words.latitude) {
            document.querySelector(".metadata #what3words-key").classList.remove("hidden");
            document.querySelector(".metadata #what3words-value").classList.remove("hidden");
            document.querySelector(".metadata #what3words-value").innerHTML = '///' + data.result.what3words.name;

            w3wLat = data.result.what3words.latitude;
            w3wLong = data.result.what3words.longitude;
            w3wLatLong = [w3wLat, w3wLong];
        }

        let geoLat, geoLong, geoLatLong;
        if (data.result.nzl_regional_geocodes) {
            geoLat = address.geocodes.detailsMap.get("Centroid of Property Latitude");
            geoLong = address.geocodes.detailsMap.get("Centroid of Property Longitude")
        } else {
            geoLat = address.geocodes.detailsMap.get("Latitude");
            geoLong = address.geocodes.detailsMap.get("Longitude")
        }
        if (geoLat && geoLong) {
            geoLatLong = [geoLat, geoLong];
        }

        var zoom = 16;
        var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

        // Define a custom icon for what3words
        var w3wIcon = L.icon({
            iconUrl: './dist/images/w3w.loc.png',
            iconSize: [30, 37], // size of the icon
            iconAnchor: [15, 36], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -20] // point from which the popup should open relative to the iconAnchor
        });

        if (w3wLatLong || geoLatLong) {
            document.querySelector("#map").classList.remove("hidden");
            // Instantiate a new map
            if (!addressValidationMap) {
                // The hardcoded coordinated are needed to initialize the map. Will be overwritten with the what3words and geocode markers.
                addressValidationMap = L.map('map').setView([51.500264, 0.633506], zoom);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution}).addTo(addressValidationMap);
            } else {
                // Update the previous map instance by removing any existing markers
                if (addressValidationW3wMarker) {
                    addressValidationW3wMarker.remove();
                }

                if (addressValidationGeoMarker) {
                    addressValidationGeoMarker.remove();
                }
            }

            // When map container visibility toggles, Leaflet may need a size refresh
            // before center/fit calculations are accurate.
            addressValidationMap.invalidateSize();

            // Add new markers for location insight datasets
            var markerArray = [];
            var markerPositions = [];
            if (w3wLatLong) {
                var w3wLatNum = parseFloat(w3wLatLong[0]);
                var w3wLongNum = parseFloat(w3wLatLong[1]);
                if (Number.isFinite(w3wLatNum) && Number.isFinite(w3wLongNum)) {
                    const w3wPoint = [w3wLatNum, w3wLongNum];
                    addressValidationW3wMarker = L.marker(w3wPoint, {icon: w3wIcon}).addTo(addressValidationMap);
                    markerArray.push(addressValidationW3wMarker);
                    markerPositions.push(w3wPoint);
                }
            }

            if (geoLatLong) {
                var geoLatNum = parseFloat(geoLatLong[0]);
                var geoLongNum = parseFloat(geoLatLong[1]);
                if (Number.isFinite(geoLatNum) && Number.isFinite(geoLongNum)) {
                    const geoPoint = [geoLatNum, geoLongNum];
                    addressValidationGeoMarker = L.marker(geoPoint).addTo(addressValidationMap);
                    markerArray.push(addressValidationGeoMarker);
                    markerPositions.push(geoPoint);
                }
            }

            // Ensure marker(s) are visible and centered deterministically.
            if (markerPositions.length === 1) {
                addressValidationMap.setView(markerPositions[0], 17, { animate: false });
            } else if (markerArray.length > 1) {
                var group = L.featureGroup(markerArray);
                addressValidationMap.fitBounds(group.getBounds().pad(0.25), { animate: false });
            }

            // One more refresh after layout settles to keep tiles/marker alignment in sync.
            setTimeout(function () {
                if (addressValidationMap) {
                    addressValidationMap.invalidateSize();
                }
            }, 0);
        }
    }
    // populate premium location insight
    if (address.premiumLocationInsightMap.size > 0) {
        enrichmentElement.classList.remove("hidden");
        populateAddressAdditionalInfo(address.premiumLocationInsightMap, enrichmentElement, "Premium Location Insight", 3);
    }

    // Keep initial behavior consistent across countries: only the Enrichment
    // header is visible until the user chooses to expand sections.
    setAllEnrichmentSectionsExpanded(false);

    updateEnrichmentBulkControls();
});

// Display and populate the "metadata" container
function populateMetadata(data) {
    // Try and get some geocoded enrichment data
    const enrichmentPayload = data && data.enrichment != null
        ? data.enrichment
        : (data && data.result ? data.result.enrichment : null);

    if (enrichmentPayload != null) {
        address.getEnrichmentData(enrichmentPayload);
    } else {
        const globalAddressKey = data && data.result && data.result.global_address_key
            ? data.result.global_address_key
            : (data && data.metadata ? data.metadata.global_address_key : null);
        if (globalAddressKey) {
            address.getLookupEnrichmentData(globalAddressKey);
        }
    }

    const confidence = data.result.confidence;
    if (confidence) {
        document.querySelector(".metadata #confidence-key").innerText = 'Confidence level: ';
        document.querySelector(".metadata #confidence-value").innerText = confidence;
    }
    const match_type = data.result.match_type;
    if (match_type) {
        document.querySelector(".metadata #match_type-key").innerText = 'Match Type:' ;
        document.querySelector(".metadata #match_type-value").innerText = match_type;
    }
    const match_confidence = data.result.match_confidence;
    if (match_confidence) {
        document.querySelector(".metadata #match_confidence-key").innerText = 'Match Confidence:';
        document.querySelector(".metadata #match_confidence-value").innerText = match_confidence;
    }
   

    if (data.metadata && data.metadata.address_classification) {
        const deliveryType = data.metadata.address_classification.delivery_type;
        if (deliveryType) {
            document.querySelector(".metadata #delivery-type-key").innerText = 'Delivery type: ';
            document.querySelector(".metadata #delivery-type-value").innerText = deliveryType.substring(0, 1).toUpperCase() + deliveryType.substring(1);
        }
    }

    const formattedAddress = data && data.result && data.result.addresses_formatted && data.result.addresses_formatted[0]
        ? data.result.addresses_formatted[0].address
        : null;

    document.querySelector(".metadata #delivery-address-key").innerHTML = data.result.address ? 'Validated address: ' : '';
    if (data.result.address) {
        document.querySelector(".metadata #delivery-address-value").innerHTML = Object.values(data.result.address).filter(line => line !== "").join("<br>");
    } else if (formattedAddress && formattedAddress.gas_meters && !formattedAddress.electricity_meters) {
        document.querySelector(".metadata #delivery-address-value").innerHTML = Object.entries(formattedAddress.gas_meters[0]).filter(line => line[1] !== "").map(x => x[0] + ": " + x[1]).join("<br>");
    } else if (formattedAddress && formattedAddress.electricity_meters && !formattedAddress.gas_meters) {
        document.querySelector(".metadata #delivery-address-value").innerHTML = Object.entries(formattedAddress.electricity_meters[0]).filter(line => line[1] !== "").map(x => x[0] + ": " + x[1]).join("<br>");
    } else if (formattedAddress && formattedAddress.gas_meters && formattedAddress.electricity_meters) {
        document.querySelector(".metadata #delivery-address-value").innerHTML = Object.entries(formattedAddress.gas_meters[0]).filter(line => line[1] !== "").map(x => x[0] + ": " + x[1]).join("<br>") + "<br><br>" +
        Object.entries(formattedAddress.electricity_meters[0]).filter(line => line[1] !== "").map(x => x[0] + ": " + x[1]).join("<br>");
    } else {
        document.querySelector(".metadata #delivery-address-value").innerHTML = '';
    }
    document.querySelector(".metadata").classList.remove("invisible");

    if (data.result.names) {
        // Populate the "Validated name" field with data.result.names
        const validatedNameElement = document.querySelector("#validated-name");
        if (validatedNameElement) {
            // Assume #validated-name contains a heading and a content area, e.g.:
            // <div id="validated-name"><h4>Validated name</h4><div class="validated-name-content"></div></div>
            let contentElement = validatedNameElement.querySelector(".validated-name-content");
            if (!contentElement) {
                contentElement = document.createElement("div");
                contentElement.className = "validated-name-content";
                validatedNameElement.appendChild(contentElement);
            }
            contentElement.innerHTML = '';
            if (Array.isArray(data.result.names)) {
                contentElement.innerHTML = data.result.names
                    .filter(Boolean)
                    .map(name => typeof name === "object" ? Object.values(name).join(" ") : name)
                    .join("<br>");
            } else if (typeof data.result.names === "string") {
                contentElement.innerText = data.result.names;
            }
        }
    }

    populateAddressAdditionalInfo(address.componentsCollectionMap, document.querySelector("#components-collection"));
    populateAddressAdditionalInfo(address.metadataCollectionMap, document.querySelector("#metadata-collection"));
    
    populateAddressAdditionalInfo(address.matchInfoCollectionMap, document.querySelector("#match_info"),null,null,true);
}

// Method to reuse to populate the address additional info. Eg: Address components, Address metadata, and enrichment data.
function populateAddressAdditionalInfo(collectionMap, parentElement, elementTitle, collapsibleIndex, isMatchInfo=false) {
    if (collectionMap.size > 0) {
        let enrichmentDivContentElement = parentElement.getElementsByClassName("content")[0];
        parentElement.classList.remove("hidden");
        let divContentElement = enrichmentDivContentElement;

        // create child element(eg: CV, Geocodes and Premium Location Insight) under Enrichment
        if (elementTitle) {
            let categoryDivElement = document.createElement("div");
            const headerElement = document.createElement("h3");
            headerElement.innerText = elementTitle;
            categoryDivElement.append(headerElement);
            if (collapsibleIndex) {
                let spanElement = document.createElement("span");
                spanElement.classList.add("collapsible");
                createCollapsibleELement(spanElement, collapsibleIndex);

                let childDivElement = document.createElement("div");
                childDivElement.classList.add('content');
                childDivElement.setAttribute('style', "display: none;");
                divContentElement = childDivElement;
                categoryDivElement.append(spanElement, childDivElement);
            }
            enrichmentDivContentElement.append(categoryDivElement);
        }
        populateContent(collectionMap, divContentElement,isMatchInfo)
    }
}

// to create collapsible child elements(CV, Geocodes and Premium Location Insight) under Enrichment
function createCollapsibleELement(parentSpanElement, collapsibleIndex) {
    let hideSpanElement = document.createElement("span");
    hideSpanElement.innerText = "[Hide]";
    hideSpanElement.classList.add("hide" + `${collapsibleIndex}`);
    hideSpanElement.classList.add("hidden");

    let showSpanElement = document.createElement("span");
    showSpanElement.innerText = "[Show]";
    showSpanElement.classList.add("show" + `${collapsibleIndex}`);

    parentSpanElement.append(hideSpanElement, showSpanElement);
    // to add event listener to the Hide & Show elements
    addCollapsibleEventListener(parentSpanElement, ".hide" + `${collapsibleIndex}`, ".show" + `${collapsibleIndex}`)
}

// to populate the address information from collectionMap into the divElement
function populateContent(collectionMap, divElement,isMatchInfo = false) {
    collectionMap.forEach((value, key) => {
        const htmlSpanElement = document.createElement("span");
        let htmlBrElement = document.createElement("br");
        if (typeof value == "object") {
            htmlSpanElement.innerText = `${key}: `;
            divElement.append(htmlSpanElement, htmlBrElement);

            addChildElement(Object.entries(value), divElement, 1, true, isMatchInfo)
        } else {
            // to add tooltip description for each entry from tooltipDescriptionMap
            if (address.tooltipDescriptionMap.has(key)) {
                let tooltipDivElement = document.createElement("div");
                tooltipDivElement.classList.add("tooltip");
                tooltipDivElement.innerText = `${value}`;

                let tooltipSpanElement = document.createElement("span");
                tooltipSpanElement.classList.add("tooltiptext");
                tooltipSpanElement.innerText = `${address.tooltipDescriptionMap.get(key)}`;
                tooltipDivElement.append(tooltipSpanElement);

                htmlSpanElement.innerText = `${key}: `;
                htmlSpanElement.append(tooltipDivElement);
            } else {
                    htmlSpanElement.innerText = `${key}: ${value}`;
            }
            divElement.append(htmlSpanElement, htmlBrElement);
        }
    });
    divElement.append(document.createElement("br"));
}

// to iterate over the entries to populate the content into divElement
function addChildElement(entries, divElement, level, addSubtitle, isMatchInfo = false) {
    for (const [childKey, childValue] of entries) {
        const htmlChildSpanElement = document.createElement("span");
        let htmlChildBrElement = document.createElement("br");

        // to handle the indention for an entry
        htmlChildSpanElement.classList.add('tab');
        htmlChildSpanElement.setAttribute("style", "--spaces: " + level * 2 + "em;");
        if (typeof childValue == "object") {
            let childLevel = level;
            if (addSubtitle) {
                htmlChildSpanElement.innerText = `${childKey}: `;
                childLevel = level + 1;
                divElement.append(htmlChildSpanElement, htmlChildBrElement);
            }
            addChildElement(Object.entries(childValue), divElement, childLevel,
                !(Array.isArray(childValue) && childValue.length === 1));
        } else {
            if(isMatchInfo){
                htmlChildSpanElement.innerText = `${childValue}`;
            }
            else{
                htmlChildSpanElement.innerText = `${childKey}: ${childValue}`;
            }
            divElement.append(htmlChildSpanElement, htmlChildBrElement);
        }
    }
}

// Hide the "metadata" container
function resetMetadata() {
    document.querySelector(".metadata #confidence-key").innerText = '';
    document.querySelector(".metadata #confidence-value").innerText = '';
    document.querySelector(".metadata #delivery-type-key").innerText = '';
    document.querySelector(".metadata #delivery-type-value").innerText = '';
    document.querySelector(".metadata #what3words-key").classList.add("hidden");
    document.querySelector(".metadata #what3words-value").classList.add("hidden");

    document.querySelector(".metadata").classList.add("invisible");

    resetMetadataElements(document.getElementById("validated-address-info"));

    // to remove all components collection elements
    resetMetadataElements(document.getElementById("components-collection"), true);
    document.querySelector("#components-collection").classList.add("hidden");

    // to remove all metadata collection elements
    resetMetadataElements(document.getElementById("metadata-collection"), true);
    document.querySelector("#metadata-collection").classList.add("hidden");

    // to remove all matchinfo collection elements
    resetMetadataElements(document.getElementById("match_info"), true);
    document.querySelector("#match_info").classList.add("hidden");

    // to remove all enrichment elements
    resetMetadataElements(document.getElementById("enrichment"), true);
    document.querySelector("#enrichment").classList.add("hidden");

    document.querySelector("#map").classList.add("hidden");

    updateEnrichmentBulkControls();
}

// to remove child elements that were created
function resetMetadataElements(parent, containsChildElements) {
    if (containsChildElements) {
        parent.querySelector(".hide").classList.add("hidden");
        parent.querySelector(".show").classList.remove("hidden");
    }
    let divElements = parent.querySelectorAll(".content");
    divElements.forEach(div => {
        div.style.display = containsChildElements ? "none" : "block";

        if (containsChildElements) {
            removeElements(div.getElementsByTagName("div"));
            removeElements(div.getElementsByTagName("span"));
            removeElements(div.getElementsByTagName("br"));
            removeElements(div.getElementsByTagName("h3"));
        }
    });
}

// to remove all the elements passed
function removeElements(elementsToRemove) {
    Array.from(elementsToRemove).forEach(element => element.remove())
}

// to handle expand and collapse
function onContentLoaded() {
    ensureEnrichmentBulkControls();
    let collapsibleDivs = document.querySelectorAll(".collapsible");
    collapsibleDivs.forEach(div => addCollapsibleEventListener(div, ".hide", ".show"));
    updateEnrichmentBulkControls();
}

// to add collapsible event listener to Hide & Show
function addCollapsibleEventListener(element, hideElementName, showElementName) {
    element.addEventListener('click', function () {
        let nextElementSibling = getCollapsibleContentElement(this);
        if (!nextElementSibling) {
            return;
        }

        let parentElement = nextElementSibling.parentElement;
        let hideElement = parentElement.querySelector(hideElementName);
        let showElement = parentElement.querySelector(showElementName);
        if (nextElementSibling.style.display === "block") {
            nextElementSibling.style.display = "none";
            hideElement.classList.add("hidden");
            showElement.classList.remove("hidden");
        } else {
            nextElementSibling.style.display = "block";
            hideElement.classList.remove("hidden");
            showElement.classList.add("hidden");
        }

        updateEnrichmentBulkControls();
    })
}

function getCollapsibleContentElement(collapsibleElement) {
    if (!collapsibleElement) {
        return null;
    }

    let siblingElement = collapsibleElement.nextElementSibling;
    while (siblingElement) {
        if (siblingElement.classList && siblingElement.classList.contains('content')) {
            return siblingElement;
        }
        siblingElement = siblingElement.nextElementSibling;
    }

    return null;
}

function findCollapseToggle(collapsibleElement, prefix) {
    if (!collapsibleElement) {
        return null;
    }

    return Array.from(collapsibleElement.children).find(child =>
        Array.from(child.classList).some(className => className.startsWith(prefix))
    ) || null;
}

function setCollapsibleState(collapsibleElement, expand) {
    if (!collapsibleElement) {
        return false;
    }

    const nextElement = getCollapsibleContentElement(collapsibleElement);
    if (!nextElement) {
        return false;
    }

    nextElement.style.display = expand ? "block" : "none";

    const hideElement = findCollapseToggle(collapsibleElement, 'hide');
    const showElement = findCollapseToggle(collapsibleElement, 'show');

    if (hideElement) {
        hideElement.classList.toggle('hidden', !expand);
    }

    if (showElement) {
        showElement.classList.toggle('hidden', expand);
    }

    return true;
}

function getEnrichmentCollapsibleElements() {
    const enrichmentElement = document.querySelector('#enrichment');
    if (!enrichmentElement) {
        return [];
    }

    return Array.from(enrichmentElement.querySelectorAll('.collapsible')).filter(collapsibleElement => {
        return !!getCollapsibleContentElement(collapsibleElement);
    });
}

function setAllEnrichmentSectionsExpanded(expand) {
    const collapsibleElements = getEnrichmentCollapsibleElements();
    collapsibleElements.forEach(collapsibleElement => setCollapsibleState(collapsibleElement, expand));
    updateEnrichmentBulkControls();
}

function updateEnrichmentBulkControls() {
    const showAllElement = document.querySelector('#enrichment-show-all');
    const hideAllElement = document.querySelector('#enrichment-hide-all');

    if (!showAllElement || !hideAllElement) {
        return;
    }

    const collapsibleElements = getEnrichmentCollapsibleElements();
    if (collapsibleElements.length === 0) {
        showAllElement.classList.remove('hidden');
        hideAllElement.classList.add('hidden');
        return;
    }

    const allExpanded = collapsibleElements.every(collapsibleElement => {
        const contentElement = getCollapsibleContentElement(collapsibleElement);
        return contentElement && contentElement.style.display === 'block';
    });

    showAllElement.classList.toggle('hidden', allExpanded);
    hideAllElement.classList.toggle('hidden', !allExpanded);
}

function ensureEnrichmentBulkControls() {
    const enrichmentElement = document.querySelector('#enrichment');
    if (!enrichmentElement || document.querySelector('#enrichment-bulk-controls')) {
        return;
    }

    const enrichmentCollapsible = enrichmentElement.querySelector('.collapsible');
    if (!enrichmentCollapsible) {
        return;
    }

    const controlsContainer = document.createElement('span');
    controlsContainer.id = 'enrichment-bulk-controls';

    const showAllElement = document.createElement('span');
    showAllElement.id = 'enrichment-show-all';
    showAllElement.innerText = '[Show all]';
    showAllElement.style.cursor = 'pointer';
    showAllElement.style.marginLeft = '8px';

    const hideAllElement = document.createElement('span');
    hideAllElement.id = 'enrichment-hide-all';
    hideAllElement.innerText = '[Hide all]';
    hideAllElement.classList.add('hidden');
    hideAllElement.style.cursor = 'pointer';
    hideAllElement.style.marginLeft = '8px';

    showAllElement.addEventListener('click', function (event) {
        event.stopPropagation();
        setAllEnrichmentSectionsExpanded(true);
    });

    hideAllElement.addEventListener('click', function (event) {
        event.stopPropagation();
        setAllEnrichmentSectionsExpanded(false);
    });

    controlsContainer.append(showAllElement, hideAllElement);
    enrichmentCollapsible.insertAdjacentElement('afterend', controlsContainer);
}

document.addEventListener("DOMContentLoaded", onContentLoaded);