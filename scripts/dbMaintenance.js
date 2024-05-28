function createDropDown() {
    createComboBox(document.getElementById("company1"));
}

let customerTableData = ipc.sendSync("get-customer-names");
let customerChosen = false;
let focused = false;
let currentFocused;
let pastFocused;
let nextFocused;
let itemIndex;
let usingListBox = false;
let message;
let currentUser;
let mergedActive = false;

ipc.on("user-data", (event, args) => {
    currentUser = args;
    console.log(currentUser);
});

let fillListBox2 = (box, editL, listType) => {
    let input = document.getElementById(listType + "-choice");
    let txtSection = document.getElementById(listType + "-choice");
    let button = document.getElementById(listType + "-button");
    let listBox = document.getElementById(listType + "-listBox");
    console.log(editL);
    box.innerHTML = "";
    //console.log(list);
    for (var member in editL) {
        let listItem = document.createElement("div");
        listItem.setAttribute("class", "listItem");
        listItem.setAttribute("data-selected", false);
        listItem.setAttribute("data-name", editL[member].customer_name);
        listItem.tabIndex = -1;
        let text;

        //list = ipc.sendSync("get-customer-names");
        // editL.sort((a, b) =>
        //     a.customer_name > b.customer_name ? 1 : -1
        // );

        listItem.setAttribute("id", `listItem${editL[member].customer_ID}`);
        text = document.createTextNode(
            `${editL[member].customer_name} -(${editL[member].customer_ID})`
        );

        $(listItem).on({
            keydown: (event) => {
                console.log("keydown fired on listItem");
                event.preventDefault();
                let index = Number(
                    listItem.parentNode.previousElementSibling.lastChild.firstChild.getAttribute(
                        "tabindex"
                    )
                );
                let filteredList = $(
                    "#" + listType + "-listBox .listItem:visible"
                );
                switch (event.key) {
                    // case 'Tab':
                    //     fillContactsNew(ipc.sendSync('get-contacts',listItem.id.substring(8)))
                    //     closeDropDowns()

                    // break;
                    case "ArrowDown":
                        console.log("hello");
                        navigateListBox(event, box, filteredList, itemIndex);
                        break;
                    case "ArrowUp":
                        navigateListBox(event, box, filteredList, itemIndex);
                        break;
                    case "Enter":
                    case "Tab":
                        if (listType == "Customer") {
                            let props = {};
                            props.contacts = ipc.sendSync(
                                "get-contacts",
                                listItem.id.substring(8)
                            );
                            props.customer_ID = listItem.id.substring(8);
                            props.customer_name = listItem.innerText;
                            props.launcher = page;
                            if (
                                callingPage != "contacts" &&
                                callingPage != "reports"
                            ) {
                                fillContactsNew(props);
                            }

                            if (
                                props.contacts.primary_contact &&
                                callingPage != "reports"
                            ) {
                                alert("tab is where");
                                let txtField =
                                    document.querySelector("#Contacts-choice");
                                let nameBox =
                                    document.querySelector("#Contacts-info");
                                let primaryItem = $(
                                    `#${props.contacts.primary_contact}`
                                )
                                    .parent()
                                    .next();
                                let primaryName = $(
                                    `#${props.contacts.primary_contact}`
                                )
                                    .prev()
                                    .text();
                                console.log(primaryName, primaryItem.text());

                                //simulate chosing an option
                                nameBox.innerText = primaryName;
                                txtField.innerText = primaryItem.text();
                                primaryItem.addClass("focusedListItem");
                                txtField.setAttribute(
                                    "method-id",
                                    primaryItem.attr("method-id")
                                );
                                txtField.setAttribute(
                                    "method",
                                    primaryItem.attr("method")
                                );
                            }

                            if (
                                callingPage != "contacts" &&
                                callingPage != "reports"
                            ) {
                                navigateTabs("down", index);
                            }
                        }

                        chooseListItem(
                            event,
                            input,
                            txtSection,
                            event.target,
                            box
                        );

                        break;
                }
            },
            mousedown: (event) => {
                console.log("mousedown fired on listItem", listType);
                let index = Number(
                    document
                        .getElementById(`${listType}-choice`)
                        .getAttribute("tabindex")
                );

                button.firstChild.classList.remove("up");
                button.firstChild.classList.add("down");
                let props = {};

                props.contacts = ipc.sendSync(
                    "get-contacts",
                    listItem.id.substring(8)
                );
                props.customer_ID = listItem.id.substring(8);
                props.customer_name = listItem.innerText;
                //props.launcher = page;
                //console.log(props);
                //console.log(callingPage);
                // if (callingPage != "contacts" && callingPage != "reports") {
                //     fillContactsNew(props);
                // }

                currentFocusedItem = event.target;
                // if (
                //     props.contacts.primary_contact &&
                //     callingPage != "contacts" &&
                //     callingPage != "reports"
                // ) {
                //     let txtField = document.querySelector("#Contacts-choice");
                //     let nameBox = document.querySelector("#Contacts-info");
                //     let primaryItem = $(`#${props.contacts.primary_contact}`)
                //         .parent()
                //         .next();
                //     let primaryName = $(`#${props.contacts.primary_contact}`)
                //         .prev()
                //         .text();
                //     console.log(primaryName, primaryItem.text());

                //     //simulate chosing an option
                //     nameBox.innerText = primaryName;
                //     txtField.innerText = primaryItem.text();
                //     primaryItem.addClass("focusedListItem");
                //     txtField.setAttribute(
                //         "method-id",
                //         primaryItem.attr("method-id")
                //     );
                //     txtField.setAttribute("method", primaryItem.attr("method"));
                // }

                chooseListItem(event, input, txtSection, event.target, box);
                setTimeout(() => {
                    // if (callingPage != "contacts" && callingPage != "reports") {
                    //     navigateTabs("down", index);
                    // }
                }, 75);
            },
        });

        listItem.appendChild(text);

        box.appendChild(listItem);
    }
};
let createComboBox = (container, listType) => {
    let arrElementsCustomerNames;
    //container.setAttribute("data-type", componentType);
    //create compnents

    let wrapper = document.createElement("div");
    wrapper.setAttribute("class", "inputAndLabelWrapper");

    let label = document.createElement("label");
    let txtLabel;
    switch (listType) {
        case "Customer1":
            txtLabel = document.createTextNode(`Customer 1`);
            break;
        case "Customer2":
            txtLabel = document.createTextNode(`Customer 2`);
            break;
        case "deleteCustomer":
            txtLabel = document.createTextNode(`Customer To Delete`);
            break;
        default:
            txtLabel = document.createTextNode(`Customer`);
            break;
    }

    label.setAttribute("class", "label");
    label.appendChild(txtLabel);

    let input = document.createElement("div");
    input.setAttribute("id", listType);
    input.setAttribute("class", "comboBox fullRound");

    let txtSection = document.createElement("div");
    txtSection.setAttribute("id", listType + "-choice");

    txtSection.setAttribute("class", "choice leftHalfRound");

    txtSection.setAttribute("contenteditable", true);
    txtSection.setAttribute("part", "text");

    //txtSection.tabIndex = getTabIndex(listType, page);
    let filteredList;
    $(txtSection).on({
        focus: (event) => {
            let thisListBox = document.getElementById(`${listType}-listBox`);
            console.log(thisListBox);

            event.stopPropagation();
            console.log(
                "focus fired in createcombobox() for " + listType + "list type"
            );
            //setting focused to true to stop closeDropDowns() from firing twice when called
            //on the click
            focused = true;
            console.log(mergedActive);
            if (mergedActive) {
                resetMerged();
                mergedActive = false;
            }
            console.log(mergedActive);
            //close all open dropdowns
            closeDropDowns();

            //toggle between open and closed styling on focused element
            toggleDropDowns("Customer txtSection focus", listBox, arrow);

            //fl = "";

            keyPressed = "";
            if (listType == "Customer") {
                if (
                    document.getElementById(`Customer-choice`).innerHTML != ""
                ) {
                    fl = "";
                    list = ipc.sendSync("get-customer-names");

                    console.log(
                        Array.from($("#Customer-listBox div")).map(
                            (element) => element.innerText
                        )
                    );

                    //fillListBox2(thisListBox);
                    // filterListBox(
                    //     txtSection,
                    //     Array.from($("#Customer-listBox div"))
                    // );
                    if (isExactMatch(txtSection.innerHTML, Array.from(fl))) {
                        //fl = "";
                    }
                } else {
                    //list = ipc.sendSync("get-customer-names");

                    //fillListBox2(thisListBox);
                    console.time("customername");
                    console.log(
                        Array.from($("#Customer-listBox div")).map(
                            (element) => element.innerText
                        )
                    );
                    // filterListBox(
                    //     txtSection,
                    //     Array.from($("#Customer-listBox div"))
                    // );
                    console.timeEnd("customername");
                    //fl = "";
                }
                if (callingPage == "edit") {
                    filterListBox(
                        txtSection,
                        Array.from($("#Customer-listBox div"), listBox)
                    );
                }
            }
        },

        mousedown: (event) => {
            //console.log(callingPage);
            console.log("mousedown fired in createcombobox()");
            console.log(document.activeElement.id);
            if (document.activeElement.id == "mergeSubmit") {
                event.target.focus();
            }
            if (focused) {
                console.log("focused");
                toggleDropDowns(
                    "Customer txtSection mousedown",
                    listBox,
                    arrow
                );
            }
        },
        dblclick: (event) => {
            console.log("dblclick fired in createcombobox()");
            event.target.innerHTML = "";
            $(txtSection).focus();
            resetListBox(listType);
            customerChosen = false;
            //resetContacts();
            event.target.removeAttribute("data-cid");
        },
        blur: (event) => {
            focused = false;
            console.log("blur fired in createcombobox()");
            if (!usingListBox) {
                closeDropDowns();
            }

            // safeguard to check if the name entered in the field matches an existing company or when leaving
            // the field without selecting the item that matches what you typed
            // if NO MATCH - it fills contacts with default
            // if MATCH - it simulates clicking the matching item in the list

            fl = $("#Customer-listBox div:visible");
            let matched = 0;
            let exactMatch = isExactMatch(txtSection.innerHTML, Array.from(fl));
            console.log(exactMatch, fl.length, customerChosen);
            let id;
            if (
                fl?.length > 0 &&
                !customerChosen &&
                keyPressed !== "ArrowDown" &&
                keyPressed !== "ArrowUp" &&
                keyPressed != "Meta" &&
                !exactMatch
            ) {
                let names = Array.from(fl);
                let arrNames = names.map((a) => a.innerText);

                let arrButtons = [
                    "Cancel",
                    event.target.innerText,
                    ...arrNames,
                ];

                const options = {
                    type: "question",
                    buttons: arrButtons, //['Cancel', 'Yes, please', 'No, thanks'],
                    defaultId: 1,
                    title: "Choose customer name",
                    message: "Choose Customer",
                    detail: "There are partial matches. Choose customer name from list.",
                };
                let answer = ipc.sendSync("open-dialog", options);
                let company = arrButtons[answer];
                if (company == "Cancel") {
                    $("#Customer-choice").text("");
                    resetListBox(listType);
                    //setTimeout(() => {
                    //    $('#Customer-choice').dblclick()
                    //}, 300);

                    return;
                } else {
                    event.target.innerText = company;
                }
            }

            let customer_text = removeSpecialCharacters(txtSection.innerText);
            for (let name in customerTableData) {
                if (customerTableData[name].customer_name == customer_text) {
                    matched += 1;
                    id = customerTableData[name].customer_ID;
                }
            }

            // if (
            //     customer_text != "" &&
            //     matched == 0 &&
            //     callingPage != "contacts" &&
            //     callingPage != "reports"
            // ) {
            //     fillContactsNew(null);
            // } else {
            //     //$(`#listItem${id}`).mousedown();
            //     //$(`#listItem${id}`).mousedown()
            // }
        },
        mouseup: (event) => {
            console.log("mouseup fired in createcombobox()");
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        },
        keydown: (event) => {
            console.log("keydown fired in createcombobox()");
            //set key to stop blur from opening popup to choose between matching companies
            //when hitting the arrow down to enter the listbox
            keyPressed = event.key;

            // if event.preventDefault() is uncommented
            // then remove the +1 and -1 in the navigateTabs() call
            // in the tab event handler

            //event.preventDefault()
            let focusedIndex;
            let pastIndex;
            let nextIndex;

            let ti = Number(event.target.getAttribute("tabindex"));
            let e = $("#" + listType + "-listBox .listItem:visible");
            switch (event.key) {
                case "Tab":
                    if (event.key == "Tab" && event.shiftKey) {
                        navigateTabs("up", ti + 1);

                        break;
                    }
                    navigateTabs("down", ti - 1);

                    break;
                case "ArrowDown":
                    event.preventDefault();

                    focusedIndex = 0;
                    pastIndex = e.length - 1;
                    nextIndex = 1;
                    for (i = 0; i < e.length; i++) {
                        if (e[i].classList.contains("focusedListItem")) {
                            e[i].classList.remove("focusedListItem");
                            if (i == e.length - 1) {
                                focusedIndex = 0;
                                pastIndex = e.length - 1;
                                nextIndex = 1;
                                itemIndex = 0;
                            } else {
                                focusedIndex = i + 1;
                                pastIndex = i;
                                nextIndex = i + 2;
                                itemIndex = i + 1;
                            }
                        }
                    }
                    usingListBox = true;

                    e[focusedIndex].focus();
                    e[focusedIndex].classList.add("focusedListItem");

                    pastFocusedItem = e[pastIndex];
                    currentFocusedItem = e[focusedIndex];
                    nextFocusedItem = e[nextIndex];
                    console.log(
                        pastFocusedItem,
                        currentFocusedItem,
                        nextFocusedItem
                    );
                    console.log(pastIndex, focusedIndex, nextIndex);
                    break;
                case "ArrowUp":
                    usingListBox = true;
                    focusedIndex = e.length - 1;
                    pastIndex = 0;
                    nextIndex = e.length - 2;
                    for (i = 0; i < e.length; i++) {
                        if (e[i].classList.contains("focusedListItem")) {
                            if (i !== 0) {
                                focusedIndex = i - 1;
                                pastIndex = i;
                                nextIndex = i - 2;
                                itemIndex = i - 1;
                            }

                            e[i].classList.remove("focusedListItem");
                        }
                    }
                    e[focusedIndex].focus();
                    e[focusedIndex].classList.add("focusedListItem");
                    currentFocusedItem = e[focusedIndex];
                    pastFocusedItem = e[pastIndex];
                    nextFocusedItem = e[nextIndex];
                    break;
                default:
                    if (listType == "Designation") {
                    }
                    break;
            }
        },

        keyup: (event) => {
            console.log("keyup fired in createcombobox()");
            let ti = Number(event.target.getAttribute("tabindex"));
            let radios;

            console.log("keyup");
            console.log(txtSection.innerText);
            customerChosen = false;
            if (
                document
                    .querySelector(`#${listType}-listBox`)
                    .getAttribute("data-state") == "closed"
            ) {
                toggleDropDowns("Customer txtSection focus", listBox, arrow);
            }
            if ($("#Customer-MessageContainer")) {
                $("#Customer-MessageContainer").remove();
            }
            let m = filterListBox2(txtSection, customerTableData);
            document.getElementById(`${listType}-listBox`).innerHTML = "";
            console.log("right before fillListBox2 in keyup fro customer");
            fillListBox2(listBox, m, listType);
            fl = $(`#${listType}-listBox div:visible`);

            console.log("fl length = " + fl.length);
            //if there are no matches then its a new company
            if (
                fl.length == 0 &&
                callingPage != "contacts" &&
                callingPage != "reports"
            ) {
                console.log("new comp");
                fillContactsNew(null);
            }
            if (fl.length == 1 && event.key == "Tab") {
                console.log(fl);
            }
            if (txtSection.innerHTML == "") {
                if ($("#Customer-MessageContainer")) {
                    $("#Customer-MessageContainer").remove();
                }
                txtSection.removeAttribute("data-cid");
                //document.getElementById("Contacts-listBox").innerHTML = "";
                resetListBox(listType);
                //resetContacts();

                //Array.from(document.querySelectorAll('#Customer-listBox .listItem'))
            }

            // if a customer was previously chosen a data-cid attr is assigned
            // and if the typed name is also not an exact match to an existing company
            if (
                txtSection.getAttribute("data-cid") &&
                !isExactMatch(txtSection.innerHTML, Array.from(fl))
            ) {
                if ($("#Customer-MessageContainer")) {
                    $("#Customer-MessageContainer").remove();
                }
                txtSection.removeAttribute("data-cid");
                //document.getElementById("Contacts-listBox").innerHTML = "";
                resetListBox(listType);
                //resetContacts()
            } else {
            }

            filteredList = Array.from($("#Customer-listBox div:visible"));
        },
        input: (event) => {
            console.log("input fired in createcombobox()");
            event.target.innerText = event.target.innerText.toLocaleUpperCase();
            if (event.target.hasChildNodes()) {
                let inputRange = document.createRange();
                let windowSelection = window.getSelection();
                //remove any previously created ranges
                windowSelection.removeAllRanges();
                let theNodes = event.target.childNodes;

                let firstNode = theNodes[0];
                let lastNode = theNodes[theNodes.length - 1];
                let start = theNodes[0];
                let end = theNodes[theNodes.length - 1];
                //console.log('Start is ' + start.nodeName + ' end is ' + end.nodeName + " node count " + theNodes.length);
                inputRange.setStartBefore(firstNode);
                inputRange.setEndAfter(lastNode);
                inputRange.collapse(false);
                //add the range to a window selection object.
                windowSelection.addRange(inputRange);
                windowSelection.collapseToEnd();
            }
        },
    });

    //underlying autocomplete box
    let autoComplete = document.createElement("span");
    autoComplete.setAttribute("id", `${listType}-autoComplete`);
    autoComplete.setAttribute("class", "choiceAutoComplete");
    let button = document.createElement("div");
    //button.setAttribute('id','btn-'+listType)
    let arrow = document.createElement("div");
    arrow.setAttribute("class", "arrow down");
    $(arrow).on({
        click: (event) => {
            event.stopImmediatePropagation();
            toggleDropDowns(null, listBox, arrow);
        },
    });
    button.setAttribute("id", listType + "-button");
    button.setAttribute("class", "arrowBox");
    button.setAttribute("data-part", "button");
    $(button).on({
        click: (event) => {
            state = listBox.getAttribute("data-state");
            console.log("combo box clicked -> click state" + state);
            //txtSection.focus()
            //     usingListBox = true
            if (state == "closed") {
                closeDropDowns();

                listBox.style.animationDuration = "300ms";
                listBox.style.transform = "scaleY(1)";
                arrow.classList.remove("down");
                arrow.classList.add("up");

                listBox.setAttribute("data-state", "open");
                txtSection.focus();
                usingListBox = true;
            } else if (state == "open") {
                listBox.style.animationDuration = "300ms";
                listBox.style.transform = "scaleY(0)";

                arrow.classList.remove("up");
                arrow.classList.add("down");

                listBox.setAttribute("data-state", "closed");
            }
        },
    });

    let listBox = document.createElement("div");

    listBox.setAttribute("id", listType + "-listBox");

    listBox.setAttribute("class", "listBox");

    listBox.setAttribute("data-state", "closed");

    //append components

    input.appendChild(txtSection);
    button.appendChild(arrow);
    input.appendChild(button);
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    container.appendChild(wrapper);
    container.appendChild(listBox);

    //populate dropdown

    fillListBox2(listBox, customSort("", customerTableData), listType);
};

let validateMerge = () => {
    let messageBox = document.getElementById("mergeMessage");
    let cust1 = document.getElementById("Customer1-choice");
    let cust2 = document.getElementById("Customer2-choice");
    let c1 = cust1.getAttribute("data-cid");
    let c2 = cust2.getAttribute("data-cid");

    if (cust1.innerHTML == "" || cust2.innerHTML == "") {
        if (messageBox.classList.contains("success")) {
            messageBox.classList.remove("success");
        }
        messageBox.classList.add("error");
        messageBox.innerText = "Choose both customers.";
        if (cust1.innerHTML == "") {
            if (c1 != null) {
                cust1.removeAttribute("data-cid");
            }
        }
        if (cust2.innerHTML == "") {
            if (c2 != null) {
                cust2.removeAttribute("data-cid");
            }
        }

        return false;
    }
    if (c1 == null || c2 == null) {
        if (messageBox.classList.contains("success")) {
            messageBox.classList.remove("success");
        }
        messageBox.classList.add("error");
        messageBox.innerText = "Choose both customers.";

        return false;
    }
    if (cust1.innerHTML == cust2.innerHTML) {
        if (messageBox.classList.contains("success")) {
            messageBox.classList.remove("success");
        }
        messageBox.classList.add("error");
        messageBox.innerText = "Choose 2 separate customers.";

        return false;
    }

    return true;
};
//function to reset merged form in order to merge another customer. It is triggered
// when clicking to use a dropdown and mergedActive is true. mergedActive is true
//when the merge button has been clicked, success message is showing, and view contacts is displayed
let resetMerged = () => {
    console.log("resetMerged() called and mergedActive = " + mergedActive);
    document.getElementById("Customer1-choice").innerText = "";
    document.getElementById("Customer2-choice").innerText = "";
    document.getElementById("mergeMessage").innerHTML = "";
    document
        .getElementById("mergeButtonContainer")
        .removeChild(document.getElementById("contactLink"));
    document.getElementById("Customer1-choice").removeAttribute("data-cid");
    document.getElementById("Customer2-choice").removeAttribute("data-cid");
    //refillListBoxes();
};

let refillListBoxes = () => {
    customerTableData = customSort("", ipc.sendSync("get-customer-names"));
    //console.log(c);
    let lb1 = document.getElementById("Customer1-listBox");
    let lb2 = document.getElementById("Customer2-listBox");
    lb1.innerHTML = "";
    lb2.innerHTML = "";
    fillListBox2(lb1, customerTableData, "Customer1");
    fillListBox2(lb2, customerTableData, "Customer2");

    document.getElementById("Customer1-choice").innerText = "";
    document.getElementById("Customer2-choice").innerText = "";

    console.log("refillListBoxes() called and mergedActive = " + mergedActive);
};

let closeDropDowns = () => {
    let lb = document.getElementsByClassName("listBox");
    let listBoxes = Array.from(lb);
    listBoxes.forEach((item) => {
        if (item.getAttribute("data-state") == "open") {
            let type = item.getAttribute("id").split("-");

            toggleDropDowns(
                "l",
                item,
                document.getElementById(`${type[0]}-button`).firstChild
            );

            item.setAttribute("data-state", "closed");
        }
    });
};

let toggleDropDowns = (state, dropDown, arrow) => {
    state = dropDown.getAttribute("data-state");

    if (state == "closed") {
        closeDropDowns();
        dropDown.style.animationDuration = "300ms";
        dropDown.style.transform = "scaleY(1)";
        dropDown.setAttribute("data-state", "open");
        arrow.classList.remove("down");
        arrow.classList.add("up");
        //usingListBox = true
        //dropDown.setAttribute('state','open')
    }
    if (state == "open") {
        dropDown.style.animationDuration = "300ms";
        dropDown.style.transform = "scaleY(0)";
        dropDown.setAttribute("data-state", "closed");
        arrow.classList.remove("up");
        arrow.classList.add("down");
        //usingListBox = false
        //dropDown.setAttribute('state','closed')
    }
};

let navigateListBox = (event, listBox, list, ii) => {
    if (event.key == "ArrowDown") {
        event.preventDefault();

        /***
         *  if its not the last item in the list increment index by one
         *  if it is the last reset index to 0
         */

        if (itemIndex < list.length - 1) {
            if (event.target.id == "addNewContact") {
                itemIndex = 1;
            } else {
                itemIndex++;
            }
        } else {
            itemIndex = 0;
        }

        currentFocusedItem = list[itemIndex];

        if (itemIndex == 0) {
            pastFocusedItem = list[list.length - 1];
        } else {
            pastFocusedItem = list[itemIndex - 1];
        }

        if (itemIndex == list.length - 1) {
            nextFocusedItem = list[0];
        } else {
            nextFocusedItem = list[itemIndex + 1];
        }

        currentFocusedItem.focus();

        currentFocusedItem.classList.add("focusedListItem");
        pastFocusedItem.classList.remove("focusedListItem");
    }
    if (event.key == "ArrowUp") {
        event.preventDefault();

        if (itemIndex < 1) {
            itemIndex = list.length - 1;
        } else {
            itemIndex--;
        }

        if (itemIndex == list.length - 1) {
            pastFocusedItem = list[0];
        } else {
            pastFocusedItem = list[itemIndex + 1];
        }

        if (itemIndex == 0) {
            nextFocusedItem = list[list.length - 1];
        } else {
            nextFocusedItem = list[itemIndex - 1];
        }

        currentFocusedItem = list[itemIndex];

        currentFocusedItem.focus();
        currentFocusedItem.classList.add("focusedListItem");
        pastFocusedItem.classList.remove("focusedListItem");
    }
};

let removeSpecialCharacters = (item) => {
    let elem = document.createElement("textarea");
    elem.innerHTML = item.trim().toUpperCase();
    return elem.value;
};

let isExactMatch = (text, list) => {
    let val = removeSpecialCharacters(text);
    let is = false;
    //loop through list items
    console.log(val);
    for (let option of list) {
        if (option.innerText.toUpperCase() === val.toUpperCase()) {
            is = true;
            break;
        } else {
            is = false;
        }
    }
    return is;
};

let chooseListItem = (event, input, txtSection, chosen, listBox) => {
    usingListBox = false;
    contactChosen = true;
    console.log("company ID is " + chosen.id.substring(8));
    let type = input.getAttribute("id").split("-");

    clearSelected(type[0]);
    if (event.type == "keyup") {
        chosen.classList.add("focusedListItem");
        chosen.setAttribute("data-selected", true);
        currentFocusedItem = chosen;

        txtSection.innerHTML = chosen.innerHTML;
    } else {
        event.target.classList.add("focusedListItem");
        currentFocusedItem = event.target;
        event.target.setAttribute("data-selected", true);
        txtSection.innerHTML = event.target.innerHTML;
    }
    let arrVisibleItems = Array.from(
        $(`#${type[0]}-listBox .listItem:visible`)
    );

    let cid = chosen.getAttribute("id").substring(8);
    customerChosen = true;
    txtSection.setAttribute("data-cid", cid);
    txtSection.setAttribute("data-name", chosen.getAttribute("data-name"));

    listBox.style.animationDuration = "100ms";
    listBox.style.transform = "scaleY(0)";

    listBox.setAttribute("data-state", "closed");
};

let clearSelected = (type) => {
    let filteredListItems;
    if (type == "Contacts") {
        filteredListItems = $("#" + type + "-listBox .option");
    } else {
        filteredListItems = $("#" + type + "-listBox .listItem");
    }

    for (let el in filteredListItems) {
        if (isDOM(filteredListItems[el])) {
            filteredListItems[el].classList.remove("focusedListItem");
        }
    }
};

let isDOM = (Obj) => {
    // Function that checks whether
    // object is of type Element
    return Obj instanceof Element;
};

let filterListBox2 = (el, arrCu) => {
    let val = el.innerText.toUpperCase().replace(/\u00a0/g, " ");
    console.log(arrCu.filter((element) => element.customer_name.includes(val)));
    return customSort(
        val,
        arrCu.filter((element) => element.customer_name.includes(val))
    );
};

window.onload = () => {
    createComboBox(document.getElementById("merge1"), "Customer1");
    createComboBox(document.getElementById("merge2"), "Customer2");
    createComboBox(document.getElementById("delete1"), "deleteCustomer");
};

//event handler to close dropdowns if clicked out side of button or listbox components
document.addEventListener("click", (e) => {
    e.stopPropagation();
    if (
        !e.target.className.includes("listItem") &&
        !e.target.className.includes("choice") &&
        !e.target.className.includes("arrowBox") &&
        !e.target.className.includes("arrow")
    ) {
        closeDropDowns();
    }
});
let find = () => {
    console.log(ipc.sendSync("findThem"));
};
let merge = () => {
    let messageSuccess;
    let messageBox = document.getElementById("mergeMessage");
    let buttonContainer = document.getElementById("mergeButtonContainer");
    let cust1 = document.getElementById("Customer1-choice");
    let cust2 = document.getElementById("Customer2-choice");
    let c1 = cust1.getAttribute("data-cid");
    let c2 = cust2.getAttribute("data-cid");
    //console.log(c1.getAttribute("data-cid"), c2.getAttribute("data-cid"));
    // if (c1 == null || c2 == null) {
    //     messageBox.innerText = "Choose both customers.";
    //     mergedActive = false;
    //     return;
    // }
    // if (cust1.innerHTML == cust2.innerHTML) {
    //     messageBox.innerText = "Choose 2 separate customers.";
    //     mergedActive = false;
    //     return;
    // }
    if (!validateMerge()) {
        mergedActive = false;
        return;
    }
    let arrButtons;
    const options = {
        type: "question",
        buttons: ["Cancel", "Yes, please", "No, thanks"],
        defaultId: 1,
        title: "Confirmation",
        message: "Are you sure you want to merge?",
        detail: "Merge cannot be undone",
    };
    let answer = ipc.sendSync("open-dialog", options);
    console.log(answer);
    if (answer == 0) {
        console.log("answer was cancel");
        return;
    }
    switch (answer) {
        case 0:
            mergedActive = false;
            return;
            break;
        case 1:
            console.log("tada");
            break;
        case 2:
            mergedActive = false;
            return;
            break;
        default:
            return;
            break;
    }
    // let confirmed = window.confirm(
    //     "Are you sure you want to merge " +
    //         cust1.innerText +
    //         " and " +
    //         cust2.innerText +
    //         "?"
    // );
    // console.log(document.activeElement);
    // if (!confirmed) {
    //     mergedActive = false;
    //     //resetMerged();
    //     return;
    // }
    messageSuccess = ipc.sendSync("merge", c1, c2, currentUser);
    if (messageSuccess) {
        if (messageBox.classList.contains("error")) {
            messageBox.classList.remove("error");
        }
        messageBox.classList.add("success");
        messageBox.innerText = "Customers successfully merged!";
        let contactLink = document.createElement("span");
        contactLink.setAttribute("class", "contactLink");
        contactLink.setAttribute("id", "contactLink");
        contactLink.addEventListener("click", (event) => {
            let objMergeContacts = new Object();
            objMergeContacts.customer_ID = c1;
            objMergeContacts.isNew = false;
            objMergeContacts.action = "edit";
            objMergeContacts.launcher = "dbm";
            objMergeContacts.user = currentUser;
            objMergeContacts.customer_name = document
                .getElementById("Customer1-choice")
                .getAttribute("data-name");
            console.log(objMergeContacts);
            ipc.send("open-contacts-merge", objMergeContacts);
            messageBox.innerText = "";
            buttonContainer.removeChild(document.getElementById("contactLink"));
        });
        let linkText = document.createTextNode("view contacts");
        contactLink.appendChild(linkText);
        buttonContainer.appendChild(contactLink);

        refillListBoxes();
        mergedActive = true;
    } else {
        messageBox.innerText = "Customer merge failed!";
    }
};

let resetListBox = (lt) => {
    //console.log(box)
    let arrFL = Array.from($("#" + lt + "-listBox .listItem"));
    if (lt != "Contacts") {
        //document.getElementById('Contacts-listBox').innerHTML = ''
        e = $("#" + lt + "-listBox .listItem:visible");
    } else {
        e = $("#" + lt + "-listBox  .option:not(.addNewOption)");
    }

    itemIndex = 0;
    arrFL.forEach((element) => {
        //console.log('l')
        element.classList.remove("focusedListItem");
        element.style.display = "flex";
    });
    if ($("#Customer-MessageContainer")) {
        $("#Customer-MessageContainer").remove();
    }
};
