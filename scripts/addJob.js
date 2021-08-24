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
let chosenCompanyID
let newCompanyContact=""
let chosenFirstname="firstname"
let chosenLastname = "lastname"
let con_ID
let newContactID
let conMeth

let phoneNumberCount
//const contactContent = document.getElementById('custNameWrapper')
let txtCust

setTimeout(()=>{
	
	
	 
		
			$("#datepicker").datepicker({
				dateFormat : "mm/dd/yy"
			});
			$('#txtCustomerName').focus()
	
},200)

ipc.on('refresh',(event,args,args2)=>{
	clearContacts()
	if(args = "go"){
		console.log("refresh fired. args= "+args)
		
		pullContacts(args2)
		console.log(document.getElementById("txtContacts").options.length)
		document.getElementById("txtContacts").selectedIndex =document.getElementById("txtContacts").options.length
	
	}else{
	//console.log("refresh "+JSON.stringify(args))
	
	pullContacts(chosenCompany)
	
	console.log(args)
	document.getElementById("txtContacts").options[args.position].selected = true
	}	
	showLabel()
	newContactID = args
	$("#txtUnit").focus()
	
})

function pullContacts(comp){
	//alert(typeof comp)
    if(typeof comp != undefined){
		console.log('pullcontacts called with object')
    	let cont = ipc.sendSync('get-contacts',comp)
		console.log("pullcontacts right after get-contacts "+cont)
		fillContacts(cont)
		// if(cont!=undefined){
			
		// 	fillContacts(cont)
		// }else{
			
		// }
    }else{
		//send with non object to trigger else in fillcontacts
		console.log('pullcontacts called without a contact object ')
		fillContacts(comp)
	}

}
ipc.on('new-contact-for-new-company', (event, args)=>{
	newCompanyContact = args
	//fillContacts(newCompanyContact)
})
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
	
	let arrCL = new Array()
	for(member in customerList){
		arrCL[member]=customerList[member].customer_name
	}
	
	companyList = Object.values(customerList)
	/*var uniqueNames = customerList.sort(function (a, b) {
	 	return a.toLowerCase().localeCompare(b.toLowerCase());
	 	}).filter(onlyUnique);
	*/	 
	
	customerList.sort((a, b) => (a.customer_name > b.customer_name) ? 1 : -1)
	//console.log("sorted customer list"+JSON.stringify(customerList))
	for(i=0;i<customerList.length;i++){
		//console.log(uniqueNames[i])
		var newOption=document.createElement("OPTION");
		//newOption.setAttribute('label', 'your mom')
		newOption.setAttribute("value",customerList[i].customer_name.toUpperCase());
		newOption.setAttribute("id", customerList[i].customer_ID)
		element.appendChild(newOption);		
		
	}
	var val
	$("#txtCustomerName").on({
		
		'keydown': function (event) {
			chosenCompanyID = null
		val = this.value;	
			console.log('keydown')
			if(event.keyCode == 13 || event.keyCode == 9) {			
				console.log('keydown'+event.keyCode)
					chosenCompany = val
					//clearContacts()
					//pullContacts(val)
					fillContacts(chosenCompany)
					$('#txtContacts').focus()			
				
			}
		 },
		'keyup': function(){
			val = this.value;		
			console.log('keyup')
			if(val == "") {	
	
					console.log('empty')
					clearContacts()							
					
			}
		},
		'input' : function(){
		val = this.value;
			 if($('#lstCustomer option').filter(function(){
			 	return this.value.toUpperCase() === val.toUpperCase();        
			 }).length) {
				console.log(val)
				//let opt = $('option[value="'+$(this).val()+'"]');
    			//let optID = (opt.length ? opt.attr('id') : 'NO OPTION');
				chosenCompany = val
				clearContacts()
				chosenCompanyID = ipc.sendSync('get-customer-ID', chosenCompany)
				//alert(chosenCompanyID)
				console.log("chosenCompanyID = "+chosenCompanyID)
				pullContacts(chosenCompanyID)
				console.log('input')
				
			}
		},
		"blur": function(){
			
			
			val = this.value;
			chosenCompany = val
			chosenCompanyID = ipc.sendSync('get-customer-ID', this.value)
			console.log('blur'+this.value+" "+chosenCompanyID)
			if(chosenCompanyID == null){
				//chosenCompanyID = ipc.sendSync('get-customer-ID', chosenCompany)
			
			fillContacts(this.value)
			}else{
				pullContacts(chosenCompanyID)
				
			}
			$('#txtContacts').focus()
		},
		"click": function(){
			console.log('click')
			this.value = ""
		}
		
	});
	
//fires an event on key release that checks for an empty customer field and clears the contact field if empty
// $("#txtCustomerName").on('keyup', function () {
// 	var val = this.value;
// 	//console.log(event.keyCode)
	
// 	if(val == "") {			
// 			console.log('empty')
// 			clearContacts()
						
		
// 	}
	
// });	

//fires an event when an option is selected from the datalist and loads the contact field when selected
// $("#txtCustomerName").on('input', function () {
// 	var val = this.value;
// 	if($('#lstCustomer option').filter(function(){
// 		return this.value.toUpperCase() === val.toUpperCase();        
// 	}).length) {
// 		//send ajax request
// 		//console.log(val)
// 		//this.trigger('click')
// 		chosenCompany = val
// 		clearContacts()
// 		pullContacts(val)
		
// 	}
	
// });
	

	

	
	

	// $("#txtContacts").on('input', function () {
	// 	var val = this.value;
	// 	if($('#lstCustomer option').filter(function(){
	// 		return this.value.toUpperCase() === val.toUpperCase();        
	// 	}).length) {
	// 		//send ajax request
	// 		//console.log(val)
	// 		//this.trigger('click')
	// 		chosenCompany = val
	// 		clearContacts()
	// 		pullContacts(val)
			
	// 	}
		
	// });
	
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
	console.log(cont)
	//console.log('fillContacts() fired')
	let optGroup = document.createElement("optgroup")
	let t=document.createTextNode('add contact')
	let newOption=document.createElement("OPTION");
	let ul = document.createElement('ul')
	const contactContent = document.getElementById('txtContacts')//lstCOntacts
	contactContent.innerHTML=""	
	//let newNumber = document.createTextNode('+ add new number')	
	//let elementNewNumber = document.createTextNode('+ add new email')
	//console.log(typeof cont)
	//console.log(cont)
	if(typeof cont != undefined && typeof cont === 'object'){ //&& cont.length >0
		 newOption=document.createElement("OPTION");
		 t=document.createTextNode('add contact')
		
        for(member in cont){
			let optGroup = document.createElement("optgroup")
			let optNewNumber = document.createElement("OPTION")
			let optNewEmail = document.createElement("OPTION")
			let optAddEmail =document.createElement("OPTION")
			
			let newNumber = document.createTextNode('+ add number')
			let txtAddEmail = document.createTextNode('+ add email')
			//let newEmail = document.createTextNode(`${cont[member].email}`)

			chosenFirstname = cont[member].first_name
			chosenLastname = cont[member].last_name
			let fn = (cont[member].first_name) ? cont[member].first_name : ""
			let ln = (cont[member].last_name) ? cont[member].last_name : ""
			optGroup.setAttribute('label',`${fn} ${ln}`)
			if(cont[member].phonenumbers){
				optGroup.setAttribute('pncount',cont[member].phonenumbers.length)
			}
			if(cont[member].emails){
				optGroup.setAttribute('ecount', cont[member].emails.length)
			}
			optGroup.setAttribute('position', member)
			if(cont[member].contact_ID){	
				optGroup.setAttribute('contactID', Number(cont[member].contact_ID))
					
				//console.log(cont[member].contactID)
			}
			 contactContent.appendChild(optGroup);
			 let dashOpt = document.createElement('option')					
			 let dash = document.createTextNode("Phone Numbers")
			 dashOpt.setAttribute("disabled","disabled")
			 dashOpt.setAttribute('class','cmHeader')
			 dashOpt.appendChild(dash)
			 optGroup.appendChild(dashOpt)
			 
			
            for(n in cont[member].phonenumbers){
				//create number element unless therre is no number
				if(cont[member].phonenumbers[n].number !=null){
					let newOption=document.createElement("OPTION");				 	
					t = document.createTextNode(`${cont[member].phonenumbers[n].number}`)
					let c = n+1
					newOption.setAttribute("position", Number(n)+1)
					newOption.setAttribute("id",`${cont[member].phonenumbers[n].phone_ID}` )
					newOption.appendChild(t)
					newOption.setAttribute("method","phone")				
					newOption.setAttribute('value', `${cont[member].phonenumbers[n].number}`)
					
					
					optGroup.appendChild(newOption)	
				}

				if(n == cont[member].phonenumbers.length-1){
					optNewNumber.appendChild(newNumber)
					optGroup.appendChild(optNewNumber)
					optGroup.lastChild.style.color = 'blue'
					optGroup.lastChild.style.fontWeight = 'bold'
					optGroup.lastChild.style.fontSize = '.65em'
					
				}			
			}
			let eDashOpt = document.createElement('option')					
			let eDash = document.createTextNode("EMAIL")
			eDashOpt.setAttribute("disabled","disabled")
			eDashOpt.appendChild(eDash)
			optGroup.appendChild(eDashOpt)

						 
			for(n in cont[member].emails){

				//create email element unless there is no email
				if(cont[member].emails[n].email !=null){
					let newOption=document.createElement("OPTION");				 	
					t = document.createTextNode(`${cont[member].emails[n].email}`)
					newOption.appendChild(t)
					newOption.setAttribute("method","email")	
					newOption.setAttribute("id",`${cont[member].emails[n].email_ID}`)			
					newOption.setAttribute('value', `${fn} ${ln} ~ ${cont[member].emails[n].email}`)				
					optGroup.appendChild(newOption)	
				}			
		   }
			
			
			optNewEmail.appendChild(txtAddEmail)
			optGroup.appendChild(optNewEmail)
			optGroup.lastChild.style.color = 'blue'
			optGroup.lastChild.style.fontWeight = 'bold'
			optGroup.lastChild.style.fontSize = '.65em'


			//let newNumber = document.createTextNode('+ add new number')
              
		}
		newOption=document.createElement("OPTION");
		newOption.setAttribute("value","no contact");	
		//newOption.setAttribute('class', 'addContactLink')
		//newOption.setAttribute('style', 'font-weight = bold')
		let ac = document.createTextNode(`+ add new contact`)
		//ac.style.fontWeight = 'bold'
		newOption.appendChild(ac)
		contactContent.insertBefore(newOption,contactContent.firstChild)
		//contactContent.appendChild(newOption)
		contactContent.firstChild.style.fontWeight = 'bold'
		//contactContent.lastChild.style.color = 'blue'
		
	}else{
		
		//console.log('else triggered in fillContacts()')
		let blankOption = document.createElement('option')
		let b_o_text = document.createTextNode('--select option--')
		blankOption.appendChild(b_o_text)
		blankOption.disabled = true
		contactContent.appendChild(blankOption)

		let noOption = document.createElement('option')
		let n_o_text = document.createTextNode('no contact')
		noOption.appendChild(n_o_text)		
		contactContent.appendChild(noOption)
		
		let addOption = document.createElement('option')
		let a_o_text = document.createTextNode('+ add contact')
		addOption.appendChild(a_o_text)		
		contactContent.appendChild(addOption)
		

	}	
	$('#txtContacts').focus()
	
	$(contactContent).on('change',()=>{
		
		tellParent()
		
	}).off('change')
	$(contactContent).trigger('change')
}

function tellParent(choice){
	var conOps = document.getElementById("txtContacts");
	console.log(`from tellParent ${chosenCompany} ${chosenFirstname} ${chosenLastname}`)
	//contactIDNumber = conOps.options[conOps.selectedIndex].parentElement.getAttribute('contactID')
		
	
	let con_ops = conOps.options[conOps.selectedIndex].text
	con_ops = con_ops.substring(con_ops.indexOf("~") + 1);
	let con_name
	let index
	switch(con_ops){
		
		case '+ add contact': 
			//con_ID = d.getTime()
			let check = ipc.sendSync('get-customer-ID',chosenCompany)
			console.log(chosenCompanyID)
			if(check === false){
			chosenCompanyID = addNewCompany(chosenCompany)
			}
			ipc.send('open-contacts','add job page',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()))
			break;
		case '+ add new contact': 
			//con_ID = d.getTime()
			//con_ID = Number(conOps.options[conOps.selectedIndex].parentElement.getAttribute('contactID'))
			
			ipc.send('open-contacts','add job page',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()))
			
			break;
		case '+ add number': 
			con_name = conOps.options[conOps.selectedIndex].parentElement.label.split(' ')
			index = conOps.options[conOps.selectedIndex].index
			conMeth = "phone"
			con_ID = Number(conOps.options[conOps.selectedIndex].parentElement.getAttribute('contactID'))
			ipc.send('open-contacts','add job page',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()), con_name[0], con_name[1], con_ID, conMeth)
			console.log('test '+con_ID)
			break;
		case '+ add email':
			con_name = conOps.options[conOps.selectedIndex].parentElement.label.split(' ')
			index = conOps.options[conOps.selectedIndex].index
			conMeth = "email"
			con_ID = Number(conOps.options[conOps.selectedIndex].parentElement.getAttribute('contactID'))
			ipc.send('open-contacts','add job page',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()), con_name[0], con_name[1], con_ID, conMeth)
			
			break;
		default:
			showLabel()
			
			break;
	}
	
}
 function validate(inputText){
	
	  const phoneno = /^\d{10}$/;
	  if((inputtxt.value.match(phoneno)))
			{
		  return true;
			}
		  else
			{
			
			return false;
			}
	
 }
function showLabel() {
	let arrOptions = document.getElementById("txtContacts")
	let selected = $('#txtContacts :selected');	
	let item = selected.text();
	let group = selected.parent().attr('label')+" ~ ";
	
	
	/****
	* switch statement to verify what was selected and
	* process accordingly
	****/
	switch (item){

		case "no contact":
			break;
		case "+ add number":
			
			break;
		case "+ add new contact":
			break;
		default:
			//loop through select and remove name from unselected options
			for(i=0;i<arrOptions.length;i++){
				if(arrOptions.options[i].text.includes('~')){//startsWith(group)
					arrOptions.options[i].text = arrOptions.options[i].text.substring(arrOptions.options[i].text.indexOf("~")+1)
				}		
			}

			//add the name to the selected item in the text box i.e Jim Kern ~ (514)908-6666
			if(item.includes('~')){
				selected.text(item)
			}else{
				selected.text(group+item);
			}
			
	}
	
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

function addJob (){
	//alias input fields for easier programming
	let txtCN = document.getElementById('txtCustomerName')
	let txtCon = document.getElementById('txtContacts')
	let txtCost =document.getElementById('txtCost')
	let txtNotes = document.getElementById('txtNotes')
	let designation = document.getElementById('selOrigin')
	let jt = document.getElementById('selJobType')

	let objNewJob = new Object()
	let company_ID
	let contact_ID
	/*
	if(isNewCustomer(txtCN.value)){
		company_ID = addNewCompany()
	}else{
		company_ID = chosenCompanyID;//ipc.sendSync('get-company-id', company)
	}
	if(contactIsBeingAdded()){
		ipc.send('add-new-contact', company_ID, newCompanyContact)
	}
	*/
	
	//build job object
	objNewJob.customer_ID =(chosenCompanyID != null && chosenCompanyID != '') ? chosenCompanyID : ipc.sendSync('add-new-customer', txtCN.value)
	//objNewJob.customer_ID = chosenCompanyID
	if(txtCon.options[txtCon.selectedIndex].getAttribute("method")=="phone"){
		objNewJob.number_ID = txtCon.options[txtCon.selectedIndex].id
	}
	if(txtCon.options[txtCon.selectedIndex].getAttribute("method")=="email"){
		objNewJob.email_ID = txtCon.options[txtCon.selectedIndex].id
	}
	(txtNotes.value.trim().length) ? objNewJob.notes = txtNotes.value : '';
	if(document.getElementById('cbCash').checked){
		objNewJob.cash_customer = 1
		objNewJob.estimated_cost = txtCost.value;	
	}
	objNewJob.designation = designation.options[designation.selectedIndex].value;
	//alert(objNewJob.designation)
	if(objNewJob.designation == "On the Lot"){
		objNewJob.date_in = todayIs() 
		objNewJob.status = "wfw" 
		
	}else if (objNewJob.designation == "Scheduled"){
		objNewJob.date_scheduled = document.getElementById('datepicker').value;
		objNewJob.time_of_day = ($('input[type=radio]:checked').size() > 0)?$('input[name=ampm2]:checked').val(): 'am';
		objNewJob.status = "sch"
		objNewJob.julian_date = jDate(document.getElementById('datepicker').value)
		objNewJob.date_called = todayIs()
	}
	(txtUnit.value.trim().length) ? objNewJob.unit = txtUnit.value : '';	
	objNewJob.active = 1
	objNewJob.cancelled = 0
	objNewJob.job_type = jt.options[jt.selectedIndex].value;
	(document.getElementById('cbApproval').checked) ? objNewJob.approval_needed = 1 : objNewJob.approval_needed = 0;
	(document.getElementById('cbParts').checked) ? objNewJob.parts_needed = 1 : objNewJob.parts_needed = 0;
	(document.getElementById('cbChecked').checked) ? objNewJob.checked = 1 : objNewJob.checked = 0;
	(document.getElementById('cbComeback').checked) ? objNewJob.comeback_customer = 1 : objNewJob.comeback_customer = 0;
	(document.getElementById('cbWaiting').checked) ? objNewJob.waiting_customer = 1 : objNewJob.waiting_customer= 0;
	
	console.log(objNewJob)
	//addNewVehicle()
	//addNewJobToCustomer(company_ID)
	ipc.send('add-job',objNewJob)


}

function addNewJobToCustomer(args){
	let IDtoAdd = Number(ipc.sendSync('getID'))
    //let companyID = Number(ipc.sendSync('get-company',company))
    ipc.send('add-job-to-company', args, IDtoAdd)		
}
function isNewCustomer(args){
	let isNew = true
	
	for(i=0;i<companyList.length;i++){
		//console.log(args + " "+JSON.stringify(companyList[i]))
		if(args.toUpperCase() == companyList[i].customer_name.toUpperCase()){
			
			isNew = false
			break;
		}
	}
	return isNew
}
/***
 * adds new company to customers.json and returns the ID of the newly created company
 */

function addNewCompany(name){
	let id = ipc.sendSync('add-new-customer', name)
	// console.log('addNewCompany fired')
	// let objCompany = new Object()
	// objCompany.companyName = document.getElementById('txtCustomerName').value.toUpperCase();
	// objCompany.contacts = []
	// objCompany.jobs = []
	// let id = ipc.sendSync('add-new-company', objCompany)
	console.log('id returned from addNewCompany: '+id)
	return id
}
function contactIsBeingAdded(){
	let selContact = document.getElementById('txtContacts')
	//let id = addNewCompany()
	//console.log(id)
	let optSelected = selContact.options[selContact.selectedIndex].value	
	let b = (optSelected.includes('no contact')) ? false : true	
	return b
}

function addNewVehicle() {
	
	
	var originOptions = document.getElementById("selOrigin");
	var selectedOrigin = originOptions.options[originOptions.selectedIndex].text;
	var newStatus;
	const objNewVehicle = new Object();
	var m= monthIndex+1;
	let company = document.getElementById('txtCustomerName').value;
	let isNewCompany = isNewCustomer(company.toUpperCase())
	let dt = new Date()
	var selected = $('#txtContacts :selected');
	var item;

	// if(isNewCompany){
	// 	let newCompany = new Object()
	// 	newCompany.companyName = company.toUpperCase()
	// 	newCompany.jobs =[]
	// 	//newCompany.jobs.push({'jobID': Number(ipc.sendSync('getID'))})
	// 	let newContact = new Object()
		
		
	// 	if(newCompanyContact){
	// 		newCompany.contacts = []
	// 		newCompany.contacts.push({})
	// 		if(newCompanyContact.firstname){
	// 			newCompany.contacts[0].firstname = newCompanyContact.firstname
	// 			//newCompany.contacts.push({'firstname': newCompanyContact.firstname})
	// 		}
	// 		if(newCompanyContact.lastname){
	// 			newCompany.contacts[0].lastname = newCompanyContact.lastname
	// 		}
	// 		if(newCompanyContact.phoneNumber){
	// 			newCompany.contacts[0].phoneNumbers= []
	// 			newCompany.contacts[0].phoneNumbers.push({'number': newCompanyContact.phoneNumber})
	// 		}
	// 		if(newCompanyContact.email){
	// 			newCompany.contacts[0].emails =[]
	// 			newCompany.contacts[0].emails.push({'email': newCompanyContact.email})
	// 		}
	// 		newContactID = dt.getTime()
	// 		newCompany.contacts[0].contactID = newContactID
	// 	}
				
		
	// 	ipc.send('add-new-company',newCompany)		
	// }else{
    //     let IDtoAdd = Number(ipc.sendSync('getID'))
    //     let companyID = Number(ipc.sendSync('get-company',company))
    //     ipc.send('add-job-to-company', companyID, IDtoAdd)		
	// }
	switch(selectedOrigin) {
		case "On the Lot":
			newStatus = "wfw";
			break;
		case "Scheduled":
			newStatus = "sch";
			break;		
		default:
			newStatus = "wfw";
			break;
	}
	


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
	let conOps = document.getElementById("txtContacts")
	if(isNewCompany){	
		objNewVehicle.jobContact = newContactID
	}else{
		//let conOps = document.getElementById("txtContacts")
		objNewVehicle.jobContact = Number(conOps.options[conOps.selectedIndex].parentElement.getAttribute('contactID'))
		item = selected.text();
		item = item.substring(item.indexOf("~") + 2);			
		
		objNewVehicle.contactMethod = item;
	}
	ipc.send('addNew',objNewVehicle)	
	
	
	
	
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