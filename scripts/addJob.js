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
	
	$("#txtCustomerName").on('keydown', function () {
		var val = this.value;
		console.log(event.keyCode)
		
		if(event.keyCode == 13 || event.keyCode == 9) {			
				
				chosenCompany = val
				clearContacts()
				pullContacts(val)
				$('#txtContacts').focus()			
			
		}
		
	});
	 
		
			$("#datepicker").datepicker({
				dateFormat : "mm/dd/yy"
			});
			
	
},200)


function pullContacts(comp){
	console.log(comp + " from pullcontacts()")
    if(comp){
    	let cont = ipc.sendSync('get-contacts',comp.toUpperCase())
		//console.log(cont)
		fillContacts(cont)
		// if(cont!=undefined){
			
		// 	fillContacts(cont)
		// }else{
			
		// }
    }
}

function onEnter(){

}

function jDate(ds){
	console.log(ds)

	var ds = ds;    

	var dayScheduled = new Date(ds);
	var julian= Math.ceil((dayScheduled - new Date(dayScheduled.getFullYear(),0,0)) / 86400000);

	return julian;
}
function fillCustomerDataList(){
	//clearContacts()
	console.log('fillcustomerdatalist()fired')
	document.getElementById('lstCustomer').style.display="block";
	var element=document.getElementById('lstCustomer');	
	companyList ='';
	element.innerHTML=""
	customerList = ipc.sendSync('get-customer-names')
	
	companyList = customerList
	var uniqueNames = customerList.sort(function (a, b) {
	 	return a.toLowerCase().localeCompare(b.toLowerCase());
	 	}).filter(onlyUnique);
	
	
	for(i=0;i<customerList.length;i++){
		
		var newOption=document.createElement("OPTION");
		//newOption.setAttribute('label', 'your mom')
		newOption.setAttribute("value",uniqueNames[i].toUpperCase());
		element.appendChild(newOption);		
		
	}

	// //fires an event on keydown and loads the contacts text field if enter or tab are the key used
	// $("#txtCustomerName").on('keydown', function () {
	// 	var val = this.value;
	// 	//console.log(event.keyCode)
		
	// 	if(event.keyCode == 13 || event.keyCode == 9) {			
				
	// 			clearContacts()
	// 			pullContacts(val)
	// 			$('#txtContacts').focus()			
			
	// 	}
		
	// });

	//fires an event on key release that checks for an empty customer field and clears the contact field if empty
	$("#txtCustomerName").on('keyup', function () {
		var val = this.value;
		//console.log(event.keyCode)
		
		if(val == "") {			
				console.log('empty')
				clearContacts()
							
			
		}
		
	});	

	//fires an event when an option is selected from the datalist and loads the contact field when selected
	$("#txtCustomerName").on('input', function () {
		var val = this.value;
		if($('#lstCustomer option').filter(function(){
			return this.value.toUpperCase() === val.toUpperCase();        
		}).length) {
			//send ajax request
			//console.log(val)
			//this.trigger('click')
			chosenCompany = val
			clearContacts()
			pullContacts(val)
			
		}
		
	});
	
}
async function clearContacts(){
	//console.log("blur fired")
	$('#txtContacts')
    .find('option')
    .remove()
	.end()
	
	$('#txtContacts')
    .find('optgroup')
    .remove()
	.end()
	
}
function fillContacts(cont){
	//console.log('fillContacts() fired')
	let optGroup = document.createElement("optgroup")
	let t=document.createTextNode('add contact')
	let newOption=document.createElement("OPTION");
	let ul = document.createElement('ul')
	const contactContent = document.getElementById('txtContacts')//lstCOntacts
	contactContent.innerHTML=""	
	let newNumber = document.createTextNode('+ add new number')	
	console.log(typeof cont)
	if(typeof cont == 'object' && cont[0].contacts.length>0){
		 newOption=document.createElement("OPTION");
		 t=document.createTextNode('add contact')
		
        for(member in cont[0].contacts){
			let optGroup = document.createElement("optgroup")
			let optNewNumber = document.createElement("OPTION")
			
			let newNumber = document.createTextNode('+ add new number')
			optGroup.setAttribute('label',`${cont[0].contacts[member].firstname} ${cont[0].contacts[member].lastname}`)
			 contactContent.appendChild(optGroup);	            
			
            for(n in cont[0].contacts[member].phoneNumbers){
				 let newOption=document.createElement("OPTION");
				 	
				 t = document.createTextNode(`${cont[0].contacts[member].phoneNumbers[n].number}`)
				newOption.appendChild(t)
				//newOption.setAttribute('label',`${cont[0].contacts[member].firstname} ${cont[0].contacts[member].lastname}`)
				newOption.setAttribute('value', `${cont[0].contacts[member].phoneNumbers[n].number}`)
				
				
				optGroup.appendChild(newOption)
				//optGroup.appendChild(newNumber)
			}
			//newOption=document.createElement("OPTION");
			
			optNewNumber.appendChild(newNumber)
			optGroup.appendChild(optNewNumber)
			//let newNumber = document.createTextNode('+ add new number')
              
		}
		newOption=document.createElement("OPTION");
		newOption.setAttribute("value",`<a href='google.com'>add contact</a>`);	
		//newOption.setAttribute('style', 'font-weight = bold')
		let ac = document.createTextNode(`+ add contact`)
		newOption.appendChild(ac)
		
		contactContent.appendChild(newOption)

		
	}else{
		console.log('else triggered in fillContacts()')
		let blankOption = document.createElement('option')
		let b_o_text = document.createTextNode('--select option--')
		blankOption.appendChild(b_o_text)
		blankOption.disabled = true
		contactContent.appendChild(blankOption)

		let noOption = document.createElement('option')
		let n_o_text = document.createTextNode('- no contact')
		noOption.appendChild(n_o_text)		
		contactContent.appendChild(noOption)
		
		let addOption = document.createElement('option')
		let a_o_text = document.createTextNode('+ add contact')
		addOption.appendChild(a_o_text)		
		contactContent.appendChild(addOption)
		// newOption.setAttribute("value",`+ add contact`);	
		// newOption.appendChild(t)		
		// contactContent.appendChild(newOption)

	}	
	
	$(contactContent).on('change',()=>{
		tellParent()
		
	}).off('change')
}
function tellParent(choice){
	var jtOptions = document.getElementById("txtContacts");
	console.log(chosenCompany)
	//console.log(jtOptions.options[jtOptions.selectedIndex].parentElement.parentElement.parentElement.childNodes[10].nodeName);
	if(jtOptions.options[jtOptions.selectedIndex].text=='+ add contact'){
		ipc.send('open-contacts',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()))
	}
	//console.log(choice.parentElement.nodeName)
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
		if(args.toUpperCase() == companyList[i].toUpperCase()){
			alert(companyList[i])
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
	objNewVehicle.customerName= company.toUpperCase()
	objNewVehicle.unit= document.getElementById('txtUnit').value;
	objNewVehicle.notes = document.getElementById('txtNotes').value;
	objNewVehicle.estimatedCost = document.getElementById('txtCost').value;
	objNewVehicle.dateIn = todayIs();
	//newel.setAttribute("jobCat", jc);
	objNewVehicle.status = newStatus;
	objNewVehicle.cash = document.getElementById('cbCash').checked;
	objNewVehicle.approval = document.getElementById('cbApproval').checked;
	objNewVehicle.checked = document.getElementById('cbChecked').checked;
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
	if(isNewCustomer(company.toUpperCase())){
		let newCompany={
			"companyName": company.toUpperCase(),
			"jobs": [
				{"jobID": Number(ipc.sendSync('getID'))}
			]
		}		
		ipc.send('add-new-company',newCompany)		
	}else{
        let IDtoAdd = Number(ipc.sendSync('getID'))
        let companyID = Number(ipc.sendSync('get-company',company))
        ipc.send('add-job-to-company', companyID, IDtoAdd)		
	}
	
	
}
function openInput(e, active, inputID1, inputID2) {
	
	var v = active.value;	
	var next = document.getElementById(inputID1);
	
	if (active.id == "cbCash") {
		
		if (active.checked == true) {
			document.getElementById(inputID1).className = "visibleInput";
		} else {

			document.getElementById('txtCost').value = "";
			document.getElementById(inputID1).className = "hiddenInput";			
		}
	}else{
		if (!e || e.keyCode != 9) {
			if (v && v != "") {
				
				document.getElementById(inputID1).className = "visibleInput";
				next.style.display = "block";				
			
			} else {
				
				document.getElementById(inputID1).className = "hiddenInput"
			}
		}
		if (inputID2) {
			let choice = active.options[active.selectedIndex].text
			console.log(choice)
			switch(choice) {
				
				case "Scheduled":
					document.getElementById(inputID2).className = "visibleFieldset";
					break;
				case "On the Lot":
					//document.getElementById(inputID2).style.className = "hiddenInput";
					document.getElementById("dateWrapper").className = "hiddenInput";
					//$('#txtCustomerName').focus()
					break;
				
				default:
					
					//document.getElementById(inputID2).className = "visibleFieldset";
					document.getElementById('cbWrapper').className = "visibleFieldset";
					document.getElementById('formButtons').className = "visibleInput";
					//document.getElementById("dateWrapper").className = "visibleInput";
					break;
			}
			if(inputID2 == "dateWrapper"){
				//document.getElementById("dateWrapper").className = "visibleInput";
									
			}else{
			document.getElementById(inputID2).className = "visibleFieldset";
			}

		}
	}
}