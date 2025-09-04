/*
 * Domain and Protocol Switcher Chrome Extension
 */

/*
 * This script handles the logic for switching domains and protocols,
 * as well as adding, deleting, and displaying saved domains.
 * It interacts with the popup.html and uses Chrome's storage API.
 * Author: Simon Sexton
 * Date: 2024-06-20
 * Version: 1.0
 * License: MIT
 */

/*
 * Function to switch the current tab's domain and protocol
 * Parameters:
 *  newProtocol: The new protocol to switch to (e.g., "http" or "https")
 *  newDomain: The new domain to switch to (e.g., "example.com")
 * Returns: None
 * Side Effects: Updates the current tab's URL
 * Requires: chrome.tabs API
 * Modifies: Current tab's URL
 * Example: switchDomain("https", "example.com")
 * Notes: None
 * Bugs: None
 */
function switchDomain(newProtocol, newDomain) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url);
        url.protocol = newProtocol + ":";
        url.hostname = newDomain;
        chrome.tabs.update(tab.id, { url: url.toString() });
    });
}

/*
 * Function to add a new domain to the saved list
 * Parameters: None
 * Returns: None
 * Side Effects: Updates Chrome storage and UI
 * Requires: chrome.storage API
 * Modifies: Chrome storage and UI
 * Example: addNewDomain()
 * Notes: Validates input before adding
 * Bugs: None
 */
function addNewDomain() {
    // store the new domain in chrome storage
    var newName = document.getElementById("nameInput").value;
    var newDomain = document.getElementById("domainInput").value;
    var newProtocol = document.getElementById("protocolInput").value;
    // test the protocol and domain are valid
    if (newProtocol !== "http" && newProtocol !== "https") {
        alert("Please enter a valid protocol (http or https)");
        return;
    }
    if (!newDomain) {
        alert("Please enter a valid domain");
        return;
    }
    if (newDomain.includes("://")) {
        alert("Please enter a valid domain without protocol");
        return;
    }
    if (newDomain.includes("/")) {
        alert("Please enter a valid domain without path");
        return;
    }

    chrome.storage.sync.get({ domains: [] }, function (data) {
        // add the new domain to the list
        var domains = data.domains;
        domains.push({
            name: newName,
            protocol: newProtocol,
            domain: newDomain,
        });
        chrome.storage.sync.set({ domains: domains }, function () {
            loadDomains();
            // clear the input fields
            document.getElementById("nameInput").value = "";
            document.getElementById("domainInput").value = "";
            document.getElementById("protocolInput").value = "https";
            // hide the domainForm
            document.getElementById("domainForm").style.display = "none";
        });
    });
}

/*
 * Function to load and display saved domains from Chrome storage
 * Parameters: None
 * Returns: None
 * Side Effects: Updates UI
 * Requires: chrome.storage API
 * Modifies: UI
 * Example: loadDomains()
 * Notes: None
 * Bugs: None
 */
function loadDomains() {
    chrome.storage.sync.get({ domains: [] }, function (data) {
        // get the domains and display them
        var domains = data.domains;
        var domainList = document.getElementById("domainList");
        domainList.innerHTML = "";
        domains.forEach(function (item, index) {
            var li = document.createElement("li");
            li.className = "domain-item";
            var button = document.createElement("button");
            button.textContent = item.name;
            // set up click event to switch domain
            button.addEventListener("click", function () {
                switchDomain(item.protocol, item.domain);
            });
            // add delete button
            var deleteButton = document.createElement("button");
            deleteButton.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>';
            deleteButton.style.marginLeft = "10px";
            // set up click event to delete domain
            deleteButton.addEventListener("click", function () {
                domains.splice(index, 1);
                chrome.storage.sync.set({ domains: domains }, function () {
                    loadDomains();
                });
            });
            li.appendChild(button);
            li.appendChild(deleteButton);
            domainList.appendChild(li);
        });
        if (domains.length === 0) {
            domainList.innerHTML =
                "<li>No domains added. Please add a domain.</li>";
        }
    });
}

/*
 * Function to cancel adding a new domain
 * Parameters: None
 * Returns: None
 * Side Effects: Hides the add domain form and clears input fields
 * Requires: None
 * Modifies: UI
 * Example: cancelAddDomain()
 * Notes: None
 * Bugs: None
 */
function cancelAddDomain() {
    // hide form and reset input fields
    document.getElementById("domainForm").style.display = "none";
    document.getElementById("domainInput").value = "";
    document.getElementById("protocolInput").value = "https";
}

/*
 * Function to show the add domain form
 * Parameters: None
 * Returns: None
 * Side Effects: Displays the add domain form
 * Requires: None
 * Modifies: UI
 * Example: showAddDomainForm()
 * Notes: None
 * Bugs: None
 */
function showAddDomainForm() {
    // show the form
    document.getElementById("domainForm").style.display = "block";
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    // load saved domains
    loadDomains();
    // set up button event listeners
    document
        .getElementById("addDomainButton")
        .addEventListener("click", showAddDomainForm);
    document
        .getElementById("saveDomainButton")
        .addEventListener("click", addNewDomain);
    document
        .getElementById("cancelButton")
        .addEventListener("click", cancelAddDomain);
});
