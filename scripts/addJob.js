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
let currentUser
//let phoneNumberCount
let launcher
let launcherData
let txtCust

setTimeout(()=>{
	
	
	 
		
			$("#datepicker").datepicker({
				dateFormat : "mm/dd/yy"
				
			});
			$("#datepickerOTL").datepicker({
				dateFormat : "mm/dd/yy"
				
			});
			//$('#txtCustomerName').focus()
			$('#selOrigin').focus()
			
	
},200)
ipc.on('user-data',(event,args, args2)=>{
	currentUser = args
	if(args2){
		launcherData = args2
		console.log(args2)
		launcher = args2.launcher
		setData(launcherData)
	}
	
	
})
ipc.on('refresh',(event,args,args2,args3)=>{
	console.log('refresh page called')
	clearContacts()
	if(args = "go"){
		console.log(args2)
		
		pullContacts(args2)
		console.log('after pullcontacts called')
		document.getElementById("txtContacts").selectedIndex =document.getElementById("txtContacts").options.length
		
		var values = Array.from(document.getElementById("txtContacts").options).map(e => e.id);
		document.getElementById("txtContacts").options.namedItem(args3).selected=true;
		
	
	}else{
	
	
	pullContacts(chosenCompany)
	
	
	document.getElementById("txtContacts").options[args.position].selected = true
	}	
	showLabel()
	newContactID = args
	
	window.focus()
	
	$('#txtUnit').click()
	$("#txtUnit").focus()
	
})

function setData(data){
	document.getElementById('datepicker').value = data.date_scheduled
	document.getElementById('rad'+data.time_of_day.toUpperCase()).checked = true
	document.getElementById('selOrigin').value = 'Scheduled'
	
	openInput(event,document.getElementById('selOrigin'),'customerNameWrapper','dateWrapper')
	
}
function pullContacts(comp){
	
    if(typeof comp != undefined){
		
    	let cont = ipc.sendSync('get-contacts',comp)
		//createdropDown(cont)
		fillContacts(cont)
		
    }else{
		//send with non object to trigger else in fillcontacts
		
		fillContacts(comp)
	}

}
ipc.on('new-contact-for-new-company', (event, args)=>{
	newCompanyContact = args
	
})
function formatDate(date){
	let pieces = date.split('/');
	if(pieces[0].length>2 || Number(pieces[0])>12) return [false,date]
	if(pieces[1].length>2) return [false,date]
	if(pieces[2].length>4 || pieces[2].length < 2 || pieces[2].length == 3) return [false,date]

	let month = (pieces[0].length <2) ? '0'+pieces[0] : pieces[0];
	let day = (pieces[1].length <2) ? '0'+pieces[1] : pieces[1];
	let year = (pieces[2].length ==2) ? '20'+pieces[2] : pieces[2];
	console.log(`${month}/${day}/${year}`)
	return [true, `${month}/${day}/${year}`]
	
}

function jDate(ds){
	

	var ds = ds;    

	var dayScheduled = new Date(ds);
	var julian= Math.ceil((dayScheduled - new Date(dayScheduled.getFullYear(),0,0)) / 86400000);

	return julian;
}
function fillCustomerDataList(){
	let element = document.getElementById('lstCustomer');
	let arrCL = new Array()

	
	document.getElementById('lstCustomer').style.display="block";
		
	companyList ='';
	element.innerHTML=""
	customerList = ipc.sendSync('get-customer-names')
	
	
	for(member in customerList){
		arrCL[member]=customerList[member].customer_name
	}
	
	companyList = Object.values(customerList)
	 
	
	customerList.sort((a, b) => (a.customer_name > b.customer_name) ? 1 : -1)
	
	for(i=0;i<customerList.length;i++){
		
		var newOption=document.createElement("OPTION");
		
		newOption.setAttribute("value",customerList[i].customer_name.toUpperCase());
		newOption.setAttribute("id", customerList[i].customer_ID)		
		element.appendChild(newOption);		
		
	}
	var val
	for (let option of element.options) {
		// console.log(option)
		option.style.display = 'block'
		option.onclick = function () {
		  this.value = option.value;
		//   element.style.display = 'none';
		  this.style.borderRadius = "5px";
		}
	}
	$("#txtCustomerName").on({
		
		'keydown': function (event) {
			// document.getElementById('no_show').innerHTML =''
		 },
		'keyup': function(){
			//reset contacts if backspacing to empty field
			val = this.value;		
			
			if(val == "") {						
					clearContacts()						
			}
		},
		'input' : function(){
			
			val = this.value;
			
			//sort datalist to display entries that match what is typed
			 if($('#lstCustomer option').filter(function(){
			 	return this.value.toUpperCase() === val.toUpperCase();        
			 }).length) {
			//if(val )	
				// chosenCompany = val
				// clearContacts()
				// chosenCompanyID = ipc.sendSync('get-customer-ID', chosenCompany)				
				// pullContacts(chosenCompanyID)
				
				
			}
		},
		"change": function(){
			console.log('change fired on customer name field')
			//console.log(checkForNoShows(chosenCompanyID))
		},
		"blur": function(){	
			document.getElementById('no_show').innerHTML =''		
			clearContacts()
			chosenCompanyID =null
			val = this.value;
			chosenCompany = val.trim()
			chosenCompany = chosenCompany.replace(/  +/g, ' ');
			// $('#txtContacts').text = chosenCompany;
			
			chosenCompanyID = ipc.sendSync('get-customer-ID', chosenCompany)
			

			// if 'get-customer-ID' returned false or null
			if(chosenCompanyID === false || chosenCompanyID === null){			
				//call fill contacts with false value
				fillContacts(this.value)
				

			}else{
				if(checkForNoShows(chosenCompanyID)){
					//create message section to alert of no shows
					
					let message = document.createElement('span')
					let text = document.createTextNode('CUSTOMER HAS NO-SHOW ON RECORD')
					message.appendChild(text)
					let link = document.createElement('span')
					let linkText = document.createTextNode('view')
					link.setAttribute('class','actionLink')
					link.appendChild(linkText)
					link.addEventListener('click',()=>{
						
						ipc.send('open-report-window',currentUser.role, chosenCompanyID,"no_shows")
					})
					
					document.getElementById('no_show').appendChild(message)
					
					document.getElementById('no_show').appendChild(link)
					
					 
					document.getElementById('no_show').style.display ="flex";
				}
				//pull contacts with chosenCompanyID
				pullContacts(chosenCompanyID)
				//document.getElementById('no_show').style.display ="flex";
				//document.getElementById('selOrigin').focus()
			}
			
		},
		"focus": function(){
			//clear the input field and contacts when clicked in or tabbing to
			clearContacts()
			this.value = ""
			
			
		},
		"click": function(){
			document.getElementById('no_show').style.display ="none";
		}
		
	});
	
}
//function to check if the company has a no show on record
function checkForNoShows(id){
	return ipc.sendSync('check-for-no-shows',id)
}
// function to validate that company name only has one space inbetween words and no spaces at beginning and end
function validateCompanyName(s) {
    if (/(\w+\s?)*\s*$/.test(s)) {
        return s.replace(/\s+$/, '');
    }
    return 'NOT ALLOWED';
}

async function clearContacts(){
	
	$('#txtContacts')
    .find('option')
    .remove()
	.end()
	
	$('#txtContacts')
    .find('optgroup')
    .remove()
	.end()
	
}


function tellParent(choice){
	$('#txtContacts').click()
	var conOps = document.getElementById("txtContacts");
	
	
	let con_ops = conOps.options[conOps.selectedIndex].text
	con_ops = con_ops.substring(con_ops.indexOf("~") + 1);
	let con_name
	let index
	switch(con_ops){
		
		case '+ add contact': 
			
			let check = ipc.sendSync('get-customer-ID',chosenCompany)
			
			if(check === false){
			chosenCompanyID = addNewCompany(chosenCompany)
			}
			ipc.send('open-contacts','add job page',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()))
			break;
		case '+ add new contact': 
			console.log('add new contact')
			ipc.send('open-contacts','add job page',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()))
			
			break;
		case '+ add number': 
			con_name = conOps.options[conOps.selectedIndex].parentElement.label.split(' ')
			index = conOps.options[conOps.selectedIndex].index
			conMeth = "phone"
			con_ID = Number(conOps.options[conOps.selectedIndex].parentElement.getAttribute('contactid'))
			console.log(con_ID)
			ipc.send('open-contacts','add job page',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()), con_name[0], con_name[1], con_ID, conMeth,currentUser)
			
			break;
		case '+ add email':
			con_name = conOps.options[conOps.selectedIndex].parentElement.label.split(' ')
			index = conOps.options[conOps.selectedIndex].index
			conMeth = "email"
			con_ID = Number(conOps.options[conOps.selectedIndex].parentElement.getAttribute('contactid'))
			ipc.send('open-contacts','add job page',chosenCompany, isNewCustomer(chosenCompany.toUpperCase()), con_name[0], con_name[1], con_ID, conMeth,currentUser)
			
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
	const today = month.toString().padStart(2,'0') + "/" + day.toString().padStart(2,'0') + "/" + year;
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
	
	
	
	//build job object
	objNewJob.customer_ID =(chosenCompanyID != null && chosenCompanyID != '') ? chosenCompanyID : ipc.sendSync('add-new-customer', txtCN.value.trim().replace(/  +/g, ' '))
	objNewJob.customer_name = ipc.sendSync('db-get-customer-name',objNewJob.customer_ID)
	if(txtCon.options[txtCon.selectedIndex].getAttribute("method")=="phone"){
		objNewJob.number_ID = txtCon.options[txtCon.selectedIndex].id
	}
	if(txtCon.options[txtCon.selectedIndex].getAttribute("method")=="email"){
		objNewJob.email_ID = txtCon.options[txtCon.selectedIndex].id
	}
	(txtNotes.value.trim().length) ? objNewJob.notes = txtNotes.value : '';
	if(document.getElementById('cbComeback').checked){
		objNewJob.comeback_customer = 1
		objNewJob.date_scheduled = document.getElementById('datepickerOTL').value;
		objNewJob.time_of_day = ($('input[type=radio]:checked').size() > 0)?$('input[name=ampmOTL]:checked').val(): 'am';
		objNewJob.julian_date = jDate(document.getElementById('datepickerOTL').value)

	}
	objNewJob.designation = designation.options[designation.selectedIndex].value;
	
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
	objNewJob.user_ID = currentUser.user_ID
	objNewJob.job_type = jt.options[jt.selectedIndex].value;
	(document.getElementById('cbCash').checked) ? objNewJob.cash_customer = 1 : objNewJob.cash_customer = 0;
	(document.getElementById('cbApproval').checked) ? objNewJob.approval_needed = 1 : objNewJob.approval_needed = 0;
	(document.getElementById('cbParts').checked) ? objNewJob.parts_needed = 1 : objNewJob.parts_needed = 0;
	(document.getElementById('cbChecked').checked) ? objNewJob.checked = 1 : objNewJob.checked = 0;
	// (document.getElementById('cbComeback').checked) ? objNewJob.comeback_customer = 1 : objNewJob.comeback_customer = 0;
	(document.getElementById('cbWaiting').checked) ? objNewJob.waiting_customer = 1 : objNewJob.waiting_customer= 0;
	
	
	
	ipc.send('add-job',objNewJob,currentUser,launcher)


}

function addNewJobToCustomer(args){
	let IDtoAdd = Number(ipc.sendSync('getID'))
    
    ipc.send('add-job-to-company', args, IDtoAdd)		
}
function isNewCustomer(args){
	let isNew = true
	
	for(i=0;i<companyList.length;i++){
		
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
	let id = ipc.sendSync('add-new-customer', name.trim())
	
	return id
}
function contactIsBeingAdded(){
	let selContact = document.getElementById('txtContacts')
	
	let optSelected = selContact.options[selContact.selectedIndex].value	
	let b = (optSelected.includes('no contact')) ? false : true	
	return b
}

function cancelAdd(){
	window.close()
}
function reset(){
	document.getElementById('addForm').reset()
	// window.close()
	// ipc.send('open-add-job')
}


function openInput(e, active, inputID1, inputID2) {
	
	var v = active.value;	
	var next = document.getElementById(inputID1);
	
	if (active.id == "cbComeback") {
		
		if (active.checked == true) {
			document.getElementById(inputID1).className = "visibleInput";
		} else {

			document.getElementById('dateWrapper_OTL_SCHEDULED').value = "";
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
			
			switch(choice) {
				
				case "Scheduled":
					document.getElementById(inputID2).className = "visibleInput";
					document.getElementById('OTL_SCHEDULED').className = 'hiddenInput';
					document.getElementById('dateWrapper_OTL_SCHEDULED').className = 'hiddenInput';
					document.getElementById('cbComeback').checked = false
					$('#datepicker').on({
						'blur': ()=>{
							let dp = document.getElementById('datepicker');
							let formatted = formatDate(dp.value)
							
							if(formatted[0] === true){
								dp.value = formatted[1]
							}else{
								dp.value = `please choose date`
								dp.focus()
							}

						}
					})
					break;
				case "On the Lot":
					
					document.getElementById("dateWrapper").className = "hiddenInput";
					document.getElementById('OTL_SCHEDULED').className = 'visibleInput';
					
					break;
				
				default:
					
					
					document.getElementById('cbWrapper').className = "visibleFieldset";
					document.getElementById('formButtons').className = "visibleInput";
					
					break;
			}
			if(inputID2 == "dateWrapper"){
				
									
			}else{
			document.getElementById(inputID2).className = "visibleFieldset";
			}

		}
	}
}