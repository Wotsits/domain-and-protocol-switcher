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
    loadDomains({ newProtocol, newDomain });
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
function addNewDomainVariantGroup() {
    const variantGroups = document.querySelectorAll(".variant-group");
    variantGroups.forEach((group, index) => {
        const nameInput = group.querySelector("#nameInput").value.trim();
        const protocolInput = group
            .querySelector("#protocolInput")
            .value.trim();
        const domainInput = group.querySelector("#domainInput").value.trim();
        // test the protocol and domain are valid
        if (protocolInput !== "http" && protocolInput !== "https") {
            alert(
                `Please enter a valid protocol (http or https) in variant ${
                    index + 1
                }`
            );
            return;
        }
        if (!domainInput) {
            alert(`Please enter a valid domain in variant ${index + 1}`);
            return;
        }
        if (domainInput.includes("://")) {
            alert(
                `Please enter a valid domain without protocol in variant ${
                    index + 1
                }`
            );
            return;
        }
        if (domainInput.includes("/")) {
            alert(
                `Please enter a valid domain without path in variant ${
                    index + 1
                }. If you have included a trailing slash, please remove it.`
            );
            return;
        }
        if (!nameInput) {
            alert(
                `Please enter a valid name for the domain in variant ${
                    index + 1
                }`
            );
            return;
        }
    });

    // now that everything is validated, build the object to be put in storage.
    const thisVariantSet = Array.from(variantGroups).map((group) => {
        return {
            name: group.querySelector("#nameInput").value.trim(),
            protocol: group.querySelector("#protocolInput").value.trim(),
            domain: group.querySelector("#domainInput").value.trim(),
        };
    });

    chrome.storage.sync.get({ domains: [] }, function (data) {
        // add the new domain to the list
        var domainsCpy = [...data.domains];
        // if domainsCpy is null or undefined, initialize it as an empty array
        if (!domainsCpy) {
            domainsCpy = [];
        }
        // add the new variant set as a new entry in the domains array
        domainsCpy.push(thisVariantSet);
        // save the updated domains array back to storage
        chrome.storage.sync.set({ domains: domainsCpy }, function () {
            // reload the domain list in the UI
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
 * Parameters: currentDomainOveride (optional) - an object with newProtocol and newDomain to override the current tab's domain
 * Returns: None
 * Side Effects: Updates UI
 * Requires: chrome.storage API
 * Modifies: UI
 * Example: loadDomains()
 * Notes: None
 * Bugs: None
 */
function loadDomains(currentDomainOveride) {
    // clear the current list
    var domainList = document.getElementById("domainList");
    domainList.innerHTML = "";

    chrome.storage.sync.get({ domains: [] }, function (data) {
        // get the domains from storage
        var domains = data.domains;

        if (domains.length === 0) {
            domainList.innerHTML =
                "<li>No domains added. Please add a domain.</li>";
            return;
        }

        // get the current active tab's domain and protocol
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                var tab = tabs[0];
                var url = new URL(tab.url);
                var currentProtocol = url.protocol.replace(":", "");
                var currentDomain = url.hostname;

                if (currentDomainOveride) {
                    currentProtocol = currentDomainOveride.newProtocol;
                    currentDomain = currentDomainOveride.newDomain;
                }

                // get the domain set that contains the current domain
                var currentDomainSet = domains.find((set) =>
                    set.some((item) => {
                        return (
                            item.protocol === currentProtocol &&
                            item.domain === currentDomain
                        );
                    })
                );

                // display the domain set that contains the current domain only.
                if (!currentDomainSet) {
                    domainList.innerHTML =
                        "<li>No domains added. Please add a domain.</li>";
                    // show the add domain button
                    document.getElementById("addDomainButton").style.display =
                        "block";
                    return;
                }

                // if there is a domain set, remove the add domain button
                document.getElementById("addDomainButton").style.display =
                    "none";

                // create list items for each domain in the current domain set
                currentDomainSet.forEach(function (item, index) {
                    // add the item if it is not the current domain
                    if (item.domain !== currentDomain) {
                        var button = document.createElement("button");
                        button.className = "domain-variant-btn btn--neutral";
                        button.textContent = `Switch to ${item.name}`;
                        // set up click event to switch domain
                        button.addEventListener("click", function () {
                            switchDomain(item.protocol, item.domain);
                        });
                        domainList.appendChild(button);
                    }
                });

                // create a delete and edit button for the domain set
                const buttonGroup = document.createElement("div");
                buttonGroup.className = "variant-control-button-group";
                domainList.appendChild(buttonGroup);
                // create delete button
                var deleteButton = document.createElement("button");
                deleteButton.classList.add("btn--negative");
                deleteButton.textContent = "Delete All Domain Variants";
                deleteButton.addEventListener("click", function () {
                    // remove the current domain set from domains
                    domains = domains.filter((set) => set !== currentDomainSet);
                    chrome.storage.sync.set({ domains: domains }, function () {
                        loadDomains();
                    });
                });
                buttonGroup.appendChild(deleteButton);
            }
        );
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
    const variantGroups = document.getElementsByClassName("variant-group");
    while (variantGroups.length > 1) {
        variantGroups[variantGroups.length - 1].remove();
    }
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
    // pre-fill the first variant group with the current tab's domain and protocol
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url);
        document.getElementById("protocolInput").value = url.protocol.replace(
            ":",
            ""
        );
        document.getElementById("domainInput").value = url.hostname;
        document.getElementById("nameInput").value = "";
    });
}

/*
 * Function to add a new variant input group to the add domain form
 * Parameters: None
 * Returns: None
 * Side Effects: Updates UI
 * Requires: None
 * Modifies: UI
 * Example: addVariant()
 * Notes: None
 * Bugs: None
 */
function addVariant() {
    const variantGroupContainer = document.getElementById(
        "variant-group-container"
    );
    const variantGroup = document.createElement("div");
    variantGroup.className = "variant-group";
    variantGroup.innerHTML = `
        <hr/>
        <input
            type="text"
            id="nameInput"
            name="name"
            placeholder="Domain Name (e.g., My Site)"
            required
            maxlength="30"
        />
        <div class="variant-url-group">
            <input
                type="text"
                id="protocolInput"
                name="protocol"
                placeholder="http or https"
                required
            />
            <span>://</span>
            <input
                type="text"
                id="domainInput"
                name="domain"
                placeholder="domain (e.g. www.example.com)"
                required
            />
        </div>
    `;
    variantGroupContainer.appendChild(variantGroup);
}

async function resetAllData() {
    await chrome.storage.sync.set({ domains: [] }, function () {
        console.log("All domain data has been reset.");
    });
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
        .addEventListener("click", addNewDomainVariantGroup);
    document
        .getElementById("cancelButton")
        .addEventListener("click", cancelAddDomain);
    document
        .getElementById("addVariantButton")
        .addEventListener("click", addVariant);
    document
        .getElementById("resetDataButton")
        .addEventListener("click", function () {
            resetAllData();
            loadDomains();
        });
});
