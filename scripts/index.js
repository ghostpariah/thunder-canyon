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
const whiteBoard = document.getElementById('whiteBoardContent')

let popupDate
let jobToEdit = {}
let loggedIn = false
let listItem
let extractedData
let customerList = document.getElementById('customerList')
let admin = false

let x
let jFile
let rawFile
let totalCount = 0
let lotCount = 0
let scheduledCount = 0
let completedCount = 0
let countStatusesCalled = 0
let bucket = {}
let openContent = createOpenContent();
let accessGrantedContent
const scope = document.querySelector('body')
let allJobs

window.onload = () =>{
	 
	allJobs = ipc.sendSync('pull_jobs')
	console.log(allJobs)

	//ipc.send('login-success',allJobs)
	/*
	for (var member in allJobs){ 
		placeElement(allJobs[member]);			
	}
	*/
	accessGrantedContent = document.getElementById('contentArea').innerHTML
	
	document.getElementById('contentArea').innerHTML = openContent;
	
	
	
	
 }

 


 $('body').on('focus',".popup", function(){
    $(this).datepicker();
});
$('body').on('blur',".whiteBoardContent", function(){
	saveWhiteBoard($(this))
    //alert($(this).text())
});

ipc.on('update', (event, args)=>{
	allJobs = args;
	loadJobs(args)
	countStatuses()
	
});

 function openContacts(){
	 
	 ipc.send('open-contacts', 'main page')//,undefined,undefined,undefined,undefined,undefined,'directButton')
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
	//countStatuses()
	document.getElementById('contentArea').innerHTML = openContent;   	
	
 })
 ipc.on('reload',(event,args)=>{
	 console.log("from reload"+args)
	//clearPage()    	
	
	loadJobs(args)
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
const arrPenultimateRow = ['wfw10','wfw22','wfw34','wfw46','wfw58']
const arrLastRow = ['wfw11','wfw23','wfw35','wfw47','wfw59']
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
	
	//clearPage();
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
 function saveWhiteBoard(wb){
	ipc.send('get-whiteboard', 'write',document.getElementById('whiteBoardContent').innerText)
	
	setTimeout(() => {
		if(window){
			document.getElementById('whiteBoardContent').innerHTML = ipc.sendSync('get-whiteboard', 'read')
		}
	}, 50);
	 
}
	 
 
 function loadJobs(args){
	fillScheduleGlimpse(args)
	createCompleted(args)
	for (var member in args){ 
		placeElement(args[member]);			
	}

 }
 function createCompleted(args){
	 let arrCompleted = new Array()
	 let wpuJobContainer = document.getElementById('wpuJobContainer')
	 let spotsNeeded 
	
	//empty array of completed jobs
	if(arrCompleted.length>0){
		arrCompleted=[]
	}
	//fill array of completed jobs
	for(member in args){
		(args[member].status == 'wpu')? arrCompleted.push(args[member]):'';
	}
	spotsNeeded = Math.ceil((arrCompleted.length/2)+2)*2
	console.log('completed spots needed: '+ spotsNeeded)
	//remove any elements that are already in the wpu container
	if(wpuJobContainer.hasChildNodes()){
		console.log(wpuJobContainer.childNodes)
		console.log('spotsNeeded is: '+spotsNeeded)
		while(wpuJobContainer.hasChildNodes()){
			wpuJobContainer.childNodes[0].remove()
		}
	}

	//create elements and put them in wpu container
	for(i=0;i<spotsNeeded;i++){
		let div = document.createElement('div')
		div.setAttribute('id', 'wpu'+i)
		div.setAttribute('class', 'job')
		div.addEventListener('drop', (event)=>{
			drop(event);
		})
		div.addEventListener('dragover', (event)=>{
			allowDrop(event);
		})
		wpuJobContainer.appendChild(div)
	}
 }
function fillScheduleGlimpse(args){
	//console.log('glimpse called')
	arrScheduledStatus = new Array()
	let wrapper = document.getElementById('ucWrapper')
	let schJobContainer = document.getElementById('schJobContainer')
	if(wrapper.hasChildNodes()){
		for(i=2;i<wrapper.childNodes.length;i++){
			wrapper.childNodes[i].remove()
		}
	}

	if(arrScheduledStatus.length>0){
		arrScheduledStatus=[]
	}
	wrapper.innerHTML=''
	for(member in args){
		(args[member].status == 'sch')? arrScheduledStatus.push(args[member]):'';
	}

	/**
	 * create job containers for view all
	 */
	//console.log()
	//console.log("rows is: "+ arrScheduledStatus.length % 5 )
	let spotsNeeded = Math.ceil((arrScheduledStatus.length/5)+2)*5
	///console.log(spotsNeeded)
	if(schJobContainer.hasChildNodes()){
		console.log(schJobContainer.childNodes)
		console.log('spotsNeeded is: '+spotsNeeded)
		while(schJobContainer.hasChildNodes()){
			schJobContainer.childNodes[0].remove()
		}
	}
	for(i=0;i<spotsNeeded;i++){
		let div = document.createElement('div')
		div.setAttribute('id', 'sch'+i)
		div.setAttribute('class', 'job')
		div.addEventListener('drop', (event)=>{
			drop(event);
		})
		div.addEventListener('dragover', (event)=>{
			allowDrop(event);
		})
		schJobContainer.appendChild(div)
	}


	
	/**
	 * set variable for sort function below
	 * direction: (1 ascending() (-1 descending)
	 * 
	 */
	let sortBy = [{
		prop:'date_scheduled',
		direction: 1
	  },{
		prop:'time_of_day',
		direction: 1
	  }];
	let x = arrScheduledStatus.sort(function(a,b){
		let i = 0, result = 0;
		while(i < sortBy.length && result === 0) {
		  result = sortBy[i].direction*(a[ sortBy[i].prop ].toString() < b[ sortBy[i].prop ].toString() ? -1 : (a[ sortBy[i].prop ].toString() > b[ sortBy[i].prop ].toString() ? 1 : 0));
		  i++;
		}
		return result;
	  })


	
	for(i=0;i<11;i++){
		if(x[i] != undefined){
		let glimpse = document.createElement('div')
		glimpse.setAttribute('class', 'upcomingBox')

		let data = document.createElement('div')
		data.setAttribute('class', 'glimpseData')
		

		let colorBlock = document.createElement('div')
		colorBlock.setAttribute('class','colorBlock')
		colorBlock.setAttribute('id', 'colorBlock'+x[i].job_ID)
		

		let spanCustomer = document.createElement('span')
		spanCustomer.setAttribute('class', 'glimpseCustomer')
		let tCustomer = document.createTextNode((x[i].customer_ID != null) ? ipc.sendSync('db-get-customer-name', x[i].customer_ID).toUpperCase(): 'no name');
		
		spanCustomer.appendChild(tCustomer)
		data.appendChild(spanCustomer)

		let spanDate = document.createElement('span')
		let date = new Date(x[i].date_scheduled)
		let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		let day = days[date.getDay()]
		spanDate.setAttribute('class', 'glimpseDate')
		let tDate = document.createTextNode(day+ ' '+x[i].date_scheduled + " "+x[i].time_of_day.toUpperCase())
		spanDate.appendChild(tDate)
		data.appendChild(spanDate)

		
		
		glimpse.appendChild(data)
		glimpse.appendChild(colorBlock)
		
		
		wrapper.appendChild(glimpse)
		let el = document.getElementById('colorBlock'+x[i].job_ID)
		
		switch(x[i].job_type){
			case 'Spring':
				el.style.backgroundColor = '#5e81ad';
				break;
			case 'Check All':
				el.style.backgroundColor = '#ff9e0c';
				break;
			case 'Alignment':
				el.style.backgroundColor = '#ad5ea8';
				break;
			case 'King Pin':
				el.style.backgroundColor = '#5ead63';
				break;
			case 'Frame':
				el.style.backgroundColor = '#ff2d00';
				break;
			default:
				break;
		}
	}
	}
	//console.log(JSON.stringify(x))

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
	let shopCount = 0
	countStatusesCalled+=1
	console.log('countStatuses() has been called '+countStatusesCalled+ ' times')
	//let objAllJobs = ipc.sendSync('getActive')
	//let objAllJobs = arrAllJobs[0]
	for (let job in allJobs){ 
		if(allJobs[job].status != 'sch'){totalCount+=1} 
		  
		 if(allJobs[job].status == "wfw"){lotCount+=1}
		 if(allJobs[job].status == "wip"){shopCount+=1}
		 if(allJobs[job].status == "sch"){scheduledCount+=1}
		 if(allJobs[job].status == "wpu"){completedCount+=1}
				
	}
	fillCountBoxes(lotCount, shopCount, scheduledCount, totalCount, completedCount)


}
function fillCountBoxes(lot,shop, scheduled, total, completed){
	
	document.getElementById('totCount').innerHTML = total
	document.getElementById('lotCount').innerHTML = lot
	document.getElementById('schCount').innerHTML = scheduled
	document.getElementById('shopCount').innerHTML = shop
	document.getElementById('completedCount').innerHTML = completed
	
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
	let menuBox = document.getElementById('adminMenu')
	
	
	//destroy menu items
	if(menuBox.hasChildNodes()){
		while(menuBox.hasChildNodes()){
			menuBox.childNodes[0].remove()
		}
	}

	//create menu items
	
	let objMenuItems =
	[{
		'text': 'Create User',
		'submenu': [{
			text : 'Create User'
		},
		{
			text : 'Delete User'
		},
		{
			text : 'Change Passowrd'
		}]
	},
	{
		'text': 'Reports',
		'submenu': [{
			text : 'EOD'
		},
		{
			text : 'No-Shows'
		}]
	}];
	let menuItem
	let menuText
	let subMenu
	let subMenuItem
	let subMenuItemText
	for(item in objMenuItems){
		menuItem = document.createElement('div')
		menuText = document.createTextNode(objMenuItems[item].text)
		menuItem.setAttribute('class','adminMenuItem')
		menuItem.setAttribute('id', 'adminMenuItem'+item)
		menuItem.appendChild(menuText)		
		
		if(objMenuItems[item].hasOwnProperty('submenu')){
			subMenu = document.createElement('div')
			subMenu.setAttribute('class',"adminMenu adminSubMenu")
			subMenu.setAttribute('id', 'adminMenuItem'+item+'subMenu')
			
			for(i in objMenuItems[item].submenu){
				subMenuItem = document.createElement('div')
				subMenuItemText = document.createTextNode(objMenuItems[item].submenu[i].text)
				subMenuItem.setAttribute('class', 'adminMenuItem')
				subMenuItem.setAttribute('id', 'adminMenuItem'+item+'subItem'+i)
				subMenuItem.appendChild(subMenuItemText)
				
				subMenu.appendChild(subMenuItem)
				
				
			}
			menuItem.appendChild(subMenu)
			
		}
		
		menuBox.appendChild(menuItem)


		document.onmouseover = function(ev){	
			ev.stopPropagation()		
			displaySubMenu(ev.target, ev.relatedTarget)
			
		}

		document.onclick = function(event){
			dosomething(event.target)
		}
	
		
	}
	
	menuBox.style.display = 'block'
	

	
}
function dosomething(e){
	
	let adminMenu = document.getElementById('adminMenu')
	let caller = document.getElementById(e.id)
	
	//is it an admin menu item
	if(adminMenu.contains(caller)){
		//does it have a submenu
		if(e.childNodes.length<2){
			//console.log(e.innerHTML)
			adminMenu.style.display = 'none'

			//which menu item was clicked
			switch(e.innerHTML){
				case 'EOD':
					console.log('EOD option chosen')
					eod()
					break;
				case 'No-Shows':
					console.log('No-Shows option chosen')
					break;
				case 'Create User':
					console.log('Create User chosen')
					openCreateUser()
				default:
					break;
			}
		}else{
			
		}
	}
	
}
function displaySubMenu(objCaller, pc){
	
	//variables
	
	let menuOpen =true
	let subMenuOpen = false
	let cID = objCaller.id
	let isParent
	let menuType
	let adminMenu = document.getElementById('adminMenu')
	let caller = (typeof(objCaller) === 'object')?document.getElementById(objCaller.id):null;
		
	let isMenu = adminMenu.contains(caller)
	if(isMenu){
		
		menuType = (typeof(caller.id)!= undefined)
			? (caller.id.includes('sub'))
				? 'sub'
				: 'top'
			:''

		 isParent = caller.childNodes.length>=2;
		
	
		//methods
		let showSubMenu = function() {	
				
			document.getElementById(cID+'subMenu').style.display = 'block'
			subMenuOpen = true
			
		}
		let closeSubMenu = function(){
			document.getElementById(cID+'subMenu').style.display = 'none'
			subMenuOpen = false
		}
		let closeMenu = function(){
			adminMenu.style.display = 'none'
			menuOpen = false
		}
		let setTimer = function(){

		}
		let menuHasHover = function(){
			let x = 0
			let hover

			if(menuType == 'sub'){
				//check submenu for hover
				for(i=0;i<caller.parentNode.childNodes.length; i++){
					x+= $(`#${caller.parentNode.childNodes[i].id}:hover`).length				
				}
				//check top menu for hover
				for(i=0;i<adminMenu.childNodes.length; i++){
					x+= $(`#${adminMenu.childNodes[i].id}:hover`).length
				}
			}else if(menuType =='top'){
				//check top menu for cover
				for(i=0;i<adminMenu.childNodes.length; i++){
					x+= $(`#${adminMenu.childNodes[i].id}:hover`).length
				}
			}

			
			hover = (x>0)?true: false;
			return hover;
		}


		//main process
		if(caller && isMenu){
			if(menuType == 'top'){
				if(isParent){
					showSubMenu()
					
				}
					setTimeout(() => {
						if(!menuHasHover()){
							closeMenu()
							
						}
					}, 50);
					$(`#${caller.id}`).mouseleave(function (){
						setTimeout(() => {
							if(!menuHasHover()){
							closeMenu()
							}else{
								if(subMenuOpen){
								closeSubMenu()
								}
							}
						},50);
					})
				
			}else if(menuType == 'sub'){
				setTimeout(() => {
					if(!menuHasHover()){
						if(subMenuOpen){
						closeSubMenu()
						}
						closeMenu()
						
					}
				}, 50);
				$(`#${caller.id}`).mouseleave(function (){
					setTimeout(() => {
						if(!menuHasHover()){
							if(subMenuOpen){
								closeSubMenu()
							}
						}
					},50);
				})
			}
		}//end main process
	}	
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
	//console.log(ev.currentTarget.id)
	ev.dataTransfer.setData("Text", ev.target.id);
	//console.log(ev.currentTarget.childNodes[1].id)
	//var l = ev.currentTarget.id;
	//loc = l.substr(4, 2);
	//makes tooltip disappear when dragging
	document.getElementById(ev.currentTarget.childNodes[1].id).style.display = "none";
	document.getElementById('context-Menu-'+ev.currentTarget.id.substr(4))
	}catch(e){
		logError(e);
	}
}
$(function()
{
    $('#datepickerScheduled').datepicker();
});

function drop(ev) {
	//console.log(ev.dataTransfer.getData('id'))
	ns = ev.target.id;
	let newStatus;
	
	let data = ev.dataTransfer.getData("Text");
	let id = data.substr(4)
	
	let oldStatus = document.getElementById(data).parentNode.id.substr(0, 3).toLowerCase(); 
	
	let newLocation 
	
	console.log(ev.target)
	
	let cellOccupied = (document.getElementById(ev.target.id))?document.getElementById(ev.target.id).hasChildNodes():true;	
	//console.log(data + ' '+id+' newLocation:'+newLocation+ ' '+cellOccupied)
	ev.stopPropagation();
	ev.preventDefault();

	let thisJob
	//allJobs = ipc.sendSync('pull_jobs')
	
	let objMoving = new Object()
	
	if(cellOccupied){
		
		newStatus = ns.substr(0, 3).toLowerCase(); 
		
		if(newStatus == "wpu" || newStatus == "sch" || newStatus =="SCH"){
			 
			objMoving.status = newStatus;
			
			if(newStatus=='sch' || newStatus=='SCH'){
				objMoving.designation = "Scheduled"
			}		
			
			
			//clearPage()
			for(member in allJobs){
				if(id == allJobs[member].job_ID){
					let getSpot = new Object()
					getSpot.job_type = allJobs[member].job_type
					getSpot.status = newStatus
					newLocation = findSpot(getSpot)
					objMoving.shop_location = newLocation
					objMoving.date_in = allJobs[member].date_in					
					objMoving.job_ID = id
					//console.log('location from for loop under occupied'+objMoving.shop_location)
				}else{
					objMoving.date_in = null
					objMoving.job_ID = id
				}
			
			}
			
		}
	}
	else{
		newStatus = ns.substr(0, 3).toLowerCase();
		newLocation = ev.target.id
		objMoving.status = newStatus;
		objMoving.shop_location = newLocation
		objMoving.designation = 'On the Lot'
		document.getElementById(newLocation).appendChild(document.getElementById(data))
		

		// determine whether the job is being dragged from scheduled to on the lot
		// and set date_in accordingly. 
		if(oldStatus == 'sch' && newStatus != 'sch'){
			objMoving.date_in = todayIs()
		}else{
			for(member in allJobs){
				if(id == allJobs[member].job_ID){
					objMoving.date_in = allJobs[member].date_in
				}
			}
		}		
	
		
		
		objMoving.job_ID = id
		document.getElementById(data).remove()
		//ipc.send('update-job',objMoving)
		let editedJob = ipc.sendSync('edit-location-drop', objMoving, id)
		let reloadedJobs = ipc.sendSync('pull_jobs')

		allJobs = reloadedJobs;
		for(member in editedJob){
			if(id == editedJob[member].job_ID){
				placeElement(editedJob[member])
			}
		}
		
		/**
		 * determine if it is being dragged into sch in order to create 
		 * schedule date edit popup
		 * 
		 */
		if(newStatus == 'sch'){


			//event.target.parentNode.nextElementSibling.style.display = 'block'
				let sub_content = `<div class= 'popupHeader'>CONFIRM OR CHANGE SCHEDULED DATE</div><br/>
				<div class='popuprow'><label> Scheduled Date:&nbsp;&nbsp;</label>
				<input type="text" id="datepicker" class = "popup"></div>
				<br/>
				<div class='popuprow'>
					<div class= 'halfrow'>
                        <label>AM</label>
                        <input type='radio' id="radAM" tabindex='6'name='ampm2' value='am'>
                        <label>PM</label>
                        <input type='radio' id="radPM" tabindex='7' name='ampm2' value='pm'>
						
                    </div>
					<div class='popupButton' onclick= 'moveToScheduled(this, ${true})' >MOVE</div><div class='popupButton' onclick='cancelScheduleAdd(this)'>CANCEL</div>
				</div>
					
					 `
					 //event.target.parentNode.nextElementSibling.innerHTML = sub_content;
					 ev.target.firstChild.childNodes[5].innerHTML =sub_content
					 ev.target.firstChild.childNodes[5].style.display= 'inline-block'
					 console.log(ev.target.firstChild.childNodes)
					  		
					for(member in allJobs){
						if (allJobs[member].job_ID == ev.target.firstChild.childNodes[5].id.substr(8)){
							popupDate = allJobs[member].date_scheduled;
							
							(allJobs[member].time_of_day == 'am')? document.getElementById('radAM').checked = true : document.getElementById('radAM').checked = false;
    						(allJobs[member].time_of_day == 'pm')? document.getElementById('radPM').checked = true : document.getElementById('radPM').checked = false;
						}

					}	
					
					 
					 $('.popup').datepicker().datepicker('setDate', popupDate );
					 $('#datepicker').datepicker({
						onSelect: function () {
							$('#datepicker').text(this.value);
						}
					 });
			
		}


		// determine whether new location is at bottom of page and reset
		// tooltip class accordingly
		//console.log(newLocation)
		let t = document.getElementById(newLocation)
		
		let tt = t.firstChild.childNodes[1]
		
			
		
		let tooltip = (arrLastRow.includes(newLocation))?'tooltipLast':(arrPenultimateRow.includes(newLocation))?'toolTipBottom':'tooltip'	
		tt.className = tooltip
		
	
		
		
	//jquery function to bind the hover event to the created element
	$('.vehicle').on('mouseenter',function() {
		$(this).find('.tooltip').fadeIn(50);
	});
	
	$('.vehicle').on('mouseleave',function() {
		$(this).find('.tooltip').fadeOut(50);
	});
	$('.vehicle').on('mouseenter',function() {
		$(this).find('.toolTipBottom').fadeIn(50);
	});
	
	$('.vehicle').on('mouseleave',function() {
		$(this).find('.toolTipBottom').fadeOut(50);
	});
	$('.vehicle').on('mouseenter',function() {
		$(this).find('.tooltipLast').fadeIn(50);
	});
	
	$('.vehicle').on('mouseleave',function() {
		$(this).find('.tooltipLast').fadeOut(50);
	});
	

	countStatuses();
	loadJobs(reloadedJobs)
	}
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
		document.getElementById("t").style.display = "none";
		document.getElementById('btnContacts').style.display = 'none';
		document.getElementById('addNewJob').style.display="none";
		document.getElementById('login-message').innerHTML="&nbsp;"
		document.getElementById('contentArea').innerHTML = openContent
		
	 }
}

function deleteCompletedJobs(){
	alert('howdy')
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
	let deactivate = ev.dataTransfer.getData("Text").substr(4)
	let data = ev.dataTransfer.getData("Text");
	
	
	try {
		
		let updatedJobs = ipc.sendSync('deactivate', deactivate)
		document.getElementById(data).remove()	

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
// 	document.getElementById("notesArea").innerHTML = text;
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
			case "compBox":
				$(document).on('click', function(event) {
					if (!$(event.target).closest('#wpuBox').length && !$(event.target).closest('#compBox').length) {
					  document.getElementById('wpuBox').style.display = 'none'
					}
				  });
					
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

					$(document).on('click', function(event) {
						
						if (!$(event.target).closest('#schBox').length && event.target.id != 'viewAll') {
						  document.getElementById('schBox').style.display = 'none'
						}
					  });
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
	//console.log('placeElement() fired')
	let placement = args.shop_location == null || args.shop_location == '' ? findOpenSpace(args) : makeJobDiv2(args)
	//console.log(placement)
	//console.log(args)
	if(placement !=null) {
		document.getElementById(args.shop_location).innerHTML = placement
	}
	if(args.cash_customer==1){document.getElementById('jica'+args.job_ID).style.display = 'inline-block'};
	if(args.waiting_customer===1){document.getElementById('jiw'+args.job_ID).style.display = 'inline-block'};
	if(args.parts_needed==1){document.getElementById('jip'+args.job_ID).style.display = 'inline-block'};
	if(args.approval_needed==1){document.getElementById('jia'+args.job_ID).style.display = 'inline-block'};
	if(args.comeback_customer==1){document.getElementById('jico'+args.job_ID).style.display = 'inline-block'};
	if(args.checked==1){document.getElementById('jich'+args.job_ID).style.display = 'inline-block'};
	
}
function findOpenSpace(args){
	let usedLocation = []
	for(member in allJobs){
		usedLocation.push(allJobs[member].shop_location)
	}
	//console.log(usedLocation)
	let jt=args.job_type
	let js=args.status
	//console.log(js)
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
	if(js != "sch" && js!= "wpu" && js != 'SCH'){
	newBucket = jt == "Spring" ? springBucket : (jt == "Alignment") ? alignmentBucket :(jt == "Frame") ? frameBucket : (jt=="King Pin") ? kingpinBucket : checkallBucket 
	}else{
		js == "sch" || js == "SCH" ? newBucket =schBucket : newBucket = wpuBucket
	}

	bucket = newBucket
	
	
	for(let i=0;i<bucket.length;i++){
		//console.log(bucket[i])
		if(usedLocation.indexOf(bucket[i])<0){
			
			args.shop_location = bucket[i]
			break;
		}
		
		
	}
	
	ipc.send('edit-location',args)
	return makeJobDiv2(args)
}
function findSpot(args){
	//let ns = args2
	let jt=args.job_type
	let js=args.status
	let spot
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
	if(js != "sch" && js!= "wpu" && js != 'SCH'){
	newBucket = jt == "Spring" ? springBucket : (jt == "Alignment") ? alignmentBucket :(jt == "Frame") ? frameBucket : (jt=="King Pin") ? kingpinBucket : checkallBucket 
	}else{
		js == "sch" || js == "SCH" ? newBucket =schBucket : newBucket = wpuBucket
	}

	bucket = newBucket
	//alert(bucket.length)
	for(let i=0;i<bucket.length;i++){
		
		hasKids = document.getElementById(bucket[i]).hasChildNodes();
		if(!hasKids){
			//alert(args.shopLocation+ " "+bucket[i])
			spot = bucket[i];
			
			
			break;
			
		}

	}

	
	return spot
}
function makeJobDiv(args){
	//remove whitespace from jobType so that it can be used for css class
	//console.log(args.jobType)
	let str = args.jobType.replace(/\s+/g, '');
	let gc = ipc.sendSync('get-contact', args.jobContact, args.customerName)
	//console.log(gc.lastName)
	//create job block
	let con = ''
	/**
	 * insert method to read and fill contactMethod to be placed in con variable below
	 * 
	 * 
	 * let contactMethod
	 */
	let cmArrayPosition = ""
	let cmType = ""
	let cm = ""
	cmType = (args.contactMethod != undefined) ? args.contactMethod.substring(0,5) : ""
	
	cmArrayPosition = (args.contactMethod != undefined) ? args.contactMethod.substring(args.contactMethod.indexOf("-") + 1) : "contact not entered"
	cm = (args.contactMethod != undefined)? args.contactMethod : "contact not entered"
	
	let fn = (gc.firstname)? gc.firstname : ""
	let ln = (gc.lastname)? gc.lastname : ""
	if(typeof gc === 'object' && args.contactMethod!=undefined){
		con = `${fn} ${ln} - ${cm}<br/>`
		
		console.log('from typeof in makeJobDiv '+gc)
	}else{
		console.log(typeof gc)
		con = `${cm}</br>`
	}
	//Contact: ${gc[0].contacts[0].firstname} ${gc[0].contacts[0].lastname} <br/>
	
	const smallJobContainer = `<div class='vehicle' 
	oncontextmenu='getEditVehicle(this);return false;' 
	id='drag${args.id}' 
	draggable='true' 
	ondragstart='drag(event)'
	ondragover='allowDrop(event)'
	ondrop='drop(event)'>
	<span class='tooltip' 
	id='tt${args.id}'>
	<b>Job Type:</b> ${args.jobType}<br/>
	<b>Date In:</b> ${args.dateIn}<br/>
	<b>Scheduled Date:</b> ${args.scheduledDate}<br/>
	<b>Customer:</b> ${args.customerName}<br/>
	<b>Unit:</b> ${args.unit}<br/>
	<b>Notes:</b> ${args.notes}<br/>
	<b>Contact:</b> ${con}
	<b>Est Cost:</b> $${args.estimatedCost == undefined && args.estimatedCost =="" ? "test": args.estimatedCost}<br/>
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
function makeJobDiv2(args){
	//console.log('makeJobDiv2() fired')
	//remove whitespace from jobType so that it can be used for css class
	//console.log('job type from makediv2'+args.job_type)
	let str = args.job_type.replace(/\s+/g, '');
	let objContact
	let contactName 
	let contactItem
	let customerName
	//let gc = ipc.sendSync('get-contact', args.jobContact, args.customerName)
	//console.log('args = '+args.number_ID)
	//if contact provided
	if(args.number_ID != null && args.number_ID != '' && args.number_ID != 'null'){
		objContact = ipc.sendSync('db-get-contact-name','phone', args.number_ID )
		contactName = `${objContact.first_name} ${objContact.last_name}`
	}else if(args.email_ID != null && args.email_ID != ''){
		objContact = ipc.sendSync('db-get-contact-name','email', args.email_ID )
		contactName = `${objContact.first_name} ${objContact.last_name}`
	}else{
		contactName = 'No Contact'
	} 
							
	
	customerName = (args.customer_ID != null) ? ipc.sendSync('db-get-customer-name', args.customer_ID): 'no name'
	let cuN = '<b>'+customerName.toUpperCase()+'</b><br/>'
	let dIn =(args.date_in == null) ? '': '<b>Date In:</b>'+ args.date_in+'<br/>'
	let ec = (args.estimated_cost == undefined || args.estimated_cost =='') ? '': '<b>Est Cost:</b> $'+args.estimated_cost+'</br>'
	let u = (args.unit == null || args.unit == '')?'': '<b>Unit: </b>'+args.unit+'</br>'
	let sd = (args.date_scheduled != null) ? '<b>Sched. Date: </b>' +args.date_scheduled+' '+args.time_of_day+'<br/>': ''
	let dc = (args.date_called != null) ? `<b>Date Called: </b>` + args.date_called+'<br/>':''
	let toolTipClass = (arrLastRow.includes(args.shop_location))?'tooltipLast':(arrPenultimateRow.includes(args.shop_location))?'toolTipBottom':'tooltip'
	
	
	let n = (args.notes != null) ? '<b>Notes: </b>'+args.notes+'</br>' : '' 
	let it = (typeof objContact != "undefined") 
		? (objContact.item.includes('@')) 
			? '<b>Email: </b>'+objContact.item + '</br>'
			: '<b>Phone: </b>'+objContact.item + '</br>'
		:'';
	const smallJobContainer = `<div class='vehicle' 
	oncontextmenu='getEditVehicle(this, pullJob(${args.job_ID}));return false;' 
	id='drag${args.job_ID}' 
	draggable='true' 
	ondragstart='drag(event)'
	ondragover='allowDrop(event)'
	ondrop='drop(event)'>
	
	<span class=${toolTipClass} 
	id='tt${args.job_ID}'>
	${cuN}
	<b>Job Type:</b> ${args.job_type}<br/>
	${dIn}
	${sd}
	${dc}
	${u}	
	<b>Contact:</b> ${contactName}</br>
	${it}
	${ec}
	${n}
	</span>
	<div id='context-Menu-${args.job_ID}' class='context-Menu'>
	
	</div>
	<div id = 'submenu-${args.job_ID}' class = 'context-submenu'>
	</div>
	<span class='info' 
	id='${args.job_ID}info'>
	<span class='customerName'>${customerName}</span><br/>
	<span class='unitNumber' id = 'jobIndicatorContainer${args.job_ID}'>
	<span id = 'jica${args.job_ID}' class='jobIndicator jobIndicatorCash'></span>
	<span id = 'jiw${args.job_ID}' class='jobIndicator jobIndicatorWaiting'></span>
	<span id = 'jip${args.job_ID}' class='jobIndicator jobIndicatorParts'></span>
	<span id = 'jia${args.job_ID}' class='jobIndicator jobIndicatorApproval'></span>
	<span id = 'jico${args.job_ID}' class='jobIndicator jobIndicatorComeback'></span>
	<span id = 'jich${args.job_ID}' class='jobIndicator jobIndicatorChecked'></span>
	</span></br>
	<span class='notes'>${(args.notes!=null)?args.notes:""}</span>
	</span>
	<span class='jobCat jobCat${str}' 
	id='${args.job_ID}Cat'></span>
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

}

function clearWIP() {
	for ( i = 0; i < 12; i++) {
		document.getElementById('wip' + i).innerHTML = "";
	}
	
}

function clearWPU() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('wpu' + i).innerHTML = "";
	}
	
}




function clearSCH() {
	for ( i = 0; i < 20; i++) {
		document.getElementById('sch' + i).innerHTML = "";
	}
	

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
	admin = true;
	document.getElementById('contentArea').innerHTML = accessGrantedContent
	//console.log('admin content'+document.getElementById('contentArea').innerHTML)
	//refresh()
	document.getElementById("btnLogin").innerHTML='Log Out'
	document.getElementById('login-message').innerHTML=`Welcome ${args.user_name}!`
	document.getElementById('topCounts').style.display = 'block';
	//document.getElementById("btnAdmin").style.display = "inline-block";
	document.getElementById('btnContacts').style.display = 'inline-block';
	//document.getElementById("trashButton").style.display = "inline-block";
	//document.getElementById('t').style.display = 'inline-block';
	document.getElementById("addNewJob").style.display = "block";
	countStatuses()
	//document.getElementById("contentArea").style.display = "block";
	
	toggleAdminElements(admin)
	loadJobs(allJobs)
		document.getElementById('whiteBoardContent').innerHTML = ipc.sendSync('get-whiteboard','read')
	
	
})
function toggleAdminElements(admin){
	if(admin){
		document.getElementById("btnAdmin").style.display = "inline-block";
		document.getElementById('t').style.display = 'inline-block';
		
	}else{
		document.getElementById("btnAdmin").style.display = "none";
		document.getElementById('t').style.display = 'none';
		
	}
}
ipc.on('show-user-elements', (event, args)=>{
	admin = false
	document.getElementById('contentArea').innerHTML = accessGrantedContent	
	
	document.getElementById('topCounts').style.display = 'block';
	document.getElementById('btnContacts').style.display = 'inline-block';
	document.getElementById("btnLogin").innerHTML='Log Out'
	document.getElementById('login-message').innerHTML=`Welcome ${args.user_name}!`	
	document.getElementById("addNewJob").style.display = "block";
	countStatuses()
	toggleAdminElements(admin)
	loadJobs(allJobs)
	document.getElementById('whiteBoardContent').innerHTML = ipc.sendSync('get-whiteboard','read')
})

ipc.on('whiteboard-updated', (event,args)=>{
	console.log('whiteboard-updated')
	document.getElementById('whiteBoardContent').innerText = ipc.sendSync('get-whiteboard','read')
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
function pullJob(id){
	let d = ipc.sendSync('pull-job',id)
	return d
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
	console.log(document.getElementById(e.id.substr(4)+"Cat").className)
	//console.log(x[0].customer_ID)
	let thisMenu = document.getElementById('context-Menu-'+e.id.substr(4))
	//console.log(allJobs.length)
	let status
	for(member in allJobs){
		if(document.getElementById('context-Menu-'+allJobs[member].job_ID)){
			document.getElementById('context-Menu-'+allJobs[member].job_ID).style.display = 'none'
		}
		if(allJobs[member].job_ID == e.id.substr(4)){			
			status = allJobs[member].status
		}
	}
	
		//create context menu
		let menuBox = document.getElementById('context-Menu-'+e.id.substr(4))
		
		
		let item1Box = document.createElement('span')
		let item2Box = document.createElement('span')
		let item3Box = document.createElement('span')
		let item4Box = document.createElement('span')
		let item1Text 
		let item2Text 
		let item3Text 
		let item4Text

		//console.log(JSON.stringify(allJobs.length)+ 'from context menu')
		menuBox.style.display ='none'
		menuBox.innerHTML=""
		
		if(status=='sch'){
			item1Text = document.createTextNode('EDIT')
			item1Box.appendChild(item1Text)
			item1Box.setAttribute('class','item')
			item1Box.setAttribute('id','edit'+e.id.substr(4))
			item1Box.addEventListener('click',(event)=>{
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				ipc.send('open-edit',x, 'context-menu')
			})

			item2Text = document.createTextNode('NO-SHOW')
			item2Box.appendChild(item2Text)
			item2Box.setAttribute('class','item')
			item2Box.setAttribute('id','noshow'+e.id.substr(4))
			item2Box.addEventListener('click',(event)=>{
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				
				objNoshow = new Object()
				objNoshow.job_ID = x[0].job_ID
				objNoshow.no_show = 1
				objNoshow.active = 0
				ipc.send('update-job',objNoshow)
				e.remove()
			})

			item3Text = document.createTextNode('SEND TO LOT')			
			item3Box.appendChild(item3Text)
			item3Box.setAttribute('class','item')
			item3Box.setAttribute('id','send'+e.id.substr(4))
			item3Box.addEventListener('click',(event)=>{
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				
				objLot = new Object()
				objLot.job_ID = x[0].job_ID
				objLot.shop_location = ''
				objLot.status = 'wfw'
				ipc.send('update-job',objLot)
				e.remove()
			})
			item4Text = document.createTextNode('CANCEL')			
			item4Box.appendChild(item4Text)
			item4Box.setAttribute('class','item')
			item4Box.setAttribute('id','send'+e.id.substr(4))
			item4Box.addEventListener('click',(event)=>{
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				//alert(e.id.substr(4))
				ipc.send('delete-scheduled',e.id.substr(4))
				e.remove()
			})
			menuBox.appendChild(item1Box)
			menuBox.appendChild(item2Box)
			menuBox.appendChild(item3Box)
			menuBox.appendChild(item4Box)
			setTimeout(() => {
				if($(`#context-Menu-${e.id.substr(4)}:hover`).length == 0){
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				}
			}, 7000);
			$(`#context-Menu-${e.id.substr(4)}`).mouseleave(function (){
				setTimeout(() => {
					if($(`#context-Menu-${e.id.substr(4)}:hover`).length == 0){
					menuBox.style.display = 'none'
					document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
					}
				}, 7000);
			})

		}else{
			item1Text = document.createTextNode('EDIT')
			item1Box.appendChild(item1Text)
			item1Box.setAttribute('class','item')
			item1Box.setAttribute('id','edit'+e.id.substr(4))
			item1Box.addEventListener('click',(event)=>{
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				ipc.send('open-edit', x, 'context-menu')
			})

			item2Text = document.createTextNode('CHECKED')
			item2Box.appendChild(item2Text)
			item2Box.setAttribute('class','item')
			item2Box.setAttribute('id','checked'+e.id.substr(4))
			item2Box.addEventListener('click',(event)=>{
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				let objChecked = new Object()
				
				objChecked.job_ID = x[0].job_ID
				objChecked.checked = 1
				ipc.send('update-job', objChecked,'context-menu')
				
			})
			item3Text = document.createTextNode('SCHEDULE')
			item3Box.appendChild(item3Text)
			item3Box.setAttribute('class','item')
			item3Box.setAttribute('id','schedule'+e.id.substr(4))
			item3Box.addEventListener('click',(event)=>{
				
				event.target.parentNode.nextElementSibling.style.display = 'block'
				let sub_content = `<div class= 'popupHeader'>CONFIRM OR CHANGE SCHEDULED DATE</div><br/>
				<div class='popuprow'><label> Scheduled Date:&nbsp;&nbsp;</label>
				<input type="text" id="datepicker" class = "popup"></div>
				<br/>
				<div class='popuprow'>
					<div class= 'halfrow'>
                        <label>AM</label>
                        <input type='radio' id="radAM" tabindex='6'name='ampm2' value='am'>
                        <label>PM</label>
                        <input type='radio' id="radPM" tabindex='7' name='ampm2' value='pm'>
						
                    </div>
					<div class='popupButton' onclick= 'moveToScheduled(this, ${false})' >MOVE</div><div class='popupButton' onclick='cancelScheduleAdd(this)'>CANCEL</div>
				</div>
					
					 `
					 event.target.parentNode.nextElementSibling.innerHTML = sub_content;
					  		
					for(member in allJobs){
						if (allJobs[member].job_ID == event.target.id.substr(8)){
							popupDate = allJobs[member].date_scheduled;
							
							(allJobs[member].time_of_day == 'am')? document.getElementById('radAM').checked = true : document.getElementById('radAM').checked = false;
    						(allJobs[member].time_of_day == 'pm')? document.getElementById('radPM').checked = true : document.getElementById('radPM').checked = false;
						}

					}	
					
					 
					 $('.popup').datepicker().datepicker('setDate', popupDate );
					 $('#datepicker').datepicker({
						onSelect: function () {
							$('#datepicker').text(this.value);
						}
					 });
					 
				})
				item4Text = document.createTextNode('COMPLETED')			
				item4Box.appendChild(item4Text)
				item4Box.setAttribute('class','item')
				item4Box.setAttribute('id','send'+e.id.substr(4))
				item4Box.addEventListener('click',(event)=>{
					menuBox.style.display = 'none'
					document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
					
					let objCompleted = new Object()				
					objCompleted.job_ID = x[0].job_ID					
					objCompleted.shop_location = ''
					objCompleted.status= 'wpu'
					ipc.send('update-job', objCompleted,'context-menu')
					e.remove()
				})	
			
			menuBox.appendChild(item1Box)
			menuBox.appendChild(item2Box)
			menuBox.appendChild(item3Box)
			menuBox.appendChild(item4Box)
			
			setTimeout(() => {
				if($(`#context-Menu-${e.id.substr(4)}:hover`).length == 0){
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				}
			}, 7000);
			$(`#context-Menu-${e.id.substr(4)}`).mouseleave(function (){
				setTimeout(() => {
					if($(`#context-Menu-${e.id.substr(4)}:hover`).length == 0){
					menuBox.style.display = 'none'
					document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
					}
				}, 7000);
			})
		}
		
			
			
		
		
	
	
	
	
	//hide tooltip and menu
	document.getElementById(e.childNodes[1].id).style.visibility = "hidden";
	thisMenu.style.display = 'block'

	//hide if clicking outside of element
  	document.onclick = function(ev){
		 
    	if(ev.target.id !== thisMenu.id && ev.target.parentNode.id !== thisMenu.id){	
      		thisMenu.style.display = 'none';
			  if(document.getElementById(e.childNodes[1].id)!= null && document.getElementById(e.childNodes[1].id) != undefined){
		 			document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
			  }
    	}
  	};
	

	

}
function cancelScheduleAdd(el){
	el.parentNode.parentNode.style.display='none'

}
function moveToScheduled(e, drop){
	const radAM = document.getElementById('radAM')
	const radPM = document.getElementById('radPM')
	const d = new Object()
	d.job_ID = e.parentNode.parentNode.id.substr(8)
	d.status = 'sch'
	d.designation = 'Scheduled'
	if(drop == false){
		d.shop_location = ''
	}
	
	d.date_scheduled = $('.popup').datepicker().val();
	d.julian_date = jDate(d.date_scheduled);
	(radAM.checked) ? d.time_of_day = 'am' 
		: (radPM.checked) ? d.time_of_day = 'pm'
			: d.time_of_day = '';
	
	ipc.send('update-job', d, 'move')
	//e.parentNode.parentNode.remove()
	e.parentNode.parentNode.parentNode.remove()
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
	//console.log(content.greeting)
	return content.getGreeting()
}
function deleteCompleted(){
	alert('hello')
}
