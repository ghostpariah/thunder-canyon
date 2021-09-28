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


let totalCount = 0
let lotCount = 0
let scheduledCount = 0
let completedCount = 0
let countStatusesCalled = 0
let bucket = {}
let openContent = createOpenContent();
let accessGrantedContent

let allJobs
let currentUser
let scheduledSpots
let wpuSpots
window.onload = () =>{
	 
	allJobs = ipc.sendSync('pull_jobs')
	console.log(allJobs)	
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
	allJobs = ipc.sendSync('pull_jobs')
	countStatuses()
	clearPage()
	loadJobs(allJobs)
	
	
});

 function openContacts(){
	 
	 ipc.send('open-contacts', 'main page')//,undefined,undefined,undefined,undefined,undefined,'directButton')
 }
 function openCalendar(){
	 
	 ipc.send('open-calendar',currentUser)
	 	
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
	
	document.getElementById('contentArea').innerHTML = openContent;   	
	
 })
 ipc.on('reload',(event,args)=>{
	 console.log("from reload"+args)
	   	
	
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

var vehicles = {
	WFW : [],
	WFP : [],
	WIP : [],
	WPU : [],
	SCH : [],
	POS : [],
	NPU : []
};
//const wpuBucket =["wpu0","wpu1","wpu2","wpu3","wpu4","wpu5","wpu6","wpu7","wpu8","wpu9","wpu10","wpu11","wpu12","wpu13","wpu14","wpu15","wpu16","wpu17","wpu18","wpu19"];
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
// function getFormInputs() {
// 	formInputs.required.push({

// 		inputs : [{
// 			"jobType" : document.getElementById("selJobType"),
// 			"origin" : document.getElementById("selOrigin"),
// 			"customerName" : document.getElementById("txtCustomerName"),
// 			"unit" : document.getElementById("txtUnit"),
// 			"schDate" : document.getElementById("datepicker")
// 		}],
// 		wrappers : [{
// 			"jobTypeWrapper" : document.getElementById("jobTypeWrapper"),
// 			"originWrapper" : document.getElementById("originWrapper"),
// 			"customerNameWrapper" : document.getElementById("customerNameWrapper"),
// 			"unitWrapper" : document.getElementById("unitWrapper"),
// 			"dateWrapper" : document.getElementById("dateWrapper")
// 		}]
// 	});
// 	formInputs.optional.push({

// 		inputs : [{
// 			"notes" : document.getElementById("txtNotes"),
// 			"cash" : document.getElementById("cbCash"),
// 			"cost" : document.getElementById("txtEstCost"),
// 			"parts" : document.getElementById("cbParts"),
// 			"comeback" : document.getElementById("cbComeback"),
// 			"waiting" : document.getElementById("cbWaiting")
// 		}],
// 		wrappers : [{
// 			"optionalWrapper" : document.getElementById("cbWrapper"),
// 			"notesWrapper" : document.getElementById("notesWrapper"),
// 			"cashWrapper" : document.getElementById("cashWrapper"),
// 			"costWrapper" : document.getElementById("costWrapper"),
// 			"partsWrapper" : document.getElementById("partsWrapper"),
// 			"comebackWrapper" : document.getElementById("comebackWrapper"),
// 			"waitingWrapper" : document.getElementById("waitingWrapper")
// 		}]
// 	});

// }


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

var testBucket = ["wfw0"];
var scheduleBucket = ["sch0", "sch1", "sch2", "sch3", "sch4", "sch5", "sch6", "sch7", "sch8", "sch9", "sch10", "sch11", "sch12", "sch13", "sch14", "sch15", "sch16", "sch17", "sch18", "sch19"];
var largestBucket = 0;
var wfwTotalSlots = 48;

var storedXMLVehicles = "";
var storedVehicles = [];
function freshStyle(stylesheet){
	$('#mainStyle').attr('href',stylesheet);
 }


 var arrPopUp = ['schBox','wpuBox','calendar-container'];
 





/*
 * callable functions
 */ 
 

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
	//determine how many spots to create in container. Creating an extra two rows for flexibility
	spotsNeeded = Math.ceil((arrCompleted.length/2)+2)*2
	wpuSpots = spotsNeeded
	//remove any elements that are already in the wpu container
	if(wpuJobContainer.hasChildNodes()){
		
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
 //function to group same date schedulled items for glimpse
 function groupByKey(array, key) {
	return array
	  .reduce((hash, obj) => {
		if(obj[key] === undefined) return hash; 
		return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
	  }, {})
 }
function fillScheduleGlimpse(args){
	//console.log('glimpse called')
	arrScheduledStatus = new Array()
	let wrapper = document.getElementById('ucWrapper')
	let schJobContainer = document.getElementById('schJobContainer')
	let objCustomerNames = ipc.sendSync('get-customer-names')
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
	
	let spotsNeeded = Math.ceil((arrScheduledStatus.length/5)+2)*5
	scheduledSpots = spotsNeeded
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
	let arrSD = groupByKey(x,'date_scheduled')
	
	
	let k = Object.keys(arrSD)
	let v = Object.values(arrSD)
	
	
	let glimpse
	let head
	let tDate
	let data
	
	for(j=0;j<k.length;j++){
		glimpse = document.createElement('div')
		glimpse.setAttribute('class', 'upcomingBox')
		head = document.createElement('div')
		let date = new Date(k[j])
		let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		let day = days[date.getDay()]
		hText = document.createTextNode(day + ' '+k[j])
		head.setAttribute('class', 'glimpseHead')	
		head.appendChild(hText)
		glimpse.appendChild(head)
		for(i=0;i<v[j].length;i++){
			
			data = document.createElement('div')
			data.setAttribute('class', 'glimpseData')
			let schedItem = document.createElement('div')
			schedItem.setAttribute('class', 'glimpseItem')
			let jobType = document.createElement('div')
			let color
			jobType.setAttribute('class', 'colorBlock')
			switch(v[j][i].job_type){
				case 'Spring':
					color = '#5e81ad';
					break;
				case 'Check All':
					color = '#ff9e0c';
					break;
				case 'Alignment':
					color = '#ad5ea8';
					break;
				case 'King Pin':
					color = '#5ead63';
					break;
				case 'Frame':
					color = '#ff2d00';
					break;
				default:
					break;
			}

			jobType.setAttribute('style','background-color:'+color)
			let n 
			let name = document.createElement('div')
			name.setAttribute('class','glimpseCustomer')
			let tJT = document.createTextNode(v[j][i].time_of_day);
			for(member in objCustomerNames){
				if(objCustomerNames[member].customer_ID == v[j][i].customer_ID){
					n=objCustomerNames[member].customer_name
				}
			}
			let tName = document.createTextNode(n.toUpperCase())
			
			jobType.appendChild(tJT)			
			schedItem.appendChild(jobType)
			name.appendChild(tName)
			schedItem.appendChild(name)
			data.appendChild(schedItem)
			glimpse.appendChild(data)
			
			
			
		}
		
		wrapper.appendChild(glimpse)
	}
			
	
		//console.log(arrSD[member].length)
	
	//console.log(JSON.stringify(arrSD,"","\t"))
	/*
	for(i=0;i<2;i++){
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
	}*/
	//console.log(JSON.stringify(x))

}

function countStatuses(){
	totalCount = 0
	scheduledCount = 0
	lotCount = 0
	completedCount = 0
	let shopCount = 0
	countStatusesCalled+=1
	
	
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
		'text': 'Users'
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
				case 'Users':
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
	
	ev.dataTransfer.setData("Text", ev.target.id);
	
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
	
	ns = ev.target.id;
	let newStatus;
	
	let data = ev.dataTransfer.getData("Text");
	let id = data.substr(4)
	
	let oldStatus = document.getElementById(data).parentNode.id.substr(0, 3).toLowerCase(); 
	
	let newLocation 
	
	console.log(ev.target)
	
	let cellOccupied = (document.getElementById(ev.target.id))?document.getElementById(ev.target.id).hasChildNodes():true;	
	
	ev.stopPropagation();
	ev.preventDefault();

	let thisJob
	
	
	let objMoving = new Object()
	
	if(cellOccupied){
		
		newStatus = ns.substr(0, 3).toLowerCase(); 
		
		if(newStatus == "wpu" || newStatus == "sch" || newStatus =="SCH"){
			 
			objMoving.status = newStatus;
			
			if(newStatus=='sch' || newStatus=='SCH'){
				objMoving.designation = "Scheduled"
			}	
			
			for(member in allJobs){
				if(id == allJobs[member].job_ID){
					let getSpot = new Object()
					getSpot.job_type = allJobs[member].job_type
					getSpot.status = newStatus
					newLocation = findSpot(getSpot)
					objMoving.shop_location = newLocation
					objMoving.date_in = allJobs[member].date_in					
					objMoving.job_ID = id
					

					
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
		
		let editedJob = ipc.sendSync('edit-location-drop', objMoving, currentUser)
		


		//determine whether new location is at bottom of page and reset
		//tooltip class accordingly		
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
	//loadJobs(reloadedJobs)
	}
}



function openLoginWindow(){
	
	if(!loggedIn){
		
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
	let cc = document.getElementById('wpuJobContainer').childNodes.length
	for(i=0;i<cc;i++){
		if(document.getElementById('wpu'+i).hasChildNodes()){
			let id = document.getElementById('wpu'+i).childNodes[0].id.substr(4)			
			ipc.send('deactivate', id, currentUser)			
		}
		
	}
	
}
function deleteCompleted(){
	
	let itemToSetInactive=''
	arrItemsToDeactivate=[]
	let element
	for(i=0;i<wpuBucket.length;i++){
		
		element = document.getElementById(wpuBucket[i])
		if(element.hasChildNodes()){
		itemToSetInactive = document.getElementById(wpuBucket[i]).childNodes[0].id.substr(4,17)
		arrItemsToDeactivate.push(itemToSetInactive)
		
		
		}
		
		document.getElementById(wpuBucket[i]).innerHTML = ''
		
	}
	ipc.send('deactivate', arrItemsToDeactivate, currentUser)


}
function deleteDrop(ev) {
	let deactivate = ev.dataTransfer.getData("Text").substr(4)
	let data = ev.dataTransfer.getData("Text");
	
	
	try {
		
		let updatedJobs = ipc.sendSync('deactivate', deactivate, currentUser)
		//document.getElementById(data).remove()	

	} catch(e) {
		
		
	}
}






function openBox(e,event) {
	
	var event = event;
	
	
		if (e.hasChildNodes)
			var count = 0;
		
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
			
			case "SCH":
				
				switch(document.getElementById("schBox").style.display) {
					case "none":
					case "":						
						break;
					case "block":						
						document.getElementById("calendar-container").style.display = "block";						
						break;
				}
				break;
			
			
				case "viewCal":

					

						switch(document.getElementById("calendar-container").style.display) {
							case "none":
							case "":							
								document.getElementById("calendar-container").style.display="block";	
								
								resetCalendar();
								setCalendarMonth();					
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


	ev.cancelBubble = true;
}



function addNewJob() {
	ipc.send('open-add-job', currentUser)
	
}



function submitted() {
	
	addNewVehicle();
	ipc.send('close-add-window')
	
}



//test filling page with new json object
function placeElement(args){
	
	let placement = (args.shop_location != null && args.shop_location != '') ? makeJobDiv2(args) : findOpenSpace(args) 
	
	if(placement !=null) {
		try{
		document.getElementById(args.shop_location).innerHTML = placement
		}catch(e){
			console.log(e)
		}
	}
	if(args.cash_customer==1){document.getElementById('jica'+args.job_ID).style.display = 'inline-block'};
	if(args.waiting_customer===1){document.getElementById('jiw'+args.job_ID).style.display = 'inline-block'};
	if(args.parts_needed==1){document.getElementById('jip'+args.job_ID).style.display = 'inline-block'};
	if(args.approval_needed==1){document.getElementById('jia'+args.job_ID).style.display = 'inline-block'};
	if(args.comeback_customer==1){document.getElementById('jico'+args.job_ID).style.display = 'inline-block'};
	if(args.checked==1){document.getElementById('jich'+args.job_ID).style.display = 'inline-block'};
	
}
function findOpenSpace(args){
	console.log('findOpen triggered')
	let usedLocation = []
	for(member in allJobs){
		usedLocation.push(allJobs[member].shop_location)
	}
	
	let jt=args.job_type
	let js=args.status
	
	let newBucket = []
	let bucket = []
	let hasKids = true
	let springBucket = ["wfw0", "wfw1", "wfw2", "wfw3", "wfw4", "wfw5", "wfw6", "wfw7", "wfw8", "wfw9", "wfw10", "wfw11"];
    let checkallBucket = ["wfw12", "wfw13", "wfw14", "wfw15", "wfw16", "wfw17", "wfw18", "wfw19", "wfw20", "wfw21", "wfw22", "wfw23"];
	let alignmentBucket = ["wfw24", "wfw25", "wfw26", "wfw27", "wfw28", "wfw29", "wfw30", "wfw31", "wfw32", "wfw33", "wfw34", "wfw35"];
	let kingpinBucket = ["wfw36", "wfw37", "wfw38", "wfw39", "wfw40", "wfw41", "wfw42", "wfw43", "wfw44", "wfw45", "wfw46", "wfw47"];
	let frameBucket =["wfw48", "wfw49", "wfw50", "wfw51", "wfw52", "wfw53", "wfw54", "wfw55", "wfw56", "wfw57", "wfw58", "wfw59"];
	//let wpuBucket =["wpu0","wpu1","wpu2","wpu3","wpu4","wpu5","wpu6","wpu7","wpu8","wpu9","wpu10","wpu11","wpu12","wpu13","wpu14","wpu15","wpu16","wpu17","wpu18","wpu19"];
	//let schBucket =["sch0","sch1","sch2","sch3","sch4","sch5","sch6","sch7","sch8","sch9","sch10","sch11","sch12","sch13","sch14","sch15","sch16","sch17","sch18","sch19"];
	let wpuBucket = []
	let schBucket = []
	for(i=0;i<scheduledSpots;i++){
		schBucket.push(`sch${i}`)
	}
	for(i=0;i<wpuSpots;i++){
		wpuBucket.push(`wpu${i}`)
	}

	if(js != "sch" && js!= "wpu" && js != 'SCH'){
	newBucket = jt == "Spring" ? springBucket : (jt == "Alignment") ? alignmentBucket :(jt == "Frame") ? frameBucket : (jt=="King Pin") ? kingpinBucket : checkallBucket 
	}else{
		js == "sch" || js == "SCH" ? newBucket =schBucket : newBucket = wpuBucket
	}

	bucket = newBucket
	
	
	for(let i=0;i<bucket.length;i++){
		
		if(usedLocation.indexOf(bucket[i])<0){			
			args.shop_location = bucket[i]
			break;
		}		
		
	}
	
	ipc.send('edit-location',args)
	return makeJobDiv2(args)
}
function findSpot(args){
	
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
	
	for(let i=0;i<bucket.length;i++){
		
		hasKids = document.getElementById(bucket[i]).hasChildNodes();
		if(!hasKids){
			
			spot = bucket[i];
			
			
			break;
			
		}

	}

	
	return spot
}

function makeJobDiv2(args){
	
	let str = args.job_type.replace(/\s+/g, '');
	let objContact
	let contactName 
	let contactItem
	let customerName
	
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









function clearWFW() {
	
	for ( i = 0; i < 60; i++) {
		document.getElementById('wfw' + i).innerHTML = "";
	}	

}

function clearWIP() {
	for ( i = 0; i < 12; i++) {
		document.getElementById('wip' + i).innerHTML = "";
	}
	
}

function clearWPU() {
	let c = document.getElementById('wpuJobContainer').childNodes.length
	for ( i = 0; i < c; i++) {
		document.getElementById('wpu' + i).innerHTML = "";
	}
	
}




function clearSCH() {
	let c = document.getElementById('schJobContainer').childNodes.length
	
	for ( i = 0; i < c; i++) {
		document.getElementById('sch' + i).innerHTML = "";
	}
	

}







function clearPage() {
	clearWFW();
	clearWIP();	
	clearWPU();	
	clearSCH();	
}

function refresh() {
	clearPage();
	ipc.send('reloadPage')
	

}


ipc.on('show-admin-elements', (event, args)=>{
	currentUser = args
	//alert(args.user_ID)
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
	currentUser = args
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

function todayIs() {
	const objDate = new Date();
	const day = objDate.getDate();
	const month = objDate.getMonth() + 1;
	const year = objDate.getFullYear();
	const today = month + "/" + day + "/" + year;
	return today;
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
				ipc.send('open-edit',x, 'context-menu',currentUser)
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
				ipc.send('update-job',objNoshow, 'context-menu', currentUser)
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
				objLot.designation = 'On the Lot'
				objLot.date_in = todayIs()
				ipc.send('update-job',objLot, 'context-menu', currentUser)
				e.remove()
			})
			item4Text = document.createTextNode('CANCEL APPT')			
			item4Box.appendChild(item4Text)
			item4Box.setAttribute('class','item')
			item4Box.setAttribute('id','send'+e.id.substr(4))
			item4Box.addEventListener('click',(event)=>{
				menuBox.style.display = 'none'
				document.getElementById(e.childNodes[1].id).style.visibility = 'visible';
				//alert(e.id.substr(4))
				objCancel = new Object()
				objCancel.job_ID = x[0].job_ID
				objCancel.cancelled = 1
				objNoshow.active = 0
				ipc.send('update-job',objCancel, "context-menu",currentUser)
				
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
				ipc.send('open-edit', x, 'context-menu',currentUser)
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
				objChecked.user_ID = currentUser.user_ID
				ipc.send('update-job', objChecked,'context-menu')
				
			})
			item3Text = document.createTextNode('SCHEDULE')
			item3Box.appendChild(item3Text)
			item3Box.setAttribute('class','item')
			item3Box.setAttribute('id','schedule'+e.id.substr(4))
			item3Box.addEventListener('click',(event)=>{
				document.getElementById(e.childNodes[1].id).style.display='none';
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
					ipc.send('update-job', objCompleted,currentUser)
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
	document.getElementById('tt'+el.parentNode.parentNode.id.substr(8)).style.display='none';
	console.log
	$(`#drag${el.parentNode.parentNode.id.substr(8)}`)
	.on('mouseenter', function(){		
		document.getElementById(`tt${this.id.substr(4)}`).style.display ='block'		
	})
	.on('mouseleave', function(){		
		document.getElementById(`tt${this.id.substr(4)}`).style.display ='none'		
	})

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


function createOpenContent(){
	const content = new Splash()
	//console.log(content.greeting)
	return content.getGreeting()
}
