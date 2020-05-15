/*
WORKFLOW APP written by Sean Davidson 
For use at Frame & Spring in tracking daily movements
of vehicles/jobs using HTA with CSS and javascript and
using XML as a database
*/

/*renderor file in electron app addition starts here
/*
*/
const electron = require('electron')
const ipc = electron.ipcRenderer
const btn = document.getElementById("btnEdit")
const container = document.getElementById("customerContainer")


let jobToEdit = {}
let loggedIn = false
let listItem
let extractedData
let customerList = document.getElementById('customerList')
let x
let jFile
let rawFile
let totalCount = 0
let lotCount = 0
let scheduledCount = 0
let completedCount = 0
let bucket = {}
let openContent = createOpenContent();
let accessGrantedContent
//window.$ = window.jQuery = require('jquery');
 window.onload = () =>{
	 ipc.send('message')
	 
	 
 }
 function openCalendar(){
	 ipc.send('open-calendar')
	 	
 }
 function jDate(ds){
    //console.log(ds)

    var ds = ds;    
    
    var dayScheduled = new Date(ds);
    var julian= Math.ceil((dayScheduled - new Date(dayScheduled.getFullYear(),0,0)) / 86400000);
    
    return julian;
}
function openCreateUser(){
	ipc.send('open-create-user')
}
 function eod(){
	console.log("button clicked")
	attachDatePicker()
	$('#datepickerReport').focus()
	$("#datepickerReport").value = todayIs()
	ipc.send('open-report-window')
	   
 }   
 ipc.on('retreivedVehicle', (event, args)=>{
	 jobToEdit = args[0]
	//console.log(jobToEdit.dateIn)
	
})
ipc.on('file-changed', (event, args)=>{
	refresh();
   console.log(args)
   
})
ipc.on('count', (event,args)=>{
	countStatuses()
})
// communication for setting page
 ipc.on('message', (event, args)=>{		
	accessGrantedContent = document.getElementById('contentArea').innerHTML
	for (var member in args){ 
		placeElement(args[member]);			
	}	
	countStatuses()
	document.getElementById('contentArea').innerHTML = openContent;   	
	
 })
 ipc.on('reload',(event,args)=>{
	clearPage()    	
	for (var member in args){ 
		placeElement(args[member]);			
	}
	countStatuses()	 
 })

 ipc.on('placeNewJob', (event, args)=>{
	placeElement(args)
	countStatuses()
})
 

 
     
 
//global variables
var oldBucket=[];
var newBucket=[];
var boxToChange="";
//var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
//var dbReports = new ActiveXObject('Microsoft.XMLDOM');
//var backup_xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
var vehicles = {
	WFW : [],
	WFP : [],
	WIP : [],
	WPU : [],
	SCH : [],
	POS : [],
	NPU : []
};
const wpuBucket =["wpu0","wpu1","wpu2","wpu3","wpu4","wpu5","wpu6","wpu7","wpu8","wpu9","wpu10","wpu11","wpu12","wpu13","wpu14","wpu15","wpu16","wpu17","wpu18","wpu19"];
let companyList = []	
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
var schJobsBucket = {
	frame : [],
	spring : [],
	alignment : [],
	kingpin : [],
	checkall : []
};
//var lastRecord = readFile('lastRecordNumber');
//var lastRecord = readFile("data/lastRecordNumber.txt");
var closeTimer;
var loc = "";
var newStatus = "";
var isOpen = false;
var jc = "";
const date = new Date();
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
/*
let springBucket = ["wfw0", "wfw1", "wfw2", "wfw3", "wfw4", "wfw5", "wfw6", "wfw7", "wfw8", "wfw9", "wfw10", "wfw11"];
var checkallBucket = ["wfw12", "wfw13", "wfw14", "wfw15", "wfw16", "wfw17", "wfw18", "wfw19", "wfw20", "wfw21", "wfw22", "wfw23"];
var alignmentBucket = ["wfw24", "wfw25", "wfw26", "wfw27", "wfw28", "wfw29", "wfw30", "wfw31", "wfw32", "wfw33", "wfw34", "wfw35"];
var kingpinBucket = ["wfw36", "wfw37", "wfw38", "wfw39", "wfw40", "wfw41", "wfw42", "wfw43", "wfw44", "wfw45", "wfw46", "wfw47"];
var frameBucket =["wfw48", "wfw49", "wfw50", "wfw51", "wfw52", "wfw53", "wfw54", "wfw55", "wfw56", "wfw57", "wfw58", "wfw59"];
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
function freshStyle(stylesheet){
	$('#mainStyle').attr('href',stylesheet);
 }

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
 var arrPopUp = ['schBox','wpuBox','calendar-container'];
 /* event listener used to close scheduled and job completed boxes
 ** wgen clicking outside of the box. It also closes when clicking on empty boxes
 ** inside scheduled
 */
//  window.addEventListener('mouseup', function(event){
// 	 //this.alert(event.target.parentNode.id);
// 	for(var i=0;i<arrPopUp.length;i++){
// 		var box = document.getElementById(arrPopUp[i]);
// 		/*
// 		$(box).on('click', function(e) {
// 			alert("hello");
// 		}).on('click', 'div', function(e) {
// 			// clicked on descendant div
// 			e.stopPropagation();
// 		});
// 		*/
// 		$(box).on('click', function (event) {
// 			event.stopPropagation();
// 			box.style.display = "none";
// 		 }).children().on('click', function (event) {
// 			event.stopPropagation();
// 			//you can also use `return false;` which is the same as `event.preventDefault()` and `event.stopPropagation()` all in one (in a jQuery event handler)
// 		});
// 		if((!box.contains(event.target)) && 
// 		!this.document.getElementById("addBlock").contains(event.target)&&
// 		event.target.id != "datepicker"&& !this.document.getElementById("my-form").contains(event.target)){
// 			box.style.display="none";
// 			if(arrPopUp[i]== "calendar-container"){
// 				//resetCalendar();
// 			}
// 		}
		
// 		/*
// 		if(event.target != box && 
// 			event.target.parentNode != box && 
// 			event.target.parentNode.parentNode != box && 
// 			event.target.parentNode.parentNode.parentNode != box && 
// 			event.target.parentNode.parentNode.parentNode.parentNode != box && 

// 			event.target.parentNode.parentNode.parentNode.parentNode.parentNode != box &&
// 			event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode != box &&
// 			event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode != box &&
// 			event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode != box){
// 			box.style.display = "none";
// 		}
// 		*/
// 	}
//  });
 





// setInterval(function() {
// 	if (isOpen == false) {
// 		console.log('refresh triggered')
// 		refresh();
// 	}
// }, 20000);

// setInterval(function() {
// 	callBackup()
// }, 3600000);

/*
 * callable functions
 */ 
 
function loadPage(page) {
	let callingPage = page;
	/*
	if(callingPage=="user"){
		window.body.style.width="100%";
		$("#add").style.width="100%";
		$("#main").style.width="100%";
	}
	*/
	//pullData();
	
	clearPage();
	countJobTypes();
	fillBuckets();
	fillPage();
	//fillCustomerDataList();
	calendarLoad();
	document.getElementById("calendar-container").style.display="none";	
	$(".viewButton").click(function(event) { event.stopPropagation(); });	
	//to make checkboxes add a check when enter is pressed
	$('input:checkbox').keypress(function(e){
		if((e.keyCode ? e.keyCode : e.which) == 13){
			$(this).trigger('click');
		}
	});
}

function reloadPage() {
	try{
	//pullData();
	//clearPage();
	ipc.send('reloadPage')
	//countJobTypes();
	//fillBuckets();
	//fillPage();
	//document.getElementById("whiteBoardContent").innerHTML=readFile("whiteBoardContent");
	}catch(e){logError(e)}
	//alert(lastRecord);
	
}
function findSize() {
    
    
        var objFSO = new ActiveXObject("Scripting.FileSystemObject");
        var e = objFSO.getFile("data/whiteBoardContent.txt");
        var fileSize = e.size;
        return fileSize;  
    
}
function countStatuses(){
	totalCount = 0
	scheduledCount = 0
	lotCount = 0
	completedCount = 0
	let objAllJobs = ipc.sendSync('getActive')
	//let objAllJobs = arrAllJobs[0]
	for (let job in objAllJobs){ 
		totalCount+=1  
		//console.log(objAllJobs[job].customerName)  
		 if(objAllJobs[job].status == "wfw"){lotCount+=1}
		 if(objAllJobs[job].status == "sch"){scheduledCount+=1}
		 if(objAllJobs[job].status == "wpu"){completedCount+=1}
				
	}
	fillCountBoxes()


}
function fillCountBoxes(){
	document.getElementById('ALLcount').innerHTML = totalCount
	document.getElementById('WFWcount').innerHTML = lotCount
	document.getElementById('bigSCHcountBox').innerHTML = scheduledCount
	document.getElementById('bigWPUcountBox').innerHTML = completedCount
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
	lastRecord = readFile('lastRecordNumber');
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
					"parts" : xmlVehicles[i].getAttribute("parts"),
					"schDate" : xmlVehicles[i].getAttribute("schDate"),
					"ampm" : xmlVehicles[i].getAttribute("ampm")
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
					"shopLocation" : xmlVehicles[i].getAttribute("shopLocation"),
					"waiting" : xmlVehicles[i].getAttribute("waiting"),
					"comeback" : xmlVehicles[i].getAttribute("comeback"),
					"parts" : xmlVehicles[i].getAttribute("parts"),
					"schDate" : xmlVehicles[i].getAttribute("schDate"),
					"ampm" : xmlVehicles[i].getAttribute("ampm")
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
					"schDate" : xmlVehicles[i].getAttribute("schDate"),
					"parts" : xmlVehicles[i].getAttribute("parts"),
					"ampm" : xmlVehicles[i].getAttribute("ampm")
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
					"schDate" : xmlVehicles[i].getAttribute("schDate"),
					"recordNumber" : xmlVehicles[i].getAttribute("recordNumber"),
					"ampm" : xmlVehicles[i].getAttribute("ampm")
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
					"ampm" : xmlVehicles[i].getAttribute("ampm"),
					"julian" : xmlVehicles[i].getAttribute("julian"),
					"recordNumber":xmlVehicles[i].getAttribute("recordNumber")			
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
	//backup_xmlDoc = xmlDoc;
	//backup_xmlDoc.save("backup_xmlDoc.xml");
	//vehicles.WPU.sort(dynamicSort("dateComplete"));
	//*******removed to try to fix SCH from filling 2 jobs in one box
	//vehicles.SCH.sort(dynamicSort("ampm")).sort(dynamicSort("schDate"));
	//********
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
/***************
 * Function to populate page with all jobs
 */
function fillPage() {	
	//pullData();
	load_jobs(vehicles.WFW, "wfw");	
	load_jobs(vehicles.WIP,"wip");	
	load_jobs(vehicles.WPU,"wpu");
	fillSCH();
	
	/********************
	 * Populate count boxes on page
	 */
	document.getElementById('ALLcount').innerHTML = vehicles.WFW.length + vehicles.WFP.length + vehicles.WIP.length;
	document.getElementById('WFWcount').innerHTML = vehicles.WFW.length;	
	document.getElementById('bigWPUcountBox').innerHTML = vehicles.WPU.length;
	document.getElementById('bigSCHcountBox').innerHTML = vehicles.SCH.length;
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
	
}

function drag(ev) {
	try{
	//pullData();
	ev.dataTransfer.setData("Text", ev.target.id);
	//console.log(ev.currentTarget.childNodes[1].id)
	//var l = ev.currentTarget.id;
	//loc = l.substr(4, 2);
	//makes tooltip disappear when dragging
	document.getElementById(ev.currentTarget.childNodes[1].id).style.display = "none";
	}catch(e){
		logError(e);
	}
}
$(function()
{
    $('#datepickerScheduled').datepicker();
});

function drop(ev) {
	
	ns = ev.target.id;
	let newStatus;
	
	let data = ev.dataTransfer.getData("Text");
	let jsonId = data.substr(4,17)
	let newLocation = event.target.id;
	let nl = newLocation.substr(0,3)
	let cellOccupied = document.getElementById(newLocation).hasChildNodes()	
	
	ev.stopPropagation();
	ev.preventDefault();

	let ov = ipc.sendSync('getVehicle', jsonId)
	let objVehicle = ov[0]
	//console.log(objVehicle.status)
	if(cellOccupied){
		
		newStatus = ns.substr(0, 3).toLowerCase(); 
		if(newStatus == "wpu" || newStatus == "sch"){
			newLocation = "new"; 
			objVehicle.status = newStatus;
			objVehicle.shopLocation = newLocation;
			ipc.send('edit', objVehicle)
			objVehicle = ipc.sendSync('getVehicle', jsonId)
			//countStatuses();
			placeElement(objVehicle[0]);
			countStatuses();
			document.getElementById(data).remove()
			//document.getElementById(newLocation).appendChild(document.getElementById(data))
		}
	}
	else{
		newStatus = ns.substr(0, 3).toLowerCase();
		objVehicle.status = newStatus;
		objVehicle.shopLocation = newLocation;
		document.getElementById(newLocation).appendChild(document.getElementById(data))
		ipc.send('edit', objVehicle) 
		countStatuses()
		
		
	}
	  
	
	let tooltip = document.getElementById(data).childNodes[1];
	//let cellOccupied = document.getElementById(newLocation).hasChildNodes()
	
	//document.getElementById(newLocation).appendChild(document.getElementById(data))
	
	
	//jquery function to bind the hover event to the created element
	$('.vehicle').on('mouseenter',function() {
		$(this).find('.tooltip').fadeIn();
	});
	
	$('.vehicle').on('mouseleave',function() {
		$(this).find('.tooltip').fadeOut();
	});
	//console.log(event.target.children)
	//console.log(tooltip.style.display+"  "+tooltip.parentNode.className)
	


}
function schSubmitted(e){
	if(e.id=="schSkip"){
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("status", "sch");
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("schDate", todayIs());
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("ampm", "am");
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("shopLocation", findLocation("sch"));
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("julian",jDate(todayIs()));
				xmlDoc.save("fs.xml");
				
	}
	if(e.id=="schSubmit"){
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("status", "sch");
				if(document.getElementById("datepickerScheduled").value !=null && document.getElementById("datepickerScheduled").value!=""){
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("schDate", document.getElementById("datepickerScheduled").value);
				}else{
					xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("schDate", todayIs());
					
				}
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("shopLocation", findLocation("sch"));
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("julian",jDate(document.getElementById("datepickerScheduled").value))
				xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc].setAttribute("ampm", $("input[type='radio'][name='ampm3']:checked").val());
				xmlDoc.save("fs.xml");

	}
	document.getElementById("schQuestionBox").style.display="none";
	document.getElementById("datepickerScheduled").value="";
	document.getElementById("schRadAM").checked=false;
	document.getElementById("schRadPM").checked=false;
	setCalendarMonth();

	reloadPage();
}
function getActive(){
	ipc.send('getActive')
}

function openLoginWindow(){
	console.log(document.getElementById('btnLogin').innerHTML)
	if(!loggedIn){
		//document.getElementById("btnLogin").innerHTML='Log Out'
		loggedIn = true
		ipc.send('open-login-window')
	 }else{
		 loggedIn= false
		document.getElementById("btnLogin").innerHTML='Log In'
	 	document.getElementById("btnAdmin").style.display = "none";
		document.getElementById("trashButton").style.display = "none";
		document.getElementById('addNewJob').style.display="none";
		document.getElementById('login-message').innerHTML=""
		document.getElementById('contentArea').innerHTML = openContent
		
	 }
}
function deleteCompleted(){
	//alert(document.getElementById(wpuBucket[0]).childNodes[0].id)
	let itemToSetInactive=''
	arrItemsToDeactivate=[]
	let element
	for(i=0;i<wpuBucket.length;i++){
		//alert(wpuBucket.length)
		element = document.getElementById(wpuBucket[i])
		if(element.hasChildNodes()){
		itemToSetInactive = document.getElementById(wpuBucket[i]).childNodes[0].id.substr(4,17)
		arrItemsToDeactivate.push(itemToSetInactive)
		//console.log(itemToSetInactive)
		
		}
		
		document.getElementById(wpuBucket[i]).innerHTML = ''
		
	}
	ipc.send('deactivate', arrItemsToDeactivate)
// 	try{
// 		if(vehicles.WPU.length){
// 			vehicles.WPU.sort(sortForDeletion);
			
// 				for(i=vehicles.WPU.length-1;i>-1;i--){
// 				var deleteMe = xmlDoc.getElementsByTagName("workflow")[0].childNodes[vehicles.WPU[i].xmlPosition];
				
// 				xmlDoc.getElementsByTagName("workflow")[0].removeChild(deleteMe);
				
// 			}
// 			xmlDoc.save("fs.xml");
// 			clearPage();			
// 			reloadPage();
// 		}
// 	}
// 	catch(e){
// 		logError(e);
// 	}
// }
// function sortForDeletion(a,b){
	
// 		if ( a.xmlPosition < b.xmlPosition ){
// 		  return -1;
// 		}
// 		if ( a.xmlPostion > b.xmlPosition ){
// 		  return 1;
// 		}
// 		return 0;  

}
function deleteDrop(ev) {
	let deactivate = ev.dataTransfer.getData("Text").substr(4,17)
	try {
		//alert(ev.dataTransfer.getData("Text").substr(4,17))
		ipc.send('deactivate', deactivate)
		
		// // 	//alert("Deleting Job...");
		
		// // var deleteMe = xmlDoc.getElementsByTagName("workflow")[0].childNodes[loc];
		// // //alert("pvar deleteMe");
		// // var thisCust=deleteMe.getAttribute('custName');
		// // //alert("var thisCust");
		// // xmlDoc.getElementsByTagName("workflow")[0].removeChild(deleteMe);
		// // //alert("removeChild")
		// // xmlDoc.save("fs.xml");
		// // //alert("save");
		// // //ev.parentNode.removeChild(ev);
		// // clearPage();
		// // //alert("clearPage")
		// // reloadPage();
		// // //alert("reloadpage");
		
		
		
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

function WriteToFile(fileName) {
	try {

		var fso, s, lrn, wbc;
		
		
		fso = new ActiveXObject("Scripting.FileSystemObject");

		
		if(fileName=="lastRecordNumber"){
			
			lrn = parseInt(readFile(fileName));
			lrn += 1;
			s = fso.OpenTextFile("data/"+fileName+".txt", 2, 1, -2);
			s.writeline(lrn);
			}else{
				findSize();
				wbc= document.getElementById("whiteBoardContent").innerHTML;
				s = fso.OpenTextFile("data/"+fileName+".txt", 2, 1, -2);
				s.writeline(wbc);
			}
		

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

// function readFile(fileName) {
// 	var fso = new ActiveXObject("Scripting.FileSystemObject");
// 	var ForReading = 1;
// 	var f1 = fso.OpenTextFile("data/"+fileName+".txt", 1);
// 	var text = f1.ReadAll();
// 	//document.getElementById("notesArea").innerHTML = text;
// 	f1.close();
// 	return text;
// }

function openBox(e,event) {
	//alert(e.id);
	var event = event;
	
	
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
						//document.getElementById("schPopUp").style.display="block";
						//document.getElementById("calendar-container").style.display = "block";
						//document.getElementById("posBox").style.display = "block";
						//document.getElementById("schBox").style.display = "block";
						break;
					case "block":
						//reloadCalender();
						//alert("calendar reloaded");
						document.getElementById("calendar-container").style.display = "block";
						//document.getElementById("posBox").style.display = "none";
						//document.getElementById("schBox").style.display = "none";
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
				case "viewCal":
						switch(document.getElementById("calendar-container").style.display) {
							case "none":
							case "":								
								//document.getElementById("schPopUp").style.display="none";	
															
								document.getElementById("calendar-container").style.display="block";	
								//countSchJobsForCalendar();
								//clearCalendar();	
								//fillDays();
								//clearDayBlocks();
								//resetCalendar();
								resetCalendar();
								setCalendarMonth();	
								
								//calendarLoad();					
								break;
							case "block":
								document.getElementById("calendar-container").style.display = "none";
								break;
						}
						break;
				case "viewAll":
						switch(document.getElementById("schBox").style.display) {
							case "none":
							case "":								
								//document.getElementById("schPopUp").style.display="none";								
								document.getElementById("schBox").style.display="block";								
								break;
							case "block":
								document.getElementById("schBox").style.display = "none";
								break;
						}
						break;
			default:
				break;
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

// function openInput(e, active, inputID1, inputID2) {
// 	var v = active.value;
// 	//alert(e.keyCode);
// 	fillCustomerDataList()
// 	var next = document.getElementById(inputID1);
// 	//alert(v);
// 	//alert(active.parentNode.className);
// 	//alert(document.getElementById("lstCustomer").options.length);
// 	if (active.id == "cbCash") {
// 		//alert('b');
// 		if (active.checked == true) {
// 			document.getElementById(inputID1).className = "visibleInput";
// 		} else {

// 			document.getElementById('txtCost').value = "";
// 			document.getElementById(inputID1).className = "hiddenInput";
// 			//alert(document.getElementById(inputID1).value);
// 		}
// 	} else {
// 		if (!e || e.keyCode != 9) {
// 			if (v && v != "") {
// 				//alert(k);
// 				document.getElementById(inputID1).className = "visibleInput";
// 				next.style.display = "block";
				
// 				//alert("make "+inputID1+ " visible "+document.getElementById(inputID1).style.display);
// 			} else {
// 				//alert("hide input");
// 				document.getElementById(inputID1).className = "hiddenInput"
// 			}
// 		}
// 		if (inputID2) {
// 			switch(active.value) {
// 				case "Scheduled":
// 				case "Call:Possible":
// 					document.getElementById(inputID2).style.display = "block";
// 					document.getElementById("datepicker").tabIndex = "2";
// 					$(function() {
// 						$("#datepicker").datepicker({
// 							dateFormat : "mm/dd/yy"
// 						});
// 						$("#datepicker").datepicker('setDate', '+0');
// 					});
// 					break;
// 				case "On the Lot":
// 					document.getElementById(inputID2).style.display = "none";
// 					break;
// 				case "Needs Picked Up":
// 					document.getElementById(inputID2).style.display = "none";
// 					break;
// 				default:
// 					document.getElementById(inputID2).style.display = "block";
// 					document.getElementById(inputID2).className = "visibleFieldset";
// 					break;
// 			}

// 			document.getElementById(inputID2).className = "visibleFieldset";

// 		}
// 	}
// }

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
	ipc.send('open-add-job')
	//fillCustomerDataList()
	//document.getElementById("addBlock").style.display = "block";
	//document.getElementById("selOrigin").focus();
	//close bottom boxes if open
	document.getElementById("schBox").style.display = "none";
	
}

function cancelAdd() {
	document.getElementById("frmReset").click();
	//document.getElementById("addBlock").style.display = "none";
	initializeForm();
	getFormInputs();

}

function submitted() {
	
	addNewVehicle();
	ipc.send('close-add-window')
	//fillPage();
	//document.getElementById("addBlock").style.display = "none";
	//setCalendarMonth();
	
	//initializeForm();
	//document.getElementById("frmReset").click();
}

function clearFormInputs() {
	getFormInputs();
	//document.getElementById("addBlock").style.display = "none";
	var requiredInfo = formInputs.required[0].inputs[0];
	requiredInfo.unit.value = "";
	requiredInfo.customerName.value = "";
}
function sortBucket(ev){
	//var h=ev.currentTarget.parentNode.innerHTML;
	//alert(h);
}



function test(el) {
	document.getElementById(el.id).innerHTML = "<form id='testETT' name='myGame'><input name='nameTT' id='nameTT' type=text value='" + vehicles.WFW[i].custName + "'></form>";
}



function isOdd(x) {
	return x % 2 != 0;
}





function separateBuckets(){
	for ( i = 0; i < vehicles.SCH.length; i++){
		if(vehicles.SCH[i].shopLocation !== "new"){
			oldBucket.push(vehicles.SCH[i]);
		}
		else{
			newBucket.push(vehicles.SCH[i]);
		}
	}
	
}
function fillSCH(){
	separateBuckets();
	load_jobs(oldBucket,"sch");
	load_jobs(newBucket,"sch");
}

//test filling page with new json object
function placeElement(args){
	//alert(args.shopLocation)
	let placement = args.shopLocation == "new" ? findOpenSpace(args) : makeJobDiv(args)
	if(placement !=null) {
		document.getElementById(args.shopLocation).innerHTML = placement
	}
	if(args.cash){document.getElementById('jica'+args.id).style.display = 'inline-block'};
	if(args.waiting){document.getElementById('jiw'+args.id).style.display = 'inline-block'};
	if(args.parts){document.getElementById('jip'+args.id).style.display = 'inline-block'};
	if(args.approval){document.getElementById('jia'+args.id).style.display = 'inline-block'};
	if(args.comeback){document.getElementById('jico'+args.id).style.display = 'inline-block'};
	if(args.checked){document.getElementById('jich'+args.id).style.display = 'inline-block'};
	//countStatuses();
}
function findOpenSpace(args){
	//let ns = args2
	let jt=args.jobType
	let js=args.status
	console.log(js)
	let newBucket = []
	let bucket = []
	let hasKids = true
	let springBucket = ["wfw0", "wfw1", "wfw2", "wfw3", "wfw4", "wfw5", "wfw6", "wfw7", "wfw8", "wfw9", "wfw10", "wfw11"];
    let checkallBucket = ["wfw12", "wfw13", "wfw14", "wfw15", "wfw16", "wfw17", "wfw18", "wfw19", "wfw20", "wfw21", "wfw22", "wfw23"];
	let alignmentBucket = ["wfw24", "wfw25", "wfw26", "wfw27", "wfw28", "wfw29", "wfw30", "wfw31", "wfw32", "wfw33", "wfw34", "wfw35"];
	let kingpinBucket = ["wfw36", "wfw37", "wfw38", "wfw39", "wfw40", "wfw41", "wfw42", "wfw43", "wfw44", "wfw45", "wfw46", "wfw47"];
	let frameBucket =["wfw48", "wfw49", "wfw50", "wfw51", "wfw52", "wfw53", "wfw54", "wfw55", "wfw56", "wfw57", "wfw58", "wfw59"];
	let wpuBucket =["wpu0","wpu1","wpu2","wpu3","wpu4","wpu5","wpu6","wpu7","wpu8","wpu9","wpu10","wpu11","wpu12","wpu13","wpu14","wpu15","wpu16","wpu17","wpu18","wpu19"];
	let schBucket =["sch0","sch1","sch2","sch3","sch4","sch5","sch6","sch7","sch8","sch9","sch10","sch11","sch12","sch13","sch14","sch15","sch16","sch17","sch18","sch19"];
	//alert(js)
	if(js != "sch" && js!= "wpu"){
	newBucket = jt == "Spring" ? springBucket : (jt == "Alignment") ? alignmentBucket :(jt == "Frame") ? frameBucket : (jt=="King Pin") ? kingpinBucket : checkallBucket 
	}else{
		js == "sch" ? newBucket =schBucket : newBucket = wpuBucket
	}

	bucket = newBucket
	//alert(bucket.length)
	for(let i=0;i<bucket.length;i++){
		
		hasKids = document.getElementById(bucket[i]).hasChildNodes();
		if(!hasKids){
			alert(args.shopLocation+ " "+bucket[i])
			args.shopLocation = bucket[i];
			
			
			break;
			
		}

	}
	ipc.send('edit',args)
	return makeJobDiv(args)
}
function makeJobDiv(args){
	//remove whitespace from jobType so that it can be used for css class
	//console.log(args.jobType)
	let str = args.jobType.replace(/\s+/g, '');

	//create job block
	const smallJobContainer = `<div class='vehicle' 
	oncontextmenu='getEditVehicle(this);return false;' 
	id='drag${args.id}' 
	draggable='true' 
	ondragstart='drag(event)'
	ondragover='allowDrop(event)'
	ondrop='drop(event)'>
	<span class='tooltip' 
	id='tt${args.id}'>
	Job Type: <b>${args.jobType}</b><br/>
	Date In: ${args.dateIn}<br/>
	Scheduled Date: ${args.scheduledDate}<br/>
	Customer: ${args.customerName}<br/>
	Unit: ${args.unit}<br/>
	Notes: ${args.notes}<br/>
	Est Cost: $${args.estimatedCost == undefined && args.estimatedCost =="" ? "test": args.estimatedCost}<br/>
	</span>
	<span class='info' 
	id='${args.id}info'>
	<span class='customerName'>${args.customerName}</span><br/>
	<span class='unitNumber'>
	<span id = 'jica${args.id}' class='jobIndicator jobIndicatorCash'></span>
	<span id = 'jiw${args.id}' class='jobIndicator jobIndicatorWaiting'></span>
	<span id = 'jip${args.id}' class='jobIndicator jobIndicatorParts'></span>
	<span id = 'jia${args.id}' class='jobIndicator jobIndicatorApproval'></span>
	<span id = 'jico${args.id}' class='jobIndicator jobIndicatorComeback'></span>
	<span id = 'jich${args.id}' class='jobIndicator jobIndicatorChecked'></span>
	</span></br>
	<span class='notes'>${args.notes}</span>
	</span>
	<span class='jobCat jobCat${str}' 
	id='${args.id}Cat'></span>
	</div>`;
	return smallJobContainer
						
}
function findLocation(txtJobType){
	var txtJobType=txtJobType;
	var sLoc;
	for ( j = 0; j < 20; j++){
		var hasKids = document.getElementById(txtJobType+j).hasChildNodes();
		if(!hasKids) {
			 sLoc = txtJobType+j;
			break;
		}else{
			sLoc="new";
		}
		
	}
	return sLoc;
}
function compare(prop){
	function compare( a, b ) {
		if ( a.prop < b.prop ){
		  return -1;
		}
		if ( a.prop > b.prop ){
		  return 1;
		}
		return 0;
	  }
}
function load_jobs(oBucket,txtJobType) {
	var txtJobType = txtJobType;
	var oBucket = oBucket;
	
	oBucket.sort(compare(oBucket.shopLocation));
	
	try{
	for ( i = 0; i < oBucket.length; i++) {
		
		if(oBucket[i].shopLocation !== "new"){
			if(txtJobType == "sch"){
				document.getElementById(oBucket[i].shopLocation).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + oBucket[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='tt"+txtJobType + i + "'>not new</span><span class='info' id='" +txtJobType+ i + "info'></span><span class='jobCat' id='" +txtJobType+ i + "Cat'></span></div>";
			}
			else{
				document.getElementById(oBucket[i].shopLocation).innerHTML = "<div class='vehicle' ondragenter='sortBucket(event)' oncontextmenu='getEditVehicle(this);return false;' id='drag" + oBucket[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='tt"+txtJobType + i + "'>not new</span><span class='info' id='"+txtJobType + i + "info'></span><span class='jobCat' id='"+txtJobType + i + "Cat'></span></div>";

			}
		}else{
			//alert(oBucket[i].shopLocation);
			if(txtJobType == "sch"){
				//alert(txtJobType);
				for ( j = 0; j < 20; j++){
					var hasKids = document.getElementById(txtJobType+j).hasChildNodes();
					if(!hasKids) {
						document.getElementById(txtJobType+j).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + oBucket[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='tt" +txtJobType+ i + "'>not new</span><span class='info' id='"+txtJobType + i + "info'></span><span class='jobCat' id='" +txtJobType+ i + "Cat'></span></div>";
						//alert(loc);
						xmlDoc.getElementsByTagName("workflow")[0].childNodes[oBucket[i].xmlPosition].setAttribute("shopLocation", txtJobType+j);
						xmlDoc.save("fs.xml");
						break;
					}
				}
			}else if(txtJobType == "wpu"){
				//alert(txtJobType);
				for ( j = 0; j < 20; j++){
					var hasKids = document.getElementById(txtJobType+j).hasChildNodes();
					//alert(document.getElementById(txtJobType+j).innerHTML);
					if(!hasKids) {
						document.getElementById(txtJobType+j).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + oBucket[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='tt" +txtJobType+ i + "'>not new</span><span class='info' id='"+txtJobType + i + "info'></span><span class='jobCat' id='" +txtJobType+ i + "Cat'></span></div>";
						//alert(loc);
						xmlDoc.getElementsByTagName("workflow")[0].childNodes[oBucket[i].xmlPosition].setAttribute("shopLocation", txtJobType+j);
						xmlDoc.save("fs.xml");
						break;
					}
				}				
			}else{

			var arrLocationBucket =[];
			var z = 0;
				
				switch(oBucket[i].jobCat) {
					case "Frame":
					case "frame":
						arrLocationBucket=frameBucket;						
						break;

					case "Spring":
					case "spring":
						arrLocationBucket = springBucket;						
						break;

					case "Alignment":
					case "alignment":
						arrLocationBucket = alignmentBucket;						
						break;

					case "King Pin":
					case "kingPin":
						arrLocationBucket = kingpinBucket;						
						break;

					case "Check All":
						arrLocationBucket = checkallBucket;						
						break;

					default:
						alert("error assigning job category");
						break;
				}
				for ( z = 0; z < 20; z++){
					var hasKids = document.getElementById(arrLocationBucket[z]).hasChildNodes();
					//alert(hasKids);
					if(!hasKids) {
						document.getElementById(arrLocationBucket[z]).innerHTML = "<div class='vehicle' oncontextmenu='getEditVehicle(this);return false;' id='drag" + oBucket[i].xmlPosition + "' draggable='true' ondragstart='drag(event)'><span class='tooltip' id='tt" +txtJobType+ i + "'>not new</span><span class='info' id='"+txtJobType + i + "info'></span><span class='jobCat' id='" +txtJobType+ i + "Cat'></span></div>";
						//alert(loc);
						xmlDoc.getElementsByTagName("workflow")[0].childNodes[oBucket[i].xmlPosition].setAttribute("shopLocation", arrLocationBucket[z]);
						xmlDoc.save("fs.xml");
						break;
					}
				}
			}
		}
		
			
		if (oBucket[i].cash == "-1") {
			document.getElementById(txtJobType + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg)";
			document.getElementById(txtJobType + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + oBucket[i].custName.toUpperCase() + "</b><br/> Scheduled:" + oBucket[i].schDate + " " + oBucket[i].ampm.toUpperCase() + " <span class='money'><b>$" + oBucket[i].estCost + "</b></span><br/>" + oBucket[i].make;

		}
		if (oBucket[i].waiting == "-1") {
			document.getElementById(txtJobType + i + 'info').style.backgroundImage = "url(waiting.jpg)";

		}
		if (oBucket[i].waiting == "-1" && oBucket[i].cash == "-1") {
			document.getElementById(txtJobType + i + 'info').style.backgroundImage = "url(dollarSignLegend.jpg), url(waiting2.jpg)";
			//document.getElementById(txtJobType + i + 'info').style.backgroundPosition = "right top, left top, left top";

		}
		if (oBucket[i].comeback == "-1") {
			document.getElementById(txtJobType + i + 'info').style.backgroundImage = "url(warningLegend.png)";
			document.getElementById(txtJobType + i + 'info').style.backgroundPosition = "right top";
		}
		if (oBucket[i].comeback == "-1" && oBucket[i].cash == "-1") {
			document.getElementById(txtJobType + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg)";
			document.getElementById(txtJobType + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (oBucket[i].comeback == "-1" && oBucket[i].waiting == "-1") {
			document.getElementById(txtJobType + i + 'info').style.backgroundImage = "url(warningLegend.png), url(waiting.jpg)";
			document.getElementById(txtJobType + i + 'info').style.backgroundPosition = "right top, left top";
		}
		if (oBucket[i].comeback == "-1" && oBucket[i].cash == "-1" && oBucket[i].waiting == "-1") {
			document.getElementById(txtJobType + i + 'info').style.backgroundImage = "url(warningLegend.png), url(dollarSignLegend.jpg), url(waiting2.jpg)";
			document.getElementById(txtJobType + i + 'info').style.backgroundPosition = "right top, left top, left top";
		}
		if (oBucket[i].parts == "-1") {
			if(txtJobType == "sch"){
				document.getElementById(txtJobType + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + oBucket[i].custName.toUpperCase() + "</b><br/> Scheduled:" + oBucket[i].schDate + " <b>" + oBucket[i].ampm.toUpperCase() + "</b> <br/>" + oBucket[i].make;
			}else{
				document.getElementById(txtJobType + i+'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'> " + oBucket[i].custName.toUpperCase() + "</b><br/> #" + oBucket[i].unitNumber + "<br/>" + oBucket[i].make;
		
			}
			if (oBucket[i].parts == "-1" && oBucket[i].cash == "-1" && oBucket[i].estCost != "") {
				if(txtJobType == "sch"){
				document.getElementById(txtJobType + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'>" + oBucket[i].custName.toUpperCase() + "</b><br/> Scheduled:" + oBucket[i].schDate + " <b>" + oBucket[i].ampm.toUpperCase() + " </b><span class='money'><b>$" + oBucket[i].estCost + "</b></span><br/>" + oBucket[i].make;
				}else{
					document.getElementById(txtJobType + i+'info').innerHTML = "<b style='font-size:13px;font-family:Verdana;color:#A3A3C2;text-decoration:line-through'> " + oBucket[i].custName.toUpperCase() + "</b><br/> #" + oBucket[i].unitNumber + "<br/><span class='money'><b>$" + oBucket[i].estCost + "</b></span><br/>" + oBucket[i].make;
				}
			}
		} else {
			if (oBucket[i].cash == "-1" && oBucket[i].estCost != "") {
				if(txtJobType=="sch"){
				document.getElementById(txtJobType + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + oBucket[i].custName.toUpperCase() + "</b><br/> Scheduled:" + oBucket[i].schDate + " <b>" + oBucket[i].ampm.toUpperCase() + "</b><span class='money'><b> $" + oBucket[i].estCost + "</b></span><br/>" + oBucket[i].make;
				}else{
					document.getElementById(txtJobType + i+'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'> " + oBucket[i].custName.toUpperCase() + "</b><br/> #" + oBucket[i].unitNumber + "<br/><span class='money'><b> $" + oBucket[i].estCost + "</b></span><br/>" + oBucket[i].make;
		
				}
			} else {
				if(txtJobType == "sch"){
				document.getElementById(txtJobType + i + 'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'>" + oBucket[i].custName.toUpperCase() + "</b><br/> Scheduled:" + oBucket[i].schDate + " <b>" + oBucket[i].ampm.toUpperCase() + "</b><br/>" + oBucket[i].make;
				}else{
					document.getElementById(txtJobType + i+'info').innerHTML = "<b style='font-size:13px;font-family:Verdana'> " + oBucket[i].custName.toUpperCase() + "</b><br/> #" + oBucket[i].unitNumber + "<br/>" + oBucket[i].make;
		
				}
			}
		}
		if(txtJobType =="sch"){
			document.getElementById('tt'+txtJobType + i).innerHTML = "Scheduled:" + oBucket[i].schDate + " <br/><b>" + oBucket[i].ampm.toUpperCase() + "</b><br/> " + oBucket[i].custName.toUpperCase() + "<br/> #" + oBucket[i].unitNumber + "<br/>" + oBucket[i].make + "<br/>Est Cost:$" + oBucket[i].estCost;
		}else{
			if(oBucket[i].schDate != null && oBucket[i].schDate !==""){
				//alert(vehicles.WFW[i].schDate);
				document.getElementById('tt'+txtJobType + i).innerHTML = "Date Called: "+ oBucket[i].dateIn + "<br/>Scheduled Date: "+oBucket[i].schDate+ "<br/> " + oBucket[i].custName.toUpperCase() + "<br/> #" + oBucket[i].unitNumber + "<br/>" + oBucket[i].make + "<br/>Est Cost:$" + oBucket[i].estCost;

			}
			else{
			//alert(vehicles.WFW[i].schDate);
				document.getElementById('tt'+txtJobType + i).innerHTML = "Date In: "+oBucket[i].dateIn + "<br/> " + oBucket[i].custName.toUpperCase() + "<br/> #" + oBucket[i].unitNumber + "<br/>" + oBucket[i].make + "<br/>Est Cost:$" + oBucket[i].estCost;
			}
		}
		var jobType = oBucket[i].jobCat;
		switch(jobType) {
			case "frame":
			case "Frame":
				document.getElementById(txtJobType + i + 'Cat').style.backgroundColor = "red";
				break;
			case "spring":
			case "Spring":
				document.getElementById(txtJobType + i + 'Cat').style.backgroundColor = "blue";
				break;
			case "alignment":
			case "Alignment":
				document.getElementById(txtJobType + i + 'Cat').style.backgroundColor = "purple";
				break;
			case "kingPin":
			case "King Pin":
				document.getElementById(txtJobType + i + 'Cat').style.backgroundColor = "green";
				break;
			case "Check All":

				document.getElementById(txtJobType + i + 'Cat').style.backgroundColor = "orange";
				break;
			default:
				break;
		}
	}
}catch(e){
	logError(e);
}
}





function Remove(EId) {
	return ( EObj = document.getElementById(EId)) ? EObj.parentNode.removeChild(EObj) : false;
}

function clearWFW() {
	//alert("total slots "+wfwTotalSlots);
	for ( i = 0; i < 59; i++) {
		document.getElementById('wfw' + i).innerHTML = "";
	}
	// for ( i = vehicles.WFW.length; i > 0; i--) {
	// 	vehicles.WFW.pop();
	// 	//alert(vehicles.WFW.length);
	// }

	// for ( i = 59; i < wfwTotalSlots; i++) {

	// 	Remove("wfw" + i);
	// 	//document.getElementById("wfw"+i).outerHTML="";

	// }

}

function clearWIP() {
	for ( i = 0; i < 12; i++) {
		document.getElementById('wip' + i).innerHTML = "";
	}
	// for ( i = vehicles.WIP.length; i > 0; i--) {
	// 	vehicles.WIP.pop();
	// 	//alert(vehicles.WIP.length);
	// }
}
function clearWPU() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('wpu' + i).innerHTML = "";
	}
	// for ( i = vehicles.WPU.length; i > 0; i--) {
	// 	vehicles.WPU.pop();
		
	// }
}




function clearSCH() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('sch' + i).innerHTML = "";
	}
	// for ( i = vehicles.SCH.length; i > 0; i--) {
	// 	vehicles.SCH.pop();
	// 	//alert(vehicles.WPU.length);
	// }
	// for ( i = newBucket.length; i > 0; i--) {
	// 	newBucket.pop();
	// 	//alert(vehicles.WPU.length);
	// }
	// for ( i = oldBucket.length; i > 0; i--) {
	// 	oldBucket.pop();
	// 	//alert(vehicles.WPU.length);
	// }

}





function clearXML() {
	xmlVehicles = "";
}

function clearPage() {
	clearWFW();
	clearWIP();	
	clearWPU();
	//clearXML();
	clearSCH();	
}

function refresh() {
	clearPage();
	ipc.send('reloadPage')
	//reloadPage();

}


ipc.on('show-admin-elements', (event, args)=>{
	document.getElementById('contentArea').innerHTML = accessGrantedContent
	refresh()
	document.getElementById("btnLogin").innerHTML='Log Out'
	document.getElementById('login-message').innerHTML=`Welcome ${args.user_name}!`
	
	document.getElementById("btnAdmin").style.display = "inline-block";
	document.getElementById("trashButton").style.display = "inline-block";
	
	//document.getElementById("contentArea").style.display = "block";
	document.getElementById("addNewJob").style.display = "block";
})
ipc.on('show-user-elements', (event, args)=>{
	document.getElementById('contentArea').innerHTML = accessGrantedContent
	refresh()
	document.getElementById("btnLogin").innerHTML='Log Out'
	document.getElementById('login-message').innerHTML=`Welcome ${args.user_name}!`
	
	
	//document.getElementById("contentArea").style.display = "block";
	document.getElementById("addNewJob").style.display = "block";
})
function openAddBox(e) {
	//alert(document.getElementById("add").style.display);
	//let defaultHeader = document.getElementById('add').innerHTML;
	document.getElementById('my-form').innerHTML = 
		` 
		<fieldset style='display:inline-block;'>
		<legend> Customer Info</legend>
		Customer: <input type='text' id='customer' name='customer' size='20'><br>
		Unit#: <input type='text' id='unit' name='unit' maxlength='30' size='10'>
		</fieldset>
		<fieldset style='display:inline-block;'>
		<legend>Job Info</legend>
		Date In: <input type='text' class= 'dateInput' id='dateInPicker' size='10'><br>
		Job Type: <select id='jtSelect'>
		<option id='frameOption' value='option1'>Frame</option>
		<option id='springOption' value='option2'>Spring</option>
		<option id='alignmentOption' value='option3'>Alignment</option>
		<option id='kingPinOption' value='option4'>King Pin</option>
		<option id='checkAllOption' value='option5'>Check All</option></select>
		</fieldset>
		<fieldset style='display:inline-block; height: 86px;'>		
		<legend>Notes</legend>
		 <textarea id='make' name='make' rows='3' columns='20'></textarea>
		 </fieldset>
		 <fieldset style='display:inline-block;'>
		 	<legend>Scheduled Job Info</legend>
			 <span id='schedWrapper'>
			 
			 Scheduled Date: <input type='text' id='datepicker2' class='dateInput style='position: relative; z-index: 100000;'><br>
			 AM<input type='radio' name='ampm' value='am' id='radAM'/> 
			 PM<input type='radio' name='ampm' value='pm' id='radPM'/>
			 </span>
			 </fieldset>
			 <fieldset style='display:inline-block;'>
			 <legend>Cash Customer Info</legend>
			 Cash Customer:<input class='cbEdit' type='checkbox' id='cash'> <br>
			 Est. Cost: <input type='text' id='cost' name='cost' size='6'>
			 </fieldset>
			 <fieldset style='display:inline-block;'>  
			 <legend>Job Status Info</legend>
			 <span class='jobStatusInfo'>
			 Parts Needed:<input type='checkbox' id='parts'> 
			 Approval Needed:<input type='checkbox' id='approval'> 
			 Checked:<input type='checkbox' id='checked'> <br>
			 Comeback: <input type='checkbox' id='comeback'>  
			 Waiting:<input type='checkbox' id='waiting'>
			 NO SHOW:<input type='checkbox' id='noShow'>
			 </span>
			 </fieldset>  
			 <input type='button' id='editSubmit' value='Submit' onclick='editJob()'>`;
			 	
	document.getElementById("unit").value = "";
	document.getElementById("make").value = "";
	document.getElementById("cost").value = "";
	document.getElementById("customer").value = "";

	document.getElementById("cash").checked = false;
	document.getElementById("waiting").checked = false;
	document.getElementById("parts").checked = false;
	document.getElementById("comeback").checked = false;
	document.getElementById("radAM").checked = false;
	if(e!=null){
	jc = e.id;
	}
	document.getElementById("customer").focus();
	document.getElementById("schedWrapper").style.display = "block";
	document.getElementById("schBox").style.display = "none";
	
	isOpen = true;
	var headerText;
	if(e!=null){
		headerText = e.innerHTML;
	}else{
		headerText="";
	}
	var eForm = document.getElementById("my-form");
	closeTimer = setTimeout(function() {
		editJob();
	}, 90000);
	//alert(isOpen);
	if (headerText == "Frame" || headerText == "Spring" || headerText == "Alignment" || headerText == "King Pin") {
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
	//You must return false to prevent the default form behavior
	clearTimeout(closeTimer);
	return false;
}

function todayIs() {
	const objDate = new Date();
	const day = objDate.getDate();
	const month = objDate.getMonth() + 1;
	const year = objDate.getFullYear();
	const today = month + "/" + day + "/" + year;
	return today;
}

//how to create a new node in xml
//alert("function ca;;"+today());
function addVehicle() {
	alert("adding");
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
	//backup_xmlDoc.getElementsByTagName("workflow")[0].appendChild(newel);
	//alert(x.xml);
	xmlDoc.save("fs.xml");
	//backup_xmlDoc.save("backup_xmlDoc.xml");
}
function getJobID(){
	console.log(ipc.sendSync('getID'))
}
function getCustomers(){
	ipc.send('get-customers')
}

// function addNewVehicle() {
// 	//alert($("input[type='radio'][name='ampm2']:checked").val());
// 	//alert("addNewVehicle fired");
// 	var originOptions = document.getElementById("selOrigin");
// 	var selectedOrigin = originOptions.options[originOptions.selectedIndex].text;
// 	var newStatus;
// 	const objNewVehicle = new Object();
// 	switch(selectedOrigin) {
// 		case "On the Lot":
// 			newStatus = "wfw";
// 			break;
// 		case "Scheduled":
// 			newStatus = "sch";
// 			break;
// 		case "Call:Possible":
// 			newStatus = "pos";
// 			break;
// 		case "Needs Picked Up":
// 			newStatus = "npu";
// 			break;
// 		default:
// 			newStatus = "wfw";
// 			break;
// 	}
// 	var m= monthIndex+1;
// 	let company = document.getElementById('txtCustomerName').value;
// 	objNewVehicle.customerName= company
// 	objNewVehicle.unit= document.getElementById('txtUnit').value;
// 	objNewVehicle.notes = document.getElementById('txtNotes').value;
// 	objNewVehicle.estimatedCost = document.getElementById('txtCost').value;
// 	objNewVehicle.dateIn = todayIs();
// 	//newel.setAttribute("jobCat", jc);
// 	objNewVehicle.status = newStatus;
// 	objNewVehicle.cash = document.getElementById('cbCash').checked;
// 	objNewVehicle.approval = document.getElementById('cbApproval').checked;
// 	objNewVehicle.checked = document.getElementById('cbApproval').checked;
// 	objNewVehicle.waiting = document.getElementById('cbWaiting').checked;
// 	objNewVehicle.comeback = document.getElementById('cbComeback').checked;
// 	objNewVehicle.parts = document.getElementById('cbParts').checked;
// 	objNewVehicle.shopLocation = "new";
// 	var jtOptions = document.getElementById("selJobType");
// 	objNewVehicle.jobType = jtOptions.options[jtOptions.selectedIndex].text;
// 	if(newStatus=="sch"){
// 	objNewVehicle.scheduledDate = document.getElementById("datepicker").value;
// 	objNewVehicle.julian = jDate(document.getElementById("datepicker").value);
// 	}
// 	objNewVehicle.origin = selectedOrigin;
// 	objNewVehicle.active = true;
// 	objNewVehicle.ampm = $("input[type='radio'][name='ampm2']:checked").val();
// 	//newel.setAttribute("recordNumber", WriteToFile("lastRecordNumber"));
// 	//xmlDoc.getElementsByTagName("workflow")[0].appendChild(newel);
	
// 	//xmlDoc.save("fs.xml");
// 	ipc.send('addNew',objNewVehicle)
// 	//totalCount+=1
	
// 	countStatuses();
	
// 	//var newel = xmlDoc.createElement("vehicle");
// 	if(isNewCustomer(company)){
// 		let newCompany={
// 			"companyName": company,
// 			"jobs": [
// 				{"jobID": Number(ipc.sendSync('getID'))}
// 			]
// 		}
		
		
// 		ipc.send('add-new-company',newCompany)
// 		console.log('is new')
// 	}else{

// 		console.log('not new')
// 	}
	
// 	//callBackup();
// }

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
				newel.setAttribute("recordNumber", WriteToFile("lastRecordNumber"));
				thisID.setAttribute("recordNumber", readFile("lastRecordNumber"));
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
			document.getElementById("inpFrom").value = "";
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
	/*
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
	*/
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

function getEditVehicle(e,x) {
	
	let jsonId = e.id.substr(4,17);
	jobToEdit={}
	
	if(e==null){
		c = x; 
	 }else{e.childNodes[1].style.backgroundColor = '#F5FCC7';
	}
	
	openAddBox(e);
	
	let arrJobToEdit = ipc.sendSync('getVehicle', jsonId)
	console.log("in render after calling getVehicle on main")
	jobToEdit = arrJobToEdit[0]	
	//var f = document.getElementById("my-form").innerHTML;
	//var eForm = document.getElementById("my-form");	
	document.getElementById("customer").value = jobToEdit.customerName;		
	document.getElementById("cash").checked = jobToEdit.cash ? true : false
	document.getElementById("waiting").checked = jobToEdit.waiting ? true : false
	document.getElementById("comeback").checked = jobToEdit.comeback ? true : false
	document.getElementById("parts").checked = jobToEdit.parts ? true : false	
	document.getElementById("approval").checked = jobToEdit.approval ? true : false
	document.getElementById("checked").checked = jobToEdit.checked ? true : false
	document.getElementById("noShow").checked = jobToEdit.noShow ? true : false
	document.getElementById("unit").value = jobToEdit.unit;
	document.getElementById("make").value = jobToEdit.notes;
	document.getElementById("cost").value = jobToEdit.estimatedCost;	
	document.getElementById("dateInPicker").value = jobToEdit.dateIn;
	document.getElementById("datepicker2").value = jobToEdit.scheduledDate == undefined ? '': jobToEdit.scheduledDate;
	(jobToEdit.ampm == 'am') ? $("#radAM").prop("checked", true) : jobToEdit.ampm =="pm" ? $("#radPM").prop("checked", true): $("#radPM").prop("checked", false) && $("#radAM").prop("checked", false)
	
	//Initialize the jquery datepickers
	$(function() {
		$("#datepicker2").datepicker({
			dateFormat : "m/d/yy"
		});
		//$("#datepicker2").datepicker('setDate', todayIs());
	});
	$(function() {
		$("#dateInPicker").datepicker({
			dateFormat : "m/d/yy"
		});
		$("#dateInPicker").datepicker('setDate', todayIs());
	});
	/*
	$(function() {
		$("#datepicker").datepicker({
			dateFormat : "mm/dd/yy"
		});
		$("#datepicker").datepicker('setDate', '+0');
	});
	*/
	
	document.getElementById("formHeader").innerHTML = `Edit ${jobToEdit.customerName}'s ${jobToEdit.jobType} Job`;
	switch(jobToEdit.jobType) {
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
	
	
	if(e!=null)	boxToChange = e.childNodes[1].id;
	/*
	isOpen = false;
	clearTimeout(closeTimer);
		try {

			document.getElementById(boxToChange).style.backgroundColor = "white";
		} catch(e) {
			document.getElementById(ns).childNodes[0].style.backgroundColor = "blue";
		}
	*/

	

}
function editJob(){
	
		jobToEdit.customerName = document.getElementById("customer").value;
		jobToEdit.cash = document.getElementById("cash").checked;
		jobToEdit.waiting = document.getElementById("waiting").checked;
		jobToEdit.unit = document.getElementById("unit").value;
		jobToEdit.notes = document.getElementById("make").value;
		jobToEdit.comeback = document.getElementById("comeback").checked;
		jobToEdit.parts = document.getElementById("parts").checked;
		jobToEdit.approval = document.getElementById("approval").checked;
		jobToEdit.checked = document.getElementById("checked").checked;
		jobToEdit.noShow = document.getElementById("noShow").checked;
		jobToEdit.estimatedCost = document.getElementById("cost").value;
		jobToEdit.dateIn = document.getElementById("dateInPicker").value;
		
		let jtOptions = document.getElementById("jtSelect");
		//console.log(jtOptions.options[jtOptions.selectedIndex].text)
		jobToEdit.jobType = jtOptions.options[jtOptions.selectedIndex].text;
		jobToEdit.scheduledDate = document.getElementById("datepicker2").value;
		jobToEdit.ampm = $("input[type='radio'][name='ampm']:checked").val();
		jobToEdit.julian = jDate(document.getElementById("datepicker2").value);

		
		

		isOpen = false;
		clearTimeout(closeTimer);
		//placeElement(ipc.send('getVehicle', jobToEdit.id))
		try {
			ipc.send('edit',jobToEdit)
			//console.log(jobToEdit)
			let jte = ipc.sendSync('getVehicle', jobToEdit.id)
			placeElement(jte)
			document.getElementById(boxToChange).style.backgroundColor = "white";
		} catch(e) {
			console.log(e);
		}
		document.getElementById('my-form').submit();
		
		//reloadPage();
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
	//var WshShell = new ActiveXObject("WScript.Shell");
	//WshShell.Run("backupXML.bat", 1, true);
	//toggleAdminMenu();
	backup_xmlDoc = xmlDoc;
	backup_xmlDoc.save("backup_xmlDoc.xml");

}

function callRestore() {
	//var WshShell = new ActiveXObject("WScript.Shell");
	//WshShell.Run("restoreXML.bat", 1, true);
	
	//toggleAdminMenu();
	backup_xmlDoc.load("backup_xmlDoc.xml");
	xmlDoc = backup_xmlDoc;
	xmlDoc.save("fs.xml");
	reloadPage();
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
	var newHead = "<head>\n <link rel=\"stylesheet\" type=\"text/css\"  href=\"css/print.css\">\n</script>\n</head>"
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
		"totalSpent" : document.getElementById("inpFrom").value,
		"totalDaily" : document.getElementById("inpDaily").value,
		"totalMonthly" : document.getElementById("totalMonthly").value

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
/*
 * countMonthly(e) is a function to add the director series total field and the monthly total field
 * on keyup and automatically fill the print preview section
 */
function countMonthly(e){
	thisTotal = e.id;
	keyedEntry = parseFloat(e.value);	
	
	switch(thisTotal){
		case "inpUPS":
		otherEntry = parseFloat(document.getElementById("inpDirector").value);
		keyedTotal = keyedEntry + otherEntry;
		break;
		case "inpDirector":
		otherEntry = parseFloat(document.getElementById("inpUPS").value);
		keyedTotal = keyedEntry + otherEntry;
		break;
		default:
		break;
	}
	return keyedTotal;
	
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
				//e.value = "0";
			} else {
				//countMonthly(e);
				//alert(e.value);
				
				document.getElementById("totalMonthly").innerHTML = "$" + countMonthly(e).toFixed(2);
				document.getElementById("totalUPS").innerHTML = "$" + e.value;
			}
			break;
		case "inpFrom":
			if (e.value == "") {
				e.value = "Customer Name";
			} else if(e.value == "Customer Name"){
				document.getElementById("from").innerHTML = "";
			}
			else{
				document.getElementById("from").innerHTML = e.value;
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
		case "inpDirector":
			
				document.getElementById("totalMonthly").innerHTML = "$" + countMonthly(e).toFixed(2);
				
			break;
		default:
			break;
	}
	//iframe.close();
}
function backToZero(e){
	if(e.value==""){
		e.value="0";
	}
}
/*
 * checkForInputData(e) is a function to check the input fields of the EOD report as you enter them 
 * and clear them to blank unless they already have data entered. This was created to stop the issue 
 * of tabbing into a field and it erasing already entered data.
 */
function checkForInputData(e){
	inputData = e.value;
	switch(inputData){
		case "":
		break;
		case "0":
		e.value = "";
		break;
		case "Customer Name":
			document.getElementById("from").innerHTML = "";
			e.value="";
			break;
		default:
		break;
		
		
	}
	
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
// function isNewCustomer(args){
// 	let isNew = true
// 	for(i=0;i<companyList.length;i++){
// 		console.log(args + " "+companyList[i])
// 		if(args == companyList[i]){
// 			isNew = false
// 			break
// 		}
// 	}
// 	return isNew
// }

function oninput(){
	var val = document.getElementById("txtCustomerName").value;
	alert(val);
    var opts = document.getElementById('lstCustomer').childNodes;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === val) {
        // An item was selected from the list!
        // yourCallbackHere()
        alert(opts[i].value);
        break;
      }
    }
}
function createOpenContent(){
	const content = new Splash()
	console.log(content.greeting)
	return content.getGreeting()
}
