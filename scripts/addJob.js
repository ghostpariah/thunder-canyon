const electron = require('electron')
const ipc = electron.ipcRenderer
let companyList
var d = new Date();
var month_name=['January','February','March','April','May','June','July','August','September','October','November','December'];
var monthIndex = d.getMonth();// 0-11
var thisYear = d.getFullYear();// xxxx
var today = d.getDate();
var thisMonth = month_name[monthIndex];
let chosenCompany=""
//const contactContent = document.getElementById('custNameWrapper')
let txtCust
setTimeout(()=>{
	let e = document.getElementById('contactsIcon')
	e.addEventListener('click',()=>{
		let chosenCompany = document.getElementById('txtCustomerName').value
		// if(chosenCompany == ""){
		// 	ipc.send('open-contacts')
		// }else{
		// ipc.send('open-contacts', chosenCompany)
		// }
		
		
	})
	// let txtCust = document.getElementById('txtCustomerName')
	// 	txtCust.addEventListener('change', ()=>{
	// 		//alert('blur activated')
	// 		pullContacts(txtCust.value)
	// 	})
},200)

// setTimeout(()=>{
// 	$('#')
// },200)
function pullContacts(comp){
	
    if(comp){
    	let cont = ipc.sendSync('get-contacts',comp)
		//console.log(cont)
		if(cont!=undefined){
			fillContacts(cont)
		}
    }
}
function fillContacts(cont){
	let ul = document.createElement('ul')
	const contactContent = document.getElementById('contactsList')
	contactContent.innerHTML="add contact"
	if(cont[0].contacts.length>0){
        for(member in cont[0].contacts){
            let li = document.createElement('li')
            let text = document.createTextNode(`
            ${cont[0].contacts[member].firstname} ${cont[0].contacts[member].lastname}
            `)
            let linkEl = document.createElement('a')
            linkEl.setAttribute('href', '#')
            let link = document.createTextNode(`  add number`)
            linkEl.appendChild(link)
            // let cc = `            
            //     <li>${cont[0].contacts[member].lastname}</li>
			// `
			let nUl = document.createElement('ul')
			contactContent.appendChild(ul)
			ul.appendChild(li)
            li.appendChild(text)
			li.appendChild(linkEl)
			li.appendChild(nUl)
			
            for(n in cont[0].contacts[member].phoneNumbers){
                //let nUl = document.createElement('ul')
                let nLi = document.createElement('li')
                let tNu = document.createTextNode(cont[0].contacts[member].phoneNumbers[n].number)
				let  input = document.createElement('input')
				input.type = 'radio';
				
				input.name = 'pn'
				input.value = tNu
				nLi.appendChild(tNu)
				nLi.appendChild(input)
				nUl.appendChild(nLi)
				nUl.appendChild(linkEl)
				li.appendChild(nUl)
				//li.appendChild(linkEl)
            }
            //contactContent.childNodes[0].innerHTML = cc
		}
	}
}

function jDate(ds){
	console.log(ds)

	var ds = ds;    

	var dayScheduled = new Date(ds);
	var julian= Math.ceil((dayScheduled - new Date(dayScheduled.getFullYear(),0,0)) / 86400000);

	return julian;
}
function fillCustomerDataList(){
	document.getElementById('lstCustomer').style.display="block";
	var element=document.getElementById('lstCustomer');	
	companyList ='';
	element.innerHTML=""
	customerList = ipc.sendSync('get-customer-names')
	// for(i=0;i<xmlVehicles.length;i++){
	// 	if(xmlVehicles[i].getAttribute('cash')!='-1'){
	// 		customerNames.push(xmlVehicles[i].getAttribute("custName"));
	// 	}
	// }
	companyList = customerList
	var uniqueNames = customerList.sort(function (a, b) {
	 	return a.toLowerCase().localeCompare(b.toLowerCase());
	 	}).filter(onlyUnique);
	
	
	for(i=0;i<customerList.length;i++){
		
		var newOption=document.createElement("OPTION");
		newOption.setAttribute("value",uniqueNames[i]);
		element.appendChild(newOption);		
		
	}
	//fires an event when an option is selected from the datalist	
	$("#txtCustomerName").on('input', function () {
		var val = this.value;
		if($('#lstCustomer option').filter(function(){
			return this.value.toUpperCase() === val.toUpperCase();        
		}).length) {
			//send ajax request
			pullContacts(val)
			openInput(event,this,'unitWrapper');
			
			document.getElementById("txtUnit").focus();
			//alert(this.value);
		}
	});
	
}

 function onlyUnique(value, index, self) { 
 	return self.indexOf(value) === index;
 	
 }
function todayIs() {
	const objDate = new Date();
	const day = objDate.getDate();
	const month = objDate.getMonth() + 1;
	const year = objDate.getFullYear();
	const today = month + "/" + day + "/" + year;
	return today;
}
function isNewCustomer(args){
	let isNew = true
	for(i=0;i<companyList.length;i++){
		console.log(args + " "+companyList[i])
		if(args.toLowerCase() == companyList[i].toLowerCase()){
			isNew = false
			break;
		}
	}
	return isNew
}

function addNewVehicle() {
	//alert($("input[type='radio'][name='ampm2']:checked").val());
	//alert("addNewVehicle fired");
	var originOptions = document.getElementById("selOrigin");
	var selectedOrigin = originOptions.options[originOptions.selectedIndex].text;
	var newStatus;
	const objNewVehicle = new Object();
	switch(selectedOrigin) {
		case "On the Lot":
			newStatus = "wfw";
			break;
		case "Scheduled":
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
	var m= monthIndex+1;
	let company = document.getElementById('txtCustomerName').value;
	objNewVehicle.customerName= company.toLowerCase()
	objNewVehicle.unit= document.getElementById('txtUnit').value;
	objNewVehicle.notes = document.getElementById('txtNotes').value;
	objNewVehicle.estimatedCost = document.getElementById('txtCost').value;
	objNewVehicle.dateIn = todayIs();
	//newel.setAttribute("jobCat", jc);
	objNewVehicle.status = newStatus;
	objNewVehicle.cash = document.getElementById('cbCash').checked;
	objNewVehicle.approval = document.getElementById('cbApproval').checked;
	objNewVehicle.checked = document.getElementById('cbApproval').checked;
	objNewVehicle.waiting = document.getElementById('cbWaiting').checked;
	objNewVehicle.comeback = document.getElementById('cbComeback').checked;
	objNewVehicle.parts = document.getElementById('cbParts').checked;
	objNewVehicle.shopLocation = "new";
	var jtOptions = document.getElementById("selJobType");
	objNewVehicle.jobType = jtOptions.options[jtOptions.selectedIndex].text;
	if(newStatus=="sch"){
	objNewVehicle.scheduledDate = document.getElementById("datepicker").value;
	objNewVehicle.julian = jDate(document.getElementById("datepicker").value);
	}
	objNewVehicle.origin = selectedOrigin;
	objNewVehicle.active = true;
	objNewVehicle.ampm = $("input[type='radio'][name='ampm2']:checked").val();
	
	ipc.send('addNew',objNewVehicle)	
	let obj
	if(isNewCustomer(company.toLowerCase())){
		let newCompany={
			"companyName": company,
			"jobs": [
				{"jobID": Number(ipc.sendSync('getID'))}
			]
		}		
		ipc.send('add-new-company',newCompany)		
	}else{
        let IDtoAdd = Number(ipc.sendSync('getID'))
        let companyID = Number(ipc.sendSync('get-company',company.toLowerCase()))
        ipc.send('add-job-to-company', companyID, IDtoAdd)		
	}
	
	
}
function openInput(e, active, inputID1, inputID2) {
	var v = active.value;
	//alert(e.keyCode);
	fillCustomerDataList()
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
	}else{
		if (!e || e.keyCode != 9) {
			if (v && v != "") {
				
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
				case "Scheduled":
				case "Call:Possible":
					document.getElementById(inputID2).style.display = "block";
					document.getElementById("datepicker").tabIndex = "2";
					$(function() {
						$("#datepicker").datepicker({
							dateFormat : "mm/dd/yy"
						});
						$("#datepicker").datepicker('setDate', '+0');
					});
					break;
				case "On the Lot":
					document.getElementById(inputID2).style.display = "none";
					$('#txtCustomerName').focus()
					break;
				case "Needs Picked Up":
					document.getElementById(inputID2).style.display = "none";
					break;
				default:
					//document.getElementById(inputID2).style.display = "block";
					document.getElementById(inputID2).className = "visibleFieldset";
					document.getElementById('cbWrapper').className = "visibleFieldset";
					document.getElementById('formButtons').className = "visibleInput";
					document.getElementById("dateWrapper").className = "visibleInput";
					break;
			}
			if(inputID2 == "dateWrapper"){
				document.getElementById("dateWrapper").className = "visibleInput";
									
			}else{
			document.getElementById(inputID2).className = "visibleFieldset";
			}

		}
	}
}