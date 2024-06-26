let currentFocusedItem;
let pastFocusedItem;
let nextFocusedItem;
let gListType;
let contactChosen = false;
let customerChosen = false;
let glComponentType;
let currentTabIndex;
let glPage;
let fl;

$(".cb").on({
    keydown: (event) => {
        event.stopPropagation;
        let ti = Number(event.target.getAttribute("tabindex"));

        switch (event.key) {
            case "Enter":
                if (event.target.checked) {
                    event.target.checked = false;
                } else {
                    event.target.checked = true;
                }

                break;
            default:
                break;
        }
    },
});

function createComponent(
    container,
    componentType,
    list,
    listType,
    callingPage
) {
    glComponentType = componentType;
    glPage = callingPage;
    let page = callingPage;
    let part = "text";
    let state = "closed";
    let focused = false;
    let keyPressed;
    const focusedElement = document.activeElement;
    let previousFocusedElement;
    let usingListBox = true;
    itemIndex = 0;

    const componentContainer = document.getElementById(container);

    let createComboBox = () => {
        let arrElementsCustomerNames;
        container.setAttribute("data-type", componentType);
        //create compnents

        let wrapper = document.createElement("div");
        wrapper.setAttribute("class", "inputAndLabelWrapper");

        let label = document.createElement("label");
        let txtLabel = document.createTextNode(`${listType}`);
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

        txtSection.tabIndex = getTabIndex(listType, page);
        let filteredList;
        $(txtSection).on({
            focus: (event) => {
                let thisListBox = document.getElementById(
                    `${listType}-listBox`
                );
                console.log(thisListBox);

                event.stopPropagation();
                console.log(
                    "focus fired in createcombobox() for " +
                        listType +
                        "list type"
                );
                //setting focused to true to stop closeDropDowns() from firing twice when called
                //on the click
                focused = true;

                //close all open dropdowns
                closeDropDowns();

                //toggle between open and closed styling on focused element
                toggleDropDowns("Customer txtSection focus", listBox, arrow);

                //fl = "";

                keyPressed = "";
                if (listType == "Customer") {
                    if (
                        document.getElementById(`Customer-choice`).innerHTML !=
                        ""
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
                        if (
                            isExactMatch(txtSection.innerHTML, Array.from(fl))
                        ) {
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
                console.log(callingPage);
                console.log("mousedown fired in createcombobox()");
                if (focused) {
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
                resetContacts();
                event.target.removeAttribute("data-cid");
            },
            blur: (event) => {
                focused = false;
                console.log("blur fired in createcombobox()");
                if (!usingListBox) {
                    closeDropDowns();
                }
                if (listType == "Customer") {
                    // safeguard to check if the name entered in the field matches an existing company or when leaving
                    // the field without selecting the item that matches what you typed
                    // if NO MATCH - it fills contacts with default
                    // if MATCH - it simulates clicking the matching item in the list

                    fl = $("#Customer-listBox div:visible");
                    let matched = 0;
                    let exactMatch = isExactMatch(
                        txtSection.innerHTML,
                        Array.from(fl)
                    );
                    console.log(exactMatch, fl.length, customerChosen);
                    let id;
                    if (
                        txtSection.innerText.length > 0 &&
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
                        let arr2 = [
                            { text: "Group 1", clickId: 1 },
                            { text: "Option 1", clickId: 2 },
                            { text: "Option 2", clickId: 3 },
                            { text: "Group 2", clickId: 4 },
                            { text: "Option 3", clickId: 5 },
                            { text: "Option 4", clickId: 6 },
                            "Cancel",
                        ];

                        const options = {
                            type: "question",
                            buttons: arrButtons, //['Cancel', 'Yes, please', 'No, thanks'],
                            defaultId: 1,
                            title: "Choose customer name",
                            message:
                                "Are you sure you want to create a new customer?",
                            detail: `The customer entered has partial matches. Only choose the (new customer) option if the intended customer isn't in the list.`, //"There are partial matches. Choose customer name from list.",
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

                    let customer_text = removeSpecialCharacters(
                        txtSection.innerText
                    );
                    for (let name in list) {
                        if (list[name].customer_name == customer_text) {
                            matched += 1;
                            id = list[name].customer_ID;
                        }
                    }

                    if (
                        customer_text != "" &&
                        matched == 0 &&
                        callingPage != "contacts" &&
                        callingPage != "reports"
                    ) {
                        fillContactsNew(null);
                    } else {
                        if (page != "edit" && callingPage != "reports") {
                            $(`#listItem${id}`).mousedown();
                        }
                        //$(`#listItem${id}`).mousedown()
                    }
                }
            },
            mouseup: (event) => {
                console.log("mouseup fired in createcombobox()");
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            },
            keydown: (event) => {
                console.log("keydown fired in createcombobox()", event.key);
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
                        console.log("arrowDoawn");
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
                        console.log(focusedIndex);
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
                if (listType == "Designation") {
                    switch (event.key) {
                        case "s":
                        case "S":
                            console.log("s typed");
                            txtSection.innerHTML = "Scheduled";
                            usingListBox = false;
                            event.preventDefault();
                            radios = document.getElementsByName("ampmSched");
                            for (
                                var i = 0, r = radios, l = r.length;
                                i < l;
                                i++
                            ) {
                                r[i].disabled = false;
                            }
                            document
                                .getElementById("dateSchWrapper")
                                .classList.remove("hiddenInput");
                            document
                                .getElementById("dateSchWrapper")
                                .classList.add("visibleInput");
                            $("#radAM").focus();
                            navigateTabs("down", ti);
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                document.getElementById("Designation1"),
                                listBox
                            );
                            break;
                        case "o":
                        case "O":
                            txtSection.innerHTML = "On the Lot";
                            event.preventDefault();
                            navigateTabs("down", ti);
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                document.getElementById("Designation0"),
                                listBox
                            );
                            document
                                .getElementById("dateSchWrapper")
                                .classList.add("hiddenInput");
                            document
                                .getElementById("dateSchWrapper")
                                .classList.remove("visibleInput");
                            break;
                        case "c":
                        case "C":
                            console.log("c typed");
                            txtSection.innerHTML = "Coming - No Appt";
                            usingListBox = false;
                            event.preventDefault();
                            radios = document.getElementsByName("ampmSched");
                            for (
                                var i = 0, r = radios, l = r.length;
                                i < l;
                                i++
                            ) {
                                r[i].disabled = true;
                            }
                            document
                                .getElementById("dateSchWrapper")
                                .classList.remove("hiddenInput");
                            document
                                .getElementById("dateSchWrapper")
                                .classList.add("visibleInput");
                            $("#DateSched-choice").focus();
                            document.querySelector(
                                "#DateSched-wrapper > label"
                            ).innerHTML = "Drop Off Date";
                            navigateTabs("down", ti);
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                document.getElementById("Designation2"),
                                listBox
                            );
                            break;
                        default:
                            //only allow s and o
                            let t = txtSection.innerText;
                            if (
                                t != "Scheduled" &&
                                t != "On the Lot" &&
                                t != "Coming - No Appt"
                            ) {
                                (r = /[^sSoO]/gi), (v = txtSection.innerText);

                                if (r.test(v)) {
                                    txtSection.innerText = v.replace(r, "");
                                }
                            }
                            break;
                    }
                }
                if (listType == "JobType") {
                    switch (event.key) {
                        case "s":
                        case "S":
                            txtSection.innerHTML = "Spring";
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                document.getElementById("JobType0"),
                                listBox
                            );
                            navigateTabs("down", ti);
                            break;
                        case "c":
                        case "C":
                            txtSection.innerHTML = "Check All";
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                document.getElementById("JobType1"),
                                listBox
                            );
                            navigateTabs("down", ti);
                            break;
                        case "a":
                        case "A":
                            txtSection.innerHTML = "Alignment";
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                document.getElementById("JobType2"),
                                listBox
                            );
                            navigateTabs("down", ti);
                            break;
                        case "k":
                        case "K":
                            txtSection.innerHTML = "King Pin";
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                document.getElementById("JobType3"),
                                listBox
                            );
                            navigateTabs("down", ti);
                            break;
                        case "f":
                        case "F":
                            txtSection.innerHTML = "Frame";
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                document.getElementById("JobType4"),
                                listBox
                            );
                            navigateTabs("down", ti);
                            break;
                        default:
                            //only allow s and o
                            let t = txtSection.innerHTML;

                            if (
                                t !== "Spring" &&
                                t !== "Alignment" &&
                                t !== "Check All" &&
                                t !== "King Pin" &&
                                t !== "Frame"
                            ) {
                                (r = /[^sScCaAkKfF]/gi),
                                    (v = txtSection.innerText);

                                if (r.test(v)) {
                                    txtSection.innerText = v.replace(r, "");
                                }
                            }
                            break;
                    }
                }

                if (listType == "Customer") {
                    console.log("keyup");
                    console.log(txtSection.innerText);
                    customerChosen = false;
                    if (
                        document
                            .querySelector("#Customer-listBox")
                            .getAttribute("data-state") == "closed"
                    ) {
                        toggleDropDowns(
                            "Customer txtSection focus",
                            listBox,
                            arrow
                        );
                    }
                    if ($("#Customer-MessageContainer")) {
                        $("#Customer-MessageContainer").remove();
                    }
                    let m = filterListBox2(txtSection, list);
                    document.getElementById("Customer-listBox").innerHTML = "";
                    console.log(
                        "right before fillListBox2 in keyup fro customer"
                    );
                    fillListBox2(listBox, m);
                    fl = $("#Customer-listBox div:visible");

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
                        document.getElementById("Contacts-listBox").innerHTML =
                            "";
                        resetListBox(listType);
                        resetContacts();

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
                        document.getElementById("Contacts-listBox").innerHTML =
                            "";
                        //resetListBox(listType)
                        //resetContacts()
                    } else {
                    }
                }

                filteredList = Array.from($("#Customer-listBox div:visible"));
            },
            input: (event) => {
                console.log("input fired in createcombobox()");
                event.target.innerText =
                    event.target.innerText.toLocaleUpperCase();
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
        if (callingPage == "popup") {
            listBox.setAttribute("class", "listBox popupJobType");
        } else {
            listBox.setAttribute("class", "listBox");
        }

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

        if (listType == "Customer") {
            fillListBox2(listBox, customSort("", list));
            arrElementsCustomerNames = Array.from($("#Customer-listBox div"));
        } else {
            fillListBox2(listBox, list);
        }
    };
    let getTabIndex = (type, page) => {
        let index;
        if (page == "edit") {
            switch (type) {
                case "DateIn":
                    index = 1;
                    break;
                case "Designation":
                    index = 2;
                    break;
                case "radAM":
                    index = 3;
                    break;
                case "radPM":
                    index = 3;
                    break;
                case "DateSched":
                    index = 4;
                    break;
                case "Customer":
                    index = 6;
                    break;
                case "Contacts":
                    index = 10;
                    break;
                case "Unit":
                    index = 7;
                    break;
                case "UnitType":
                    index = 8;
                    break;
                case "JobType":
                    index = 5;
                    break;
                case "radAM_OTL":
                    index = 15;
                    break;
                case "DateOTL":
                    index = 16;
                    break;
                default:
                    break;
            }

            return index;
        }
        if (page == "add") {
            switch (type) {
                case "Designation":
                    index = 1;
                    break;
                case "radAM":
                    index = 2;
                    break;
                case "radPM":
                    index = 3;
                    break;
                case "DateSched":
                    index = 4;
                    break;
                case "Customer":
                    index = 6;
                    break;
                case "Contacts":
                    index = 10;
                    break;
                case "Unit":
                    index = 7;
                    break;
                case "UnitType":
                    index = 8;
                    break;
                case "JobType":
                    index = 5;
                    break;
                default:
                    break;
            }

            return index;
        }
        if (page == "popup") {
            switch (type) {
                case "radAM":
                    index = 2;
                    break;
                case "radPM":
                    index = 3;
                    break;
                case "DateSched":
                    index = 4;
                    break;

                case "JobType":
                    index = 5;
                    break;
                default:
                    break;
            }

            return index;
        }
    };
    let fillListBox2 = (box, editL) => {
        let input = document.getElementById(listType + "-choice");
        let txtSection = document.getElementById(listType + "-choice");
        let button = document.getElementById(listType + "-button");
        let listBox = document.getElementById(listType + "-listBox");
        console.log(editL);
        box.innerHTML = "";
        console.log(list);
        for (var member in editL) {
            let listItem = document.createElement("div");
            listItem.setAttribute("class", "listItem");
            listItem.setAttribute("data-selected", false);
            listItem.tabIndex = -1;
            let text;

            switch (listType) {
                case "Customer":
                    //list = ipc.sendSync("get-customer-names");
                    // editL.sort((a, b) =>
                    //     a.customer_name > b.customer_name ? 1 : -1
                    // );

                    listItem.setAttribute(
                        "id",
                        `listItem${editL[member].customer_ID}`
                    );
                    text = document.createTextNode(editL[member].customer_name);
                    if (text.length > 25) {
                        listItem.setAttribute(
                            "class",
                            "listItem wrap-detected"
                        );
                    }

                    $(listItem).on({
                        keydown: (event) => {
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
                                    navigateListBox(
                                        event,
                                        box,
                                        filteredList,
                                        itemIndex
                                    );
                                    break;
                                case "ArrowUp":
                                    navigateListBox(
                                        event,
                                        box,
                                        filteredList,
                                        itemIndex
                                    );
                                    break;
                                case "Enter":
                                case "Tab":
                                    if (listType == "Customer") {
                                        let props = {};
                                        props.contacts = ipc.sendSync(
                                            "get-contacts",
                                            listItem.id.substring(8)
                                        );
                                        props.customer_ID =
                                            listItem.id.substring(8);
                                        props.customer_name =
                                            listItem.innerText;
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
                                            let txtField =
                                                document.querySelector(
                                                    "#Contacts-choice"
                                                );
                                            let nameBox =
                                                document.querySelector(
                                                    "#Contacts-info"
                                                );
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
                                            console.log(
                                                primaryName,
                                                primaryItem.text()
                                            );

                                            //simulate chosing an option
                                            nameBox.innerText = primaryName;
                                            txtField.innerText =
                                                primaryItem.text();
                                            primaryItem.addClass(
                                                "focusedListItem"
                                            );
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
                            props.launcher = page;
                            console.log(props);
                            console.log(callingPage);
                            if (
                                callingPage != "contacts" &&
                                callingPage != "reports"
                            ) {
                                fillContactsNew(props);
                            }

                            currentFocusedItem = event.target;
                            if (
                                props.contacts.primary_contact &&
                                callingPage != "contacts" &&
                                callingPage != "reports"
                            ) {
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

                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                event.target,
                                box
                            );
                            setTimeout(() => {
                                if (
                                    callingPage != "contacts" &&
                                    callingPage != "reports"
                                ) {
                                    navigateTabs("down", index);
                                }
                            }, 75);
                        },
                    });
                    break;

                default:
                    listItem.setAttribute("id", listType + member);
                    text = document.createTextNode(editL[member]);
                    $(listItem).on({
                        keydown: (event) => {
                            let filteredList = $(
                                "#" + listType + "-listBox .listItem:visible"
                            );
                            let index = Number(
                                document
                                    .getElementById(`${listType}-choice`)
                                    .getAttribute("tabindex")
                            );

                            switch (event.key) {
                                case "Tab":
                                    closeDropDowns();
                                    chooseListItem(
                                        event,
                                        input,
                                        txtSection,
                                        event.target,
                                        box
                                    );
                                    break;
                                case "ArrowDown":
                                    console.log("yellow");
                                    navigateListBox(event, box, filteredList);
                                    break;
                                case "ArrowUp":
                                    navigateListBox(event, box, filteredList);
                                    break;
                                case "Enter":
                                    //listItem.click()

                                    if (event.target.innerHTML == "Scheduled") {
                                        let radios =
                                            document.getElementsByName(
                                                "ampmSched"
                                            );
                                        for (
                                            var i = 0, r = radios, l = r.length;
                                            i < l;
                                            i++
                                        ) {
                                            r[i].disabled = false;
                                        }
                                        document.getElementById(
                                            "radAM"
                                        ).checked = true;
                                        document.querySelector(
                                            "#DateSched-wrapper > label"
                                        ).innerHTML = "Date Scheduled";
                                        document
                                            .getElementById("dateSchWrapper")
                                            .classList.remove("hiddenInput");
                                        document
                                            .getElementById("dateSchWrapper")
                                            .classList.add("visibleInput");
                                        if (
                                            document.getElementById(
                                                "cbOTL_scheduled"
                                            )?.checked
                                        ) {
                                            document
                                                .getElementById(
                                                    "cbOTL_scheduled"
                                                )
                                                .click();
                                        }
                                        navigateTabs("down", index);
                                        chooseListItem(
                                            event,
                                            input,
                                            txtSection,
                                            event.target,
                                            box
                                        );
                                        break;
                                    }
                                    if (
                                        event.target.innerHTML ==
                                        "Coming - No Appt"
                                    ) {
                                        let radios =
                                            document.getElementsByName(
                                                "ampmSched"
                                            );
                                        for (
                                            var i = 0, r = radios, l = r.length;
                                            i < l;
                                            i++
                                        ) {
                                            r[i].disabled = true;
                                        }
                                        document.getElementById(
                                            "radAM"
                                        ).checked = false;
                                        document.querySelector(
                                            "#DateSched-wrapper > label"
                                        ).innerHTML = "Drop Off Date";
                                        document
                                            .getElementById("dateSchWrapper")
                                            .classList.remove("hiddenInput");
                                        document
                                            .getElementById("dateSchWrapper")
                                            .classList.add("visibleInput");
                                        if (
                                            document.getElementById(
                                                "cbOTL_scheduled"
                                            )?.checked
                                        ) {
                                            document
                                                .getElementById(
                                                    "cbOTL_scheduled"
                                                )
                                                .click();
                                        }

                                        navigateTabs("down", index);
                                        chooseListItem(
                                            event,
                                            input,
                                            txtSection,
                                            event.target,
                                            box
                                        );
                                        break;
                                    }

                                    document
                                        .getElementById("dateSchWrapper")
                                        .classList.remove("visibleInput");
                                    document
                                        .getElementById("dateSchWrapper")
                                        .classList.add("hiddenInput");
                                    //listItem.click()
                                    // switch(listType){
                                    //     case 'Designation' :
                                    //         if(event.target.innerHTML == 'Scheduled' || event.target.innerHTML == 'Coming - No Appt'){

                                    //             document.getElementById('dateSchWrapper').classList.remove('hiddenInput')
                                    //             document.getElementById('dateSchWrapper').classList.add('visibleInput')
                                    //         }else{
                                    //             document.getElementById('dateSchWrapper').classList.remove('visibleInput')
                                    //             document.getElementById('dateSchWrapper').classList.add('hiddenInput')
                                    //         }
                                    //         break;
                                    //     default:
                                    //         break;
                                    // }
                                    //  navigateTabs('down',index)
                                    // chooseListItem(event,input,txtSection,event.target,box)
                                    break;
                                default:
                                    break;
                            }
                        },

                        mousedown: (event) => {
                            event.preventDefault();

                            let index = Number(
                                document
                                    .getElementById(`${listType}-choice`)
                                    .getAttribute("tabindex")
                            );

                            switch (listType) {
                                case "Designation":
                                    if (event.target.innerHTML == "Scheduled") {
                                        let radios =
                                            document.getElementsByName(
                                                "ampmSched"
                                            );
                                        for (
                                            var i = 0, r = radios, l = r.length;
                                            i < l;
                                            i++
                                        ) {
                                            r[i].disabled = false;
                                        }
                                        document.getElementById(
                                            "radAM"
                                        ).checked = true;
                                        document.querySelector(
                                            "#DateSched-wrapper > label"
                                        ).innerHTML = "Date Scheduled";
                                        document
                                            .getElementById("dateSchWrapper")
                                            .classList.remove("hiddenInput");
                                        document
                                            .getElementById("dateSchWrapper")
                                            .classList.add("visibleInput");
                                        if (
                                            document.getElementById(
                                                "cbOTL_scheduled"
                                            )?.checked
                                        ) {
                                            document
                                                .getElementById(
                                                    "cbOTL_scheduled"
                                                )
                                                .click();
                                        }
                                        break;
                                    }
                                    if (
                                        event.target.innerHTML ==
                                        "Coming - No Appt"
                                    ) {
                                        let radios =
                                            document.getElementsByName(
                                                "ampmSched"
                                            );
                                        for (
                                            var i = 0, r = radios, l = r.length;
                                            i < l;
                                            i++
                                        ) {
                                            r[i].disabled = true;
                                        }
                                        document.getElementById(
                                            "radAM"
                                        ).checked = false;
                                        document.querySelector(
                                            "#DateSched-wrapper > label"
                                        ).innerHTML = "Drop Off Date";
                                        document
                                            .getElementById("dateSchWrapper")
                                            .classList.remove("hiddenInput");
                                        document
                                            .getElementById("dateSchWrapper")
                                            .classList.add("visibleInput");
                                        if (
                                            document.getElementById(
                                                "cbOTL_scheduled"
                                            )?.checked
                                        ) {
                                            document
                                                .getElementById(
                                                    "cbOTL_scheduled"
                                                )
                                                .click();
                                        }
                                        break;
                                    }

                                    document
                                        .getElementById("dateSchWrapper")
                                        .classList.remove("visibleInput");
                                    document
                                        .getElementById("dateSchWrapper")
                                        .classList.add("hiddenInput");

                                    break;
                                default:
                                    break;
                            }

                            //open schedule input if schedule chosen

                            // if(listType =='Customer'){
                            //     if(!contactChosen){
                            //         // resetListBox(listBox)
                            //     }
                            //     fillContactsNew(ipc.sendSync('get-contacts',listItem.id.substring(8)))
                            // }
                            button.firstChild.classList.remove("up");
                            button.firstChild.classList.add("down");
                            chooseListItem(
                                event,
                                input,
                                txtSection,
                                event.target,
                                box
                            );

                            navigateTabs("down", index);
                        },
                    });
                    break;
            }

            listItem.appendChild(text);

            box.appendChild(listItem);
        }
    };
    // let fillListBox = (element)=>{
    //     element.innerHTML =''
    //     switch(listType){
    //         case 'Customer':
    //             list.sort((a, b) => (a.customer_name > b.customer_name) ? 1 : -1)
    //             for(var member in list){
    //                 let customer = document.createElement('div')
    //                 customer.setAttribute('class', 'listItem')
    //                 customer.setAttribute('id', `listItem${list[member].customer_ID}`)
    //                 let txtName = document.createTextNode(list[member].customer_name)
    //                 customer.appendChild(txtName)
    //                 customer.tabIndex = -1

    //                 //customer.addEventListener('click',(event)=>{
    //                     $(customer).on({
    //                         keydown: (event)=>{
    //                             console.log('list item keydown')
    //                             //move to next listItem on arrowdow key
    //                             if(event.key == 'ArrowDown'){

    //                                 pastFocusedItem = currentFocusedItem
    //                                 currentFocusedItem = nextFocusedItem
    //                                 nextFocusedItem = document.querySelector(`${element} :nth-Child(${itemIndex})`)
    //                                 nextFocusedItem.focus()
    //                                 itemIndex++

    //                             }
    //                             if(event.key == 'ArrowUp'){
    //                                 itemIndex--
    //                             }
    //                         },
    //                         click: ()=>{
    //                             console.log('listItem clicked. State = '+state)
    //                             let contactID = ipc.sendSync('get-contacts',event.target.id.substring(8))
    //                             let txtSection = document.getElementById(listType+'-choice')
    //                             let listBox = document.getElementById(listType+'-listbox')
    //                             let input = document.getElementById(listType)
    //                             let button = document.getElementById(listType+'-button')
    //                             txtSection.innerHTML = customer.innerHTML
    //                             listBox.style.animationDuration = '300ms'
    //                             listBox.style.transform = 'scaleY(0)'
    //                             input.classList.remove('flatBottom')
    //                             input.classList.add('fullRound')
    //                             button.classList.remove('pullUpButton');
    //                             button.classList.add('dropDownButton');
    //                             txtSection.classList.add('leftHalfRound')
    //                             txtSection.classList.remove('leftFlatBottom')
    //                             fillContactsNew(contactID)
    //                             listBox.setAttribute('data-state','closed')
    //                         },
    //                         blur: ()=>{

    //                         }
    //                     })
    //                    element.appendChild(customer)
    //             }

    //         break;
    //         case 'Designation':

    //                 console.log('list in Designation = '+list[0])
    //                 let input = document.getElementById(listType+'-choice')
    //                 let txtSection = document.getElementById(listType+'-choice')
    //                 let button = document.getElementById(listType+'-button')
    //                 let listBox = document.getElementById(listType+'-listBox')

    //                 for(var member in list){
    //                     let designation = document.createElement('div')
    //                     designation.setAttribute('id',listType+member)
    //                     designation.setAttribute('class','listItem')
    //                     designation.tabIndex = -1

    //                     $(designation).on({
    //                         keydown: (event)=>{
    //                             if(event.key == 'ArrowDown' || event.key == 'ArrowUp'){
    //                                 navigateListBox(event,listBox,list)
    //                             }
    //                             if(event.key == 'Enter'){
    //                                 chooseListItem(event,input,txtSection,button,listBox)
    //                             }

    //                         },
    //                         click: (event)=>{
    //                             console.log('clicking designation item and state = '+state)
    //                             //open schedule input if schedule chosen
    //                             if(event.target.innerHTML == 'Scheduled'){

    //                                 document.getElementById('dateWrapper').classList.remove('hiddenInput')
    //                                 document.getElementById('dateWrapper').classList.add('visibleInput')
    //                             }else{
    //                                 document.getElementById('dateWrapper').classList.remove('visibleInput')
    //                                 document.getElementById('dateWrapper').classList.add('hiddenInput')
    //                             }
    //                             chooseListItem(event,input,txtSection,button,listBox)
    //                         }
    //                     })

    //                     let txtDesignation = document.createTextNode(list[member])
    //                     designation.appendChild(txtDesignation)
    //                     element.appendChild(designation)
    //                 }
    //             break;
    //             case 'Job-Type':
    //                 {
    //                 console.log('list in Designation = '+list[0])
    //                 let input = document.getElementById(listType+'-choice')
    //                 let txtSection = document.getElementById(listType+'-choice')
    //                 let listBox = document.getElementById(listType+'-listBox')
    //                 let button = document.getElementById(listType+'-button')

    //                 for(var member in list){
    //                     let jobType = document.createElement('div')
    //                     jobType.setAttribute('id',listType+member)
    //                     jobType.setAttribute('class','listItem')
    //                     jobType.tabIndex = -1

    //                     $(jobType).on({
    //                         keydown: (event)=>{
    //                             navigateListBox(event,listBox,list)
    //                         }
    //                     })
    //                     jobType.addEventListener('click',(event)=>{
    //                         console.log('clicking designation item and state = '+state)
    //                         input.innerHTML = event.target.innerHTML;
    //                         element.style.animationDuration = '300ms'
    //                         element.style.transform = 'scaleY(0)'
    //                         input.classList.remove('flatBottom')
    //                         input.classList.add('fullRound')
    //                         button.classList.remove('pullUpButton');
    //                         button.classList.add('dropDownButton');
    //                         txtSection.classList.add('leftHalfRound')
    //                         txtSection.classList.remove('leftFlatBottom')
    //                         element.setAttribute('data-state','closed')
    //                     })
    //                     let txtJobType = document.createTextNode(list[member])
    //                     jobType.appendChild(txtJobType)
    //                     element.appendChild(jobType)
    //                 }
    //                 }
    //             break;
    //             default:
    //                 break;

    //     }
    // }
    let createSplitSelectBox = () => {
        container.setAttribute("data-type", componentType);
        //console.log('split select called')
        /**
         * create split select box
         */

        //wrapper for label and simulated select element
        let inputWrapper = document.createElement("div");
        inputWrapper.setAttribute("class", "inputAndLabelWrapper");

        //label
        let label = document.createElement("label");
        let txtLabel = document.createTextNode(`${listType}`);
        label.appendChild(txtLabel);
        label.setAttribute("class", "label");

        //select element
        let selectBox = document.createElement("div");
        selectBox.setAttribute("id", `${listType}-input`);
        selectBox.setAttribute("class", "selectBox fullRound");

        // selectBox.addEventListener('mousedown',(event)=>{
        //     //event.preventDefault()
        //     console.log('toggling in split select selectBox focus event')
        //     toggleDropDowns('Customer txtSection mousedown',listBox,arrow)

        // })

        //left side info section within select input
        let info = document.createElement("div");
        info.setAttribute("class", "displayedInfo");
        info.setAttribute("id", `${listType}-info`);

        //center section for displayed input
        let choice = document.createElement("div");
        choice.setAttribute("class", "choice");
        choice.setAttribute("id", `${listType}-choice`);
        // choice.setAttribute('contenteditable','true')
        choice.tabIndex = getTabIndex(listType, page);
        $(choice).on({
            focus: (event) => {
                event.stopPropagation();
                //event.preventDefault()

                focused = true;

                //close all open dropdowns
                closeDropDowns();

                //toggle between open and closed styling on focused element
                toggleDropDowns("Customer txtSection focus", listBox, arrow);
            },
            keydown: (event) => {
                let e = $("#" + listType + "-listBox .optionGroup .option");
                let focusedIndex;
                let pastIndex;
                let nextIndex;
                switch (event.key) {
                    case "ArrowDown":
                        focusedIndex = 0;
                        pastIndex = e.length - 1;
                        nextIndex = 1;
                        for (i = 0; i < e.length; i++) {
                            if (e[i].classList.contains("focusedListItem")) {
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

                                e[i].classList.remove("focusedListItem");
                            }
                        }
                        usingListBox = true;
                        e[focusedIndex].focus();
                        e[focusedIndex].classList.add("focusedListItem");
                        pastFocusedItem = e[pastIndex];
                        currentFocusedItem = e[focusedIndex];
                        nextFocusedItem = e[nextIndex];
                        break;
                    case "ArrowUp":
                        usingListBox = true;
                        focusedIndex = e.length - 1;
                        itemIndex = focusedIndex;
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
                        currentFocusedItem = e[focusedIndex]; //listBox.childNodes[1]
                        pastFocusedItem = e[pastIndex]; //listBox.firstChild
                        nextFocusedItem = e[nextIndex]; //listBox.childNodes[1]
                        break;
                    case "Tab":
                        event.preventDefault();
                        let ti = Number(choice.getAttribute("tabindex"));

                        if (event.shiftKey) {
                            console.log("tabindex up = " + ti);
                            navigateTabs("up", ti);
                        } else {
                            console.log("tabindex down = " + ti);
                            navigateTabs("down", ti);
                        }
                        toggleDropDowns(null, listBox, arrow);
                        break;
                    default:
                        break;
                }
            },
            mousedown: (event) => {
                if (focused) {
                    toggleDropDowns(
                        "Customer txtSection mousedown",
                        listBox,
                        arrow
                    );
                }
            },
            blur: (event) => {
                focused = false;
            },
        });

        //button section with up/down arrow
        let button = document.createElement("div");
        button.setAttribute("class", "arrowBox");
        button.setAttribute("id", `${listType}-button`);
        $(button).on({
            click: (event) => {
                event.stopImmediatePropagation();
                toggleDropDowns(null, listBox, arrow);
            },
        });

        let arrow = document.createElement("div");
        arrow.setAttribute("class", "arrow down");
        $(arrow).on({
            click: (event) => {
                event.stopImmediatePropagation();
                toggleDropDowns(null, listBox, arrow);
            },
        });
        //box that holds options...simulated datalist
        let listBox = document.createElement("div");
        listBox.setAttribute("class", "listBox");
        listBox.setAttribute("id", `${listType}-listBox`);
        listBox.setAttribute("data-state", "closed");

        //assemble elements
        inputWrapper.appendChild(label);
        button.appendChild(arrow);
        selectBox.appendChild(info);
        selectBox.appendChild(choice);
        selectBox.appendChild(button);
        inputWrapper.appendChild(selectBox);

        container.appendChild(inputWrapper);
        container.appendChild(listBox);
    };

    let createSelectBox = () => {
        container.setAttribute("data-type", componentType);

        //wrapper for label and simulated select element
        let inputWrapper = document.createElement("div");
        inputWrapper.setAttribute("class", "inputAndLabelWrapper");

        //label
        let label = document.createElement("label");
        let txtLabel = document.createTextNode(`${listType}`);
        label.appendChild(txtLabel);
        label.setAttribute("class", "label");

        //select element
        let selectBox = document.createElement("div");
        selectBox.setAttribute("id", `${listType}-input`);
        selectBox.setAttribute("class", "selectBox fullRound");
        $(selectBox).on({
            click: (event) => {
                state = listBox.getAttribute("data-state");
                console.log("selectBox clicked. State:" + state);
                if (state == "closed") {
                    listBox.style.animationDuration = "300ms";
                    listBox.style.transform = "scaleY(1)";
                    arrow.classList.remove("down");
                    arrow.classList.add("up");
                    fillListBox2(listBox);
                    listBox.setAttribute("data-state", "open");
                    usingListBox = true;
                } else {
                    //selectBox.classList.add('fullRound')
                    //selectBox.classList.remove('flatBottom')
                    listBox.style.animationDuration = "300ms";
                    listBox.style.transform = "scaleY(0)";
                    //button.classList.remove('pullUpButton');
                    //button.classList.add('dropDownButton');
                    arrow.classList.remove("up");
                    arrow.classList.add("down");
                    //choice.classList.add('leftHalfRound')
                    //choice.classList.remove('leftFlatBottom')
                    listBox.setAttribute("data-state", "closed");
                    usingListBox = false;
                }
            },
        });
        //TODO: add a way to determine tabindex order if(selectBox.listType == 'Designation')

        //center section for displayed input
        let choice = document.createElement("div");
        choice.setAttribute("class", "choiceSelect");
        choice.setAttribute("id", `${listType}-choice`);
        choice.tabIndex = getTabIndex(listType, page);
        choice.setAttribute("contenteditable", true);

        $(choice).on({
            focus: (event) => {
                //event.preventDefault()
                //choice.innerHTML = ''
                previousFocusedElement = choice.id;
                //choice.style.outline = 'none'
                console.log(document.activeElement);
                closeDropDowns();
                fillListBox2(listBox);
                toggleDropDowns(null, listBox, arrow);
            },
            blur: (event) => {
                console.log("blur in choice fired");

                if (!usingListBox) {
                    closeDropDowns();
                }
            },
            mousedown: (event) => {
                event.preventDefault();
            },
            click: (event) => {
                choice.focus();
            },
            dblclick: (event) => {
                choice.innerHTML = "";
                //choice.focus()
            },
            keydown: (event) => {
                console.log(event.key);
                let e = $("#" + listType + "-listBox .listItem:visible");
                let ti = Number(event.target.getAttribute("tabindex"));
                switch (event.key) {
                    case "ArrowDown":
                        usingListBox = true;

                        e[0].focus();
                        e[0].classList.add("focusedListItem");
                        currentFocusedItem = e[0];

                        nextFocusedItem = e[1];

                        break;
                    case "Tab":
                        usingListBox = false;
                        console.log("select box TAB event");
                        closeDropDowns();
                        event.preventDefault();

                        if (listType == "Designation") {
                            if (choice.innerHTML == "Scheduled") {
                                document
                                    .getElementById("dateWrapper")
                                    .classList.remove("hiddenInput");
                                document
                                    .getElementById("dateWrapper")
                                    .classList.add("visibleInput");
                                //document.getElementById('dateWrapper').style.display = 'block'
                                //$("#radAM").focus()
                            } else {
                                document
                                    .getElementById("dateWrapper")
                                    .classList.add("hiddenInput");
                                document
                                    .getElementById("dateWrapper")
                                    .classList.remove("visibleInput");
                                //document.getElementById('dateWrapper').style.display = 'none'
                                //$('#Customer-choice').focus()
                            }
                        } else {
                            console.log(choice.tabIndex);
                        }
                        navigateTabs("down", ti);
                        if (event.shiftKey) {
                            navigateTabs("up", ti);
                        }
                        break;
                    case "Enter":
                        usingListBox = false;
                        event.preventDefault();
                        if (listType == "Designation") {
                            if (choice.innerHTML == "Scheduled") {
                                document
                                    .getElementById("dateWrapper")
                                    .classList.remove("hiddenInput");
                                document
                                    .getElementById("dateWrapper")
                                    .classList.add("visibleInput");
                                //document.getElementById('dateWrapper').style.display = 'block'
                                $("#radAM").focus();
                            } else {
                                document
                                    .getElementById("dateWrapper")
                                    .classList.add("hiddenInput");
                                document
                                    .getElementById("dateWrapper")
                                    .classList.remove("visibleInput");
                                //document.getElementById('dateWrapper').style.display = 'none'
                                $("#Customer-choice").focus();
                            }
                        } else {
                            console.log(choice.tabIndex);

                            //currentFocusedItem = listBox.firstChild
                            //currentFocusedItem.focus()
                        }
                        break;

                    default:
                        break;
                }
            },
            keyup: (event) => {
                let ti = Number(event.target.getAttribute("tabindex"));
                if (listType == "Designation") {
                    if (event.key === "s" || event.key === "S") {
                        choice.innerHTML = "Scheduled";
                        usingListBox = false;
                        event.preventDefault();
                        if (listType == "Designation") {
                            if (choice.innerHTML == "Scheduled") {
                                document
                                    .getElementById("dateWrapper")
                                    .classList.remove("hiddenInput");
                                document
                                    .getElementById("dateWrapper")
                                    .classList.add("visibleInput");
                                //document.getElementById('dateWrapper').style.display = 'block'
                                $("#radAM").focus();
                            } else {
                                document
                                    .getElementById("dateWrapper")
                                    .classList.add("hiddenInput");
                                document
                                    .getElementById("dateWrapper")
                                    .classList.remove("visibleInput");
                                //document.getElementById('dateWrapper').style.display = 'none'
                                $("#Customer-choice").focus();
                            }
                        }
                        navigateTabs("down", ti);
                    }
                    if (event.key === "c" || event.key === "C") {
                        choice.innerHTML = "Coming - No Appt";
                        usingListBox = false;
                        event.preventDefault();
                        if (listType == "Designation") {
                            if (choice.innerHTML == "Coming - No Appt") {
                                document
                                    .getElementById("dateWrapper")
                                    .classList.remove("hiddenInput");
                                document
                                    .getElementById("dateWrapper")
                                    .classList.add("visibleInput");
                                //document.getElementById('dateWrapper').style.display = 'block'
                                $("#radAM").focus();
                            } else {
                                document
                                    .getElementById("dateWrapper")
                                    .classList.add("hiddenInput");
                                document
                                    .getElementById("dateWrapper")
                                    .classList.remove("visibleInput");
                                //document.getElementById('dateWrapper').style.display = 'none'
                                $("#Customer-choice").focus();
                            }
                        }
                        navigateTabs("down", ti);
                    }
                    if (event.key === "o" || event.key === "O") {
                        choice.innerHTML = "On the Lot";
                        navigateTabs("down", ti);
                    }
                }
                if (listType == "JobType") {
                    if (event.key === "s" || event.key === "S") {
                        choice.innerHTML = "Spring";
                        navigateTabs("down", ti);
                    }
                    if (event.key === "c" || event.key === "C") {
                        choice.innerHTML = "Check All";
                        navigateTabs("down", ti);
                    }
                    if (event.key === "a" || event.key === "A") {
                        choice.innerHTML = "Alignment";
                        navigateTabs("down", ti);
                    }
                    if (event.key === "k" || event.key === "K") {
                        choice.innerHTML = "King Pin";
                        navigateTabs("down", ti);
                    }
                    if (event.key === "f" || event.key === "F") {
                        choice.innerHTML = "Frame";
                        navigateTabs("down", ti);
                    }
                }
                var text = choice.innerText.toUpperCase();
                // for (let option of document.getElementsByClassName('listItem')) {
                //     if(option.innerText.toUpperCase().indexOf(text) > -1){
                //         option.style.display = "block";
                //         if(option.innerText.toUpperCase()===text){
                //             option.classList.add('exactMatch')
                //             //fillContactsNew(ipc.sendSync('get-contacts',option.id.substring(8)))
                //             //createDropDown(list[member])
                //         }else{
                //             option.classList.remove('exactMatch')

                //         }
                //     }else{
                //         option.style.display = "none";
                //     }
                // }
                // let visibleListItems = $('#'+listType+'-listBox .listItem:visible')
                //     if(visibleListItems.length == 1){
                //         autoComplete.innerHTML = visibleListItems[0].innerHTML

                //         // let end = choice.innerHTML.length
                //         // $(choice).setSelectionRange(end,end)

                //     }
                //     if(choice.innerHTML.length == 0){
                //         autoComplete.innerHTML = ''
                //     }
            },
        });
        //  for(var member in list){
        //     let opt = document.createElement('option')
        //     let optText = document.createTextNode(list[member])
        //     opt.appendChild(optText)
        //     choice.appendChild(opt)
        //  }

        //underlying autocomplete box
        let autoComplete = document.createElement("span");
        autoComplete.setAttribute("id", `${listType}-autoComplete`);
        autoComplete.setAttribute("class", "choiceAutoComplete");

        //button section with up/down arrow
        let button = document.createElement("div");
        button.setAttribute("class", "arrowBox");
        button.setAttribute("id", `${listType}-button`);

        let arrow = document.createElement("div");
        arrow.setAttribute("class", "arrow down");
        //  $(button).on({
        //     click : (event)=>{
        //         //choice.blur()
        //         //choice.focus()
        //         state = listBox.getAttribute('data-state')
        //         console.log('button click. State:'+state )
        //         if(state == 'closed'){
        //             console.log('state = '+state+' from button click')
        //         //console.log('dropdown is closed click event')
        //         //closeDropDowns()
        //         choice.focus()
        //             // selectBox.classList.remove('fullRound')
        //             // selectBox.classList.add('flatBottom')
        //             // listBox.style.animationDuration = '300ms'
        //             // listBox.style.transform = 'scaleY(1)'
        //             // button.classList.remove('dropDownButton');
        //             // button.classList.add('pullUpButton');
        //             // choice.classList.add('leftFlatBottom')
        //             // choice.classList.remove('leftHalfRound')
        //             // fillListBox2(listBox)
        //             // //listBox.firstChild.focus()
        //             // //listBox.firstChild.classList.add('focusedListItem')
        //             // //currentFocusedItem = listBox.firstChild
        //             listBox.setAttribute('data-state','open')
        //             // console.log(document.activeElement)

        //         }else{
        //             choice.blur()
        //             // selectBox.classList.add('fullRound')
        //             // selectBox.classList.remove('flatBottom')
        //             // listBox.style.animationDuration = '300ms'
        //             // listBox.style.transform = 'scaleY(0)'
        //             // button.classList.remove('pullUpButton');
        //             // button.classList.add('dropDownButton');
        //             // choice.classList.add('leftHalfRound')
        //             // choice.classList.remove('leftFlatBottom')
        //             // listBox.setAttribute('data-state','closed')
        //         }
        //     }
        //  })

        //box that holds options...simulated datalist
        let listBox = document.createElement("div");
        listBox.setAttribute("class", "listBox");
        listBox.setAttribute("id", `${listType}-listBox`);
        listBox.setAttribute("data-state", "closed");

        //assemble elements
        inputWrapper.appendChild(label);
        //choice.appendChild(autoComplete)
        button.appendChild(arrow);
        selectBox.appendChild(choice);
        //selectBox.appendChild(autoComplete)
        selectBox.appendChild(button);
        inputWrapper.appendChild(selectBox);

        container.appendChild(inputWrapper);
        container.appendChild(listBox);

        $(listBox).on({
            // focus: ()=>{
            //     console.log('select box focus fired')
            //     selectBox.classList.remove('fullRound')
            //      selectBox.classList.add('flatBottom')
            //      listBox.style.animationDuration = '300ms'
            //      listBox.style.transform = 'scaleY(1)'
            //      button.classList.remove('dropDownButton');
            //      button.classList.add('pullUpButton');
            //      choice.classList.add('leftFlatBottom')
            //      choice.classList.remove('leftHalfRound')
            //      //fillListBox(listBox)
            //      state= 'open';
            // },
            blur: () => {
                console.log("select box blur fired");
                //selectBox.classList.add('fullRound')
                //selectBox.classList.remove('flatBottom')
                listBox.style.animationDuration = "300ms";
                listBox.style.transform = "scaleY(0)";
                button.classList.remove("up");
                button.classList.add("down");
                //choice.classList.add('leftHalfRound')
                //choice.classList.remove('leftFlatBottom')
                state = "closed";
            },
        });
    };

    let createDateBox = (which) => {
        let id = `${listType}-choice`;
        // if(which){
        //     id = `${listType}${which}-choice`
        // }else{
        //     id = `${listType}-choice`
        // }

        container.setAttribute("data-type", componentType);

        //create wrapper
        let wrapper = document.createElement("div");
        wrapper.setAttribute("class", "inputAndLabelWrapper");
        wrapper.setAttribute("id", listType + "-wrapper");

        //create label
        let label = document.createElement("label");
        let labelText;
        switch (which) {
            case "In":
                labelText = "Date In";
                break;
            case "Sched":
            case "OTL":
                labelText = "Date Scheduled";
                break;
            default:
                labelText = "Date Scheduled";
                break;
        }
        let txtLabel = document.createTextNode(labelText);
        label.setAttribute("class", "label");

        //create input
        let input = document.createElement("div");
        input.setAttribute("id", listType);
        input.setAttribute("class", "comboBox fullRound");

        //create text field
        let txtSection = document.createElement("input");
        txtSection.setAttribute("id", id);
        txtSection.setAttribute("class", "choiceDate");
        txtSection.setAttribute("contenteditable", true);
        txtSection.setAttribute("data-state", "closed");
        txtSection.tabIndex = getTabIndex(listType, page);
        $(txtSection).on({
            focus: (event) => {
                closeDropDowns();
                state = event.target.getAttribute("data-state");

                if (state == "closed") {
                    event.target.setAttribute("data-state", "open");
                    arrow.classList.remove("down");
                    arrow.classList.add("up");
                }
            },
            keydown: (event) => {
                if ($(`#Date-MessageContainer`)) {
                    $(`#Date-MessageContainer`).remove();
                }
            },
            blur: (event) => {
                event.target.setAttribute("data-state", "closed");
                arrow.classList.remove("up");
                arrow.classList.add("down");
            },

            mousedown: (event) => {
                closeDropDowns();
                state = event.target.getAttribute("data-state");

                if (state == "closed") {
                    event.target.setAttribute("data-state", "open");
                    arrow.classList.remove("down");
                    arrow.classList.add("up");
                }
                if (state == "open") {
                    // event.target.setAttribute('data-state','closed')
                    // arrow.classList.remove('up');
                    // arrow.classList.add('down');
                }
            },
        });

        //create button
        let button = document.createElement("div");
        button.setAttribute("id", "btn-" + listType);
        button.setAttribute("class", "arrowBox");
        $(button).on({
            click: (event) => {
                closeDropDowns();

                state = txtSection.getAttribute("data-state");
                console.log("mousedown date button, state = " + state);
                if (state == "closed") {
                    txtSection.focus();
                    txtSection.setAttribute("data-state", "open");
                    arrow.classList.remove("down");
                    arrow.classList.add("up");
                    //txtSection.focus()
                }
                if (state == "open") {
                    txtSection.setAttribute("data-state", "closed");
                    arrow.classList.remove("up");
                    arrow.classList.add("down");
                    txtSection.blur();
                }
            },
        });

        //create arrow
        let arrow = document.createElement("div");
        arrow.setAttribute("class", "arrow down");
        $(arrow).on({
            click: (event) => {
                event.stopImmediatePropagation();
                closeDropDowns();

                state = txtSection.getAttribute("data-state");
                console.log("mousedown date button, state = " + state);
                if (state == "closed") {
                    txtSection.focus();
                    txtSection.setAttribute("data-state", "open");
                    arrow.classList.remove("down");
                    arrow.classList.add("up");
                    //txtSection.focus()
                }
                if (state == "open") {
                    txtSection.setAttribute("data-state", "closed");
                    arrow.classList.remove("up");
                    arrow.classList.add("down");
                    txtSection.blur();
                }
            },
        });

        if (which !== "In") {
            //create radio buttons
            let rbWrapper = document.createElement("div");
            rbWrapper.setAttribute("class", "dateInfo");

            let amWrapper = document.createElement("div");
            amWrapper.setAttribute("class", "ampmWrapper");

            let pmWrapper = document.createElement("div");
            pmWrapper.setAttribute("class", "ampmWrapper");

            let amLabel = document.createElement("label");

            let txtAMlabel = document.createTextNode("AM");
            amLabel.appendChild(txtAMlabel);

            //

            let radAM = document.createElement("input");
            radAM.setAttribute("type", "radio");

            radAM.setAttribute("value", "am");
            radAM.setAttribute("checked", true);

            $(radAM).on({
                focus: (event) => {
                    closeDropDowns();
                },
            });

            let radPM = document.createElement("input");
            radPM.setAttribute("type", "radio");

            radPM.setAttribute("value", "pm");

            $(radPM).on({
                focus: (event) => {
                    closeDropDowns();
                },
            });

            //determine if Sched or OTL datebox
            if (which == "Sched") {
                radAM.setAttribute("id", "radAM");
                radAM.setAttribute("name", "ampmSched");
                radAM.tabIndex = getTabIndex("radAM", page);

                radPM.setAttribute("id", "radPM");
                radPM.setAttribute("name", "ampmSched");
                radPM.tabIndex = getTabIndex("radPM", page);
            } else {
                radAM.setAttribute("id", "radAM_OTL");
                radAM.setAttribute("name", "ampmOTL");
                radPM.tabIndex = getTabIndex("radAM_OTL", page);

                radPM.setAttribute("id", "radPM_OTL");
                radPM.setAttribute("name", "ampmOTL");
                radPM.tabIndex = getTabIndex("radPM_OTL", page);
            }

            let pmLabel = document.createElement("label");
            // pmLabel.setAttribute('class','smallRadioLabel')
            let txtPMlabel = document.createTextNode("PM");
            pmLabel.appendChild(txtPMlabel);

            amWrapper.appendChild(amLabel);
            amWrapper.appendChild(radAM);
            pmWrapper.appendChild(pmLabel);
            pmWrapper.appendChild(radPM);

            rbWrapper.appendChild(amWrapper);
            rbWrapper.appendChild(pmWrapper);

            input.appendChild(rbWrapper);
        } //end if

        //assemble pieces

        label.appendChild(txtLabel);
        wrapper.appendChild(label);

        button.appendChild(arrow);

        input.appendChild(txtSection);
        input.appendChild(button);
        wrapper.appendChild(input);

        container.appendChild(wrapper);
    };

    let createTextBox = () => {
        let wrapper = document.createElement("div");
        wrapper.setAttribute("class", "inputAndLabelWrapper");

        let label = document.createElement("label");
        label.setAttribute("class", "label");
        let txtLabel = document.createTextNode(listType);
        label.appendChild(txtLabel);

        let textBox = document.createElement("input"); //div
        textBox.setAttribute("type", "text");
        textBox.setAttribute("id", listType + "-choice");
        //textBox.setAttribute('class','selectBox')
        textBox.tabIndex = getTabIndex(listType, page);
        $(textBox).on({
            focus: (event) => {
                closeDropDowns();
            },
            keydown: (event) => {
                if (listType == "Unit" || listType == "UnitType")
                    if (
                        $("#Unit-MessageContainer") ||
                        $("#UnitType-MessageContainer")
                    ) {
                        $("#Unit-MessageContainer").remove();
                        $("#UnitType-MessageContainer").remove();
                    }
            },
        });

        let button = document.createElement("div");
        button.setAttribute("class", "dropDownButton");

        wrapper.appendChild(label);
        wrapper.appendChild(textBox);
        container.appendChild(wrapper);
    };

    switch (componentType) {
        case "comboBox":
            createComboBox();
            break;
        case "select":
            createSelectBox();
            break;
        case "split select":
            createSplitSelectBox();
            break;
        case "textBox":
            createTextBox();
            break;
        case "date":
            createDateBox();
            break;
        case "date in":
            createDateBox("In");
            break;
        case "date sched":
            createDateBox("Sched");
            break;
        case "date OTL":
            createDateBox("OTL");
        default:
            break;
    }
}
let isDOM = (Obj) => {
    // Function that checks whether
    // object is of type Element
    return Obj instanceof Element;
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
let navigateTabs = (direction, ind) => {
    let tabbable = document.querySelectorAll(
        "[tabindex]:not(.listItem):not(.option)"
    );
    let rect;
    let nextElement;
    let dex = ind;

    if (direction == "up") {
        if (dex > 1) {
            dex = ind - 1;
        } else {
            dex = tabbable.length;
        }

        rect = document
            .querySelectorAll(`[tabindex="${dex}"]`)[0]
            .getBoundingClientRect();
        if (glPage != "popup") {
            while (rect.top == 0) {
                console.log("dex = " + dex);
                dex -= 1;
                rect = document
                    .querySelectorAll(`[tabindex="${dex}"]`)[0]
                    .getBoundingClientRect();
            }
        }

        nextElement = document.querySelectorAll(`[tabindex="${dex}"]`)[0];

        nextElement.focus();
    }

    if (direction == "down") {
        if (dex == tabbable.length) {
            dex = 1;
        } else {
            dex = ind + 1;
        }

        rect = document
            .querySelectorAll(`[tabindex="${dex}"]`)[0]
            .getBoundingClientRect();
        if (glPage != "popup" && glPage) {
            while (rect.top == 0) {
                dex += 1;
                rect = document
                    .querySelectorAll(`[tabindex="${dex}"]`)[0]
                    .getBoundingClientRect();
            }
        }
        nextElement = document.querySelectorAll(`[tabindex="${dex}"]`)[0];

        nextElement.focus();
    }
    tabbable.forEach((item) => {
        // console.log(item)
    });
    // console.log(tabbable)
};

let clearSuggestion = (type) => {
    // document.getElementById(`${type}-autoComplete`).innerHTML =''
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
let chooseListItem = (event, input, txtSection, chosen, listBox) => {
    usingListBox = false;
    contactChosen = true;

    let type = input.getAttribute("id").split("-");

    if ($(`#${type[0]}-MessageContainer`)) {
        $(`#${type[0]}-MessageContainer`).remove();
    }

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
    switch (type[0]) {
        case "JobType":
        case "Designation":
            chosen.classList.add("focusedListItem");
            chosen.setAttribute("data-selected", true);
            currentFocusedItem = chosen;
            txtSection.innerHTML = chosen.innerHTML;
            break;
        case "Customer":
            let cid = chosen.getAttribute("id").substring(8);
            customerChosen = true;
            txtSection.setAttribute("data-cid", cid);
            if (glPage == "contacts") {
                break;
            }
            if (glPage == "reports") {
                let jobs = ipc.sendSync("get-jobs", cid);

                console.log("input triggered");
                document.getElementById("reportResult").innerHTML = "";
                displayHistory(jobs);
                break;
            }
            if (checkForNoShows(cid)) {
                if ($("#Customer-MessageContainer")) {
                    $("#Customer-MessageContainer").remove();
                }

                txtSection.parentNode.parentNode.appendChild(
                    createMessageBox(type[0], "no_show")
                );
            }

            break;
        case "Contacts":
            txtSection.setAttribute(
                "method",
                `${chosen.getAttribute("method")}`
            );
            txtSection.setAttribute(
                "method-ID",
                `${chosen.getAttribute("method-ID")}`
            );
            break;
    }

    if (glComponentType == "split select") {
        txtSection.previousSibling.innerHTML =
            event.target.parentNode.firstElementChild.innerHTML;
    }

    //split input id by - in order to get the listType for clearing suggestion

    clearSuggestion(type[0]);
    listBox.style.animationDuration = "100ms";
    listBox.style.transform = "scaleY(0)";

    listBox.setAttribute("data-state", "closed");
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
let resetContacts = () => {
    document.querySelector("#Contacts-listBox").innerHTML = "";
    document.querySelector("#Contacts-choice").innerHTML = "";
    document.querySelector("#Contacts-info").innerHTML = "";
    document.querySelector("#Contacts-choice").removeAttribute("method");
    document.querySelector("#Contacts-choice").removeAttribute("method-id");
};
let filterListBox2 = (el, arrCu) => {
    let val = el.innerText.toUpperCase().replace(/\u00a0/g, " ");
    console.log(arrCu.filter((element) => element.customer_name.includes(val)));
    return customSort(
        val,
        arrCu.filter((element) => element.customer_name.includes(val))
    );
};
let filterListBox = (el, arrElements) => {
    let val = el.innerText;
    let arrNames = arrElements;
    let fl;
    console.log(arrElements.length);
    console.time("foreach");
    //Preprocess val to uppercase and replace non-breaking spaces
    const processedVal = val.toUpperCase().replace(/\u00a0/g, " ");

    fl = arrNames.filter((element) =>
        element.innerText
            .toUpperCase()
            .replace(/\u00a0/g, " ")
            .includes(processedVal)
    );
    //let ma = list.filter;
    console.log("new mapped array length = " + fl.length);
    console.log(fl);

    // Loop through arrNames
    // for (let i = 0; i < arrNames.length; i++) {
    //     let element = arrNames[i];
    //     // Preprocess element's innerText
    //     const processedText = element.innerText
    //         .toUpperCase()
    //         .replace(/\u00a0/g, " ");
    //     console.log(
    //         window.getComputedStyle(element).getPropertyValue("display")
    //     );
    //     if (processedText.includes(processedVal)) {
    //         if (
    //             window.getComputedStyle(element).getPropertyValue("display") ==
    //             "none"
    //         ) {
    //             element.style.display = "flex";
    //         }
    //     } else {
    //         if (
    //             window.getComputedStyle(element).getPropertyValue("display") ==
    //                 "block" ||
    //             window.getComputedStyle(element).getPropertyValue("display") ==
    //                 "flex"
    //         ) {
    //             element.style.display = "none";
    //         }
    //     }
    //}

    // arrNames.forEach((element) => {
    //     if (
    //         element.innerText
    //             .toUpperCase()
    //             .includes(val.toUpperCase().replace(/\u00a0/g, " "))
    //     ) {
    //         element.style.display = "flex";
    //     } else {
    //         element.style.display = "none";
    //     }
    // });
    console.timeEnd("foreach");
    //fl = arrNames;
    //fl =$('#Customer-listBox div:visible')
    //console.log('arrNames length ='+arrNames.length)

    return customSort(val, fl);
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

function buildExistingCustomersString(arrList) {
    let stringCustomers = "\n";
    console.log("existing customer array length is " + arrList.length);
    if (arrList.length == 1) {
        stringCustomers = `${
            arrList[0].first_name ? arrList[0].first_name : ""
        } ${arrList[0].last_name ? arrList[0].last_name : ""} at ${
            arrList[0].customer_name
        }`;
        return stringCustomers;
    }
    if (arrList.length > 1) {
        for (let i = 0; i < arrList.length; i++) {
            stringCustomers =
                stringCustomers +
                `${arrList[i].first_name ? arrList[i].first_name : ""} ${
                    arrList[i].last_name ? arrList[i].last_name : ""
                } at ${arrList[i].customer_name}${
                    i == arrList.length - 1
                        ? "."
                        : i == arrList.length - 2
                        ? " and "
                        : ", "
                }\n`;
        }

        return stringCustomers;
    }
}
/**
 * Function to create message box for imvalid input data
 * @param {*} lt /will be Customer, phone, email etc. It describes the input data
 * @param {*} messageType /describes the type i.e. invalid, existing number, not enough digits
 * @param {*} errorType /describes the type to determine background color. i.e error, warning
 * @param {*} objExistingCustomers /object of existing contacts that already have entered number or email associated with them.
 * @returns
 */
let createMessageBox = (lt, messageType, errorType, objExistingCustomers) => {
    let messageContainer = document.createElement("div");
    messageContainer.setAttribute("id", `${lt}-MessageContainer`);
    messageContainer.setAttribute("class", "messageContainer");

    let message = document.createElement("span");
    let messageText;

    switch (lt) {
        case "Customer":
            /**
             *  if no show message box add a link
             *  to the no show report
             */
            let name = document.querySelector("#Customer-choice").innerText;

            if (messageType == "no_show") {
                messageContainer.setAttribute(
                    "class",
                    "messageContainer warning"
                );
                messageText = document.createTextNode(
                    "CUSTOMER HAS NO-SHOW ON RECORD"
                );

                let link = document.createElement("span");
                link.setAttribute("class", "actionLink");
                let linkText = document.createTextNode("view");
                link.appendChild(linkText);
                link.addEventListener("click", () => {
                    ipc.send(
                        "open-report-window",
                        currentUser.role,
                        chosenCompanyID,
                        "no_shows",
                        name
                    );
                });
                message.appendChild(messageText);
                messageContainer.appendChild(message);
                messageContainer.appendChild(link);
            } else {
                messageText = document.createTextNode("CUSTOMER REQUIRED");
                message.appendChild(messageText);
                messageContainer.appendChild(message);
                messageContainer.setAttribute(
                    "class",
                    "messageContainer invalid"
                );
            }

            break;
        case "Unit":
        case "UnitType":
            messageText = document.createTextNode(`Unit OR UnitType REQUIRED`);
            message.appendChild(messageText);
            messageContainer.appendChild(message);
            messageContainer.setAttribute("class", "messageContainer invalid");
            break;
        case "phone":
        case "phone-add":
        case "email":
            if (messageType == "digits") {
                let addFromEditParent = document.getElementById(
                    `${lt}-add-MessageContainer`
                );
                let addFromAddParent = document.getElementById(
                    `${lt}-MessageContainer`
                );
                let digitError = document.getElementById(
                    `${lt}-digits-MessageContainer`
                );
                let existingError = document.getElementById(
                    `${lt}-existing-MessageContainer`
                );
                if (existingError) {
                    if (addFromEditParent) {
                        addFromEditParent.removeChild(existingError);
                    }
                    if (addFromAddParent) {
                        addFromAddParent.removeChild(existingError);
                    }
                }
                if (digitError) {
                    if (addFromEditParent) {
                        addFromEditParent.removeChild(digitError);
                    }
                    if (addFromAddParent) {
                        addFromAddParent.removeChild(digitError);
                    }
                    // document
                    //     .getElementById(`${lt}_message_container`)
                    //     .removeChild(digitError);
                }
                messageContainer.setAttribute(
                    "id",
                    `${lt}-digits-MessageContainer`
                );
                messageText = document.createTextNode(
                    `Number must be at least 10 digits`
                );

                message.appendChild(messageText);
                messageContainer.appendChild(message);
                messageContainer.setAttribute(
                    "class",
                    "messageContainer invalid"
                );

                break;
            }
            if (messageType == "invalid") {
                let invalidError = document.getElementById(
                    `${lt}-invalid-MessageContainer`
                );
                messageContainer.setAttribute(
                    "id",
                    `${lt}-invalid-MessageContainer`
                );

                if (invalidError) {
                    document
                        .getElementById(`${lt}_message_container`)
                        .removeChild(invalidError);
                }
                messageText = document.createTextNode(`Invalid email address`);
                message.appendChild(messageText);
                messageContainer.appendChild(message);
                messageContainer.setAttribute(
                    "class",
                    "messageContainer invalid"
                );
                break;
            }
            if (messageType == "existing") {
                // let link = document.createElement("span");
                // //link.setAttribute("class", "actionLink");
                // let linkText = document.createTextNode("view");
                // link.appendChild(linkText);
                // link.addEventListener("click", (event) => {
                //     let props = {};
                //     props.action = "edit";
                //     props.contacts = objExistingCustomers[0];
                //     props.customer_name = objExistingCustomers[0].customer_name;
                //     props.launcher = "edit page";

                //     props.customer_ID = objExistingCustomers[0].customer_ID;

                //     ipc.send("open-contacts-add", props);
                // });
                let addFromEditParent = document.getElementById(
                    `${lt}-add-MessageContainer`
                );
                let addFromAddParent = document.getElementById(
                    `${lt}-MessageContainer`
                );
                let existingError = document.getElementById(
                    `${lt}-existing-MessageContainer`
                );
                if (existingError) {
                    if (addFromEditParent) {
                        addFromEditParent.removeChild(existingError);
                    }
                    if (addFromAddParent) {
                        addFromAddParent.removeChild(existingError);
                    }
                    // document
                    //     .getElementById(`${lt}_message_container`)
                    //     .removeChild(existingError);
                }
                messageContainer.setAttribute(
                    "id",
                    `${lt}-existing-MessageContainer`
                );
                console.log(objExistingCustomers);
                messageText = document.createTextNode(
                    `*CAUTION* Number already associated with ${buildExistingCustomersString(
                        objExistingCustomers
                    )}`
                );
                message.appendChild(messageText);

                messageContainer.appendChild(message);
                //messageContainer.appendChild(link);
                if (errorType == "warning") {
                    messageContainer.setAttribute(
                        "class",
                        "messageContainer warning"
                    );
                } else {
                    messageContainer.setAttribute(
                        "class",
                        "messageContainer invalid"
                    );
                }

                break;
            }

            messageText = document.createTextNode(
                `Phone Number or Email REQUIRED`
            );
            message.appendChild(messageText);
            messageContainer.appendChild(message);
            messageContainer.setAttribute("class", "messageContainer invalid");
            break;

            break;
        // case 'email':
        //     break;
        // case 'phone':
        //     break;
        case "fName":
            messageText = document.createTextNode(`FIRST NAME REQUIRED`);
            message.appendChild(messageText);
            messageContainer.appendChild(message);
            messageContainer.setAttribute("class", "messageContainer invalid");
            break;
        // case 'last name':
        //     break;
        default:
            messageText = document.createTextNode(`${lt} REQUIRED`);
            message.appendChild(messageText);
            messageContainer.appendChild(message);
            messageContainer.setAttribute("class", "messageContainer invalid");
            break;
    }

    return messageContainer;
};

/**
 *
 * @param {string} item
 * @returns the string stripped of any html formating like &nbsp
 */
let removeSpecialCharacters = (item) => {
    let elem = document.createElement("textarea");
    elem.innerHTML = item.trim().toUpperCase();
    return elem.value;
};

function customSort(input, arr) {
    console.log("input is -" + input + "-");
    console.log(arr);
    if (input == "" || input == undefined) {
        console.log("input is -" + input + "-");
        return arr.sort((a, b) => (a.customer_name > b.customer_name ? 1 : -1));
    }
    return arr.sort((a, b) => {
        // Compare customer_name properties
        const nameA = a.customer_name.toLowerCase();
        const nameB = b.customer_name.toLowerCase();

        // Check if input matches at the beginning of the string
        const aStartsWithInput = nameA.startsWith(input.toLowerCase());
        const bStartsWithInput = nameB.startsWith(input.toLowerCase());

        // If both start with input or both don't start with input, sort alphabetically
        if (aStartsWithInput === bStartsWithInput) {
            return nameA.localeCompare(nameB);
        }

        // If only one starts with input, it comes first
        return aStartsWithInput ? -1 : 1;
    });
    // return arr.sort((a, b) => {
    //     const aIndex = a.customer_name
    //         .toLowerCase()
    //         .indexOf(input.toLowerCase());
    //     const bIndex = b.customer_name
    //         .toLowerCase()
    //         .indexOf(input.toLowerCase());

    //     // If both strings contain the input
    //     if (aIndex !== -1 && bIndex !== -1) {
    //         // Sort by index (i.e., earlier occurrence of input comes first)
    //         if (aIndex !== bIndex) {
    //             return aIndex - bIndex;
    //         }
    //         // If the same index, sort alphabetically
    //         return a.customer_name.localeCompare(b.customer_name);
    //     }
    //     // If only one string contains the input, it comes first
    //     else if (aIndex !== -1) {
    //         return -1;
    //     } else if (bIndex !== -1) {
    //         return 1;
    //     }
    //     // If neither string contains the input, sort alphabetically
    //     else {
    //         return a.customer_name.localeCompare(b.customer_name);
    //     }
    // });
}
