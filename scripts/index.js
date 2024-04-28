/*****************************
 * WORKFLOW APP written by Sean Davidson
 * For use at Frame & Spring in tracking daily movements
 * of vehicles/jobs using Node.js, Electron, and SQLite database.
 * Front end styled using CSS, javascript, and HTML5
 ******************************/

/***************
 * global variables
 ***************/
//import errLog from 'electron-log';

//const electron = require('electron')

//const ipc = electron.ipcRenderer
const date = new Date();
const arrPenultimateRow = ["wfw10", "wfw22", "wfw34", "wfw46", "wfw58"];
const arrLastRow = ["wfw11", "wfw23", "wfw35", "wfw47", "wfw59"];
const arrBottomHalf = [
    "wfw7",
    "wfw8",
    "wfw9",
    "wfw10",
    "wfw11",
    "wfw19",
    "wfw20",
    "wfw21",
    "wfw22",
    "wfw23",
    "wfw31",
    "wfw32",
    "wfw33",
    "wfw34",
    "wfw35",
    "wfw43",
    "wfw44",
    "wfw45",
    "wfw46",
    "wfw47",
    "wfw55",
    "wfw56",
    "wfw57",
    "wfw58",
    "wfw59",
    "pen7",
    "pen8",
    "pen9",
    "pen10",
    "pen11",
];

const arrShopLocations = [
    "wip0",
    "wip1",
    "wip2",
    "wip3",
    "wip4",
    "wip5",
    "wip6",
    "wip7",
    "wip8",
    "wip9",
    "wip10",
    "wip11",
];
let objPopUp = {};
let popupDate;
let objLoggedInUser;
let admin = false;
let totalCount = 0;
let lotCount = 0;
let scheduledCount = 0;
let completedCount = 0;
let completedJobs = [];

let openContent = createOpenContent();
let accessGrantedContent;
let allJobs;
let allCustomers;
let allCustomerNames = [];
let currentUser;
let scheduledSpots;
let wpuSpots;
var ns = "";
var frameCount = 0;
var springCount = 0;
var alignmentCount = 0;
var kingpinCount = 0;
var largestBucket = 0;

let saveTimer;

/*************
 * page load functions and event listeners
 ************/

window.onload = () => {
    console.log(window.devicePixelRatio);
    let pr = window.devicePixelRatio;
    ipc.send("zoom-level", pr);
    try {
        console.time("window.onload");
        objLoggedInUser = getLoggedInObject();

        allJobs = ipc.sendSync("pull_jobs");
        allCustomers = ipc.sendSync("get-customer-names");
        for (i = 0; i < allCustomers.length; i++) {
            allCustomerNames.push(allCustomers[i].customer_name);
        }

        accessGrantedContent = document.getElementById("contentArea").innerHTML;
        console.log(objLoggedInUser);
        if (objLoggedInUser.loggedIn == true) {
            console.log("from index.html onload in if statement");
            ipc.send("login-success", objLoggedInUser);
        } else {
            console.log("from onload...not logged in");
            document.getElementById("contentArea").innerHTML = openContent;
            document.getElementById("contentArea").style.display = "flex";
        }
        deselectExpiredOTL_Scheduled(allJobs);
    } catch (e) {
        logError(e);
    }
};
let getCustomerNames = (id) => {
    for (i = 0; i < allCustomers.length; i++) {
        if (allCustomers[i].customer_ID == id) {
            return allCustomers[i].customer_name;
        }
    }
    return undefined;
};
getLoggedInObject = () => {
    return ipc.sendSync("get-logged-in-user");
};

$("body").on("focus", ".popup", function () {
    $(this).datepicker();
});

$("body").on("keyup", ".whiteBoardContent", function () {
    // if()
    // saveWhiteBoard($(this))
});

$(function () {
    $("#datepickerScheduled").datepicker();
});

/*****************
 * handlers for communication from main process
 ****************/

ipc.on("all-jobs", (event, args) => {
    allJobs = ipc.sendSync("pull_jobs");
    loadJobs(allJobs);
});

//sent when app instance originated action
ipc.on("update-single-job", (event, job) => {
    console.log("update-single-job called from adding job", job);
    allJobs.push(job);
    countStatuses();
    if (job.status == "sch" || job.status == "noa") {
        fillScheduledJobsOnAdd(allJobs);
    } else {
        placeElement(job);
        $(`#${job.shop_location}`).on({
            mouseenter: (event) => {
                $(event.currentTarget).parent().find(".tooltip").style.display =
                    "block";
                console.log("yaboy");
            },
        });
    }

    fillScheduleGlimpse(allJobs);
});
ipc.on("ma-update-completed", (event, job) => {});
//sent when new customer added to update customer array
ipc.on("update-customer-array", (event, args) => {
    console.log(args);
    allCustomers.push(args);
    console.log("update customer array");
    console.log(allCustomers);
});

ipc.on("update", (event, args) => {
    console.log("update called from adding job");
    clearPage();
    allJobs = ipc.sendSync("pull_jobs");
    allCustomers = ipc.sendSync("get-customer-names");
    countStatuses();

    loadJobs(allJobs);
});

// ipc.on('count', (event,args)=>{
// 	countStatuses()
// })

ipc.on("reload", (event, args) => {
    loadJobs(args);
    countStatuses();
});

ipc.on("placeNewJob", (event, args) => {
    placeElement(args);
    countStatuses();
});

//show admin elements for admin user
ipc.on("show-admin-elements", (event, args) => {
    currentUser = args;
    admin = true;

    document.getElementById("contentArea").innerHTML = accessGrantedContent;
    document.getElementById("contentArea").style.display = "flex";
    document.getElementById("btnLogin").innerHTML = "Log Out";
    document.getElementById("login-message").innerHTML = `<b> ${
        args.user_name.charAt(0).toUpperCase() + args.user_name.slice(1)
    }</b>`;
    document.getElementById("topCounts").style.display = "flex";
    document.getElementById("btnContacts").style.display = "flex";
    document.getElementById("addNewJob").style.display = "flex";
    countStatuses();
    toggleAdminElements(admin);
    console.time("show-admin");
    loadJobs(allJobs);

    document.getElementById("whiteBoardContent").innerHTML = ipc.sendSync(
        "get-whiteboard",
        "read"
    );

    console.timeEnd("show-admin");
});

ipc.on("show-user-elements", (event, args) => {
    admin = false;
    currentUser = args;
    document.getElementById("contentArea").innerHTML = accessGrantedContent;
    document.getElementById("contentArea").style.display = "flex";
    document.getElementById("topCounts").style.display = "flex";
    document.getElementById("btnContacts").style.display = "flex";
    document.getElementById("btnLogin").innerHTML = "Log Out";
    document.getElementById("login-message").innerHTML = `${
        args.user_name.charAt(0).toUpperCase() + args.user_name.slice(1)
    }`;
    document.getElementById("addNewJob").style.display = "flex";
    countStatuses();
    toggleAdminElements(admin);
    loadJobs(allJobs);
    document.getElementById("whiteBoardContent").innerHTML = ipc.sendSync(
        "get-whiteboard",
        "read"
    );
});

ipc.on("whiteboard-updated", (event, args) => {
    console.log("white-board-updated");
    document.getElementById("whiteBoardContent").innerText = ipc.sendSync(
        "get-whiteboard",
        "read"
    );
    setCaretToEnd(document.getElementById("whiteBoardContent"));
});

/******************
 * functions for opening modal windows
 ******************/

function openLoginWindow() {
    objLoggedInUser = getLoggedInObject();

    switch (objLoggedInUser.loggedIn) {
        case undefined:
            console.log("loggedIn is undefined");
            ipc.send("open-login-window");
            break;
        case true:
            console.log("loggedIn is true");
            ipc.send("logout");
            logOutReset();
            break;
        case false:
            console.log("loggedIn is false");
            ipc.send("open-login-window");
    }
}
function logOutReset() {
    document.getElementById("btnLogin").innerHTML = "Log In";
    document.getElementById("btnAdmin").style.display = "none";
    document.getElementById("t").style.display = "none";
    document.getElementById("btnContacts").style.display = "none";
    document.getElementById("addNewJob").style.display = "none";
    document.getElementById("login-message").innerHTML = "&nbsp;";
    document.getElementById("contentArea").innerHTML = openContent;
}

function openContacts() {
    console.log(currentUser);
    ipc.send(
        "open-contacts",
        "main page",
        null,
        null,
        null,
        null,
        null,
        null,
        currentUser
    );
}

function openCalendar() {
    ipc.send("open-calendar", currentUser);
}

function openCreateUser() {
    ipc.send("open-create-user");
}
function openRestore() {
    ipc.send("open-restore");
}

function openReports() {
    attachDatePicker();
    $("#datepickerReport").focus();
    $("#datepickerReport").value = todayIs();
    console.log(currentUser.role);
    ipc.send("open-report-window", currentUser.role, undefined, currentUser);
}

function openAddJob() {
    ipc.send("open-add-job", currentUser);
}

//function to convert date to 3 digit day of year i.e. 365
function jDate(ds) {
    var ds = ds;
    var dayScheduled = new Date(ds);
    var julian = Math.ceil(
        (dayScheduled - new Date(dayScheduled.getFullYear(), 0, 0)) / 86400000
    );

    return julian;
}

function saveWhiteBoard(wb) {
    ipc.send(
        "get-whiteboard",
        "write",
        document.getElementById("whiteBoardContent").innerText
    );
}
function deselectExpiredOTL_Scheduled(jobs) {
    let today = new Date().getTime();
    let count = 0;
    jobs.forEach((item) => {
        let scheduledDate = new Date(item.date_scheduled).getTime();
        if (item.comeback_customer == 1 && today > scheduledDate) {
            ipc.send("deselect-OTL", item.job_ID);
        }
    });

    // console.log(count)
}

async function loadJobs(args) {
    fillScheduleGlimpse(args);

    createCompleted(args);

    //split args into scheduled and not scheduled
    const [arrScheduled, arrOnLot] = args.reduce(
        (result, element) => {
            result[
                element.status == "sch" || element.status == "noa" ? 0 : 1
            ].push(element);
            return result;
        },
        [[], []]
    );

    const [arrActiveOnLot, arrCompletedOnLot] = arrOnLot.reduce(
        (result, element) => {
            result[element.status != "wpu" ? 0 : 1].push(element);
            return result;
        },
        [[], []]
    );
    sortScheduled(arrScheduled);

    for (var member in arrScheduled) {
        arrScheduled[member].shop_location = `sch${member}`;
    }
    //console.log(arrSch)
    console.time("placeLotJobs");

    for (var member in arrActiveOnLot) {
        placeElement(arrActiveOnLot[member]);
    }
    console.log(arrCompletedOnLot);
    for (var member in arrCompletedOnLot) {
        arrCompletedOnLot[member].shop_location = `wpu${member}`;
        placeElement(arrCompletedOnLot[member]);
    }
    // for (var member in arrOnLot) {
    //     placeElement(arrOnLot[member]);
    // }
    console.timeEnd("placeLotJobs");
    console.time("placeSchJobs");
    for (var member in arrScheduled) {
        //arrSch[member].shop_location = ''
        placeElement(arrScheduled[member]);
    }
    console.timeEnd("placeSchJobs");
    $("#whiteBoardContent").on({
        blur: (event) => {},
        keydown: (event) => {
            if (event.key == "Tab") {
                event.preventDefault();
            }
        },
        keyup: (event) => {
            useTimer("stop", document.getElementById("whiteBoardContent"));
            useTimer("start", document.getElementById("whiteBoardContent"));
        },
    });
}

function setCaretToEnd(target) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(target);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    target.focus();
    range.detach(); // optimization

    // set scroll to the end if multiline
    target.scrollTop = target.scrollHeight;
}
ipc.on("typing", (event) => {
    console.log("typing called");
    document.querySelector("#bottom > .header").classList.add("typing");
});
ipc.on("not-typing", (event) => {
    console.log("not-typing called");
    document.querySelector("#bottom > .header").classList.remove("typing");
});

function useTimer(action, wb) {
    if (action == "start") {
        saveTimer = setTimeout(() => {
            saveWhiteBoard(wb);
            //ipc.send('typing','no')
        }, 10);
    }
    if (action == "stop") {
        clearTimeout(saveTimer);
    }
}
function fillScheduledJobsOnAdd(args) {
    let arrSch = args.filter((job) => {
        return job.status == "sch" || job.status == "noa";
    });
    //console.log(arrSch)
    let sorted = sortScheduled(arrSch);
    for (let i = 0; i < sorted.length; i++) {
        sorted[i].shop_location = `sch${i}`;
        //console.log(sorted[i].shop_location)
    }
    setTimeout(() => {
        for (let member in sorted) {
            placeElement(sorted[member]);
        }
    }, 100);
}
function createCompleted(args) {
    let arrCompleted = new Array();
    let wpuJobContainer = document.getElementById("wpuJobContainer");
    let spotsNeeded;

    //empty array of completed jobs
    if (arrCompleted.length > 0) {
        arrCompleted = [];
    }
    //fill array of completed jobs
    arrCompleted = args.filter((job) => {
        return job.status == "wpu";
    });
    // for(member in args){
    // 	(args[member].status == 'wpu')? arrCompleted.push(args[member]):'';
    // }
    //determine how many spots to create in container. Creating an extra two rows for flexibility
    spotsNeeded = Math.ceil(arrCompleted.length / 2 + 2) * 2;
    wpuSpots = spotsNeeded;
    //remove any elements that are already in the wpu container
    if (wpuJobContainer.hasChildNodes()) {
        while (wpuJobContainer.hasChildNodes()) {
            wpuJobContainer.childNodes[0].remove();
        }
    }

    //create elements and put them in wpu container
    for (i = 0; i < spotsNeeded; i++) {
        let div = document.createElement("div");
        div.setAttribute("id", "wpu" + i);
        div.setAttribute("class", "job");
        div.addEventListener("drop", (event) => {
            drop(event);
        });
        div.addEventListener("dragover", (event) => {
            allowDrop(event);
        });
        wpuJobContainer.appendChild(div);
    }
    return arrCompleted;
}

//function to group same date scheduled items for glimpse
function groupByKey(array, key) {
    return array.reduce((hash, obj) => {
        if (obj[key] === undefined) return hash;
        return Object.assign(hash, {
            [obj[key]]: (hash[obj[key]] || []).concat(obj),
        });
    }, {});
}
//function to sort scheduled by date and time of day
function sortScheduled(arrToSort) {
    /**
     * set variable for sort function below
     * direction: (1 ascending() (-1 descending)
     *
     */
    var naiveReverse = (string) => {
        //return string.split('/').reverse().join('');
        return string.substring(6);
    };

    //create year property to sort by year first so that 01/01/2023 doesnt show as first because of 01 being before others
    for (let sd in arrToSort) {
        arrToSort[sd].year = naiveReverse(arrToSort[sd].date_scheduled);
        switch (arrToSort[sd].job_type) {
            case "Frame":
                arrToSort[sd].job_type_order = "1";
                break;
            case "King Pin":
                arrToSort[sd].job_type_order = "2";
                break;
            case "Spring":
                arrToSort[sd].job_type_order = "3";
                break;
            case "Alignment":
                arrToSort[sd].job_type_order = "4";
                break;
            case "Check All":
                arrToSort[sd].job_type_order = "5";
                break;
            default:
                break;
        }
    }

    let sortBy = [
        {
            prop: "year",
            direction: 1,
        },
        {
            prop: "date_scheduled",
            direction: 1,
        },
        {
            prop: "time_of_day",
            direction: 1,
        },
        {
            prop: "job_type_order",
            direction: 1,
        },
    ];

    let x = arrToSort.sort(function (a, b) {
        let i = 0,
            result = 0;
        while (i < sortBy.length && result === 0) {
            result =
                sortBy[i]?.direction *
                (a[sortBy[i]?.prop].toString() < b[sortBy[i]?.prop].toString()
                    ? -1
                    : a[sortBy[i]?.prop].toString() >
                      b[sortBy[i]?.prop].toString()
                    ? 1
                    : 0);
            i++;
        }
        return result;
    });

    return x; //groupByKey(x,'date_scheduled')
}

//function to fill the scheduled glimpse section with scheduled jobs
function fillScheduleGlimpse(args) {
    //console.log(args)
    arrScheduledStatus = new Array();
    let wrapper = document.getElementById("ucWrapper");
    let schJobContainer = document.getElementById("schJobContainer");
    let objCustomerNames = allCustomers; //ipc.sendSync('get-customer-names')
    //console.log(objCustomerNames)
    //console.log(allCustomers)
    if (wrapper.hasChildNodes()) {
        for (i = 2; i < wrapper.childNodes.length; i++) {
            wrapper.childNodes[i].remove();
        }
    }

    if (arrScheduledStatus.length > 0) {
        arrScheduledStatus = [];
    }
    wrapper.innerHTML = "";
    console.time("filterSched");

    arrScheduledStatus = args.filter((job) => {
        return (
            job.status == "sch" ||
            job.comeback_customer == 1 ||
            job.status == "noa"
        );
    });

    // for(member in args){
    // 	//comeback_customer field is now used to display "on the lot & scheduled"
    // 	(args[member].status == 'sch' || args[member].comeback_customer == 1 || args[member].status == 'noa')? arrScheduledStatus.push(args[member]):'';
    // }
    console.timeEnd("filterSched");
    /**
     * create job containers for view all
     */

    let spotsNeeded = Math.ceil(arrScheduledStatus.length / 5 + 2) * 5;
    scheduledSpots = spotsNeeded;
    if (schJobContainer.hasChildNodes()) {
        while (schJobContainer.hasChildNodes()) {
            schJobContainer.childNodes[0].remove();
        }
    }
    for (i = 0; i < spotsNeeded; i++) {
        let div = document.createElement("div");
        div.setAttribute("id", "sch" + i);
        div.setAttribute("class", "job");
        div.addEventListener("drop", (event) => {
            drop(event);
        });
        div.addEventListener("dragover", (event) => {
            allowDrop(event);
        });
        schJobContainer.appendChild(div);
    }

    let arrSort = sortScheduled(arrScheduledStatus); //groupByKey(x,'date_scheduled')
    let arrSD = groupByKey(arrSort, "date_scheduled");

    let k = Object.keys(arrSD);
    let v = Object.values(arrSD);

    let glimpse;
    let head;
    let tDate;
    let data;
    let glimpseID;
    let glimpseContext;

    for (j = 0; j < k.length; j++) {
        glimpse = document.createElement("div");
        glimpse.setAttribute("class", "upcomingBox");

        head = document.createElement("div");
        let date = new Date(k[j]);
        let days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        let day = days[date.getDay()];
        hText = document.createTextNode(day + " " + k[j]);
        head.setAttribute("class", "glimpseHead");
        head.appendChild(hText);
        glimpse.appendChild(head);
        for (i = 0; i < v[j].length; i++) {
            data = document.createElement("div");
            data.setAttribute("class", "glimpseData");
            glimpseContext = document.createElement("div");
            glimpseContext.setAttribute("class", "glimpse-context-menu");
            glimpseContext.setAttribute("id", `gc${v[j][i].job_ID}`);
            data.setAttribute("id", `gli${v[j][i].job_ID}`);
            let idj = v[j][i].job_ID;
            let hovered = false;

            data.addEventListener("contextmenu", (event) => {
                event.stopPropagation();
                event.preventDefault();
                createGlimpsePopUp(event);
            });

            let schedItem = document.createElement("div");
            schedItem.setAttribute("class", "glimpseItem");
            $(data).on({
                mouseenter: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    createGlimpseToolTip(event.currentTarget);
                },
                mouseleave: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    let t = $(event.currentTarget)
                        .parent()
                        .find(".glimpseToolTip");
                    //console.log(event.currentTarget)
                    //console.log(event.relatedTarget)
                    //console. log('they are siblings '+$(event.currentTarget).siblings().is(event.relatedTarget))
                    //console.log(event.relatedTarget.getAttribute('class'))
                    if (
                        event.relatedTarget.getAttribute("class") !=
                            "glimpseToolTip" &&
                        event.relatedTarget.nodeName != "B"
                    ) {
                        $(t).fadeOut(75);
                    }
                },
            });
            let tt = document.createElement("div");
            tt.setAttribute("class", "tooltip glimpseToolTip");
            tt.setAttribute("id", `gtt${v[j][i].job_ID}`);
            tt.setAttribute("data-job", v[j][i]);

            let jobType = document.createElement("div");
            let color;

            switch (v[j][i].job_type) {
                case "Spring":
                    color = "#5e81ad";
                    break;
                case "Check All":
                    color = "#ff9e0c";
                    break;
                case "Alignment":
                    color = "#ad5ea8";
                    break;
                case "King Pin":
                    color = "#5ead63";
                    break;
                case "Frame":
                    color = "#ff2d00";
                    break;
                default:
                    break;
            }
            let textColor; //color of the am pm text

            let n; // variable to hold customer name text from db
            let name = document.createElement("div"); // container for customer name

            let morning = document.createElement("i");
            morning.setAttribute("class", "fa-regular fa-a");
            let afternoon = document.createElement("i");
            afternoon.setAttribute("class", "fa-regular fa-p");
            let m = document.createElement("i");
            m.setAttribute("class", "fa-regular fa-m");
            let coming = document.createElement("i");
            coming.setAttribute("class", "fa-solid fa-truck-moving");
            name.setAttribute("class", "glimpseCustomer");
            let otl = document.createElement("i");

            let textotl = document.createTextNode("OTL");
            otl.appendChild(textotl);

            let tJT = document.createElement("i");

            switch (v[j][i].time_of_day) {
                case "am":
                    textColor = "am";
                    if (v[j][i].comeback_customer == 1) {
                        tJT = otl;
                        break;
                    }
                    tJT = morning;
                    break;
                case "pm":
                    textColor = "pm";
                    if (v[j][i].comeback_customer == 1) {
                        tJT = otl;
                        break;
                    }
                    tJT = afternoon;
                    break;
                default:
                    textColor = "dropOff";
                    if (v[j][i].comeback_customer == 1) {
                        tJT = otl;
                        break;
                    }
                    tJT = coming;
                    break;
            }
            jobType.setAttribute("class", `colorBlock ${textColor}`);
            jobType.setAttribute("style", `background-color:${color}`);

            for (member in objCustomerNames) {
                if (
                    objCustomerNames[member].customer_ID == v[j][i].customer_ID
                ) {
                    n = objCustomerNames[member].customer_name;
                }
            }
            let tName = document.createTextNode(n.toUpperCase()); //customer name textNode

            jobType.appendChild(tJT);
            if (tJT != coming && v[j][i].comeback_customer != 1) {
                jobType.appendChild(m);
            }

            schedItem.appendChild(jobType);
            name.appendChild(tName);
            schedItem.appendChild(name);
            data.appendChild(schedItem);

            glimpse.appendChild(data);
            glimpse.appendChild(glimpseContext);
            glimpse.appendChild(tt);
        }

        wrapper.appendChild(glimpse);
    }
}

let createGlimpseToolTip = (e) => {
    let rect = e.getBoundingClientRect();
    let jobID = e.id.substring(3);
    let objJob;
    let objContact;

    for (i = 0; i < allJobs.length; i++) {
        if (jobID == allJobs[i].job_ID) {
            objJob = allJobs[i];

            break;
        }
    }

    let ttBox = document.getElementById(`gtt${jobID}`);
    let cn;
    for (i = 0; i < allCustomerNames.length; i++) {
        if (allCustomers[i].customer_ID == objJob.customer_ID) {
            cn = allCustomers[i].customer_name;
        }
    }

    if (
        objJob.number_ID != null &&
        objJob.number_ID != "" &&
        objJob.number_ID != "null"
    ) {
        objContact = ipc.sendSync(
            "db-get-contact-name",
            "phone",
            objJob.number_ID
        );
        contactName = `${objContact?.first_name ?? ""} ${
            objContact?.last_name ?? ""
        }`;
    } else if (objJob.email_ID != null && objJob.email_ID != "") {
        objContact = ipc.sendSync(
            "db-get-contact-name",
            "email",
            objJob.email_ID
        );
        contactName = `${objContact?.first_name ?? ""} ${
            objContact?.last_name ?? ""
        }`;
    } else {
        contactName = "No Contact";
    }

    let cuN =
        "<span class='ttCustomerName'><b>" +
        cn.toUpperCase() +
        "</b><br/></span>";
    let dIn =
        objJob.date_in == null
            ? ""
            : "<b>Date In:</b>" + objJob.date_in + "<br/>";
    let jt =
        objJob.job_type == null
            ? ""
            : "<b>Job Type:</b>" + objJob.job_type + "<br/>";
    //let ec = (objJob.estimated_cost == undefined || objJob.estimated_cost =='') ? '': '<b>Est Cost:</b> $'+objJob.estimated_cost+'</br>'
    let u =
        objJob.unit == null || objJob.unit == ""
            ? ""
            : "<b>Unit #: </b>" + objJob.unit + "</br>";
    let ut =
        objJob.unit_type == null || objJob.unit_type == ""
            ? ""
            : "<b>Unit Type: </b>" + objJob.unit_type + "</br>";
    //let sd = (objJob.date_scheduled != null) ? (objJob.designation == 'Scheduled')?'<b>Sched. Date: </b>':'<b> Drop Off Date:' +objJob.date_scheduled+' '+objJob.time_of_day+'<br/>': ''
    let sd;
    if (objJob.date_scheduled != null) {
        if (objJob.designation == "Scheduled") {
            sd =
                "<b>Sched. Date: </b>" +
                objJob.date_scheduled +
                objJob.time_of_day +
                "<br/>";
        } else if (objJob.designation == "Coming - No Appt") {
            sd =
                "<b>Dropping Off - No Appt: </b>" +
                objJob.date_scheduled +
                "<br/>";
        } else {
            sd = "";
        }
    }
    let dc =
        objJob.date_called != null
            ? `<b>Date Called: </b>` + objJob.date_called + "<br/>"
            : "";
    //let toolTipClass = (arrBottomHalf.includes(objJob.shop_location))?'tooltipLast': (arrShopLocations.includes(objJob.shop_location))?'tooltipRight':'tooltip'
    let con = `<b>Contact: </b> ${contactName}<br/>`;
    let n =
        objJob.notes != null ? "<b>Notes: </b>" + objJob.notes + "</br>" : "";
    let it =
        typeof objContact != "undefined"
            ? objContact.item.includes("@")
                ? "<b>Email: </b>" + objContact.item + "</br>"
                : "<b>Phone: </b>" + objContact.item + "</br>"
            : "";

    ttBox.innerHTML = ` <div>
		${cuN}
		<hr>
		${con}
		${it}
		<hr>
		
		${jt}		
		${u}
		${ut}		
		
		${n}
		<hr>
		${dIn}
		${sd}
		${dc}
		
	</div>`;

    ttBox.style.display = "block";
    ttBox.style.top = rect.top;
    ttBox.style.left = rect.left + 180;

    let tRect = ttBox.getBoundingClientRect();

    //if tooltip extends beyond bottom of window, shift up highr so that it doesnt trigger scroll bar
    if (tRect.bottom > window.innerHeight) {
        let shift = window.innerHeight - tRect.height - 30;
        ttBox.style.top = shift;
    }
    $(ttBox).on({
        mouseleave: (event) => {
            event.stopPropagation();
            let tt_id = event.currentTarget.id.substring(3);
            let rt_id =
                event.relatedTarget.parentNode.parentNode.id.substring(3);

            if (tt_id != rt_id) {
                $(ttBox).fadeOut(75);
            }
        },
    });
};

function createGlimpsePopUp(element) {
    let e = element.currentTarget;
    let rect = e.getBoundingClientRect();
    let jobID = e.id.substring(3);
    let objJobData = pullJob(jobID);
    let thisMenu = document.getElementById(`gc${e.id}`);
    let cn;
    for (i = 0; i < allCustomerNames.length; i++) {
        if (allCustomers[i].customer_ID == objJobData.customer_ID) {
            cn = allCustomers[i].customer_name;
        }
    }
    objJobData.customer_name = cn;
    for (member in allJobs) {
        if (document.getElementById("gc" + allJobs[member].job_ID)) {
            document.getElementById(
                "gc" + allJobs[member].job_ID
            ).style.display = "none";
            document.getElementById(
                `gtt${allJobs[member].job_ID}`
            ).style.display = "none";
        }
    }

    let menuBox = document.getElementById("gc" + e.id.substring(3));

    let item1Box = document.createElement("span");
    let item2Box = document.createElement("span");
    let item3Box = document.createElement("span");
    let item4Box = document.createElement("span");
    let item1Text;
    let item2Text;
    let item3Text;
    let item4Text;

    menuBox.style.display = "block";
    menuBox.style.top = rect.top;
    menuBox.innerHTML = "";

    item1Text = document.createTextNode("EDIT");
    item1Box.appendChild(item1Text);
    item1Box.setAttribute("class", "item");
    item1Box.setAttribute("id", "edit" + e.id.substr(4));
    item1Box.addEventListener("click", (event) => {
        menuBox.style.display = "none";
        ipc.send("open-edit", objJobData, "context-menu", currentUser);
    });

    item2Text = document.createTextNode("NO-SHOW");
    item2Box.appendChild(item2Text);
    item2Box.setAttribute("class", "item");
    item2Box.setAttribute("id", "noshow" + e.id.substr(4));
    item2Box.addEventListener("click", (event) => {
        menuBox.style.display = "none";
        objNoshow = new Object();
        objNoshow.job_ID = objJobData.job_ID;
        objNoshow.no_show = 1;
        objNoshow.active = 0;
        ipc.send(
            "update-job",
            objNoshow,
            "context-menu",
            currentUser,
            getCustomerNames(objJobData.customer_ID)
        );
        e.remove();
    });

    item3Text = document.createTextNode("SEND TO LOT");
    item3Box.appendChild(item3Text);
    item3Box.setAttribute("class", "item");
    item3Box.setAttribute("id", "send" + e.id.substr(4));
    item3Box.addEventListener("click", (event) => {
        menuBox.style.display = "none";
        objLot = new Object();
        objLot.job_ID = objJobData.job_ID;
        objLot.shop_location = "";
        objLot.status = "wfw";
        objLot.designation = "On the Lot";
        objLot.date_in = todayIs();
        ipc.send(
            "update-job",
            objLot,
            "context-menu",
            currentUser,
            getCustomerNames(objJobData.customer_ID)
        );
        e.remove();
    });
    item4Text = document.createTextNode("CANCEL APPT");
    item4Box.appendChild(item4Text);
    item4Box.setAttribute("class", "item");
    item4Box.setAttribute("id", "send" + e.id.substr(4));
    item4Box.addEventListener("click", (event) => {
        menuBox.style.display = "none";
        objCancel = new Object();
        objCancel.job_ID = objJobData.job_ID;
        objCancel.cancelled = 1;
        objCancel.active = 0;
        ipc.send(
            "update-job",
            objCancel,
            "context-menu",
            currentUser,
            getCustomerNames(objJobData.customer_ID)
        );
        e.remove();
    });
    menuBox.appendChild(item1Box);
    menuBox.appendChild(item2Box);
    menuBox.appendChild(item3Box);
    menuBox.appendChild(item4Box);

    $(".glimpse-context-menu").on("mouseleave", function () {
        $(this).fadeOut(250);
    });

    setTimeout(() => {
        if ($(`.glimpse-context-menu:hover`).length == 0) {
            $(`.glimpse-context-menu`).fadeOut(250);
        }
    }, 7000);
    document.onclick = function (ev) {
        if (ev.target.id !== `gc${e.id}`) {
            $(`.glimpse-context-menu`).fadeOut(250);
        }
    };
}

function countStatuses() {
    totalCount = 0;
    scheduledCount = 0;
    lotCount = 0;
    completedCount = 0;
    let shopCount = 0;

    for (let job in allJobs) {
        if (allJobs[job].status != "sch") {
            totalCount += 1;
        }
        if (allJobs[job].status == "wfw" || allJobs[job].status === "pen") {
            lotCount += 1;
        }
        if (allJobs[job].status == "wip") {
            shopCount += 1;
        }
        if (allJobs[job].status == "sch") {
            scheduledCount += 1;
        }
        if (allJobs[job].status == "wpu") {
            completedCount += 1;
        }
    }
    fillCountBoxes(
        lotCount,
        shopCount,
        scheduledCount,
        totalCount,
        completedCount
    );
}

function fillCountBoxes(lot, shop, scheduled, total, completed) {
    document.getElementById("totCount").innerHTML = total;
    document.getElementById("lotCount").innerHTML = lot;
    document.getElementById("schCount").innerHTML = scheduled;
    document.getElementById("shopCount").innerHTML = shop;
    document.getElementById("completedCount").innerHTML = completed;
}

function toggleAdminMenu() {
    let menuBox = document.getElementById("adminMenu");

    //destroy menu items
    if (menuBox.hasChildNodes()) {
        while (menuBox.hasChildNodes()) {
            menuBox.childNodes[0].remove();
        }
    }

    //create menu items

    let objMenuItems = [
        {
            text: "Users",
            // 'submenu': [{
            // 	text : 'Create User'
            // },
            // {
            // 	text : 'Delete User'
            // },
            // {
            // 	text : 'Change Passowrd'
            // }]
        },
        {
            text: "Reports",
            // 'submenu': [{
            // 	text : 'EOD'
            // },
            // {
            // 	text : 'No-Shows'
            // }]
        },
        {
            text: "Restore DB",
        },
    ];
    let menuItem;
    let menuText;
    let subMenu;
    let subMenuItem;
    let subMenuItemText;
    for (item in objMenuItems) {
        menuItem = document.createElement("div");
        menuText = document.createTextNode(objMenuItems[item].text);
        menuItem.setAttribute("class", "adminMenuItem");
        menuItem.setAttribute("id", "adminMenuItem" + item);
        menuItem.appendChild(menuText);

        if (objMenuItems[item].hasOwnProperty("submenu")) {
            subMenu = document.createElement("div");
            subMenu.setAttribute("class", "adminMenu adminSubMenu");
            subMenu.setAttribute("id", "adminMenuItem" + item + "subMenu");

            for (i in objMenuItems[item].submenu) {
                subMenuItem = document.createElement("div");
                subMenuItemText = document.createTextNode(
                    objMenuItems[item].submenu[i].text
                );
                subMenuItem.setAttribute("class", "adminMenuItem");
                subMenuItem.setAttribute(
                    "id",
                    "adminMenuItem" + item + "subItem" + i
                );
                subMenuItem.appendChild(subMenuItemText);
                subMenu.appendChild(subMenuItem);
            }
            menuItem.appendChild(subMenu);
        }

        menuBox.appendChild(menuItem);

        document.onmouseover = function (ev) {
            ev.stopPropagation();
            displaySubMenu(ev.target, ev.relatedTarget);
        };

        document.onclick = function (event) {
            dosomething(event.target);
        };
    }

    menuBox.style.display = "block";
}

function dosomething(e) {
    let adminMenu = document.getElementById("adminMenu");
    let caller = document.getElementById(e.id);
    //alert(e.id)
    //is it an admin menu item
    if (adminMenu.contains(caller)) {
        //does it have a submenu
        if (e.childNodes.length < 2) {
            adminMenu.style.display = "none";

            //which menu item was clicked
            switch (e.innerHTML) {
                case "EOD":
                    openReports();
                    break;
                case "Restore DB":
                    openRestore();
                    break;
                case "Users":
                    openCreateUser();
                    break;
                case "Reports":
                    openReports();
                default:
                    break;
            }
        } else {
        }
    }
}
function displaySubMenu(objCaller, pc) {
    try {
        //variables

        let menuOpen = true;
        let subMenuOpen = false;
        let cID = objCaller.id;
        let isParent;
        let menuType;
        let adminMenu = document.getElementById("adminMenu");
        let caller =
            typeof objCaller === "object"
                ? document.getElementById(objCaller.id)
                : null;

        let isMenu = adminMenu.contains(caller);
        if (isMenu) {
            menuType =
                typeof caller.id != undefined
                    ? caller.id.includes("sub")
                        ? "sub"
                        : "top"
                    : "";

            isParent = caller.childNodes.length >= 2;

            //methods
            let showSubMenu = function () {
                //document.getElementById(cID+'subMenu').style.display = 'block'
                subMenuOpen = true;
            };
            let closeSubMenu = function () {
                document.getElementById(cID + "subMenu").style.display = "none";
                subMenuOpen = false;
            };
            let closeMenu = function () {
                adminMenu.style.display = "none";
                menuOpen = false;
            };
            let setTimer = function () {};
            let menuHasHover = function () {
                let x = 0;
                let hover;

                if (menuType == "sub") {
                    //check submenu for hover
                    for (i = 0; i < caller.parentNode.childNodes.length; i++) {
                        x += $(
                            `#${caller.parentNode.childNodes[i].id}:hover`
                        ).length;
                    }
                    //check top menu for hover
                    for (i = 0; i < adminMenu.childNodes.length; i++) {
                        x += $(`#${adminMenu.childNodes[i].id}:hover`).length;
                    }
                } else if (menuType == "top") {
                    //check top menu for cover
                    for (i = 0; i < adminMenu.childNodes.length; i++) {
                        x += $(`#${adminMenu.childNodes[i].id}:hover`).length;
                    }
                }

                hover = x > 0 ? true : false;
                return hover;
            };

            //main process
            if (caller && isMenu) {
                if (menuType == "top") {
                    if (isParent) {
                        showSubMenu();
                    }
                    setTimeout(() => {
                        if (!menuHasHover()) {
                            closeMenu();
                        }
                    }, 50);
                    $(`#${caller.id}`).mouseleave(function () {
                        setTimeout(() => {
                            if (!menuHasHover()) {
                                closeMenu();
                            } else {
                                if (subMenuOpen) {
                                    closeSubMenu();
                                }
                            }
                        }, 50);
                    });
                } else if (menuType == "sub") {
                    setTimeout(() => {
                        if (!menuHasHover()) {
                            if (subMenuOpen) {
                                closeSubMenu();
                            }
                            closeMenu();
                        }
                    }, 50);
                    $(`#${caller.id}`).mouseleave(function () {
                        setTimeout(() => {
                            if (!menuHasHover()) {
                                if (subMenuOpen) {
                                    closeSubMenu();
                                }
                            }
                        }, 50);
                    });
                }
            } //end main process
        }
    } catch (e) {
        logError(e);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
}

function drag(ev) {
    try {
        let img = new Image();
        img.src = "../images/semi4.png";
        ev.dataTransfer.setData("Text", ev.target.id);
        document.getElementById(
            ev.currentTarget.childNodes[1].id
        ).style.display = "none";
        document.getElementById(
            "context-Menu-" + ev.currentTarget.id.substr(4)
        ).style.display = "none";
        ev.dataTransfer.setDragImage(img, -20, -20);
    } catch (e) {
        logError(e);
    }
}

async function changeLocation(targetID, cellOccupied, data, draggedContainer) {
    try {
        ns = targetID;
        let newStatus;

        let id = data.substr(4);
        console.log(data, draggedContainer.id);
        // let oldStatus = document
        //     .getElementById(data)
        //     .parentNode.id.substr(0, 3)
        //     .toLowerCase();
        let oldStatus = draggedContainer.id.substr(0, 3).toLowerCase();
        console.log(oldStatus + " on changeLocation");
        let newLocation;

        let thisJob;

        let objMoving = new Object();

        if (cellOccupied) {
            newStatus = ns.substring(0, 3).toLowerCase();

            if (
                newStatus == "wpu" ||
                newStatus == "sch" ||
                newStatus == "SCH"
            ) {
                objMoving.status = newStatus;

                if (newStatus == "sch" || newStatus == "SCH") {
                    objMoving.designation = "Scheduled";
                }

                for (member in allJobs) {
                    if (id == allJobs[member].job_ID) {
                        let getSpot = new Object();
                        getSpot.job_type = allJobs[member].job_type;
                        getSpot.status = newStatus;
                        newLocation = findSpot(getSpot);
                        objMoving.shop_location = newLocation;
                        objMoving.date_in = allJobs[member].date_in;
                        objMoving.job_ID = id;
                        objMoving.customer_ID = allJobs[member].customer_ID;
                    } else {
                        objMoving.date_in = null;
                        objMoving.job_ID = id;
                    }
                }
            }
        } else {
            newStatus = ns.substring(0, 3).toLowerCase();
            newLocation = ns; //ev.target.id
            objMoving.status = newStatus;
            objMoving.shop_location = newLocation;
            objMoving.designation = "On the Lot";

            // determine whether the job is being dragged from scheduled to on the lot
            // and set date_in accordingly.
            if (oldStatus == "sch" && newStatus != "sch") {
                objMoving.date_in = todayIs();
            } else {
                for (member in allJobs) {
                    if (id == allJobs[member].job_ID) {
                        objMoving.date_in = allJobs[member].date_in;
                    }
                }
            }
            console.log(oldStatus, newStatus);
            switch (oldStatus) {
                case "sch":
                    break;
                case "wpu":
                    console.log("wpu triggered");
                    if (newStatus != "wpu") {
                        console.log("completed moved");
                        objMoving.date_completed = null;
                    }
                    break;
                default:
                    break;
            }
            objMoving.job_ID = id;
            let custID;
            for (member in allJobs) {
                if (id == allJobs[member].job_ID) {
                    custID = allJobs[member].customer_ID;
                }
            }
            console.time("client");
            let cn = getCustomerNames(custID);
            console.timeEnd("client");
            console.log(objMoving);
            console.time("save-drop-info");
            ipc.send("edit-location-drop", objMoving, currentUser, cn);
            //let editedJob = ipc.sendSync('edit-location-drop', objMoving, currentUser,cn)
            console.timeEnd("save-drop-info");

            //determine whether new location is at bottom of page and reset
            //tooltip class accordingly
            let t = document.getElementById(newLocation);

            let tt = t.firstChild?.childNodes[1];
            let tooltip = arrBottomHalf.includes(newLocation)
                ? "tooltipLast"
                : arrShopLocations.includes(newLocation)
                ? "tooltipRight"
                : "tooltipDefault";
            if (tt) tt.className = `tooltip ${tooltip}`;

            //jquery function to bind the hover event to the created element

            $(".vehicle").on("mouseenter", function (event) {
                $(this).find(".tooltip").fadeIn(50);
            });
            $(".vehicle").on("mouseleave", function (event) {
                $(this).find(".tooltip").fadeOut(50);
            });
            // $('.vehicle').on('mouseenter',function(event) {

            // 	$(this).find('.toolTipBottom').fadeIn(50);
            // });

            // $('.vehicle').on('mouseleave',function(event) {

            // 	$(this).find('.toolTipBottom').fadeOut(50);
            // });
            // $('.vehicle').on('mouseenter',function(event) {

            // 	$(this).find('.tooltipLast').fadeIn(50);
            // });

            // $('.vehicle').on('mouseleave',function(event) {

            // 	$(this).find('.tooltipLast').fadeOut(50);
            // });
            // $('.vehicle').on('mouseenter',function(event) {

            // 	$(this).find('.tooltipRight').fadeIn(50);
            // });

            // $('.vehicle').on('mouseleave',function(event) {

            // 	$(this).find('.tooltipRight').fadeOut(50);
            // });

            countStatuses();
        }
    } catch (e) {
        logError(e);
    }

    return true;
}
function drop(ev) {}

let dragged = null;

document.addEventListener("dragstart", (event) => {
    // store a ref. on the dragged elem
    dragged = event.target;
    console.log(dragged);
});

document.addEventListener("dragover", (event) => {
    // prevent default to allow drop
    event.preventDefault();
});
document.addEventListener("drop", async (event) => {
    // prevent default action (open as link for some elements)
    event.preventDefault();
    event.stopPropagation();
    console.log(event.target);
    let notTrashCan =
        event.target.id == "t" || event.target.id == "imgTrashCan"
            ? false
            : true;
    //if(event.target.id =='t' || event.target.id == 'imgTrashCan') return
    console.time("dropEvent");
    let cellOccupied = notTrashCan
        ? document.getElementById(event.target.id)
            ? document.getElementById(event.target.id).hasChildNodes()
            : true
        : false;
    let isJobIndicator = document
        .getElementById(event.target.id)
        .classList?.contains("jobIndicator")
        ? true
        : false;
    let isJobCat = document
        .getElementById(event.target.id)
        .classList?.contains("jobCat")
        ? true
        : false;
    if (cellOccupied || isJobIndicator || isJobCat) {
        console.log("has kids");
    } else {
        let draggedID = dragged.id;
        let draggedContainer = dragged.parentNode;
        let targetID = event.target.id;

        dragged.parentNode.removeChild(dragged);
        event.target.appendChild(dragged);
        console.timeEnd("dropEvent");
        if (notTrashCan) {
            changeLocation(targetID, cellOccupied, draggedID, draggedContainer);
        }
    }
});

function deleteCompletedJobs() {
    try {
        let arrCompletedJobIDs = allJobs
            .filter((job) => {
                return job.status == "wpu";
            })
            .map((job) => {
                return job.job_ID;
            });
        console.log(arrCompletedJobIDs);
        //console.table(ipc.sendSync('dev-activate-completed'))
        ipc.send("deactivate-all", arrCompletedJobIDs, currentUser);
    } catch (e) {
        logError(e);
    }
}

function delay(t) {
    return new Promise((resolve) => {
        setTimeout(resolve, t);
    });
}
async function shuffle(completedJobs) {
    for (let member in completedJobs) {
        await delay(10);
        placeElement(completedJobs[member]);
    }
}
function deleteDrop(ev) {
    let deactivate = ev.dataTransfer.getData("Text").substr(4);
    //let data = ev.dataTransfer.getData("Text");
    completedJobs = ipc.sendSync("deactivate", deactivate, currentUser);

    createCompleted(completedJobs);
    for (let cj in completedJobs) {
        console.log(completedJobs[cj]);
        //document.getElementById(completedJobs[cj].shop_location).innerHTML = "";
        completedJobs[cj].shop_location = "";
    }

    shuffle(completedJobs).then(() => {
        console.log("all done");
    });
}
function moveTOCompleted(args) {
    //completedJobs = ipc.sendSync("deactivate", deactivate, currentUser);

    //createCompleted(completedJobs);

    console.log(args);
    document.getElementById(args.shop_location).innerHTML = "";
    args.shop_location = "";

    shuffle(args).then(() => {
        console.log("all done");
    });
}

function openBox(e, event) {
    var event = event;

    if (e.hasChildNodes) var count = 0;

    switch (e.id) {
        case "compBox":
            $(document).on("click", function (event) {
                if (
                    !$(event.target).closest("#wpuBox").length &&
                    !$(event.target).closest("#compBox").length
                ) {
                    document.getElementById("wpuBox").style.display = "none";
                }
            });

            switch (document.getElementById("wpuBox").style.display) {
                case "none":
                case "":
                    document.getElementById("wpuBox").style.display = "block";

                    break;
                case "block":
                    if (!e.hasChildNodes()) {
                        document.getElementById("wpuBox").style.display =
                            "none";
                    }
                    break;
            }
            break;

        case "SCH":
            switch (document.getElementById("schBox").style.display) {
                case "none":
                case "":
                    break;
                case "block":
                    document.getElementById(
                        "calendar-container"
                    ).style.display = "block";
                    break;
            }
            break;

        case "viewCal":
            switch (
                document.getElementById("calendar-container").style.display
            ) {
                case "none":
                case "":
                    document.getElementById(
                        "calendar-container"
                    ).style.display = "block";

                    resetCalendar();
                    setCalendarMonth();
                    break;
                case "block":
                    document.getElementById(
                        "calendar-container"
                    ).style.display = "none";
                    break;
            }
            break;
        case "viewAll":
            $(document).on("click", function (event) {
                if (
                    !$(event.target).closest("#schBox").length &&
                    event.target.id != "viewAll"
                ) {
                    document.getElementById("schBox").style.display = "none";
                    //   document.getElementById('schBox').classList.remove('fadeIn')
                    document.getElementById("schBox").classList.add("fadeOut");
                }
            });
            switch (document.getElementById("schBox").style.display) {
                case "none":
                case "":
                    document
                        .getElementById("schBox")
                        .classList.remove("fadeOut");
                    document.getElementById("schBox").classList.add("fadeIn");
                    document.getElementById("schBox").style.display = "block";
                    break;
                case "block":
                    //document.getElementById("schBox").style.display = "none";
                    break;
            }
            break;

        default:
            break;
    }
}

function closeBox(ev, e) {
    switch (e.parentNode.id) {
        case "wpuBoxHeader":
            document.getElementById("wpuBox").style.display = "none";
            break;
        case "wfpBoxHeader":
            document.getElementById("wfpBox").style.display = "none";
            break;
        case "schBoxHeader":
            document.getElementById("schBox").style.display = "none";
            break;
        case "posBoxHeader":
            document.getElementById("posBox").style.display = "none";
            break;
        case "npuBoxHeader":
            document.getElementById("npuBox").style.display = "none";
            break;
        case "reportFormWrapper":
            document.getElementById("reportFormWrapper").style.display = "none";
            document.getElementById("reportPrint").style.display = "none";
            document.body.style.opacity = "1";
        default:
            break;
    }

    ev.cancelBubble = true;
}

//function to place jobs in correct page locations
function placeElement(args) {
    try {
        let placement =
            args.shop_location != null && args.shop_location != ""
                ? makeJobDiv2(args)
                : findOpenSpace(args);

        if (placement != null) {
            try {
                document.getElementById(args.shop_location).innerHTML =
                    placement;
            } catch (e) {
                console.log(e);
            }
        }
        if (args.cash_customer == 1) {
            document.getElementById("jica" + args.job_ID).style.display =
                "inline-block";
        }
        if (args.waiting_customer === 1) {
            document.getElementById("jiw" + args.job_ID).style.display =
                "inline-block";
        }
        if (args.parts_needed == 1) {
            document.getElementById("jip" + args.job_ID).style.display =
                "inline-block";
        }
        if (args.approval_needed == 1) {
            document.getElementById("jia" + args.job_ID).style.display =
                "inline-block";
        }
        if (args.comeback_customer == 1) {
            document.getElementById("jico" + args.job_ID).style.display =
                "inline-block";
        }
        if (args.checked == 1) {
            document.getElementById("jich" + args.job_ID).style.display =
                "inline-block";
        }
    } catch (e) {
        logError(e);
        console.log(e);
    }
}

//function to find the first open space in column for newly created jobs
function findOpenSpace(args) {
    try {
        let usedLocation = [];
        let jobs;
        jobs = args.status == "wpu" ? completedJobs : allJobs;

        for (member in jobs) {
            usedLocation.push(jobs[member].shop_location);
        }

        let jt = args.job_type;
        let js = args.status;

        let newBucket = [];
        let bucket = [];
        let hasKids = true;
        let springBucket = [
            "wfw0",
            "wfw1",
            "wfw2",
            "wfw3",
            "wfw4",
            "wfw5",
            "wfw6",
            "wfw7",
            "wfw8",
            "wfw9",
            "wfw10",
            "wfw11",
        ];
        let checkallBucket = [
            "wfw12",
            "wfw13",
            "wfw14",
            "wfw15",
            "wfw16",
            "wfw17",
            "wfw18",
            "wfw19",
            "wfw20",
            "wfw21",
            "wfw22",
            "wfw23",
        ];
        let alignmentBucket = [
            "wfw24",
            "wfw25",
            "wfw26",
            "wfw27",
            "wfw28",
            "wfw29",
            "wfw30",
            "wfw31",
            "wfw32",
            "wfw33",
            "wfw34",
            "wfw35",
        ];
        let kingpinBucket = [
            "wfw36",
            "wfw37",
            "wfw38",
            "wfw39",
            "wfw40",
            "wfw41",
            "wfw42",
            "wfw43",
            "wfw44",
            "wfw45",
            "wfw46",
            "wfw47",
        ];
        let frameBucket = [
            "wfw48",
            "wfw49",
            "wfw50",
            "wfw51",
            "wfw52",
            "wfw53",
            "wfw54",
            "wfw55",
            "wfw56",
            "wfw57",
            "wfw58",
            "wfw59",
        ];
        let overFlowBucket = [
            "wfw60",
            "wfw61",
            "wfw62",
            "wfw63",
            "wfw64",
            "wfw65",
            "wfw66",
            "wfw67",
            "wfw68",
            "wfw69",
            "wfw70",
            "wfw71",
        ];
        let wpuBucket = [];
        let schBucket = [];
        for (i = 0; i < scheduledSpots; i++) {
            schBucket.push(`sch${i}`);
        }
        for (i = 0; i < wpuSpots; i++) {
            wpuBucket.push(`wpu${i}`);
        }

        if (js != "sch" && js != "wpu" && js != "SCH" && js != "noa") {
            newBucket =
                jt == "Spring"
                    ? springBucket
                    : jt == "Alignment"
                    ? alignmentBucket
                    : jt == "Frame"
                    ? frameBucket
                    : jt == "King Pin"
                    ? kingpinBucket
                    : checkallBucket;
        } else {
            js == "sch" || js == "SCH" || js == "noa"
                ? (newBucket = schBucket)
                : (newBucket = wpuBucket);
        }

        bucket = [...newBucket, ...overFlowBucket];

        for (let i = 0; i < bucket.length; i++) {
            if (usedLocation.indexOf(bucket[i]) < 0) {
                args.shop_location = bucket[i];
                break;
            }
        }
        console.time("os");
        ipc.send("edit-location", args);
        console.timeEnd("os");
        return makeJobDiv2(args);
    } catch (e) {
        logError(e);
    }
}
function findSpot(args) {
    try {
        let jt = args.job_type;
        let js = args.status;
        let spot;
        let newBucket = [];
        let bucket = [];
        let hasKids = true;
        let springBucket = [
            "wfw0",
            "wfw1",
            "wfw2",
            "wfw3",
            "wfw4",
            "wfw5",
            "wfw6",
            "wfw7",
            "wfw8",
            "wfw9",
            "wfw10",
            "wfw11",
        ];
        let checkallBucket = [
            "wfw12",
            "wfw13",
            "wfw14",
            "wfw15",
            "wfw16",
            "wfw17",
            "wfw18",
            "wfw19",
            "wfw20",
            "wfw21",
            "wfw22",
            "wfw23",
        ];
        let alignmentBucket = [
            "wfw24",
            "wfw25",
            "wfw26",
            "wfw27",
            "wfw28",
            "wfw29",
            "wfw30",
            "wfw31",
            "wfw32",
            "wfw33",
            "wfw34",
            "wfw35",
        ];
        let kingpinBucket = [
            "wfw36",
            "wfw37",
            "wfw38",
            "wfw39",
            "wfw40",
            "wfw41",
            "wfw42",
            "wfw43",
            "wfw44",
            "wfw45",
            "wfw46",
            "wfw47",
        ];
        let frameBucket = [
            "wfw48",
            "wfw49",
            "wfw50",
            "wfw51",
            "wfw52",
            "wfw53",
            "wfw54",
            "wfw55",
            "wfw56",
            "wfw57",
            "wfw58",
            "wfw59",
        ];
        let wpuBucket = [
            "wpu0",
            "wpu1",
            "wpu2",
            "wpu3",
            "wpu4",
            "wpu5",
            "wpu6",
            "wpu7",
            "wpu8",
            "wpu9",
            "wpu10",
            "wpu11",
            "wpu12",
            "wpu13",
            "wpu14",
            "wpu15",
            "wpu16",
            "wpu17",
            "wpu18",
            "wpu19",
        ];
        let schBucket = [
            "sch0",
            "sch1",
            "sch2",
            "sch3",
            "sch4",
            "sch5",
            "sch6",
            "sch7",
            "sch8",
            "sch9",
            "sch10",
            "sch11",
            "sch12",
            "sch13",
            "sch14",
            "sch15",
            "sch16",
            "sch17",
            "sch18",
            "sch19",
        ];

        if (js != "sch" && js != "wpu" && js != "SCH") {
            newBucket =
                jt == "Spring"
                    ? springBucket
                    : jt == "Alignment"
                    ? alignmentBucket
                    : jt == "Frame"
                    ? frameBucket
                    : jt == "King Pin"
                    ? kingpinBucket
                    : checkallBucket;
        } else {
            js == "sch" || js == "SCH"
                ? (newBucket = schBucket)
                : (newBucket = wpuBucket);
        }

        bucket = newBucket;

        for (let i = 0; i < bucket.length; i++) {
            hasKids = document.getElementById(bucket[i]).hasChildNodes();
            if (!hasKids) {
                spot = bucket[i];

                break;
            }
        }

        return spot;
    } catch (e) {
        logError(e);
    }
}

function makeJobDiv2(args) {
    try {
        let str = args.job_type.replace(/\s+/g, "");
        let objContact;
        let contactName;
        let contactItem;
        let customerName;

        //if contact provided
        //console.time('makejobdiv')
        if (
            args.number_ID != null &&
            args.number_ID != "" &&
            args.number_ID != "null"
        ) {
            objContact = ipc.sendSync(
                "db-get-contact-name",
                "phone",
                args.number_ID
            );
            contactName = `${objContact?.first_name ?? ""} ${
                objContact?.last_name ?? ""
            }`;
        } else if (
            args.email_ID != null &&
            args.email_ID != "" &&
            args.email_ID != "null"
        ) {
            objContact = ipc.sendSync(
                "db-get-contact-name",
                "email",
                args.email_ID
            );
            contactName = `${objContact?.first_name ?? ""} ${
                objContact?.last_name ?? ""
            }`;
        } else {
            contactName = "No Contact";
        }
        //console.timeEnd('makejobdiv')

        customerName =
            args.customer_ID != null
                ? getCustomerNames(args.customer_ID)
                : "no name";
        //console.log(customerName)
        let cuN =
            "<span class='ttCustomerName'><b>" +
            customerName.toUpperCase() +
            "</b></span><br/>";
        let dIn =
            args.date_in == null
                ? ""
                : "<b>Date In:</b>" + args.date_in + "<br/>";
        let ec =
            args.estimated_cost == undefined || args.estimated_cost == ""
                ? ""
                : "<b>Est Cost:</b> $" + args.estimated_cost + "</br>";
        let u =
            args.unit == null || args.unit == ""
                ? ""
                : "<b>Unit #: </b>" + args.unit + "</br>";
        let ut =
            args.unit_type == null || args.unit_type == ""
                ? ""
                : "<b>Unit Type: </b>" + args.unit_type + "</br>";
        let sd =
            args.date_scheduled != null
                ? "<b>Sched. Date: </b>" +
                  args.date_scheduled +
                  " " +
                  args.time_of_day +
                  "<br/>"
                : "";
        let dc =
            args.date_called != null
                ? `<b>Date Called: </b>` + args.date_called + "<br/>"
                : "";
        let toolTipClass = arrBottomHalf.includes(args.shop_location)
            ? "tooltipLast"
            : arrShopLocations.includes(args.shop_location)
            ? "tooltipRight"
            : "toolTipDefault";
        console.log("berry boop os your mon");
        let n =
            args.notes != null ? "<b>Notes: </b>" + args.notes + "</br>" : "";
        let it =
            typeof objContact != "undefined"
                ? objContact?.item?.includes("@")
                    ? "<b>Email: </b>" + objContact.item + "</br>"
                    : "<b>Phone: </b>" + objContact.item + "</br>"
                : "";

        let context = arrShopLocations.includes(args.shop_location)
            ? "context-Menu left"
            : "context-Menu";
        //add customer name to job object for editing
        let job = pullJob(args.job_ID);
        job.customer_name = customerName;
        let nameForContextMenu = "";
        let strTest =
            "nameForContextMenu = " + JSON.stringify(customerName) + ";";
        eval(strTest);
        nameForContextMenu = nameForContextMenu.replace(/'/g, "&apos;");
        //console.log(nameForContextMenu);
        //console.table(job)
        const smallJobContainer = `<div class='vehicle' 
		oncontextmenu='createContextMenu(this, pullJob(${
            args.job_ID
        }),${null},"${nameForContextMenu}");return false;'		
		id='drag${args.job_ID}' 
		draggable='true' 
		ondragstart='drag(event)'
		ondragover='allowDrop(event)'		
		ondrop='drop(event)'>
		
		<div class='tooltip ${toolTipClass}' 
		id='tt${args.job_ID}'>
		${cuN}
		<hr>
		<b>Contact:</b> ${contactName}</br>
		${it}
		${ec}
		
		<hr>
		<b>Job Type:</b> ${args.job_type}<br/>		
		
		${n}
		<hr>
		${u}
		${ut}
		<hr>	
		
		${dIn}
		${sd}
		${dc}
		
		</div>
		<div id='context-Menu-${args.job_ID}' class='${context}'>
		
		</div>
		<div id = 'submenu-${args.job_ID}' class = 'context-submenu'>
		</div>
		<div class='info' 
		id='${args.job_ID}info'>
		<div class='mainJobCustomerName'>${customerName}</div>
		<div class='indicatorBox' id = 'jobIndicatorContainer${args.job_ID}'>
		
		<div id = 'jica${args.job_ID}' class='jobIndicator jobIndicatorCash'></div>
		<div id = 'jiw${args.job_ID}' class='jobIndicator jobIndicatorWaiting'></div>
		<div id = 'jip${args.job_ID}' class='jobIndicator jobIndicatorParts'></div>
		<div id = 'jia${args.job_ID}' class='jobIndicator jobIndicatorApproval'></div>
		<div id = 'jico${args.job_ID}' class='jobIndicator jobIndicatorComeback'></div>
		<div id = 'jich${args.job_ID}' class='jobIndicator jobIndicatorChecked'></div>
		</div>
		<div class='unitNumber' id = 'unitNumber'>${u}</div>
		<div class='notes'>${args.notes != null ? args.notes : ""}</div>
		</div>
		<div class="jobCat jobCat${
            //determine if On the Lot, Scheduled, or notified drop off that shows in scheduled
            //only scheduled gets the striped indicator
            sd == ""
                ? str
                : args.time_of_day == "am" || args.time_of_day == "pm"
                ? str + "Scheduled"
                : str
        }" 
		id='${args.job_ID}Cat'></div>
		</div>`;

        return smallJobContainer;
    } catch (e) {
        logError(e);
    }
}

// function to clear jobs from On the Lot
function clearWFW() {
    for (i = 0; i < 72; i++) {
        document.getElementById("wfw" + i).innerHTML = "";
    }
}

//function to clear pending section
function clearPEN() {
    for (i = 0; i < 12; i++) {
        document.getElementById("pen" + i).innerHTML = "";
    }
}

//function to clear jobs from In the Shop
function clearWIP() {
    for (i = 0; i < 12; i++) {
        document.getElementById("wip" + i).innerHTML = "";
    }
}

//function to clear jobs from Completed
function clearWPU() {
    let c = document.getElementById("wpuJobContainer").childNodes.length;
    for (i = 0; i < c; i++) {
        document.getElementById("wpu" + i).innerHTML = "";
    }
}

//function to clear jobs from scheduled section
function clearSCH() {
    let c = document.getElementById("schJobContainer").childNodes.length;

    for (i = 0; i < c; i++) {
        document.getElementById("sch" + i).innerHTML = "";
    }
}

function clearPage() {
    clearWFW();
    clearPEN();
    clearWIP();
    clearWPU();
    clearSCH();
}

function refresh() {
    clearPage();
    ipc.send("reloadPage");
}

function toggleAdminElements(admin) {
    if (admin) {
        document.getElementById("btnAdmin").style.display = "flex";
        document.getElementById("t").style.display = "flex";
        document.getElementById("btnReports").style.display = "none";
    } else {
        document.getElementById("btnAdmin").style.display = "none";
        document.getElementById("btnReports").style.display = "flex";
        document.getElementById("t").style.display = "none";
    }
}

//pull object with all individual job data from database by using job ID
function pullJob(id) {
    let objJob = ipc.sendSync("pull-job", id);
    return objJob;
}

function createContextMenu(e, objJobData, g, customerName) {
    try {
        objJobData.customer_name = customerName;

        let thisMenu = g
            ? document.getElementById(`gc${e.id}`)
            : document.getElementById("context-Menu-" + objJobData.job_ID);
        let status = objJobData.status;
        for (member in allJobs) {
            if (
                document.getElementById(
                    "context-Menu-" + allJobs[member].job_ID
                )
            ) {
                document.getElementById(
                    "context-Menu-" + allJobs[member].job_ID
                ).style.display = "none";
            }
        }

        //create context menu

        let menuBox = document.getElementById(
            "context-Menu-" + objJobData.job_ID
        );

        let item1Box = document.createElement("span");
        let item2Box = document.createElement("span");
        let item3Box = document.createElement("span");
        let item4Box = document.createElement("span");
        let item1Text;
        let item2Text;
        let item3Text;
        let item4Text;

        menuBox.style.display = "none";
        menuBox.innerHTML = "";

        if (status == "sch") {
            item1Text = document.createTextNode("EDIT");
            item1Box.appendChild(item1Text);
            item1Box.setAttribute("class", "item");
            item1Box.setAttribute("id", "edit" + e.id.substr(4));
            item1Box.addEventListener("click", (event) => {
                menuBox.style.display = "none";
                document.getElementById(e.childNodes[1].id).style.visibility =
                    "visible";
                ipc.send("open-edit", objJobData, "context-menu", currentUser);
            });

            item2Text = document.createTextNode("NO-SHOW");
            item2Box.appendChild(item2Text);
            item2Box.setAttribute("class", "item");
            item2Box.setAttribute("id", "noshow" + e.id.substr(4));
            item2Box.addEventListener("click", (event) => {
                menuBox.style.display = "none";
                document.getElementById(e.childNodes[1].id).style.visibility =
                    "visible";

                objNoshow = new Object();
                objNoshow.job_ID = objJobData.job_ID;
                objNoshow.no_show = 1;
                objNoshow.active = 0;
                ipc.send(
                    "update-job",
                    objNoshow,
                    "context-menu",
                    currentUser,
                    objJobData.customer_name
                );
                e.remove();
            });

            item3Text = document.createTextNode("SEND TO LOT");
            item3Box.appendChild(item3Text);
            item3Box.setAttribute("class", "item");
            item3Box.setAttribute("id", "send" + objJobData.job_ID); //e.id.substr(4))
            item3Box.addEventListener("click", (event) => {
                menuBox.style.display = "none";
                document.getElementById(e.childNodes[1].id).style.visibility =
                    "visible";

                objLot = new Object();
                objLot.job_ID = objJobData.job_ID;
                objLot.shop_location = "";
                objLot.status = "wfw";
                objLot.designation = "On the Lot";
                objLot.date_in = todayIs();
                ipc.send(
                    "update-job",
                    objLot,
                    "context-menu",
                    currentUser,
                    getCustomerNames(objJobData.customer_ID)
                );
                e.remove();
            });
            item4Text = document.createTextNode("CANCEL APPT");
            item4Box.appendChild(item4Text);
            item4Box.setAttribute("class", "item");
            item4Box.setAttribute("id", "send" + e.id.substr(4));
            item4Box.addEventListener("click", (event) => {
                menuBox.style.display = "none";
                document.getElementById(e.childNodes[1].id).style.visibility =
                    "visible";
                objCancel = new Object();
                objCancel.job_ID = objJobData.job_ID;
                objCancel.cancelled = 1;
                objCancel.active = 0;
                ipc.send(
                    "update-job",
                    objCancel,
                    "context-menu",
                    currentUser,
                    getCustomerNames(objJobData.customer_ID)
                );
                e.remove();
            });
            menuBox.appendChild(item1Box);
            menuBox.appendChild(item2Box);
            menuBox.appendChild(item3Box);
            menuBox.appendChild(item4Box);

            $(".context-Menu").on("mouseleave", function () {
                $(this).fadeOut(500);
            });

            setTimeout(() => {
                if ($(`.context-Menu:hover`).length == 0) {
                    $(`.context-Menu`).fadeOut(500);
                    if (
                        document.getElementById(e.childNodes[1].id) != null &&
                        document.getElementById(e.childNodes[1].id) != undefined
                    ) {
                        document.getElementById(
                            e.childNodes[1].id
                        ).style.visibility = "visible";
                    }
                }
            }, 7000);
            // setTimeout(() => {
            // 	if($(`#context-Menu-${e.id.substr(4)}:hover`).length == 0){
            // 	menuBox.style.display = 'none'
            // 	document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
            // 	}
            // }, 7000);
            // $(`#context-Menu-${e.id.substr(4)}`).mouseleave(function (){
            // 	setTimeout(() => {
            // 		if($(`#context-Menu-${e.id.substr(4)}:hover`).length == 0){
            // 		menuBox.style.display = 'none'
            // 		document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
            // 		}
            // 	}, 7000);
            // })
        } else {
            item1Text = document.createTextNode("EDIT");
            item1Box.appendChild(item1Text);
            item1Box.setAttribute("class", "item");
            item1Box.setAttribute("id", "edit" + objJobData.job_ID);
            item1Box.addEventListener("click", (event) => {
                menuBox.style.display = "none";
                document.getElementById(e.childNodes[1].id).style.visibility =
                    "visible";
                ipc.send("open-edit", objJobData, "context-menu", currentUser);
            });

            item2Text = document.createTextNode("CHECKED");
            item2Box.appendChild(item2Text);
            item2Box.setAttribute("class", "item");
            item2Box.setAttribute("id", "checked" + e.id.substr(4));
            item2Box.addEventListener("click", (event) => {
                menuBox.style.display = "none";
                document.getElementById(e.childNodes[1].id).style.visibility =
                    "visible";
                let objChecked = new Object();

                objChecked.job_ID = objJobData.job_ID;
                objChecked.checked = 1;
                ipc.send(
                    "update-job",
                    objChecked,
                    "context-menu",
                    currentUser,
                    objJobData.customer_name
                );
            });
            item3Text = document.createTextNode("SCHEDULE");
            item3Box.appendChild(item3Text);
            item3Box.setAttribute("class", "item");
            item3Box.setAttribute("id", "schedule" + objJobData.job_ID);
            item3Box.addEventListener("click", (event) => {
                cancelScheduleAdd();
                objPopUp = {};
                document.getElementById(e.childNodes[1].id).style.display =
                    "none";
                event.target.parentNode.nextElementSibling.style.display =
                    "block";
                $(event.target.parentNode.nextElementSibling).on({
                    mouseenter: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    },
                });
                let sub_content = `
					<div class= 'popupHeader'>CONFIRM OR CHANGE SCHEDULED DATE</div>
					<br/>
					<div class = "flexRow">
						<label>On the Lot & Scheduled:</label>
                        <input id="cbOTL_scheduled"type="checkbox" tabindex="1"/>
                  	</div>
					
					<div id="sdWrapper" class='popuprow'>

					</div>
					
					<div class='popuprow'>
						
						<div id="jtWrapper">
							
						</div>
					</div>
					<div class="popuprow" draggable="false">
						<div class="inputAndLabelWrapper" id="notesWrapper" draggable="false">
							<label>Notes</label>
							<textarea id="txtNotes" rows="7" cols="50" tabindex="6" type="text" style="vertical-align:middle;"></textarea>
						</div>
						
					</div>
					<div class="popuprow">
						<div class="buttonrow">
							<input type="button" class="mediumButton" tabindex="7" value="SCHED." onclick= 'moveToScheduled(this, ${false})' ></input>
							<input type="button" class="mediumButton" tabindex="8" value="CANCEL" onclick='cancelScheduleAdd(this)'></input>
						</div>
					</div>	
						`;

                event.target.parentNode.nextElementSibling.innerHTML =
                    sub_content;

                createComponent(
                    document.getElementById("jtWrapper"),
                    "comboBox",
                    ["Spring", "Check All", "Alignment", "King Pin", "Frame"],
                    "JobType",
                    "popup"
                );
                createComponent(
                    document.getElementById("sdWrapper"),
                    "date sched",
                    null,
                    "DateSched",
                    "popup"
                );
                $("#DateSched-choice").datepicker({
                    beforeShowDay: $.datepicker.noWeekends,
                    constrainInput: false,
                    dateFormat: "mm/dd/yy",
                    onSelect: function (dateText, inst) {
                        if ($(`#Date-MessageContainer`)) {
                            $(`#Date-MessageContainer`).remove();
                        }
                        document.getElementById("JobType-listBox").style.top =
                            document.getElementById("jtWrapper").offsetTop + 55;
                        this.setAttribute("data-state", "closed");
                        document
                            .getElementById("btn-DateSched")
                            .firstElementChild.classList.remove("up");
                        document
                            .getElementById("btn-DateSched")
                            .firstElementChild.classList.add("down");
                        navigateTabs(
                            "down",
                            Number(this.getAttribute("tabindex"))
                        );
                    },
                });
                $("#DateSched-choice").on({
                    keypress: (event) => {
                        const numberKey = /[0-9]+/;

                        if (!numberKey.test(event.key)) {
                            event.preventDefault();
                        }
                        let num = event.target.value;

                        if (num.length == 2) {
                            event.target.value += "/";
                        }
                        if (num.length == 5) {
                            event.target.value += "/";
                        }
                    },

                    keyup: (event) => {
                        if (
                            event.key != "Backspace" &&
                            event.key != "Enter" &&
                            event.key != "Tab"
                        ) {
                            let num = event.target.value;
                            if (num.length == 8) {
                                console.log(event.key);
                                if (
                                    event.key != "0" &&
                                    Number(
                                        event.target.value.substring(6, 7)
                                    ) >= 2
                                ) {
                                    let year = event.target.value.substring(7);
                                    let pre = event.target.value.substring(
                                        0,
                                        6
                                    );
                                    console.log(year, pre);
                                    year = year.padStart(4, "20");
                                    console.log(year);
                                    event.target.value = pre + year;
                                }
                            }
                        }
                    },
                });

                document.getElementById("JobType-listBox").style.top =
                    document.getElementById("jtWrapper").offsetTop + 55; //txtSection.getBoundingClientRect().bottom

                $("#txtNotes").on({
                    blur: (event) => {},
                    focus: (event) => {
                        closeDropDowns();
                    },
                    mousedown: (event) => {
                        //get ID of draggable job container by getting number from submenu ID
                        let numberID =
                            event.target.parentNode.parentNode.parentNode.id.substring(
                                8
                            );
                        //call function to turn off draggability of draggable job container to enable highlighting text for editing
                        //pass in element and true or false for draggable attribute
                        toggleDraggability(
                            document.getElementById("drag" + numberID),
                            false
                        );
                        // document
                        //     .getElementById("drag" + numberID)
                        //     .setAttribute("draggable", false);
                    },
                    mouseup: (event) => {
                        //get ID of job draggable job container by getting number from submenu ID
                        let numberID =
                            event.target.parentNode.parentNode.parentNode.id.substring(
                                8
                            );
                        //call function to turn off draggability of draggable job container to enable highlighting text for editing
                        //pass in element and true or false for draggable attribute
                        toggleDraggability(
                            document.getElementById("drag" + numberID),
                            true
                        );
                    },
                });

                for (member in allJobs) {
                    if (allJobs[member].job_ID == event.target.id.substr(8)) {
                        objPopUp = allJobs[member];
                        document.querySelector("#txtNotes").innerText =
                            allJobs[member].notes;

                        popupDate = allJobs[member].date_scheduled
                            ? allJobs[member].date_scheduled
                            : "";

                        allJobs[member].comeback_customer == 1
                            ? (document.getElementById(
                                  "cbOTL_scheduled"
                              ).checked = true)
                            : (document.getElementById(
                                  "cbOTL_scheduled"
                              ).checked = false);

                        allJobs[member].time_of_day == "am"
                            ? (document.getElementById("radAM").checked = true)
                            : (document.getElementById(
                                  "radAM"
                              ).checked = false);

                        allJobs[member].time_of_day == "pm"
                            ? (document.getElementById("radPM").checked = true)
                            : (document.getElementById(
                                  "radPM"
                              ).checked = false);

                        switch (allJobs[member].job_type) {
                            case "Spring":
                                $("#JobType0").mousedown();
                                console.log("spring");
                                break;
                            case "Check All":
                                $("#JobType1").mousedown();
                                break;
                            case "Alignment":
                                $("#JobType2").mousedown();
                                break;
                            case "King Pin":
                                $("#JobType3").mousedown();
                                break;
                            case "Frame":
                                $("#JobType4").mousedown();
                                break;
                            default:
                                break;
                        }
                    }
                }
                $("#cbOTL_scheduled").focus();

                $("#DateSched-choice")
                    .datepicker()
                    .datepicker("setDate", popupDate);
                // $("#txtNotes").on({
                //     focus: (event) => {
                //         closeDropDowns();
                //     },
                // });

                //setCaretToEnd(document.getElementById("txtNotes"));
                let tRect =
                    event.target.parentNode.nextElementSibling.getBoundingClientRect();

                //if tooltip extends beyond bottom of window, shift up highr so that it doesnt trigger scroll bar
                if (tRect.bottom > window.innerHeight) {
                    console.log(tRect);
                    let shift = window.innerHeight - tRect.height - 50;
                    event.target.parentNode.nextElementSibling.style.top =
                        shift;
                }
                if (tRect.right > window.innerWidth) {
                    console.log(tRect);
                    let shift = tRect.width - 50;
                    event.target.parentNode.nextElementSibling.style.right =
                        shift;
                }
            });
            item4Text = document.createTextNode("COMPLETED");
            item4Box.appendChild(item4Text);
            item4Box.setAttribute("class", "item");
            item4Box.setAttribute("id", "send" + objJobData.job_ID);
            item4Box.addEventListener("click", (event) => {
                menuBox.style.display = "none";
                document.getElementById(e.childNodes[1].id).style.visibility =
                    "visible";

                let objCompleted = new Object();
                objCompleted.job_ID = objJobData.job_ID;
                objCompleted.shop_location = "";
                objCompleted.status = "wpu";
                objCompleted.date_completed = todayIs();
                console.table(objJobData);
                ipc.send(
                    "update-job",
                    objCompleted,
                    "context-menu",
                    currentUser,
                    objJobData.customer_name
                );
                e.remove();
            });

            menuBox.appendChild(item1Box);
            menuBox.appendChild(item2Box);
            menuBox.appendChild(item3Box);
            menuBox.appendChild(item4Box);

            $(".context-Menu").on("mouseleave", function () {
                $(this).fadeOut(250);
            });

            setTimeout(() => {
                if ($(`.context-Menu:hover`).length == 0) {
                    $(`.context-Menu`).fadeOut(250);
                    if (
                        document.getElementById(e.childNodes[1].id) != null &&
                        document.getElementById(e.childNodes[1].id) != undefined
                    ) {
                        document.getElementById(
                            e.childNodes[1].id
                        ).style.visibility = "visible";
                    }
                }
            }, 7000);
            // setTimeout(() => {
            // 	if($(`#context-Menu-${e.id.substr(4)}:hover`).length == 0){
            // 	menuBox.style.display = 'none'
            // 	document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
            // 	}
            // }, 7000);
            // $(`#context-Menu-${e.id.substr(4)}`).mouseleave(function (){
            // 	setTimeout(() => {
            // 		if($(`#context-Menu-${e.id.substr(4)}:hover`).length == 0){
            // 		menuBox.style.display = 'none'
            // 		document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
            // 		}
            // 	}, 7000);
            // })
        }

        //hide tooltip and menu
        document.getElementById(e.childNodes[1].id).style.visibility = "hidden";
        thisMenu.style.display = "block";

        //hide if clicking outside of element
        document.onclick = function (ev) {
            // console.log("menuID " + thisMenu.id);
            // console.log(ev.target.id);
            if (
                ev.target.id !== thisMenu.id &&
                ev.target.parentNode.id !== thisMenu.id
            ) {
                $(`.context-Menu`).fadeOut(250);
                if (
                    document.getElementById(e.childNodes[1].id) != null &&
                    document.getElementById(e.childNodes[1].id) != undefined
                ) {
                    document.getElementById(
                        e.childNodes[1].id
                    ).style.visibility = "visible";
                }
            }
        };
    } catch (e) {
        logError(e);
    }
}
function toggleDraggability(element, setting) {
    element.setAttribute("draggable", setting);
}
function cancelScheduleAdd(el) {
    let openPopUps = document.querySelectorAll(".context-submenu");
    let op = Array.from(openPopUps);
    //console.log(op)
    for (let p in op) {
        op[p].style.display = "none";
        op[p].innerHTML = "";

        // el.parentNode.parentNode.parentNode.style.display = 'none'
        // el.parentNode.parentNode.parentNode.innerHTML = ''

        //document.getElementById('tt'+el.parentNode.parentNode.id.substr(8)).style.display='none';

        $(`#drag${op[p].id.substring(8)}`)
            .on("mouseenter", function (event) {
                event.stopPropagation();
                document.getElementById(
                    `tt${op[p].id.substring(8)}`
                ).style.display = "block";
            })
            .on("mouseleave", function (event) {
                event.stopPropagation();
                document.getElementById(
                    `tt${op[p].id.substring(8)}`
                ).style.display = "none";
            });
    }
}
function moveToScheduled(e, drop) {
    const radAM = document.getElementById("radAM");
    const radPM = document.getElementById("radPM");
    const cbOTL = document.getElementById("cbOTL_scheduled");
    const datePicked = document.getElementById("DateSched-choice");
    const jt = document.getElementById("JobType-choice");
    const notes = document.getElementById("txtNotes");
    const d = new Object();
    d.job_ID = objPopUp.job_ID;
    //d.job_ID = e.parentNode.parentNode.parentNode.id.substr(8)

    //verify that required inputs are entered
    if (datePicked.value) {
        console.log("verified");
    } else {
        document
            .querySelector("#sdWrapper")
            .appendChild(createMessageBox("Date"));
        document.getElementById("JobType-listBox").style.top =
            document.getElementById("jtWrapper").offsetTop + 55;
        console.log("unverified");
        return;
    }
    console.log(cbOTL.checked);
    if (cbOTL.checked == true) {
        d.status = "wfw";
        d.designation = "On the Lot";
        d.comeback_customer = 1;
    } else {
        d.status = "sch";
        d.designation = "Scheduled";
        d.shop_location = "";
    }
    if (objPopUp.date_scheduled) {
        console.log("already scheduled");
        if (objPopUp.date_scheduled?.localeCompare(datePicked.value) != 0) {
            d.date_scheduled = datePicked.value;
            d.julian_date = jDate(d.date_scheduled);
        }
    } else {
        d.date_scheduled = datePicked.value;
        d.julian_date = jDate(d.date_scheduled);
    }

    objPopUp.job_type.localeCompare(jt.innerText) != 0
        ? (d.job_type = jt.innerText)
        : "";

    if (objPopUp.notes) {
        objPopUp.notes.localeCompare(notes.value) != 0
            ? (d.notes = notes.value)
            : "";
    } else {
        if (notes.value) {
            d.notes = notes.value;
        }
    }
    //d.date_scheduled = datePicked.value

    radAM.checked
        ? (d.time_of_day = "am")
        : radPM.checked
        ? (d.time_of_day = "pm")
        : (d.time_of_day = "am");

    ipc.send("update-job", d, "move", currentUser);

    //cancelScheduledAdd used to clean out data and close popup
    cancelScheduleAdd();
    console.log(d);
}

function createOpenContent() {
    const content = new Splash(ipc.sendSync("get-version"));

    return content.getGreeting();
}

//function to log errors to file
function logError(text) {
    console.log(text);
    ipc.send("log-error", text);
}

function drag_start(event) {
    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData(
        "text/plain",
        parseInt(style.getPropertyValue("left"), 10) -
            event.clientX +
            "," +
            (parseInt(style.getPropertyValue("top"), 10) - event.clientY)
    );
}

function drop_window(event) {
    var offset = event.dataTransfer.getData("text/plain").split(",");
    var dm = document.getElementById("SCH");
    dm.style.left = event.clientX + parseInt(offset[0], 10) + "px";
    dm.style.top = event.clientY + parseInt(offset[1], 10) + "px";
    event.preventDefault();
    return false;
}
const isOverflown = ({
    clientWidth,
    clientHeight,
    scrollWidth,
    scrollHeight,
}) => {
    return scrollHeight > clientHeight || scrollWidth > clientWidth;
};
