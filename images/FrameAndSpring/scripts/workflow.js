/*
WORKFLOW APP written by Sean Davidson 
For use at Frame & Spring in tracking daily movements
of vehicles/jobs using HTA with CSS and javascript and
using XML as a database
*/

//global variables
var boxToChange="";
var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
var dbReports = new ActiveXObject('Microsoft.XMLDOM');
var vehicles = {
	WFW : [],
	WFP : [],
	WIP : [],
	WPU : [],
	SCH : [],
	POS : [],
	NPU : []
};
var iframeReportData = [];
//iframe for printing
var iframe;

var formInputs = {
	required : [],
	optional : []
};
var cashJobs = [{
	"completed" : "",
	"pickedUp" : "",
	"stillHere" : ""
}];
function getFormInputs() {
	formInputs.required.push({

		inputs : [{
			"jobType" : document.getElementById("selJobType"),
			"origin" : document.getElementById("selOrigin"),
			"customerName" : document.getElementById("txtCustomerName"),
			"unit" : document.getElementById("txtUnit"),
			"schDate" : document.getElementById("datepicker")
		}],
		wrappers : [{
			"jobTypeWrapper" : document.getElementById("jobTypeWrapper"),
			"originWrapper" : document.getElementById("originWrapper"),
			"customerNameWrapper" : document.getElementById("customerNameWrapper"),
			"unitWrapper" : document.getElementById("unitWrapper"),
			"dateWrapper" : document.getElementById("dateWrapper")
		}]
	});
	formInputs.optional.push({

		inputs : [{
			"notes" : document.getElementById("txtNotes"),
			"cash" : document.getElementById("cbCash"),
			"cost" : document.getElementById("txtEstCost"),
			"parts" : document.getElementById("cbParts"),
			"comeback" : document.getElementById("cbComeback"),
			"waiting" : document.getElementById("cbWaiting")
		}],
		wrappers : [{
			"optionalWrapper" : document.getElementById("cbWrapper"),
			"notesWrapper" : document.getElementById("notesWrapper"),
			"cashWrapper" : document.getElementById("cashWrapper"),
			"costWrapper" : document.getElementById("costWrapper"),
			"partsWrapper" : document.getElementById("partsWrapper"),
			"comebackWrapper" : document.getElementById("comebackWrapper"),
			"waitingWrapper" : document.getElementById("waitingWrapper")
		}]
	});

}


var jobBucket = {
	frame : [],
	spring : [],
	alignment : [],
	kingpin : []
};

var lastRecord = readFile("data/lastRecordNumber.txt");
var closeTimer;
var loc = "";
var newStatus = "";
var isOpen = false;
var jc = "";
var date = new Date();
var day = date.getDate();
var month = date.getMonth() + 1;
var year = date.getFullYear();
var today = month + "/" + day + "/" + year;
var xmlVehicles = "";
var ns = "";
//alert(date.getTime());
var eName = "";
var eCash = "";
var eUnit = "";
var eMake = "";
var eCost = "";
var eJobCat = "";
var eWaiting = "";
var eDate = "";
var eForm = document.getElementById("my-form");
var vehicleToEdit = "";
var testCount = 0;
var frameCount = 0;
var springCount = 0;
var alignmentCount = 0;
var kingpinCount = 0;
var springBucket = ["wfw0", "wfw1", "wfw2", "wfw3", "wfw4", "wfw5", "wfw6", "wfw7", "wfw8", "wfw9", "wfw10", "wfw11"];
var alignmentBucket = ["wfw12", "wfw13", "wfw14", "wfw15", "wfw16", "wfw17", "wfw18", "wfw19", "wfw20", "wfw21", "wfw22", "wfw23"];
var kingpinBucket = ["wfw24", "wfw25", "wfw26", "wfw27", "wfw28", "wfw29", "wfw30", "wfw31", "wfw32", "wfw33", "wfw34", "wfw35"];
var frameBucket = ["wfw36", "wfw37", "wfw38", "wfw39", "wfw40", "wfw41", "wfw42", "wfw43", "wfw44", "wfw45", "wfw46", "wfw47"];
/* original buckets
var springBucket = ["wfw0", "wfw4", "wfw8", "wfw12", "wfw16", "wfw20", "wfw24", "wfw28", "wfw32", "wfw36", "wfw40", "wfw44"];
var alignmentBucket = ["wfw1", "wfw5", "wfw9", "wfw13", "wfw17", "wfw21", "wfw25", "wfw29", "wfw33", "wfw37", "wfw41", "wfw45"];
var kingpinBucket = ["wfw2", "wfw6", "wfw10", "wfw14", "wfw18", "wfw22", "wfw26", "wfw30", "wfw34", "wfw38", "wfw42", "wfw46"];
var frameBucket = ["wfw3", "wfw7", "wfw11", "wfw15", "wfw19", "wfw23", "wfw27", "wfw31", "wfw35", "wfw39", "wfw43", "wfw47"];
*/
var testBucket = ["wfw0"];
var scheduleBucket = ["sch0", "sch1", "sch2", "sch3", "sch4", "sch5", "sch6", "sch7", "sch8", "sch9", "sch10", "sch11", "sch12", "sch13", "sch14", "sch15", "sch16", "sch17", "sch18", "sch19"];
var largestBucket = 0;
var wfwTotalSlots = 48;

var storedXMLVehicles = "";
var storedVehicles = [];

/*
 * anonymous functions
 
$(function() {
    $( "#aBucket" ).sortable({
    	connectWith: "#wip, #sBucket, #fBucket, #kBucket"
    }).draggable().droppable();
    //$( "#aBucket" ).disableSelection();
    $( "#sBucket" ).sortable({
    	connectWith: "#wip, #aBucket, #fBucket, #kBucket"
    }).draggable().droppable();
    //$( "#sBucket" ).disableSelection();
    $( "#kBucket" ).sortable({
    	connectWith: "#wip, #sBucket, #aBucket, #fBucket"
    }).draggable().droppable();
    //$( "#kBucket" ).disableSelection();
    $( "#fBucket" ).sortable({
    	connectWith: "#wip, #sBucket, #aBucket, #kBucket"
    }).draggable().droppable();
   // $( "#fBucket" ).disableSelection();
   $( "#wip" ).sortable({
    	connectWith: "#aBucket, #sBucket, #fBucket, #kBucket"
    }).draggable().droppable();
  });
  */
$(function() {
	$("#datepicker").datepicker({
		dateFormat : "mm/dd/yy"
	});
	$("#datepicker").datepicker('setDate', '+0');
});

setInterval(function() {
	if (isOpen == false) {
		refresh();
	}
}, 20000);
setInterval(function() {
	callBackup()
}, 7200000);

/*
 * callable functions
 */ 
 
function loadPage() {
	pullData();
	clearPage();
	countJobTypes();
	fillBuckets();
	fillPage();
	fillCustomerDataList();
	//alert(xmlVehicles.length);
}

function reloadPage() {
	try{
	pullData();
	clearPage();
	countJobTypes();
	fillBuckets();
	fillPage();
	}catch(e){logError(e)}
	//alert(lastRecord);
}

function countJobTypes() {
	frameCount = 0;
	springCount = 0;
	alignmentCount = 0;
	kingpinCount = 0;
	var blah = xmlDoc.getElementsByTagName("vehicle");
	//alert(xmlVehicles.length);

	for ( i = 0; i < blah.length; i++) {

		var b = blah[i].getAttribute("jobCat");
		var s = blah[i].getAttribute("status");
		if (s == "wfw") {
			switch(b) {
				case "frame":

					frameCount++;
					break;
				case "spring":
					springCount++;
					break;
				case "alignment":
					alignmentCount++;
					break;
				case "kingPin":
					kingpinCount++;
					break;
				default:
					break;
			}
		}
	}
	//alert("Frame jobs: "+frameCount+" Spring jobs: "+springCount+" Alignment: "+alignmentCount+" Kingpin: "+kingpinCount);

}

function fillBuckets() {
	var fbn = 0;
	var sbn = 0;
	var abn = 0;
	var kbn = 0;
	if (frameCount > 11) {
		fbn = 48;
		for ( i = 12; i < frameCount; i++) {

			frameBucket.push("wfw" + fbn);
			fbn += 4;
		}
	}
	if (springCount > 12) {
		sbn = 49;
		for ( i = 12; i < springCount; i++) {

			springBucket.push("wfw" + sbn);
			sbn += 4;
		}
	}
	if (alignmentCount > 12) {
		abn = 50;
		for ( i = 12; i < alignmentCount; i++) {

			alignmentBucket.push("wfw" + abn);
			abn += 4;
		}
	}
	if (kingpinCount > 12) {
		kbn = 51;
		for ( i = 12; i < kingpinCount; i++) {

			kingpinBucket.push("wfw" + kbn);
			kbn += 4;
		}
	}
	largestBucket = Math.max(frameCount, springCount, alignmentCount, kingpinCount);
	//alert("largest bucket "+largestBucket);
	if (largestBucket > 11) {
		var ccc = largestBucket - 12;
		//alert(ccc);
		wfwTotalSlots = largestBucket * 4;
		addRowsToWFW(ccc);
	}
	//alert(frameBucket.length+" "+springBucket.length+" "+alignmentBucket.length+" "+kingpinBucket.length);
}

function addRowsToWFW(rta) {
	var rowsToAdd = rta;
	var idCount = 48;
	for ( i = 0; i < rowsToAdd; i++) {
		for ( j = 0; j < 4; j++) {
			var nl = document.createElement("div");
			nl.setAttribute("class", "job");
			nl.setAttribute("id", "wfw" + idCount);
			idCount++;
			nl.setAttribute("ondrop", "drop(event)");
			nl.setAttribute("ondragover", "allowDrop(event)");
			document.getElementById("waiting").appendChild(nl);
		}
	}
	//alert("total wfw slots created: "+idCount);
	wfwTotalSlots = idCount;
}

function pullData() {
	try{
	xmlDoc.load('fs.xml');
	//xmlDoc.onreadystatechange=function(){alert(xmlDoc.readyState)}
	//alert(xmlDoc.readyState);
	dbReports.load('completedJobs.xml');
	clearData();
	lastRecord = readFile();
	// TODO: validate true
	var xmlElem = xmlDoc.documentElement;
	// TODO: validate not null
	//var xmlStatus = xmlElem.selectSingleNode('//vehicle[@custName=\'City of Columbus\']');
	//var strStatus = xmlStatus.getAttribute('status');
	storedXMLVehicles = dbReports.getElementsByTagName("vehicle");
	xmlVehicles = xmlDoc.getElementsByTagName("vehicle");
	//alert(xmlVehicles.length);
	//fillCustomerDataList();
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		storedVehicles.push({
			"custName" : xmlVehicles[i].getAttribute("custName"),
			"make" : xmlVehicles[i].getAttribute("make"),
			"estCost" : xmlVehicles[i].getAttribute("estCost"),
			"jobCat" : xmlVehicles[i].getAttribute("jobCat"),
			"dateIn" : xmlVehicles[i].getAttribute("dateIn"),
			"status" : xmlVehicles[i].getAttribute("status"),
			"unitNumber" : xmlVehicles[i].getAttribute("unitNumber"),
			"xmlPosition" : i,
			"shopLocation" : xmlVehicles[i].getAttribute("shopLocation"),
			"cash" : xmlVehicles[i].getAttribute("cash"),
			"waiting" : xmlVehicles[i].getAttribute("waiting"),
			"dateComplete" : xmlVehicles[i].getAttribute("dateComplete"),
			"comeback" : xmlVehicles[i].getAttribute("comeback"),
			"parts" : xmlVehicles[i].getAttribute("parts"),
			"recordNumber" : xmlVehicles[i].getAttribute("recordNumber")
		});
	}
	for ( i = 0; i < xmlVehicles.length; i++) {
		var s = xmlVehicles[i].getAttribute("status");
		//alert(xmlVehicles.parent().children().index(this));

		switch(s) {
			case "wfw":
				vehicles.WFW.push({
					"custName" : xmlVehicles[i].getAttribute("custName"),
					"make" : xmlVehicles[i].getAttribute("make"),
					"estCost" : xmlVehicles[i].getAttribute("estCost"),
					"jobCat" : xmlVehicles[i].getAttribute("jobCat"),
					"dateIn" : xmlVehicles[i].getAttribute("dateIn"),
					"status" : xmlVehicles[i].getAttribute("status"),
					"unitNumber" : xmlVehicles[i].getAttribute("unitNumber"),
					"xmlPosition" : i,
					"cash" : xmlVehicles[i].getAttribute("cash"),
					"shopLocation" : xmlVehicles[i].getAttribute("shopLocation"),
					"waiting" : xmlVehicles[i].getAttribute("waiting"),
					"comeback" : xmlVehicles[i].getAttribute("comeback"),
					"parts" : xmlVehicles[i].getAttribute("parts")
				});
				//alert(i);

				break;
			case "wfp":
				vehicles.WFP.push({
					"custName" : xmlVehicles[i].getAttribute("custName"),
					"make" : xmlVehicles[i].getAttribute("make"),
					"estCost" : xmlVehicles[i].getAttribute("estCost"),
					"jobCat" : xmlVehicles[i].getAttribute("jobCat"),
					"dateIn" : xmlVehicles[i].getAttribute("dateIn"),
					"status" : xmlVehicles[i].getAttribute("status"),
					"unitNumber" : xmlVehicles[i].getAttribute("unitNumber"),
					"xmlPosition" : i,
					"cash" : xmlVehicles[i].getAttribute("cash"),
					"waiting" : xmlVehicles[i].getAttribute("waiting"),
					"comeback" : xmlVehicles[i].getAttribute("comeback"),
					"parts" : xmlVehicles[i].getAttribute("parts")
				});
				//alert(vehicles.WFP[i].xmlPosition);
				break;
			case "wip":
				vehicles.WIP.push({
					"custName" : xmlVehicles[i].getAttribute("custName"),
					"make" : xmlVehicles[i].getAttribute("make"),
					"estCost" : xmlVehicles[i].getAttribute("estCost"),
					"jobCat" : xmlVehicles[i].getAttribute("jobCat"),
					"dateIn" : xmlVehicles[i].getAttribute("dateIn"),
					"status" : xmlVehicles[i].getAttribute("status"),
					"unitNumber" : xmlVehicles[i].getAttribute("unitNumber"),
					"xmlPosition" : i,
					"shopLocation" : xmlVehicles[i].getAttribute("shopLocation"),
					"cash" : xmlVehicles[i].getAttribute("cash"),
					"waiting" : xmlVehicles[i].getAttribute("waiting"),
					"comeback" : xmlVehicles[i].getAttribute("comeback"),
					"parts" : xmlVehicles[i].getAttribute("parts")
				});
				//alert(vehicles.WIP[i].xmlPosition);
				break;
			case "wpu":
				vehicles.WPU.push({
					"custName" : xmlVehicles[i].getAttribute("custName"),
					"make" : xmlVehicles[i].getAttribute("make"),
					"estCost" : xmlVehicles[i].getAttribute("estCost"),
					"jobCat" : xmlVehicles[i].getAttribute("jobCat"),
					"dateIn" : xmlVehicles[i].getAttribute("dateIn"),
					"status" : xmlVehicles[i].getAttribute("status"),
					"unitNumber" : xmlVehicles[i].getAttribute("unitNumber"),
					"xmlPosition" : i,
					"shopLocation" : xmlVehicles[i].getAttribute("shopLocation"),
					"cash" : xmlVehicles[i].getAttribute("cash"),
					"waiting" : xmlVehicles[i].getAttribute("waiting"),
					"dateComplete" : xmlVehicles[i].getAttribute("dateComplete"),
					"comeback" : xmlVehicles[i].getAttribute("comeback"),
					"parts" : xmlVehicles[i].getAttribute("parts"),
					"recordNumber" : xmlVehicles[i].getAttribute("recordNumber")
				});

				break;
			case "sch":
				vehicles.SCH.push({
					"custName" : xmlVehicles[i].getAttribute("custName"),
					"make" : xmlVehicles[i].getAttribute("make"),
					"estCost" : xmlVehicles[i].getAttribute("estCost"),
					"jobCat" : xmlVehicles[i].getAttribute("jobCat"),
					"dateIn" : xmlVehicles[i].getAttribute("dateIn"),
					"status" : xmlVehicles[i].getAttribute("status"),
					"unitNumber" : xmlVehicles[i].getAttribute("unitNumber"),
					"xmlPosition" : i,
					"shopLocation" : xmlVehicles[i].getAttribute("shopLocation"),
					"cash" : xmlVehicles[i].getAttribute("cash"),
					"waiting" : xmlVehicles[i].getAttribute("waiting"),
					"comeback" : xmlVehicles[i].getAttribute("comeback"),
					"parts" : xmlVehicles[i].getAttribute("parts"),
					"schDate" : xmlVehicles[i].getAttribute("schDate"),
					"ampm" : xmlVehicles[i].getAttribute("ampm")
				});
				//alert(vehicles.WIP[i].xmlPosition);
				break;
			case "pos":
				vehicles.POS.push({
					"custName" : xmlVehicles[i].getAttribute("custName"),
					"make" : xmlVehicles[i].getAttribute("make"),
					"estCost" : xmlVehicles[i].getAttribute("estCost"),
					"jobCat" : xmlVehicles[i].getAttribute("jobCat"),
					"dateIn" : xmlVehicles[i].getAttribute("dateIn"),
					"status" : xmlVehicles[i].getAttribute("status"),
					"unitNumber" : xmlVehicles[i].getAttribute("unitNumber"),
					"xmlPosition" : i,
					"shopLocation" : xmlVehicles[i].getAttribute("shopLocation"),
					"cash" : xmlVehicles[i].getAttribute("cash"),
					"waiting" : xmlVehicles[i].getAttribute("waiting"),
					"comeback" : xmlVehicles[i].getAttribute("comeback"),
					"parts" : xmlVehicles[i].getAttribute("parts"),
					"schDate" : xmlVehicles[i].getAttribute("schDate"),
					"ampm" : xmlVehicles[i].getAttribute("ampm")
				});

				//alert(vehicles.WIP[i].xmlPosition);
				break;
			case "npu":
				vehicles.NPU.push({
					"custName" : xmlVehicles[i].getAttribute("custName"),
					"make" : xmlVehicles[i].getAttribute("make"),
					"estCost" : xmlVehicles[i].getAttribute("estCost"),
					"jobCat" : xmlVehicles[i].getAttribute("jobCat"),
					"dateIn" : xmlVehicles[i].getAttribute("dateIn"),
					"status" : xmlVehicles[i].getAttribute("status"),
					"unitNumber" : xmlVehicles[i].getAttribute("unitNumber"),
					"xmlPosition" : i,
					"shopLocation" : xmlVehicles[i].getAttribute("shopLocation"),
					"cash" : xmlVehicles[i].getAttribute("cash"),
					"waiting" : xmlVehicles[i].getAttribute("waiting"),
					"comeback" : xmlVehicles[i].getAttribute("comeback"),
					"parts" : xmlVehicles[i].getAttribute("parts")
				});
				//alert(vehicles.WIP[i].xmlPosition);
				break;
			default:
				break;
		}

	}
	}catch(e){
		logError(e.stack);
	}
	//vehicles.WPU.sort(dynamicSort("dateComplete"));
	vehicles.SCH.sort(dynamicSort("ampm")).sort(dynamicSort("schDate"));
	//vehicles.POS.sort(dynamicSort("ampm")).sort(dynamicSort("schDate"));
	//fillCustomerDataList();
	//for ( i = 0; i < vehicles.WPU.length; i++) {
		//alert(vehicles.WPU[i].dateComplete);
	//}
}

function toggleAdminMenu() {
	$("#menuAdmin").toggle("drop", 500);
}

function dynamicSort(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function(a, b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	};
}

function sortSCH(){
	vehicles.SCH.sort(function(a,b) { 
    return new Date(a.schDate).getTime() - new Date(b.schDate).getTime() 
});
}

function sortJsonArrayByProperty(objArray, prop, direction) {
	if (arguments.length < 2)
		throw new Error("sortJsonArrayByProp requires 2 arguments");
	var direct = arguments.length > 2 ? arguments[2] : 1;
	//Default to ascending

	if (objArray && objArray.constructor === Array) {
		var propPath = (prop.constructor === Array) ? prop : prop.split(".");
		objArray.sort(function(a, b) {
			for (var p in propPath) {
				if (a[propPath[p]] && b[propPath[p]]) {
					a = a[propPath[p]];
					b = b[propPath[p]];
				}
			}
			// convert numeric strings to integers
			a = a.match(/^\d+$/) ? +a : a;
			b = b.match(/^\d+$/) ? +b : b;
			return ((a < b) ? -1 * direct : ((a > b) ? 1 * direct : 0) );
		});
	}
}

function fillPage() {
	//clearPage();
	pullData();
	fillWFW();
	fillWIP();
	//fillWFP();
	fillWPU();
	fillSCH();
	//fillPOS();
	//fillNPU();
	document.getElementById('ALLcount').innerHTML = vehicles.WFW.length + vehicles.WFP.length + vehicles.WIP.length;
	document.getElementById('WFWcount').innerHTML = vehicles.WFW.length;
	//document.getElementById('bigWFPcountBox').innerHTML = vehicles.WFP.length;
	document.getElementById('bigWPUcountBox').innerHTML = vehicles.WPU.length;
	document.getElementById('bigSCHcountBox').innerHTML = vehicles.SCH.length;
	//document.getElementById('bigPOScountBox').innerHTML = vehicles.POS.length;
	//document.getElementById('bigNPUcountBox').innerHTML = vehicles.NPU.length;
	countWPUCashTotal();
	

}

function countWPUCashTotal() {
	var amount = 0;
	for ( i = 0; i < vehicles.WPU.length; i++) {
		if (vehicles.WPU[i].estCost && vehicles.WPU[i].cash == "-1") {
			amount += Number(vehicles.WPU[i].estCost);
		}
	}
	document.getElementById("wpuCashTotal").innerHTML = "$" + amount.toFixed(2);
	return amount;
}

function clearPage() {
	clearWFW();
	clearWIP();
	//clearWFP();
	clearWPU();
	clearSCH();
	//clearPOS();
	//clearNPU();
}

function clearData() {
	for ( i = vehicles.WFW.length; i > 0; i--) {
		vehicles.WFW.pop();
		//alert(vehicles.WFW.length);
	}
	for ( i = vehicles.WIP.length; i > 0; i--) {
		vehicles.WIP.pop();
		//alert(vehicles.WFW.length);
	}
	for ( i = vehicles.WFP.length; i > 0; i--) {
		vehicles.WFP.pop();
		//alert(vehicles.WFW.length);
	}
	for ( i = vehicles.WPU.length; i > 0; i--) {
		vehicles.WPU.pop();
		//alert(vehicles.WFW.length);
	}
	for ( i = vehicles.SCH.length; i > 0; i--) {
		vehicles.SCH.pop();
		//alert(vehicles.WFW.length);
	}
	/*
	for ( i = vehicles.POS.length; i > 0; i--) {
		vehicles.POS.pop();
		//alert(vehicles.WFW.length);
	}
	for ( i = vehicles.NPU.length; i > 0; i--) {
		vehicles.NPU.pop();
		//alert(vehicles.WFW.length);
	}
	*/
	for ( i = storedVehicles.length; i > 0; i--) {
		storedVehicles.pop();
		//alert(vehicles.WFW.length);
	}
}


function val() {
	alert("val stinks");
}

function allowDrop(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	//var h=ev.target.parentNode.innerHTML;
	//alert(h);
}

function drag(ev) {
	pullData();
	ev.dataTransfer.setData("Text", ev.target.id);

	var l = ev.currentTarget.id;

	loc = l.substr(4, 2);
	//makes tooltip disappear when dragging
	document.getElementById(ev.currentTarget.childNodes[0].id).style.display = "none";

}

function drop(ev) {

	ns = ev.target.id;
	newStatus = ns.substr(0, 3);
	//alert("drop"+newStatus);
	//setNewLocation();
	//loadPage();
	ev.stopPropagation();
	ev.preventDefault();
	//var data=ev.dataTransfer.getData("Text");
	pullData();
	var thisJob = xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc];
	var thisCustomer=thisJob.getAttribute('custName');
	if (ev.target.hasChildNodes()) {
		//alert("has kids");
		switch(ev.target.id) {
			case "wfpHeader":
				//alert("wfp");
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("status", "wfp");
				xmlDoc.save("fs.xml");
				break;
			case "WFP":
				//alert("wfp");
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("status", "wfp");
				xmlDoc.save("fs.xml");
				break;

			case "WPU":
				//alert(thisJob.getAttribute("custName"));
				checkIfFull();
				var d = todayIs();
				//alert(d);
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("status", "wpu");
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("dateComplete", d);
				//.getTime() );
				xmlDoc.save("fs.xml");
				//storeCompletedJobs();
				break;
			default:
				//alert(ev.target.id);
				break;
		}
		//setNewLocation();

	} else {
		//xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("shopLocation",ev.target.id);

		try {
			if (ev.target.className !== "jobCat") {
				setNewLocation();
				var data = ev.dataTransfer.getData("Text");
				ev.target.appendChild(document.getElementById(data));
				if (newStatus == "wpu") {
					var d = todayIs();

					//alert(d.getTime());
					xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("status", "wpu");
					xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("dateComplete", d);
					xmlDoc.save("fs.xml");
					//storeCompletedJobs();
				}

			}
			//alert(ev.target.id);

		} catch(e) {
		}
	}
	clearPage();
	reloadPage();

	//pullData();
	//loadPage();
	//alert("page filled");
	//alert(ev.currentTarget.id);
	//alert(xmlVehicles.length);
}

function deleteDrop(ev) {
	//drop(ev);
	try {
		
		
			//alert("Deleting Job...");
		
		var deleteMe = xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc];
		//alert("pvar deleteMe");
		var thisCust=deleteMe.getAttribute('custName');
		//alert("var thisCust");
		xmlDoc.getElementsByTagName("workflow")[0].removeChild(deleteMe);
		//alert("removeChild")
		xmlDoc.save("fs.xml");
		//alert("save");
		//ev.parentNode.removeChild(ev);
		clearPage();
		//alert("clearPage")
		reloadPage();
		//alert("reloadpage");
		
		
		
	} catch(e) {
		logError(e,thisCust);
		
	}
}

function logError(e,cust) {
	try {
		var d= new Date();
		var fso, s;
		fso = new ActiveXObject("Scripting.FileSystemObject");
		
		s = fso.OpenTextFile("errorLog.txt", 8, 1, 0);
		if(cust){
			
		s.write(todayIs() +' '+d.getHours()+':'+d.getMinutes()+' '+cust.toUpperCase()+'\n'+e.stack + '\n');
		}else{
		s.write(todayIs() +' '+d.getHours()+':'+d.getMinutes()+'\n'+e.stack + '\n');
			
		}
		s.Close();
	} catch(err) {
		var strErr = 'Error:';
		strErr += '\nNumber:' + err.number;
		strErr += '\nDescription:' + err.description;
		document.write(strErr);
		alert(strErr);
	}
}

function WriteToFile() {
	try {

		var fso, s, lrn;
		lrn = parseInt(readFile());
		lrn += 1;
		fso = new ActiveXObject("Scripting.FileSystemObject");

		s = fso.OpenTextFile("data/lastRecordNumber.txt", 2, 1, -2);
		s.writeline(lrn);

		s.Close();
	} catch(err) {
		var strErr = 'Error:';
		strErr += '\nNumber:' + err.number;
		strErr += '\nDescription:' + err.description;
		document.write(strErr);
		alert(strErr);
		//lastRecord=lrn;
	}
	return lrn;
}

function readFile() {
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var ForReading = 1;
	var f1 = fso.OpenTextFile("data/lastRecordNumber.txt", 1);
	var text = f1.ReadAll();
	//document.getElementById("notesArea").innerHTML = text;
	f1.close();
	return text;
}

function openBox(e) {

	//alert("openBox triggered");
	if (document.getElementById("reportFormWrapper").style.display == "none" || document.getElementById("reportFormWrapper").style.display == "") {
		if (e.hasChildNodes)
			var count = 0;
		//alert(e.firstChild.id);
		switch(e.id) {
			case "WPU":
				switch(document.getElementById("wpuBox").style.display) {
					case "none":
					case "":
						document.getElementById("wpuBox").style.display = "block";

						break;
					case "block":
						if (!e.hasChildNodes()) {
							document.getElementById("wpuBox").style.display = "none";
						}
						break;
				}
				break;
			case "WFP":
				if (document.getElementById("wfpBox").style.display == "none") {
					document.getElementById("wfpBox").style.display = "block";
				} else {
					document.getElementById("wpuBox").style.display == "none"
				}
				break;
			case "SCH":
				switch(document.getElementById("schBox").style.display) {
					case "none":
					case "":
						//document.getElementById("posBox").style.display = "block";
						document.getElementById("schBox").style.display = "block";
						break;
					case "block":
						//document.getElementById("posBox").style.display = "none";
						document.getElementById("schBox").style.display = "none";
						break;
				}
				break;
			case "POS":
				switch(document.getElementById("posBox").style.display) {
					case "none":
					case "":
						document.getElementById("posBox").style.display = "block";
						document.getElementById("schBox").style.display = "block";
						break;
					case "block":
						document.getElementById("posBox").style.display = "none";
						document.getElementById("schBox").style.display = "none";
						break;
				}
				break;
			case "NPU":

				switch(document.getElementById("npuBox").style.display) {
					case "none":
					case "":
						document.getElementById("npuBox").style.display = "block";

						break;
					case "block":

						document.getElementById("npuBox").style.display = "none";

						break;
				}
				break;

			default:
				break;
		}

	}

}

function closeBox(ev, e) {
	switch(e.parentNode.id) {
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

	//alert("close");
	ev.cancelBubble = true;
}

function openInput(e, active, inputID1, inputID2) {
	var v = active.value;
	//alert(e.keyCode);
	var next = document.getElementById(inputID1);
	//alert(v);
	//alert(active.parentNode.className);
	//alert(document.getElementById("lstCustomer").options.length);
	if (active.id == "cbCash") {
		//alert('b');
		if (active.checked == true) {
			document.getElementById(inputID1).className = "visibleInput";
		} else {

			document.getElementById('txtCost').value = "";
			document.getElementById(inputID1).className = "hiddenInput";
			//alert(document.getElementById(inputID1).value);
		}
	} else {
		if (!e || e.keyCode != 9) {
			if (v && v != "") {
				//alert(k);
				document.getElementById(inputID1).className = "visibleInput";
				next.style.display = "block";
				
				//alert("make "+inputID1+ " visible "+document.getElementById(inputID1).style.display);
			} else {
				//alert("hide input");
				document.getElementById(inputID1).className = "hiddenInput"
			}
		}
		if (inputID2) {
			switch(active.value) {
				case "Call:Scheduled":
				case "Call:Possible":
					document.getElementById(inputID2).style.display = "block";
					document.getElementById("datepicker").tabIndex = "2";
					break;
				case "On the Lot":
					document.getElementById(inputID2).style.display = "none";
					break;
				case "Needs Picked Up":
					document.getElementById(inputID2).style.display = "none";
					break;
				default:
					document.getElementById(inputID2).style.display = "block";
					document.getElementById(inputID2).className = "visibleFieldset";
					break;
			}

			document.getElementById(inputID2).className = "visibleFieldset";

		}
	}
}

function initializeForm() {

	document.getElementById("jobTypeWrapper").style.display = "none";
	document.getElementById("originWrapper").style.display = "block";
	document.getElementById("customerNameWrapper").style.display = "none";
	document.getElementById("unitWrapper").style.display = "none";
	document.getElementById("dateWrapper").style.display = "none";
	document.getElementById("notesWrapper").style.display = "none";
	document.getElementById("cbWrapper").style.display = "none";

}

function addNewJob() {
	document.getElementById("addBlock").style.display = "block";
	document.getElementById("selOrigin").focus();
	//close bottom boxes if open
	document.getElementById("schBox").style.display = "none";
	//document.getElementById("posBox").style.display = "none";
	//document.getElementById("npuBox").style.display = "none";
}

function cancelAdd() {
	document.getElementById("frmReset").click();
	document.getElementById("addBlock").style.display = "none";
	initializeForm();
	getFormInputs();

}

function submitted() {
	addNewVehicle();
	clearPage();
	fillPage();
	document.getElementById("addBlock").style.display = "none";

	//getFormInputs();
	//var requiredInfo=formInputs.required[0].inputs[0];
	//alert(t.unit.value);
	initializeForm();
	document.getElementById("frmReset").click();
}

function clearFormInputs() {
	getFormInputs();
	document.getElementById("addBlock").style.display = "none";
	var requiredInfo = formInputs.required[0].inputs[0];
	requiredInfo.unit.value = "";
	requiredInfo.customerName.value = "";
}
function sortBucket(ev){
	//var h=ev.currentTarget.parentNode.innerHTML;
	//alert(h);
}
//WriteToFile();
function fillWFP() {

	for ( i = 0; i < vehicles.WFP.length; i++) {

		document.getElementById('wfp' + i).innerHTML = "<div onclick='getEditVehicle(this)' ondragenter='sortBucket(event)' class='vehicle' id='drag" + vehicles.WFP[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfp" + i + "'></span><span class='info' id='wfp" + i + "info'></span><span class='jobCat' id='wfp" + i + "Cat'>&nbsp;</span></div>";
		//alert(vehicles.WFW[i].xmlPostion);

		if (vehicles.WFP[i].cash == "-1") {
			document.getElementById('wfp' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg)";
			document.getElementById('wfp' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WFP[i].custName + "</b><br/> #" + vehicles.WFP[i].unitNumber + " <span class='money'><b>$" + vehicles.WFP[i].estCost + "</b></span><br/>" + vehicles.WFP[i].make;

		}
		if (vehicles.WFP[i].waiting == "-1") {
			document.getElementById('wfp' + i + 'info').style.backgroundImage = "url(waiting.jpg)";

		}
		if (vehicles.WFP[i].cash == "-1" && vehicles.WFP[i].waiting == "-1") {
			document.getElementById('wfp' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg), url(waiting.jpg)";
		}
		if (vehicles.WFP[i].comeback == "-1") {
			document.getElementById('wfp' + i + 'info').style.backgroundImage = "url(warningLegend.png)";
			document.getElementById('wfp' + i + 'info').style.backgroundPosition = "right top";
		}
		if (vehicles.WFP[i].comeback == "-1" && vehicles.WFP[i].cash == "-1") {
			document.getElementById('wfp' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg)";
			document.getElementById('wfp' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.WFP[i].comeback == "-1" && vehicles.WFP[i].waiting == "-1") {
			document.getElementById('wfp' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(waiting.jpg)";
			document.getElementById('wfp' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.WFP[i].comeback == "-1" && vehicles.WFP[i].cash == "-1" && vehicles.WFP[i].waiting == "-1") {
			document.getElementById('wfp' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg), url(waiting2.jpg)";
			document.getElementById('wfp' + i + 'info').style.backgroundPosition = "right top, left top, left top";
		}
		if (vehicles.WFP[i].parts == "-1") {
			document.getElementById('wfp' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;text-decoration:line-through;color:#A3A3C2'>" + vehicles.WFP[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WFP[i].unitNumber + " <span class='money'><b>$" + vehicles.WFP[i].estCost + "</b></span><br/>" + vehicles.WFP[i].make;

		} else {

			document.getElementById('wfp' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WFP[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WFP[i].unitNumber + "<br/>" + vehicles.WFP[i].make;
		
		}
		document.getElementById('ttWfp' + i).innerHTML = vehicles.WFP[i].dateIn + "<br/> " + vehicles.WFP[i].custName.toUpperCase() + " #" + vehicles.WFP[i].unitNumber + "<br/>" + vehicles.WFP[i].make + "<br/>Est Cost:$" + vehicles.WFP[i].estCost;

		var jobType = vehicles.WFP[i].jobCat;
		switch(jobType) {
			case "frame":
			case "Frame":
				document.getElementById('wfp' + i + 'Cat').style.backgroundColor = "red";
				break;
			case "spring":
			case "Spring":
				document.getElementById('wfp' + i + 'Cat').style.backgroundColor = "blue";
				break;
			case "alignment":
			case "Alignment":
				document.getElementById('wfp' + i + 'Cat').style.backgroundColor = "purple";
				break;
			case "kingPin":
			case "King Pin":
				document.getElementById('wfp' + i + 'Cat').style.backgroundColor = "green";
				break;
			case "Check All":

				document.getElementById('wfp' + i + 'Cat').style.backgroundColor = "orange";
				break;
			default:
				break;
		}

	}
}

function test(el) {
	document.getElementById(el.id).innerHTML = "<form id='testETT' name='myGame'><input name='nameTT' id='nameTT' type=text value='" + vehicles.WFW[i].custName + "'></form>";
}

function fillWPU() {
	//alert(vehicles.WPU.length);

	try {
		//checkIfFull();
		for ( i = 0; i < vehicles.WPU.length; i++) {

			if (document.getElementById('wpu' + i)) {
				//alert(i);
				document.getElementById('wpu' + i).innerHTML = "<div oncontextmenu='getEditVehicle(this);return false;' class='vehicle' id='drag" + vehicles.WPU[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWpu" + i + "'></span><span class='info' id='wpu" + i + "info'></span><span class='jobCat' id='wpu" + i + "Cat'></span></div>";
				//alert(vehicles.WFW[i].xmlPostion);
				if (vehicles.WPU[i].cash == "-1") {
					//alert(vehicles.WPU[i].custName);
					document.getElementById('wpu' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg)";
					document.getElementById('wpu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WPU[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WPU[i].unitNumber + " <span class='money'><b>$" + vehicles.WPU[i].estCost + "</b></span><br/>" + vehicles.WPU[i].make;

				}
				if (vehicles.WPU[i].waiting == "-1") {
					document.getElementById('wpu' + i + 'info').style.backgroundImage = "url(waiting.jpg)";

				}
				if (vehicles.WPU[i].cash == "-1" && vehicles.WPU[i].waiting == "-1") {
					document.getElementById('wpu' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg), url(waiting.jpg)";
				}
				if (vehicles.WPU[i].comeback == "-1") {
					document.getElementById('wpu' + i + 'info').style.backgroundImage = "url(warningLegend.png)";
					document.getElementById('wpu' + i + 'info').style.backgroundPosition = "right top";
				}
				if (vehicles.WPU[i].comeback == "-1" && vehicles.WPU[i].cash == "-1") {
					document.getElementById('wpu' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg)";
					document.getElementById('wpu' + i + 'info').style.backgroundPosition = "right top, left top";
				}
				if (vehicles.WPU[i].comeback == "-1" && vehicles.WPU[i].waiting == "-1") {
					document.getElementById('wpu' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(waiting.jpg)";
					document.getElementById('wpu' + i + 'info').style.backgroundPosition = "right top, left top";
				}
				if (vehicles.WPU[i].comeback == "-1" && vehicles.WPU[i].cash == "-1" && vehicles.WPU[i].waiting == "-1") {
					document.getElementById('wpu' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg), url(waiting2.jpg)";
					document.getElementById('wpu' + i + 'info').style.backgroundPosition = "right top, left top, left top";
				}
				if (vehicles.WPU[i].parts == "-1") {
					document.getElementById('wpu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through;'>" + vehicles.WPU[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WPU[i].unitNumber + " <br/>" + vehicles.WPU[i].make;

					if (vehicles.WPU[i].parts == "-1" && vehicles.WPU[i].cash == "-1" && vehicles.WPU[i].estCost != "") {
						document.getElementById('wpu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through;'>" + vehicles.WPU[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WPU[i].unitNumber + " <span class='money'><b>$" + vehicles.WPU[i].estCost + "</b></span><br/>" + vehicles.WPU[i].make;
					}
				} else {
					if (vehicles.WPU[i].cash == "-1" && vehicles.WPU[i].estCost != "") {
						document.getElementById('wpu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WPU[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WPU[i].unitNumber + " <span class='money'><b>$" + vehicles.WPU[i].estCost + "</b></span><br/>" + vehicles.WPU[i].make;

					} else {
						document.getElementById('wpu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WPU[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WPU[i].unitNumber + "<br/>" + vehicles.WPU[i].make;
					}

				}

				document.getElementById('ttWpu' + i).innerHTML = "Date In: "+vehicles.WPU[i].dateIn + "<br/> Date Completed: "+vehicles.WPU[i].dateComplete+"<br/>" + vehicles.WPU[i].custName.toUpperCase() + "<br/> #" + vehicles.WPU[i].unitNumber + "<br/>" + vehicles.WPU[i].make + "<br/>Est Cost:$" + vehicles.WPU[i].estCost;

				var jobType = vehicles.WPU[i].jobCat;
				switch(jobType) {
					case "frame":
					case "Frame":
						document.getElementById('wpu' + i + 'Cat').style.backgroundColor = "red";
						break;
					case "spring":
					case "Spring":
						document.getElementById('wpu' + i + 'Cat').style.backgroundColor = "blue";
						break;
					case "alignment":
					case "Alignment":
						document.getElementById('wpu' + i + 'Cat').style.backgroundColor = "purple";
						break;
					case "kingPin":
					case "King Pin":
						document.getElementById('wpu' + i + 'Cat').style.backgroundColor = "green";
						break;
					case "Check All":

						document.getElementById('wpu' + i + 'Cat').style.backgroundColor = "orange";
						break;
					default:
						break;
				}

			}
		}
	} catch(e) {
		logError(e);
	}

}

function isOdd(x) {
	return x % 2 != 0;
}

function fillWFW() {
	//alert(vehicles.WFW.length);
	testCount = testCount + 1;
	var jobcategory = "";
	for ( i = 0; i < vehicles.WFW.length; i++) {
		var jobcategory = vehicles.WFW[i].jobCat;
		try {
			if (vehicles.WFW[i].shopLocation !== 'new') {
				//alert(vehicles.WFW[i].shopLocation);
				document.getElementById(vehicles.WFW[i].shopLocation).innerHTML = "<div class='vehicle' ondragenter='sortBucket(event)' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>not new</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";

			} else {
				//alert("it was undefined");
				var j = 0;
				//alert(document.getElementById('wfw'+j).hasChildNodes());
				switch(jobcategory) {
					case "Frame":
					case "frame":
						while (document.getElementById(frameBucket[j]).hasChildNodes()) {//'wfw' + j
							//alert(document.getElementById('wfw'+j).hasChildNodes());
							//alert(j);
							j++;
						}
						//alert(frameBucket[j]);
						document.getElementById(frameBucket[j]).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>test</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";
						//xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("shopLocation",document.getElementById(frameBucket[j]));
						//xmlDoc.save("fs.xml");
						break;
					case "Spring":
					case "spring":
						while (document.getElementById(springBucket[j]).hasChildNodes()) {//'wfw' + j

							//alert(document.getElementById('wfw'+j).hasChildNodes());
							//alert(j);
							j++;
						}
						document.getElementById(springBucket[j]).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>Spring</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";
						//xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("shopLocation",document.getElementById(springBucket[j]));
						//xmlDoc.save("fs.xml");

						break;
					case "Alignment":
					case "alignment":
						while (document.getElementById(alignmentBucket[j]).hasChildNodes()) {//'wfw' + j
							//alert(document.getElementById('wfw'+j).hasChildNodes());
							//alert(j);
							j++;
						}
						document.getElementById(alignmentBucket[j]).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>Alignment</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";
						break;
					case "King Pin":
					case "kingPin":
						while (document.getElementById(kingpinBucket[j]).hasChildNodes()) {//'wfw' + j
							//alert(document.getElementById('wfw'+j).hasChildNodes());
							//alert(j);
							j++;
						}
						document.getElementById(kingpinBucket[j]).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>Kingpin</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";
						break;
					case "Check All":
						while (document.getElementById(alignmentBucket[j]).hasChildNodes()) {//'wfw' + j
							//alert(document.getElementById('wfw'+j).hasChildNodes());
							//alert(j);
							j++;
						}
						//alert(frameBucket[j]);
						document.getElementById(alignmentBucket[j]).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>test</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";
						//xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("shopLocation",document.getElementById(frameBucket[j]));
						//xmlDoc.save("fs.xml");
						break;
					default:
						alert("error assigning job category");
						break;
				}

				/*
				while (document.getElementById(frameBucket[j]).hasChildNodes()) {//'wfw' + j
				//alert(document.getElementById('wfw'+j).hasChildNodes());
				j++;
				}

				document.getElementById(frameBucket[j]).innerHTML = "<div class='vehicle' onclick='getEditVehicle(this)' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>Content 1</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";
				*/
				//document.getElementById('wfw'+i).innerHTML="<div class='vehicle' id='drag"+vehicles.WFW[i].xmlPosition+"' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw"+i+"'>Content 1</span><span class='info' id='j"+i+"info'></span><span class='jobCat' id='j"+i+"Cat'></span></div>";
			}//alert(vehicles.WFW[i].xmlPostion);
		} catch(e) {
			logError(e);
			//alert(document.getElementById('wfw'+j).id);
			//alert("hello");
			switch(jobcategory) {
				case "Frame":
				case "frame":
					j = 0;
					break;
				case "Spring":
				case "spring":
					j = 1;
					break;
				case "Alignment":
				case "alignment":
					j = 2;
					break;
				case "King Pin":
				case "kingPin":
					j = 3;
					break;
				default:
					break;
			}
			try {
				while (document.getElementById('wfw' + j).hasChildNodes()) {//'wfw' + j
					//alert(document.getElementById('wfw'+j).hasChildNodes());
					j += 4;

				}
				//alert(e);
				//alert(j);
				document.getElementById('wfw' + j).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>bad shop location</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";

			} catch(e) {
				j = 0;
				while (document.getElementById('wfw' + j).hasChildNodes()) {//'wfw' + j
					//alert(document.getElementById('wfw'+j).hasChildNodes());
					j++;

				}
				//alert(e);

				document.getElementById('wfw' + j).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.WFW[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttWfw" + i + "'>bad shop location</span><span class='info' id='j" + i + "info'></span><span class='jobCat' id='j" + i + "Cat'></span></div>";
			}

		}
		if (vehicles.WFW[i].cash == "-1") {
			document.getElementById('j' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg)";
			document.getElementById('j' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WFW[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WFW[i].unitNumber + " <span class='money'><b>$" + vehicles.WFW[i].estCost + "</b></span><br/>" + vehicles.WFW[i].make;

		}
		if (vehicles.WFW[i].waiting == "-1") {
			document.getElementById('j' + i + 'info').style.backgroundImage = "url(waiting.jpg)";

		}
		if (vehicles.WFW[i].cash == "-1" && vehicles.WFW[i].waiting == "-1") {
			document.getElementById('j' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg), url(waiting.jpg)";
		}
		if (vehicles.WFW[i].comeback == "-1") {
			document.getElementById('j' + i + 'info').style.backgroundImage = "url(warningLegend.png)";
			document.getElementById('j' + i + 'info').style.backgroundPosition = "right top";
		}
		if (vehicles.WFW[i].comeback == "-1" && vehicles.WFW[i].cash == "-1") {
			document.getElementById('j' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg)";
			document.getElementById('j' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.WFW[i].comeback == "-1" && vehicles.WFW[i].waiting == "-1") {
			document.getElementById('j' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(waiting.jpg)";
			document.getElementById('j' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.WFW[i].comeback == "-1" && vehicles.WFW[i].cash == "-1" && vehicles.WFW[i].waiting == "-1") {
			document.getElementById('j' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg), url(waiting2.jpg)";
			document.getElementById('j' + i + 'info').style.backgroundPosition = "right top, left top, left top";
		}
		if (vehicles.WFW[i].parts == "-1") {
			document.getElementById('j' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#a3A3C2;text-decoration:line-through'>" + vehicles.WFW[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WFW[i].unitNumber + " <br/>" + vehicles.WFW[i].make;
			if (vehicles.WFW[i].parts == "-1" && vehicles.WFW[i].cash == "-1" && vehicles.WFW[i].estCost != "") {
				document.getElementById('j' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#a3A3C2;text-decoration:line-through'>" + vehicles.WFW[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WFW[i].unitNumber + " <span class='money'><b>$" + vehicles.WFW[i].estCost + "</b></span><br/>" + vehicles.WFW[i].make;

			}
		} else {
			if (vehicles.WFW[i].cash == "-1" && vehicles.WFW[i].estCost != "") {
				document.getElementById('j' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WFW[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WFW[i].unitNumber + " <span class='money'><b>$" + vehicles.WFW[i].estCost + "</b></span><br/>" + vehicles.WFW[i].make;

			} else {
				document.getElementById('j' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WFW[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WFW[i].unitNumber + "<br/>" + vehicles.WFW[i].make;
			
			}
		}
		document.getElementById('ttWfw' + i).innerHTML = vehicles.WFW[i].dateIn + "<br/> " + vehicles.WFW[i].custName.toUpperCase() + "<br/> #" + vehicles.WFW[i].unitNumber + "<br/>" + vehicles.WFW[i].make + "<br/>Est Cost:$" + vehicles.WFW[i].estCost;

		var jobType = vehicles.WFW[i].jobCat;
		//alert(jobType);
		switch(jobType) {
			//alert(jobType);
			case "Frame":
			case "frame":

				document.getElementById('j' + i + 'Cat').style.backgroundColor = "red";
				break;
			case "Spring":
			case "spring":
				document.getElementById('j' + i + 'Cat').style.backgroundColor = "blue";
				break;
			case "Alignment":
			case "alignment":
				document.getElementById('j' + i + 'Cat').style.backgroundColor = "purple";
				break;
			case "King Pin":
			case "kingPin":
				document.getElementById('j' + i + 'Cat').style.backgroundColor = "green";
				break;
			case "Check All":
				document.getElementById('j' + i + 'Cat').style.backgroundColor = "orange";
				break;
			default:
				break;
		}

	}
}

function fillWIP() {
	//alert(vehicles.WIP.length);
	for ( i = 0; i < vehicles.WIP.length; i++) {
		//alert(i);
		
		document.getElementById(vehicles.WIP[i].shopLocation).innerHTML = "<div oncontextmenu='getEditVehicle(this);return false;' class='vehicle' id='drag" + vehicles.WIP[i].xmlPosition + "' draggable='true' ondragstart='drag(event)' ondrop='drop(event)' ondragover='allowDrop(event)'><span class='tooltip' id='ttWip" + i + "'>Content 1</span><span class='info' id='wip" + i + "info'></span><span class='jobCat' id='wip" + i + "Cat'></span></div>";

		if (vehicles.WIP[i].cash == "-1") {
			document.getElementById('wip' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg)";
			document.getElementById('wip' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WIP[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WIP[i].unitNumber + " <span class='money'><b>$" + vehicles.WIP[i].estCost + "</b></span><br/>" + vehicles.WIP[i].make;

		}
		if (vehicles.WIP[i].waiting == "-1") {
			document.getElementById('wip' + i + 'info').style.backgroundImage = "url(waiting.jpg)";

		}
		if (vehicles.WIP[i].waiting == "-1" && vehicles.WIP[i].cash == "-1") {
			document.getElementById('wip' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg), url(waiting2.jpg)";
			//document.getElementById('wip' + i + 'info').style.backgroundPosition = "right top, left top, left top";

		}
		if (vehicles.WIP[i].comeback == "-1") {
			document.getElementById('wip' + i + 'info').style.backgroundImage = "url(warningLegend.png)";
			document.getElementById('wip' + i + 'info').style.backgroundPosition = "right top";
		}
		if (vehicles.WIP[i].comeback == "-1" && vehicles.WIP[i].cash == "-1") {
			document.getElementById('wip' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg)";
			document.getElementById('wip' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.WIP[i].comeback == "-1" && vehicles.WIP[i].waiting == "-1") {
			document.getElementById('wip' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(waiting.jpg)";
			document.getElementById('wip' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.WIP[i].comeback == "-1" && vehicles.WIP[i].cash == "-1" && vehicles.WIP[i].waiting == "-1") {
			document.getElementById('wip' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg), url(waiting2.jpg)";
			document.getElementById('wip' + i + 'info').style.backgroundPosition = "right top, left top, left top";
		}
		if (vehicles.WIP[i].parts == "-1") {
			document.getElementById('wip' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + vehicles.WIP[i].custName.toUpperCase() + "</b><br/> #:" + vehicles.WIP[i].unitNumber + " <br/>" + vehicles.WIP[i].make;
			if (vehicles.WIP[i].parts == "-1" && vehicles.WIP[i].cash == "-1" && vehicles.WIP[i].estCost != "") {
				document.getElementById('wip' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + vehicles.WIP[i].custName.toUpperCase() + "</b><br/> #:" + vehicles.WIP[i].unitNumber + " <span class='money'><b>$" + vehicles.WIP[i].estCost + "</b></span><br/>" + vehicles.WIP[i].make;

			}
		} else {
			if (vehicles.WIP[i].cash == "-1" && vehicles.WIP[i].estCost != "") {
				document.getElementById('wip' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WIP[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WIP[i].unitNumber + " <span class='money'><b>$" + vehicles.WIP[i].estCost + "</b></span><br/>" + vehicles.WIP[i].make;

			} else {
				document.getElementById('wip' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.WIP[i].custName.toUpperCase() + "</b><br/> #" + vehicles.WIP[i].unitNumber + "<br/>" + vehicles.WIP[i].make;
			}
		}
		document.getElementById('ttWip' + i).innerHTML = vehicles.WIP[i].dateIn + "<br/> " + vehicles.WIP[i].custName.toUpperCase() + "<br/> #" + vehicles.WIP[i].unitNumber + "<br/>" + vehicles.WIP[i].make + "<br/>Est Cost:$" + vehicles.WIP[i].estCost;

		var jobType = vehicles.WIP[i].jobCat;
		switch(jobType) {
			case "frame":
			case "Frame":
				document.getElementById('wip' + i + 'Cat').style.backgroundColor = "red";
				break;
			case "spring":
			case "Spring":
				document.getElementById('wip' + i + 'Cat').style.backgroundColor = "blue";
				break;
			case "alignment":
			case "Alignment":
				document.getElementById('wip' + i + 'Cat').style.backgroundColor = "purple";
				break;
			case "kingPin":
			case "King Pin":
				document.getElementById('wip' + i + 'Cat').style.backgroundColor = "green";
				break;
			case "Check All":

				document.getElementById('wip' + i + 'Cat').style.backgroundColor = "orange";
				break;
			default:
				break;
		}
	}
}

function fillSCH() {
	//alert(vehicles.WIP.length);
	for ( i = 0; i < vehicles.SCH.length; i++) {
		//alert(i);
		if (vehicles.SCH[i].shopLocation !== 'new') {
			//alert(vehicles.WFW[i].shopLocation);
			document.getElementById(vehicles.SCH[i].shopLocation).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.SCH[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttSch" + i + "'>not new</span><span class='info' id='sch" + i + "info'></span><span class='jobCat' id='sch" + i + "Cat'></span></div>";

		} else {
			var j = 0;
			while (document.getElementById('sch' + j).hasChildNodes()) {//'wfw' + j
				//alert(document.getElementById('wfw'+j).hasChildNodes());
				j += 1;

			}
			document.getElementById('sch' + j).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.SCH[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttSch" + i + "'>not new</span><span class='info' id='sch" + i + "info'></span><span class='jobCat' id='sch" + i + "Cat'></span></div>";

		}
		//document.getElementById(vehicles.SCH[i].shopLocation).innerHTML = "<div onclick='getEditVehicle(this)' class='vehicle' id='drag" + vehicles.SCH[i].xmlPosition + "' draggable='true' ondragstart='drag(event)' ondrop='drop(event)' ondragover='allowDrop(event)'><span class='tooltip' id='ttSch" + i + "'>Content 1</span><span class='info' id='sch" + i + "info'></span><span class='jobCat' id='sch" + i + "Cat'></span></div>";

		if (vehicles.SCH[i].cash == "-1") {
			document.getElementById('sch' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg)";
			document.getElementById('sch' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.SCH[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.SCH[i].schDate + " " + vehicles.SCH[i].ampm.toUpperCase() + " <span class='money'><b>$" + vehicles.SCH[i].estCost + "</b></span><br/>" + vehicles.SCH[i].make;

		}
		if (vehicles.SCH[i].waiting == "-1") {
			document.getElementById('sch' + i + 'info').style.backgroundImage = "url(waiting.jpg)";

		}
		if (vehicles.SCH[i].waiting == "-1" && vehicles.SCH[i].cash == "-1") {
			document.getElementById('sch' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg), url(waiting2.jpg)";
			//document.getElementById('sch' + i + 'info').style.backgroundPosition = "right top, left top, left top";

		}
		if (vehicles.SCH[i].comeback == "-1") {
			document.getElementById('sch' + i + 'info').style.backgroundImage = "url(warningLegend.png)";
			document.getElementById('sch' + i + 'info').style.backgroundPosition = "right top";
		}
		if (vehicles.SCH[i].comeback == "-1" && vehicles.SCH[i].cash == "-1") {
			document.getElementById('sch' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg)";
			document.getElementById('sch' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.SCH[i].comeback == "-1" && vehicles.SCH[i].waiting == "-1") {
			document.getElementById('sch' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(waiting.jpg)";
			document.getElementById('sch' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.SCH[i].comeback == "-1" && vehicles.SCH[i].cash == "-1" && vehicles.SCH[i].waiting == "-1") {
			document.getElementById('sch' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg), url(waiting2.jpg)";
			document.getElementById('sch' + i + 'info').style.backgroundPosition = "right top, left top, left top";
		}
		if (vehicles.SCH[i].parts == "-1") {
			document.getElementById('sch' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + vehicles.SCH[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.SCH[i].schDate + " <b>" + vehicles.SCH[i].ampm.toUpperCase() + "</b> <br/>" + vehicles.SCH[i].make;
			if (vehicles.SCH[i].parts == "-1" && vehicles.SCH[i].cash == "-1" && vehicles.SCH[i].estCost != "") {
				document.getElementById('sch' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + vehicles.SCH[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.SCH[i].schDate + " <b>" + vehicles.SCH[i].ampm.toUpperCase() + " </b><span class='money'><b>$" + vehicles.SCH[i].estCost + "</b></span><br/>" + vehicles.SCH[i].make;

			}
		} else {
			if (vehicles.SCH[i].cash == "-1" && vehicles.SCH[i].estCost != "") {
				document.getElementById('sch' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.SCH[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.SCH[i].schDate + " <b>" + vehicles.SCH[i].ampm.toUpperCase() + "</b><span class='money'><b> $" + vehicles.SCH[i].estCost + "</b></span><br/>" + vehicles.SCH[i].make;

			} else {
				document.getElementById('sch' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.SCH[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.SCH[i].schDate + " <b>" + vehicles.SCH[i].ampm.toUpperCase() + "</b><br/>" + vehicles.SCH[i].make;
			}
		}
		document.getElementById('ttSch' + i).innerHTML = "Scheduled:" + vehicles.SCH[i].schDate + " <br/><b>" + vehicles.SCH[i].ampm.toUpperCase() + "</b><br/> " + vehicles.SCH[i].custName.toUpperCase() + "<br/> #" + vehicles.SCH[i].unitNumber + "<br/>" + vehicles.SCH[i].make + "<br/>Est Cost:$" + vehicles.SCH[i].estCost;

		var jobType = vehicles.SCH[i].jobCat;
		switch(jobType) {
			case "frame":
			case "Frame":
				document.getElementById('sch' + i + 'Cat').style.backgroundColor = "red";
				break;
			case "spring":
			case "Spring":
				document.getElementById('sch' + i + 'Cat').style.backgroundColor = "blue";
				break;
			case "alignment":
			case "Alignment":
				document.getElementById('sch' + i + 'Cat').style.backgroundColor = "purple";
				break;
			case "kingPin":
			case "King Pin":
				document.getElementById('sch' + i + 'Cat').style.backgroundColor = "green";
				break;
			case "Check All":

				document.getElementById('sch' + i + 'Cat').style.backgroundColor = "orange";
				break;
			default:
				break;
		}
	}
}

function fillPOS() {
	//alert(vehicles.WIP.length);
	for ( i = 0; i < vehicles.POS.length; i++) {
		//alert(i);
		if (vehicles.POS[i].shopLocation !== 'new') {
			//alert(vehicles.WFW[i].shopLocation);
			document.getElementById(vehicles.POS[i].shopLocation).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.POS[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttPos" + i + "'>not new</span><span class='info' id='pos" + i + "info'></span><span class='jobCat' id='pos" + i + "Cat'></span></div>";
			//alert(vehicles.POS[i].xmlPosition);
		} else {
			var j = 0;
			while (document.getElementById('pos' + j).hasChildNodes()) {//'wfw' + j
				//alert(document.getElementById('wfw'+j).hasChildNodes());
				j += 1;

			}
			document.getElementById('pos' + j).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + vehicles.POS[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttPos" + i + "'>not new</span><span class='info' id='pos" + i + "info'></span><span class='jobCat' id='pos" + i + "Cat'></span></div>";

		}
		//document.getElementById(vehicles.SCH[i].shopLocation).innerHTML = "<div onclick='getEditVehicle(this)' class='vehicle' id='drag" + vehicles.SCH[i].xmlPosition + "' draggable='true' ondragstart='drag(event)' ondrop='drop(event)' ondragover='allowDrop(event)'><span class='tooltip' id='ttSch" + i + "'>Content 1</span><span class='info' id='sch" + i + "info'></span><span class='jobCat' id='sch" + i + "Cat'></span></div>";

		if (vehicles.POS[i].cash == "-1") {
			document.getElementById('pos' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg)";
			document.getElementById('pos' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.POS[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.POS[i].schDate + " <b>" + vehicles.POS[i].ampm.toUpperCase() + "</b> <span class='money'><b> $" + vehicles.POS[i].estCost + "</b></span><br/>" + vehicles.POS[i].make;

		}
		if (vehicles.POS[i].waiting == "-1") {
			document.getElementById('pos' + i + 'info').style.backgroundImage = "url(waiting.jpg)";

		}
		if (vehicles.POS[i].waiting == "-1" && vehicles.POS[i].cash == "-1") {
			document.getElementById('pos' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg), url(waiting2.jpg)";
			//document.getElementById('sch' + i + 'info').style.backgroundPosition = "right top, left top, left top";

		}
		if (vehicles.POS[i].comeback == "-1") {
			document.getElementById('pos' + i + 'info').style.backgroundImage = "url(warningLegend.png)";
			document.getElementById('pos' + i + 'info').style.backgroundPosition = "right top";
		}
		if (vehicles.POS[i].comeback == "-1" && vehicles.POS[i].cash == "-1") {
			document.getElementById('pos' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg)";
			document.getElementById('pos' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.POS[i].comeback == "-1" && vehicles.POS[i].waiting == "-1") {
			document.getElementById('pos' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(waiting.jpg)";
			document.getElementById('pos' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.POS[i].comeback == "-1" && vehicles.POS[i].cash == "-1" && vehicles.POS[i].waiting == "-1") {
			document.getElementById('pos' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg), url(waiting2.jpg)";
			document.getElementById('pos' + i + 'info').style.backgroundPosition = "right top, left top, left top";
		}
		if (vehicles.POS[i].parts == "-1") {
			document.getElementById('pos' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + vehicles.POS[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.POS[i].schDate + " <b>" + vehicles.POS[i].ampm.toUpperCase() + "</b> <br/>" + vehicles.POS[i].make;
			if (vehicles.POS[i].parts == "-1" && vehicles.POS[i].cash == "-1" && vehicles.POS[i].estCost != "") {
				document.getElementById('pos' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + vehicles.POS[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.POS[i].schDate + " <b>" + vehicles.POS[i].ampm.toUpperCase() + "</b> <span class='money'><b>$" + vehicles.POS[i].estCost + "</b></span><br/>" + vehicles.POS[i].make;

			}
		} else {
			if (vehicles.POS[i].cash == "-1" && vehicles.POS[i].estCost != "") {
				document.getElementById('pos' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.POS[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.POS[i].schDate + " >b>" + vehicles.POS[i].ampm.toUpperCase() + "</b> <span class='money'><b> $" + vehicles.POS[i].estCost + "</b></span><br/>" + vehicles.POS[i].make;

			} else {
				document.getElementById('pos' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.POS[i].custName.toUpperCase() + "</b><br/> Scheduled:" + vehicles.POS[i].schDate + " <b>" + vehicles.POS[i].ampm.toUpperCase() + "</b><br/>" + vehicles.POS[i].make;
			}
		}
		document.getElementById('ttPos' + i).innerHTML = "Scheduled: " + vehicles.POS[i].schDate + " <br/><b>" + vehicles.POS[i].ampm.toUpperCase() + "</b><br/> " + vehicles.POS[i].custName.toUpperCase() + "<br/> #" + vehicles.POS[i].unitNumber + "<br/>" + vehicles.POS[i].make + "<br/>Est Cost:$" + vehicles.POS[i].estCost;

		var jobType = vehicles.POS[i].jobCat;
		switch(jobType) {
			case "frame":
			case "Frame":
				document.getElementById('pos' + i + 'Cat').style.backgroundColor = "red";
				break;
			case "spring":
			case "Spring":
				document.getElementById('pos' + i + 'Cat').style.backgroundColor = "blue";
				break;
			case "alignment":
			case "Alignment":
				document.getElementById('pos' + i + 'Cat').style.backgroundColor = "purple";
				break;
			case "kingPin":
			case "King Pin":
				document.getElementById('pos' + i + 'Cat').style.backgroundColor = "green";
				break;
			case "Check All":

				document.getElementById('pos' + i + 'Cat').style.backgroundColor = "orange";
				break;
			default:
				break;
		}
	}
}

function fillNPU() {
	//alert(vehicles.WIP.length);
	for ( i = 0; i < vehicles.NPU.length; i++) {
		//alert(i);
		if (vehicles.NPU[i].shopLocation !== 'new') {
			//alert(vehicles.WFW[i].shopLocation);
			document.getElementById(vehicles.NPU[i].shopLocation).innerHTML = "<div class='vehicle' onclick='getEditVehicle(this)' id='drag" + vehicles.NPU[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttNpu" + i + "'>not new</span><span class='info' id='npu" + i + "info'></span><span class='jobCat' id='npu" + i + "Cat'></span></div>";

		} else {
			var j = 0;
			while (document.getElementById('npu' + j).hasChildNodes()) {//'wfw' + j
				//alert(document.getElementById('wfw'+j).hasChildNodes());
				j += 1;

			}
			document.getElementById('npu' + j).innerHTML = "<div class='vehicle' onclick='getEditVehicle(this)' id='drag" + vehicles.NPU[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='ttNpu" + i + "'>not new</span><span class='info' id='npu" + i + "info'></span><span class='jobCat' id='npu" + i + "Cat'></span></div>";

		}
		//document.getElementById(vehicles.SCH[i].shopLocation).innerHTML = "<div onclick='getEditVehicle(this)' class='vehicle' id='drag" + vehicles.SCH[i].xmlPosition + "' draggable='true' ondragstart='drag(event)' ondrop='drop(event)' ondragover='allowDrop(event)'><span class='tooltip' id='ttSch" + i + "'>Content 1</span><span class='info' id='sch" + i + "info'></span><span class='jobCat' id='sch" + i + "Cat'></span></div>";

		if (vehicles.NPU[i].cash == "-1") {
			document.getElementById('npu' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg)";
			document.getElementById('npu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.NPU[i].custName.toUpperCase() + "</b><br/> #" + vehicles.NPU[i].unitNumber + " <span class='money'><b>$" + vehicles.NPU[i].estCost + "</b></span><br/>" + vehicles.NPU[i].make;

		}
		if (vehicles.NPU[i].waiting == "-1") {
			document.getElementById('npu' + i + 'info').style.backgroundImage = "url(waiting.jpg)";

		}
		if (vehicles.NPU[i].waiting == "-1" && vehicles.NPU[i].cash == "-1") {
			document.getElementById('npu' + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg), url(waiting2.jpg)";
			//document.getElementById('sch' + i + 'info').style.backgroundPosition = "right top, left top, left top";

		}
		if (vehicles.NPU[i].comeback == "-1") {
			document.getElementById('npu' + i + 'info').style.backgroundImage = "url(warningLegend.png)";
			document.getElementById('npu' + i + 'info').style.backgroundPosition = "right top";
		}
		if (vehicles.NPU[i].comeback == "-1" && vehicles.NPU[i].cash == "-1") {
			document.getElementById('npu' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg)";
			document.getElementById('npu' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.NPU[i].comeback == "-1" && vehicles.NPU[i].waiting == "-1") {
			document.getElementById('npu' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(waiting.jpg)";
			document.getElementById('npu' + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (vehicles.NPU[i].comeback == "-1" && vehicles.NPU[i].cash == "-1" && vehicles.NPU[i].waiting == "-1") {
			document.getElementById('npu' + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg), url(waiting2.jpg)";
			document.getElementById('npu' + i + 'info').style.backgroundPosition = "right top, left top, left top";
		}
		if (vehicles.NPU[i].parts == "-1") {
			document.getElementById('npu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + vehicles.NPU[i].custName.toUpperCase() + "</b><br/> #:" + vehicles.NPU[i].unitNumber + " <br/>" + vehicles.NPU[i].make;
			if (vehicles.NPU[i].parts == "-1" && vehicles.NPU[i].cash == "-1" && vehicles.NPU[i].estCost != "") {
				document.getElementById('npu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + vehicles.NPU[i].custName.toUpperCase() + "</b><br/> #:" + vehicles.NPU[i].unitNumber + " <span class='money'><b>$" + vehicles.NPU[i].estCost + "</b></span><br/>" + vehicles.NPU[i].make;

			}
		} else {
			if (vehicles.NPU[i].cash == "-1" && vehicles.NPU[i].estCost != "") {
				document.getElementById('npu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.NPU[i].custName.toUpperCase() + "</b><br/> #" + vehicles.NPU[i].unitNumber + " <span class='money'><b>$" + vehicles.NPU[i].estCost + "</b></span><br/>" + vehicles.NPU[i].make;

			} else {
				document.getElementById('npu' + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + vehicles.NPU[i].custName.toUpperCase() + "</b><br/> #" + vehicles.NPU[i].unitNumber + "<br/>" + vehicles.NPU[i].make;
			}
		}
		document.getElementById('ttNpu' + i).innerHTML = vehicles.NPU[i].dateIn + "<br/> " + vehicles.NPU[i].custName.toUpperCase() + "<br/> #" + vehicles.NPU[i].unitNumber + "<br/>" + vehicles.NPU[i].make + "<br/>Est Cost:$" + vehicles.NPU[i].estCost;

		var jobType = vehicles.NPU[i].jobCat;
		switch(jobType) {
			case "frame":
			case "Frame":
				document.getElementById('npu' + i + 'Cat').style.backgroundColor = "red";
				break;
			case "spring":
			case "Spring":
				document.getElementById('npu' + i + 'Cat').style.backgroundColor = "blue";
				break;
			case "alignment":
			case "Alignment":
				document.getElementById('npu' + i + 'Cat').style.backgroundColor = "purple";
				break;
			case "kingPin":
			case "King Pin":
				document.getElementById('npu' + i + 'Cat').style.backgroundColor = "green";
				break;
			case "Check All":

				document.getElementById('npu' + i + 'Cat').style.backgroundColor = "orange";
				break;
			default:
				break;
		}
	}
}

function Remove(EId) {
	return ( EObj = document.getElementById(EId)) ? EObj.parentNode.removeChild(EObj) : false;
}

function clearWFW() {
	//alert("total slots "+wfwTotalSlots);
	for ( i = 0; i < 48; i++) {
		document.getElementById('wfw' + i).innerHTML = "";
	}
	for ( i = vehicles.WFW.length; i > 0; i--) {
		vehicles.WFW.pop();
		//alert(vehicles.WFW.length);
	}

	for ( i = 48; i < wfwTotalSlots; i++) {

		Remove("wfw" + i);
		//document.getElementById("wfw"+i).outerHTML="";

	}

}

function clearWIP() {
	for ( i = 0; i < 12; i++) {
		document.getElementById('wip' + i).innerHTML = "";
	}
	for ( i = vehicles.WIP.length; i > 0; i--) {
		vehicles.WIP.pop();
		//alert(vehicles.WIP.length);
	}
}

function clearWFP() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('wfp' + i).innerHTML = "";
	}
	for ( i = vehicles.WFP.length; i > 0; i--) {
		vehicles.WFP.pop();
	}
}

function clearWPU() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('wpu' + i).innerHTML = "";
	}
	for ( i = vehicles.WPU.length; i > 0; i--) {
		vehicles.WPU.pop();
		//alert(vehicles.WPU.length);
	}
}

function clearSCH() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('sch' + i).innerHTML = "";
	}
	for ( i = vehicles.SCH.length; i > 0; i--) {
		vehicles.SCH.pop();
		//alert(vehicles.WPU.length);
	}
}

function clearPOS() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('pos' + i).innerHTML = "";
	}
	for ( i = vehicles.POS.length; i > 0; i--) {
		vehicles.POS.pop();
		//alert(vehicles.WPU.length);
	}
}

function clearNPU() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('npu' + i).innerHTML = "";
	}
	for ( i = vehicles.NPU.length; i > 0; i--) {
		vehicles.NPU.pop();
		//alert(vehicles.WPU.length);
	}
}

function clearXML() {
	xmlVehicles = "";
}

function clearPage() {
	clearWFW();
	clearWIP();
	//clearWFP();
	clearWPU();
	clearXML();
	clearSCH();
	//clearPOS();
	//clearNPU();
}

function refresh() {
	clearPage();
	reloadPage();

}

function openAddBox(e) {
	//alert(document.getElementById("add").style.display);

	document.getElementById('my-form').innerHTML = " Customer: <input type='text' id='customer' name='customer' size='20'> Unit#: <input type='text' id='unit' name='unit' maxlength='30' size='10'> Notes: <input type='text' id='make' name='make' size='20'><br/><span id='schedWrapper'>Scheduled Date: <input type='text' id='datepicker2' style='position: relative; z-index: 100000;'> AM<input type='radio' name='ampm' value='am' id='radAM'/> PM<input type='radio' name='ampm' value='pm' id='radPM'/></span>  Cash:<input type='checkbox' id='cash'> Est. Cost: <input type='text' id='cost' name='cost' size='6'>  Parts or Approval Needed:<input type='checkbox' id='parts'>  Comeback: <input type='checkbox' id='comeback'>  Waiting:<input type='checkbox' id='waiting'>  &nbsp;<input type='button' value='Submit' onclick='edit()'>";
	document.getElementById("unit").value = "";
	document.getElementById("make").value = "";
	document.getElementById("cost").value = "";
	document.getElementById("customer").value = "";

	document.getElementById("cash").checked = false;
	document.getElementById("waiting").checked = false;
	document.getElementById("parts").checked = false;
	document.getElementById("comeback").checked = false;
	document.getElementById("radAM").checked = false;
	jc = e.id;
	document.getElementById("customer").focus();
	if (e.parentNode.id.substr(0, 3) == "sch" || e.parentNode.id.substr(0, 3) == "pos") {
		document.getElementById("schedWrapper").style.display = "block";
		document.getElementById("schBox").style.display = "none";
		//document.getElementById("posBox").style.display = "none";
	} else {
		document.getElementById("schedWrapper").style.display = "none";
	}
	
	isOpen = true;

	var headerText = e.innerHTML;
	var eForm = document.getElementById("my-form");
	closeTimer = setTimeout(function() {
		edit();
	}, 90000);
	//alert(isOpen);
	if (e.innerHTML == "Frame" || e.innerHTML == "Spring" || e.innerHTML == "Alignment" || e.innerHTML == "King Pin") {
		document.getElementById("formHeader").innerHTML = "New " + e.innerHTML + " Job";
		document.getElementById("formHeader").className = "header";
		eForm.onsubmit = function() {
			processForm(eForm);
		};
	} else {
		document.getElementById("formHeader").innerHTML = "Edit Job";
		document.getElementById("formHeader").className = "header";
		//loadEditForm();
	}
	switch(headerText) {
		case "Frame":
			document.getElementById("formHeader").style.color = "red";
			break;
		case "Spring":
			document.getElementById("formHeader").style.color = "blue";
			break;
		case "Alignment":
			document.getElementById("formHeader").style.color = "purple";
			break;
		case "King Pin":
			document.getElementById("formHeader").style.color = "green";
			break;
		default:
			break;

	}
}



function processForm(e) {

	addVehicle();
	clearPage();
	fillPage();
	// You must return false to prevent the default form behavior
	clearTimeout(closeTimer);
	return false;
}

function todayIs() {
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var today = month + "/" + day + "/" + year;
	return today;
}

//how to create a new node in xml
//alert("function ca;;"+today());
function addVehicle() {

	var newel = xmlDoc.createElement("vehicle");
	newel.setAttribute("custName", document.getElementById('customer').value);
	newel.setAttribute("unitNumber", document.getElementById('unit').value);
	newel.setAttribute("make", document.getElementById('make').value);
	newel.setAttribute("estCost", document.getElementById('cost').value);
	newel.setAttribute("dateIn", today());
	newel.setAttribute("jobCat", jc);
	newel.setAttribute("status", "wfw");
	newel.setAttribute("cash", document.getElementById('cash').checked);
	newel.setAttribute("waiting", document.getElementById('waiting').checked);
	newel.setAttribute("comeback", document.getElementById('comeback').checked);
	newel.setAttribute("parts", document.getElementById('parts').checked);
	newel.setAttribute("shopLocation", "new");

	xmlDoc.getElementsByTagName("workflow")[0].appendChild(newel);

	//alert(x.xml);
	xmlDoc.save("fs.xml");
}

function addNewVehicle() {
	//alert($("input[type='radio'][name='ampm2']:checked").val());
	var originOptions = document.getElementById("selOrigin");
	var selectedOrigin = originOptions.options[originOptions.selectedIndex].text;
	var newStatus;
	switch(selectedOrigin) {
		case "On the Lot":
			newStatus = "wfw";
			break;
		case "Call:Scheduled":
			newStatus = "sch";
			break;
		case "Call:Possible":
			newStatus = "pos";
			break;
		case "Needs Picked Up":
			newStatus = "npu";
			break;
		default:
			newStatus = "wfw";
			break;
	}
	var newel = xmlDoc.createElement("vehicle");
	newel.setAttribute("custName", document.getElementById('txtCustomerName').value);
	newel.setAttribute("unitNumber", document.getElementById('txtUnit').value);
	newel.setAttribute("make", document.getElementById('txtNotes').value);
	newel.setAttribute("estCost", document.getElementById('txtCost').value);
	newel.setAttribute("dateIn", todayIs());
	//newel.setAttribute("jobCat", jc);
	newel.setAttribute("status", newStatus);
	newel.setAttribute("cash", document.getElementById('cbCash').checked);
	newel.setAttribute("waiting", document.getElementById('cbWaiting').checked);
	newel.setAttribute("comeback", document.getElementById('cbComeback').checked);
	newel.setAttribute("parts", document.getElementById('cbParts').checked);
	newel.setAttribute("shopLocation", "new");
	var jtOptions = document.getElementById("selJobType");
	newel.setAttribute("jobCat", jtOptions.options[jtOptions.selectedIndex].text);
	newel.setAttribute("schDate", document.getElementById("datepicker").value);

	newel.setAttribute("origin", selectedOrigin);
	newel.setAttribute("ampm", $("input[type='radio'][name='ampm2']:checked").val());
	newel.setAttribute("recordNumber", WriteToFile());
	xmlDoc.getElementsByTagName("workflow")[0].appendChild(newel);

	//alert(x.xml);
	xmlDoc.save("fs.xml");
	//WriteToFile();
}

function storeCompletedJobs() {
	//alert($("input[type='radio'][name='ampm2']:checked").val());
	//var e=ev.dataTransfer.getData("Text");

	try {
		var thisID = xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc];
		var exists = false;
		for ( i = 0; i < storedXMLVehicles.length; i++) {
			switch(storedXMLVehicles[i].getAttribute("recordNumber")) {
				case thisID.getAttribute('recordNumber'):
					exists = true;
					break;
				default:
					exists = false;
					break;
			}
		}
		if (!exists) {
			//alert(storedXMLVehicles[i].getAttribute("recordNumber"));
			//alert(thisID.getAttribute("recordNumber"));
			//var thisJob=
			var newel = dbReports.createElement("vehicle");
			newel.setAttribute("custName", thisID.getAttribute("custName"));
			newel.setAttribute("unitNumber", thisID.getAttribute("unitNumber"));
			newel.setAttribute("make", thisID.getAttribute("make"));
			newel.setAttribute("estCost", thisID.getAttribute("estCost"));
			newel.setAttribute("dateIn", thisID.getAttribute("dateIn"));
			newel.setAttribute("dateCompleted", todayIs());
			//newel.setAttribute("jobCat", jc);
			newel.setAttribute("status", "wpu");
			newel.setAttribute("cash", thisID.getAttribute("cash"));
			newel.setAttribute("waiting", thisID.getAttribute("waiting"));
			newel.setAttribute("comeback", thisID.getAttribute("comeback"));
			newel.setAttribute("parts", thisID.getAttribute("parts"));
			newel.setAttribute("shopLocation", thisID.getAttribute("shopLocation"));
			if (thisID.getAttribute("recordNumber")) {

				newel.setAttribute("recordNumber", thisID.getAttribute("recordNumber"));
			} else {
				newel.setAttribute("recordNumber", WriteToFile());
				thisID.setAttribute("recordNumber", readFile());
			}
			newel.setAttribute("jobCat", thisID.getAttribute("jobCat"));
			//newel.setAttribute("schDate", thisID.getAttribute("schDate"));

			//newel.setAttribute("origin",thisID.getAttribute("origin"));
			//newel.setAttribute("ampm",thisID.getAttribute("ampm"));
			dbReports.getElementsByTagName("workflow")[0].appendChild(newel);

			//alert(x.xml);
			dbReports.save("completedJobs.xml");
			xmlDoc.save("fs.xml");
		}
	} catch(e) {
		logError(e.stack);
		alert(e.stack);
	}
}

function getJobsCreatedCount(d) {
	var count = 0;
	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateIn") == d) {
			switch(xmlVehicles[i].getAttribute("status")) {
				case "pos":
				case "sch":
					break;
				default:
					count++;
					break;
			}
		}
	}
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateIn") == d) {

			count++

		}
	}
	return count;
}

function getSpring() {
	var dateNeeded = document.getElementById("datepickerReport").value;
	var count = 0;
	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (xmlVehicles[i].getAttribute("jobCat") == "Spring" || xmlVehicles[i].getAttribute("jobCat") == "spring") {

				switch(xmlVehicles[i].getAttribute("status")) {
					case "pos":
					case "sch":
						break;
					default:
						count++;
						break;
				}
			}
		}
	}
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (storedXMLVehicles[i].getAttribute("jobCat") == "Spring" || storedXMLVehicles[i].getAttribute("jobCat") == "spring") {

				count++
			}
		}
	}
	return count;
}

function getFrame() {
	var dateNeeded = document.getElementById("datepickerReport").value;
	var count = 0;
	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (xmlVehicles[i].getAttribute("jobCat") == "Frame" || xmlVehicles[i].getAttribute("jobCat") == "frame") {

				switch(xmlVehicles[i].getAttribute("status")) {
					case "pos":
					case "sch":
						break;
					default:
						count++;
						break;
				}
			}
		}
	}
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (storedXMLVehicles[i].getAttribute("jobCat") == "Frame" || storedXMLVehicles[i].getAttribute("jobCat") == "frame") {

				count++;
			}
		}
	}
	return count;
}

function getKingPin() {
	var dateNeeded = document.getElementById("datepickerReport").value;
	var count = 0;
	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (xmlVehicles[i].getAttribute("jobCat") == "King Pin" || xmlVehicles[i].getAttribute("jobCat") == "kingPin") {

				switch(xmlVehicles[i].getAttribute("status")) {
					case "pos":
					case "sch":
						break;
					default:
						count++;
						break;
				}
			}
		}
	}
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (storedXMLVehicles[i].getAttribute("jobCat") == "King Pin" || storedXMLVehicles[i].getAttribute("jobCat") == "kingPin") {

				count++
			}
		}
	}
	return count;
}

function getAlignment() {
	var dateNeeded = document.getElementById("datepickerReport").value;
	var count = 0;
	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (xmlVehicles[i].getAttribute("jobCat") == "Alignment" || xmlVehicles[i].getAttribute("jobCat") == "alignment") {

				switch(xmlVehicles[i].getAttribute("status")) {
					case "pos":
					case "sch":
						break;
					default:
						count++;
						break;
				}
			}
		}
	}
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (storedXMLVehicles[i].getAttribute("jobCat") == "Alignment" || storedXMLVehicles[i].getAttribute("jobCat") == "alignment") {

				count++;
			}
		}
	}
	return count;
}

function getCheckAll() {
	var dateNeeded = document.getElementById("datepickerReport").value;
	var count = 0;
	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (xmlVehicles[i].getAttribute("jobCat") == "Check All") {
				switch(xmlVehicles[i].getAttribute("status")) {
					case "pos":
					case "sch":
						break;
					default:
						count++;
						break;
				}

				//count++;
			}
		}
	}
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateIn") == dateNeeded) {
			if (storedXMLVehicles[i].getAttribute("jobCat") == "Check All") {

				count++
			}
		}
	}
	return count;
}

function getCompleted() {
	var dateNeeded = document.getElementById("datepickerReport").value;
	var count = 0;
	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateCompleted") == dateNeeded) {

			count++;

		}
	}
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateCompleted") == dateNeeded) {

			count++;

		}
	}
	return count;
}

function getCompletedCash() {
	var dateNeeded = document.getElementById("datepickerReport").value;
	var count = 0;

	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateCompleted") == dateNeeded && xmlVehicles[i].getAttribute("cash") == "-1") {

			count++;

		}
	}
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateCompleted") == dateNeeded && storedXMLVehicles[i].getAttribute("cash") == "-1") {

			count++;

		}
	}
	return count;
}

function getCompletedCashAmount() {
	var dateNeeded = document.getElementById("datepickerReport").value;
	var amount = 0;
	var amount2 = 0;
	var thisAmount = 0;
	var thatAmount = 0;
	//pullData();
	for ( i = 0; i < xmlVehicles.length; i++) {
		if (xmlVehicles[i].getAttribute("dateComplete") == dateNeeded && xmlVehicles[i].getAttribute("cash") == "-1") {
			thisAmount = xmlVehicles[i].getAttribute('estCost');
			//alert(thisAmount);
			amount2 += Number(thisAmount);

		}
	}
	cashJobs.stillHere = amount2;

	amount2 = 0;
	for ( i = 0; i < storedXMLVehicles.length; i++) {
		if (storedXMLVehicles[i].getAttribute("dateCompleted") == dateNeeded && storedXMLVehicles[i].getAttribute("cash") == "-1") {
			thatAmount = storedXMLVehicles[i].getAttribute('estCost');
			//alert(thatAmount);
			amount += Number(thatAmount);

		}
	}
	cashJobs.completed = amount;
	cashJobs.pickedUp = cashJobs.completed - cashJobs.stillHere;

}

function getEOD() {
	document.getElementById("reportPrint").style.display = "block";
	document.getElementById('reportFormWrapper').style.display = "block";
	document.getElementById("inpCheck").focus();
	document.body.style.opacity = ".50";
	document.getElementById("reportPrint").style.opacity = "1";
	document.getElementById("reportFormWrapper").style.opacity = "1";
	//document.getElementById("posBox").style.display = "none";
	document.getElementById("schBox").style.display = "none";

	$("#datepickerReport").datepicker({
		onSelect : function(dateText, inst) {
			document.getElementById("inpCheck").value = "";
			document.getElementById("inpCheck").focus();
			document.getElementById("inpBatch").value = "";
			document.getElementById("inpUPS").value = "";
			document.getElementById("inpSpent").value = "";
			document.getElementById("inpDaily").value = "";
			document.getElementById("inpMonthly").value = "";
			document.getElementById("totalCashCheck").innerHTML = "";
			document.getElementById("totalBatch").innerHTML = "";
			document.getElementById("totalUPS").innerHTML = "";
			document.getElementById("totalSpent").innerHTML = "";
			document.getElementById("totalDaily").innerHTML = "";
			document.getElementById("totalMonthly").innerHTML = "";

			document.getElementById("totalJobs").innerHTML = getJobsCreatedCount(dateText);
			document.getElementById("totalSpring").innerHTML = getSpring();
			document.getElementById("totalFrame").innerHTML = getFrame();
			document.getElementById("totalKingPin").innerHTML = getKingPin();
			document.getElementById("totalAlignment").innerHTML = getAlignment();
			document.getElementById("totalCheckAll").innerHTML = getCheckAll();
			document.getElementById("totalCompleted").innerHTML = getCompleted();
			document.getElementById("totalCashJobs").innerHTML = getCompletedCash();
			document.getElementById("reportHeader").innerHTML = "EOD Report " + document.getElementById("datepickerReport").value;
			getCompletedCashAmount();
			document.getElementById("totalCashJobsAmount").innerHTML = "$" + cashJobs.completed.toFixed(2);
			document.getElementById("totalCashJobsStillHere").innerHTML = "$" + cashJobs.stillHere.toFixed(2);
			document.getElementById("totalCashJobsPickedUp").innerHTML = "$" + cashJobs.pickedUp.toFixed(2);
			//alert(dateText + " "+todayIs()+ " "+getJobsCreatedCount(dateText));
		},
		dateFormat : "m/d/yy"

	});
	$("#datepickerReport").datepicker("setDate", -1);
	document.getElementById("reportHeader").innerHTML = "EOD Report " + document.getElementById("datepickerReport").value;

	//document.getElementById('frameReport').style.display="block";

	document.getElementById("totalJobs").innerHTML = getJobsCreatedCount(todayIs());
	document.getElementById("totalSpring").innerHTML = getSpring();
	document.getElementById("totalFrame").innerHTML = getFrame();
	document.getElementById("totalKingPin").innerHTML = getKingPin();
	document.getElementById("totalAlignment").innerHTML = getAlignment();
	document.getElementById("totalCheckAll").innerHTML = getCheckAll();
	document.getElementById("totalCompleted").innerHTML = getCompleted();
	document.getElementById("totalCashJobs").innerHTML = getCompletedCash();
	getCompletedCashAmount();
	document.getElementById("totalCashJobsAmount").innerHTML = "$" + cashJobs.completed.toFixed(2);
	document.getElementById("totalCashJobsStillHere").innerHTML = "$" + cashJobs.stillHere.toFixed(2);
	document.getElementById("totalCashJobsPickedUp").innerHTML = "$" + cashJobs.pickedUp.toFixed(2);

	objJobs = dbReports.getElementsByTagName("workflow")[0].childNodes;
	for ( i = 0; i < objJobs.length; i++) {
		if (objJobs[i].getAttribute("dateCompleted") == todayIs()) {
			//alert(objJobs[i].getAttribute("custName"));
		}
	}

}

function getReportData() {
	var totCreated;
	var totSpring;
	var totFrame;
	var totKingPin;
	var totCheckAll;
	var totAlignment;
	var totCompleted;
	var totCashCompleted;
	var totCashAmount;

	for ( i = 0; i < dbReports.length; i++) {

	}
}

function setNewLocation() {
	//alert("setNewLocation"+loc);
	xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("status", newStatus);
	//alert(newStatus);
	//if(newStatus=="wip"){
	xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("shopLocation", ns);
	//}
	xmlDoc.save("fs.xml");
	//fillPage();
}

function getEditVehicle(e) {
	//var thisVehicle="vehicles."+e.id.substr(0,3)+"["+e.id.substr(4,2)+"].status";
	//alert(e.id);
	for ( i = 0; i < vehicles.WFW.length; i++) {
		document.getElementById("j" + i + "info").style.backgroundColor = "white";

	}
	for ( i = 0; i < vehicles.WIP.length; i++) {
		document.getElementById("wip" + i + "info").style.backgroundColor = "white";
		document.getElementById("wip" + i).draggable = true;
	}
	for ( i = 0; i < vehicles.WPU.length; i++) {
		document.getElementById("wpu" + i + "info").style.backgroundColor = "white";

	}

	for ( i = 0; i < vehicles.SCH.length; i++) {
		//alert(document.getElementById("sch"+i+"info").id);
		document.getElementById("sch" + i + "info").style.backgroundColor = "white";

	}
/*
	for ( i = 0; i < vehicles.POS.length; i++) {
		//alert(vehicles.POS.length);
		document.getElementById("pos" + i + "info").style.backgroundColor = "white";

	}
	for ( i = 0; i < vehicles.NPU.length; i++) {
		document.getElementById("npu" + i + "info").style.backgroundColor = "white";

	}*/
	//alert(e.id);

	openAddBox(e);
	var c = e.id.substr(4, 2);
	//alert(e.parentNode.id);
	//var l=e.parentNode.id.substr(0,3).toUpperCase();
	//alert(l);
	//var thisVehicleCustomer=vehicles.WFW[c-1].custName;
	//alert(thisVehicleCustomer);
	//alert(e.childNodes[1].id);
	e.childNodes[1].style.backgroundColor = "#F5FCC7";
	//e.parentNode.style.borderColor="blue";
	pullData();

	//alert(c);
	vehicleToEdit = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c];
	eName = vehicleToEdit.getAttribute("custName");
	eCash = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("cash");
	eUnit = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("unitNumber");
	eMake = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("make");
	eCost = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("estCost");
	eJobCat = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("jobCat");
	eWaiting = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("waiting");
	eDate = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("dateIn");
	eParts = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("parts");
	eComeback = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("comeback");
	eSchDate = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("schDate");
	eAMPM = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c].getAttribute("ampm");
	//alert(b);
	//alert(c);
	var f = document.getElementById("my-form").innerHTML;
	var eForm = document.getElementById("my-form");

	var r = "Date In: <input type='text' id='date' size='10'> <select id='jtSelect'><option id='frameOption' value='option1'>Frame</option><option id='springOption' value='option2'>Spring</option><option id='alignmentOption' value='option3'>Alignment</option><option id='kingPinOption' value='option4'>King Pin</option><option id='checkAllOption' value='option5'>Check All</option></select>";
	document.getElementById("my-form").innerHTML = r + f;
	document.getElementById("customer").value = eName;
	//alert(eCash);
	if (eCash < 0) {
		document.getElementById("cash").checked = true;
	} else {
		document.getElementById("cash").checked = false;
	}
	if (eWaiting < 0) {
		document.getElementById("waiting").checked = true;
	} else {
		document.getElementById("waiting").checked = false;
	}
	if (eComeback < 0) {
		document.getElementById("comeback").checked = true;
	} else {
		document.getElementById("comeback").checked = false;
	}
	if (eParts < 0) {
		document.getElementById("parts").checked = true;
	} else {
		document.getElementById("parts").checked = false;
	}
	document.getElementById("unit").value = eUnit;
	document.getElementById("make").value = eMake;
	document.getElementById("cost").value = eCost;
	document.getElementById("date").value = eDate;
	$(function() {
		$("#datepicker2").datepicker({
			dateFormat : "m/d/yy"
		});
		$("#datepicker2").datepicker('setDate', todayIs());
	});

	document.getElementById("datepicker2").value = eSchDate;

	if (eAMPM == "am") {
		//alert(eAMPM);
		$("#radAM").prop("checked", true);
		//alert($("#radAM").checked);
	}
	if (eAMPM == "pm") {
		$("#radPM").prop("checked", true);
	}
	//alert(eCost);
	switch(eJobCat) {
		case "frame":
		case "Frame":
			document.getElementById('frameOption').setAttribute("selected", "selected");
			document.getElementById("formHeader").style.color = "red";
			break;
		case "spring":
		case "Spring":
			document.getElementById('springOption').setAttribute("selected", "selected");
			document.getElementById("formHeader").style.color = "blue";
			break;
		case "alignment":
		case "Alignment":
			document.getElementById('alignmentOption').setAttribute("selected", "selected");
			document.getElementById("formHeader").style.color = "purple";
			break;
		case "kingPin":
		case "King Pin":
			document.getElementById('kingPinOption').setAttribute("selected", "selected");
			document.getElementById("formHeader").style.color = "green";
			break;
		case "Check All":
			document.getElementById('checkAllOption').setAttribute("selected", "selected");
			document.getElementById("formHeader").style.color = "orange";
			break;
		default:
			break;
	}

	boxToChange = e.childNodes[1].id;
	//alert(e.childNodes[1].id);
	eForm.onsubmit = function() {
		//alert("edit function on submit");
		//pullData();
		//vehicleToEdit = xmlDoc.getElementsByTagName("workflow")[0].childNodes[c];
		//alert($("input[type='radio'][name='ampm2']:checked").val()");

		vehicleToEdit.setAttribute("custName", document.getElementById("customer").value);
		vehicleToEdit.setAttribute("cash", document.getElementById("cash").checked);
		vehicleToEdit.setAttribute("waiting", document.getElementById("waiting").checked);
		vehicleToEdit.setAttribute("unitNumber", document.getElementById("unit").value);
		vehicleToEdit.setAttribute("make", document.getElementById("make").value);
		vehicleToEdit.setAttribute("comeback", document.getElementById("comeback").checked);
		vehicleToEdit.setAttribute("parts", document.getElementById("parts").checked);
		vehicleToEdit.setAttribute("estCost", document.getElementById("cost").value);
		vehicleToEdit.setAttribute("dateIn", document.getElementById("date").value);
		//vehicleToEdit.setAttribute("custName",document.getElementById("customer").value);
		var jtOptions = document.getElementById("jtSelect");
		vehicleToEdit.setAttribute("jobCat", jtOptions.options[jtOptions.selectedIndex].text);
		vehicleToEdit.setAttribute("schDate", document.getElementById("datepicker2").value);
		vehicleToEdit.setAttribute("ampm", $("input[type='radio'][name='ampm']:checked").val());

		xmlDoc.save("fs.xml");

		isOpen = false;
		clearTimeout(closeTimer);
		try {

			document.getElementById(boxToChange).style.backgroundColor = "white";
		} catch(e) {
			document.getElementById(ns).childNodes[0].style.backgroundColor = "blue";
		}
	};

	

}
function edit(){
	
	vehicleToEdit.setAttribute("custName", document.getElementById("customer").value);
		vehicleToEdit.setAttribute("cash", document.getElementById("cash").checked);
		vehicleToEdit.setAttribute("waiting", document.getElementById("waiting").checked);
		vehicleToEdit.setAttribute("unitNumber", document.getElementById("unit").value);
		vehicleToEdit.setAttribute("make", document.getElementById("make").value);
		vehicleToEdit.setAttribute("comeback", document.getElementById("comeback").checked);
		vehicleToEdit.setAttribute("parts", document.getElementById("parts").checked);
		vehicleToEdit.setAttribute("estCost", document.getElementById("cost").value);
		vehicleToEdit.setAttribute("dateIn", document.getElementById("date").value);
		//vehicleToEdit.setAttribute("custName",document.getElementById("customer").value);
		var jtOptions = document.getElementById("jtSelect");
		vehicleToEdit.setAttribute("jobCat", jtOptions.options[jtOptions.selectedIndex].text);
		vehicleToEdit.setAttribute("schDate", document.getElementById("datepicker2").value);
		vehicleToEdit.setAttribute("ampm", $("input[type='radio'][name='ampm']:checked").val());

		xmlDoc.save("fs.xml");

		isOpen = false;
		clearTimeout(closeTimer);
		try {

			document.getElementById(boxToChange).style.backgroundColor = "white";
		} catch(e) {
			logError(e);
		}
		document.getElementById('my-form').submit();
		
		reloadPage();
}
function setEditVehicle() {
	document.getElementById("my-form").submit();
	//xmlDoc.save("fs.xml");
}

function checkIfFull() {
	//alert(vehicles.WPU.length);
	if (vehicles.WPU.length > 19) {
		alert("The Job Complete section is full. Please delete picked up vehicles from the Job Complete section.");
	}
}

function callBackup() {
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.Run("backupXML.bat", 1, true);
	//toggleAdminMenu();
}

function callRestore() {
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.Run("restoreXML.bat", 1, true);
	reloadPage();
	//toggleAdminMenu();
}

function createRecords() {
	for ( i = 0; i < xmlVehicles.length; i++) {
		xmlDoc.getElementsByTagName("workflow")[0].childNodes[i].setAttribute("recordNumber", i + 1);
		if (!xmlDoc.getElementsByTagName("workflow")[0].childNodes[i].getAttribute("schDate")) {
			xmlDoc.getElementsByTagName("workflow")[0].childNodes[i].setAttribute("schDate", "");
			//alert("no schDate for this record");
		}
		if (!xmlDoc.getElementsByTagName("workflow")[0].childNodes[i].getAttribute("ampm")) {
			xmlDoc.getElementsByTagName("workflow")[0].childNodes[i].setAttribute("ampm", "");
		}
		xmlDoc.save("fs.xml");
		var fso, s, lrn;

		fso = new ActiveXObject("Scripting.FileSystemObject");

		s = fso.OpenTextFile("data/lastRecordNumber.txt", 2, 1, -2);
		s.writeline(xmlVehicles.length);

		s.Close();
	}
}

function printDiv(divName) {
	//var printContents = document.getElementById(divName).innerHTML;
	var newHead = "<head>\n <link rel=\"stylesheet\" type=\"text/css\"  href=\"css/print.css\">\n<script>$( \"#datepickerReport\" ).datepicker();$(\"#datepickerReport\").datepicker(\"setDate\", todayIs());</script>\n</head>"
	var newContents = document.getElementById(divName).innerHTML;
	//alert(document.head.innerHTML);
	var originalHead = document.head.innerHTML;
	//document.body.innerHTML;
	var originalContents = document.body.innerHTML;
	var printContents = newHead + newContents;
	iframeReportData.push[ {
		"totalCashCheck" : document.getElementById("inpCheck").value,
		"totalUPS" : document.getElementById("inpUPS").value,
		"totalBatch" : document.getElementById("inpBatch").value,
		"totalSpent" : document.getElementById("inpSpent").value,
		"totalDaily" : document.getElementById("inpDaily").value,
		"totalMonthly" : document.getElementById("inpMonthly").value

	}];

	document.body.style.opacity = "1";

	document.getElementById("reportPrint").style.display = "none";
	document.getElementById("reportFormWrapper").style.display = "none";

	try {
		var oIframe = document.getElementById('frameReport');
		var oContent = document.getElementById('reportPrint').innerHTML;
		var oDoc = (oIframe.contentWindow || oIframe.contentDocument);
		if (oDoc.document)
			oDoc = oDoc.document;
		oDoc.write("<html><head><title>title</title>");
		oDoc.write("<link href='css/print.css' rel='stylesheet' type='text/css'/></head><body onload='this.focus(); this.print();'>");
		oDoc.write(oContent + "</body></html>");
		oDoc.close();

	} catch(e) {
		alert(e.stack);
		self.print();
	}

}

function fillPrint(e) {
	thisTotal = e.id;
	//alert(e.value);
	//iframe.open();
	switch(thisTotal) {
		case "datepickerReport":
			if (e.value == "") {
				e.value = todayIs();
			} else {
				document.getElementById("reportHeader").innerHTML = "EOD Report " + e.value;

			}
			break;
		case "inpCheck":
			if (e.value == "") {
				e.value = "0";
			} else {
				document.getElementById("totalCashCheck").innerHTML = "$" + e.value;

			}
			break;
		case "inpBatch":
			if (e.value == "") {
				e.value = "0";
			} else {
				document.getElementById("totalBatch").innerHTML = "$" + e.value;
			}
			break;
		case "inpUPS":
			if (e.value == "") {
				e.value = "0";
			} else {
				document.getElementById("totalUPS").innerHTML = "$" + e.value;
			}
			break;
		case "inpSpent":
			if (e.value == "") {
				e.value = "0";
			} else {
				document.getElementById("totalSpent").innerHTML = "$" + e.value;
			}
			break;
		case "inpDaily":
			if (e.value == "") {
				e.value = "0";
			} else {
				document.getElementById("totalDaily").innerHTML = "$" + e.value;
			}
			break;
		case "inpMonthly":
			if (e.value == "") {
				e.value = "0";
			} else {
				document.getElementById("totalMonthly").innerHTML = "$" + e.value;
			}
			break;
		default:
			break;
	}
	//iframe.close();
}


function writeFrame() {
	var strContent = "<div id=\"reportHeader\">EOD Report </div>\n";
	strContent += "<div class=\"lineItem\">Cash/Check on Hand<span class=\"reportTotal\" id=\"totalCashCheck\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">Batch Total<span class=\"reportTotal\" id=\"totalBatch\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">UPS Payments<span class=\"reportTotal\" id=\"totalUPS\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">Total Spent<span class=\"reportTotal\" id=\"totalSpent\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">Daily Total<span class=\"reportTotal\" id=\"totalDaily\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">Monthly Total<span class=\"reportTotal\" id=\"totalMonthly\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">Total Jobs created<span class=\"reportTotal\" id=\"totalJobs\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">&nbsp;--Total Spring<span class=\"reportTotal\" id=\"totalSpring\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">&nbsp;--Total Alignment<span class=\"reportTotal\" id=\"totalAlignment\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">&nbsp;--Total King Pin<span class=\"reportTotal\" id=\"totalKingPin\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">&nbsp;--Total Frame<span class=\"reportTotal\" id=\"totalFrame\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">&nbsp;--Total Check All<span class=\"reportTotal\" id=\"totalCheckAll\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">Total Completed<span class=\"reportTotal\" id=\"totalCompleted\">37</span></div>\n";
	strContent += "<div class=\"lineItem\">Total Cash Jobs Completed<span class=\"reportTotal\" id=\"totalCashJobs\">37</span></div>\n";

	return strContent;
}

function hasFocus(el) {
	var inpThis = el;
	inpThis.value = "";
	inpThis.style.backgroundColor = "black";
	inpThis.style.cursor = text;
	$(inpThis).focusin(function() {
		$(this).css("background-color", "#FFFFCC");
	});
}
function fillCustomerDataList(){
	document.getElementById('lstCustomer').style.display="block";
	var el=document.getElementById('lstCustomer');
	//alert(el.id);
	//alert(xmlVehicles.length);
	for(i=0;i<xmlVehicles.length;i++){
		if(xmlVehicles[i].getAttribute('cash')!='-1'){
		var newOption=document.createElement("OPTION");
		newOption.setAttribute("value",xmlVehicles[i].getAttribute('custName'));
		el.appendChild(newOption);
		}
		//alert(newOption.value);
		
	}
	
	document.getElementById('lstCustomer');
}