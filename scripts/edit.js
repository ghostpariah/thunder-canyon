/*********
 * global variables
 */
const electron = require('electron')
const ipcEdit = electron.ipcRenderer
//const remote = require('remote')
//const ipcEdit = remote.require('ipc')
let editData;
const inpCustomer = document.getElementById('txtCustomerName')
const selContacts = document.getElementById('txtContacts')
const inpUnit = document.getElementById('txtUnit')
const selDesignation = document.getElementById('selOrigin')
const inpScheduledDate =document.getElementById('datepicker')
const radAM = document.getElementById('radAM')
const radPM = document.getElementById('radPM')
const selJobType = document.getElementById('selJobType')
const cbCash = document.getElementById('cbCash')
const inpCost = document.getElementById('txtCost')
const cbParts = document.getElementById('cbParts')
const cbApproval = document.getElementById('cbApproval')
const cbChecked = document.getElementById('cbChecked')
const cbComeback = document.getElementById('cbComeback')
const cbWaiting = document.getElementById('cbWaiting')
const cbNoShow = document.getElementById('cbNoShow')
const txtNotes = document.getElementById('txtNotes')
let launcher
//TODO: program currrent user being sent to here and then passed on with edit to main
let currentUser
window.onload = ()=>{
    
    
}
setTimeout(()=>{		
    $("#datepicker").datepicker({dateFormat : "mm/dd/yy"});
        
    
    

},1000);

/**
 * 
 * @param {*} input 
 * @returns 
 * 
 * function to treat data synchronously
 * data was delayed causing errors due to asynchronous flow. 
 * used the 'async' and 'await' to stop processing until all data was received
 */

async function treatData (input) {
	try{
	  var treated = input	  
	  return treated;
	}
	catch(err){
	  console.log(err)
	}
  
  }

/**
 * handle communication from main
 */
 
  
ipcEdit.on('edit-data', async (event,args, args2, args3)=>{
    console.log(typeof(args))
	editData = await treatData(args)
	loadData(editData)
    
	launcher = args2
	currentUser = args3
    // setTimeout(() => {
	// 	loadData(args)
    //     //loadData(editData)
    // }, 0);
})
ipcEdit.on('contacts-updated', (event,args,args2)=>{
	console.log(args)
	console.log('passed item ID '+args2)
	setTimeout(() => {
        fillContacts(args)
		for(var i=0; i<selContacts.options.length;i++) {
			if(selContacts.options[i].id == args2) {
				selContacts.selectedIndex = i;
				showLabel()
				break;
			}
		}
		
    }, 400);
	
})

/**
 * functions
 */
function cancelAdd(){
	ipcEdit.send('close-window')
}

/* function to load current job data into edit form inputs*/
function loadData(objJobToEdit){

    let d = objJobToEdit
    
	try{
    inpCustomer.value = ipcEdit.sendSync('db-get-customer-name',d.customer_ID);
	}catch(e){
		console.log(e)
	}
    
    (d.unit != null) ? inpUnit.value = d.unit : inpUnit.value = "";
    (d.designation == "On the Lot" || d.desgnation == 'on the lot')? selDesignation.selectedIndex = 1 : selDesignation.selectedIndex = 2;
    (d.date_scheduled != null) ? inpScheduledDate.value = d.date_scheduled : inpScheduledDate.value = "";
    (d.time_of_day == 'am')? radAM.checked = true : radAM.checked = false;
    (d.time_of_day == 'pm')? radPM.checked = true : radPM.checked = false;
    for(i=0;i<selJobType.options.length;i++){        
        (d.job_type == selJobType.options[i].value)? selJobType.selectedIndex = i : '';        
    }
    
    
    if(d.cash_customer != null){
        if(d.cash_customer === 1){
            cbCash.checked = true;
            if(d.estimated_cost != null){
                inpCost.value = d.estimated_cost;
            }else{
                inpCost.value = "";
            }
        }else{            
            cbCash.checked = false;        
        }
    }else{
        cbCash.checked = false;
    }
    
    (d.parts_needed != null) ? (d.parts_needed == 1)? cbParts.checked = true : cbParts.checked = false : cbParts.checked = false;
    (d.approval_needed != null) ? (d.approval_needed == 1)? cbApproval.checked = true : cbApproval.checked = false : cbApproval.checked = false;
    (d.checked != null) ? (d.checked == 1)? cbChecked.checked = true : cbChecked.checked = false : cbChecked.checked = false;
    (d.comeback_customer != null) ? (d.comeback_customer == 1)? cbComeback.checked = true : cbComeback.checked = false : cbComeback.checked = false;
    (d.waiting_customer != null) ? (d.waiting_customer== 1)? cbWaiting.checked = true : cbWaiting.checked = false : cbWaiting.checked = false;
    (d.no_show != null) ? (d.no_show == 1)? cbNoShow.checked = true : cbNoShow.checked = false : cbNoShow.checked = false;
    (d.notes != null) ? txtNotes.value = d.notes : txtNotes.value = "";
    
    fillContacts(ipcEdit.sendSync('get-contacts',d.customer_ID))
	
    if(d.number_ID != null && d.number_ID != ''){

		for(var i=0; i<selContacts.options.length;i++) {
			if(selContacts.options[i].id == d.number_ID) {
				selContacts.selectedIndex = i;
				showLabel()
				break;
			}
		}
	}
	if(d.email_ID != null && d.email_ID != ''){

		for(var i=0; i<selContacts.options.length;i++) {
			if(selContacts.options[i].id == d.email_ID) {
				selContacts.selectedIndex = i;
				showLabel()
				break;
			}
		}
	}
}

function fillContacts(cont){
	
	
	let optGroup = document.createElement("optgroup")
	let t=document.createTextNode('add contact')
	let newOption=document.createElement("OPTION");
	let ul = document.createElement('ul')
	const contactContent = document.getElementById('txtContacts')
	contactContent.innerHTML=""	
	
	
	if(typeof cont == 'object' && cont.length>0){
		 newOption=document.createElement("OPTION");
		 t=document.createTextNode('add contact')
		
        for(member in cont){
			let optGroup = document.createElement("optgroup")
			let optNewNumber = document.createElement("OPTION")
			let optNewEmail = document.createElement("OPTION")
			let optAddEmail =document.createElement("OPTION")
			
			let newNumber = document.createTextNode('+ add number')
			let txtAddEmail = document.createTextNode('+ add email')
			

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


			
              
		}
		newOption = document.createElement("OPTION");
		newOption.setAttribute("value","no contact");	
		
		let ac = document.createTextNode(`+ add new contact`)
		
		newOption.appendChild(ac)
		contactContent.insertBefore(newOption,contactContent.firstChild)
		
		contactContent.firstChild.style.fontWeight = 'bold'
		
		
	}else{
		
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
	
	$(contactContent).on('change',()=>{
		
		
		
	}).off('change')
	$(contactContent).trigger('change')
}

/*function called when contact is changed on the edit form*/
function changeContact(choice){
	var contactsInput = document.getElementById("txtContacts");
		
	
	let con_ops = contactsInput.options[contactsInput.selectedIndex].text
	con_ops = con_ops.substring(con_ops.indexOf("~") + 1);
	let contactName
	let index
	let customer = ipcEdit.sendSync('db-get-customer-name', editData.customer_ID)
	switch(con_ops){
		
		case '+ add contact': 
			
			
			ipcEdit.send('open-contacts','edit page',customer, false)
			break;
		case '+ add new contact': 
			
			ipcEdit.send('open-contacts','edit page',customer, false)
			
			break;
		case '+ add number': 
			contactName = contactsInput.options[contactsInput.selectedIndex].parentElement.label.split(' ')
			index = contactsInput.options[contactsInput.selectedIndex].index
			conMeth = "phone"
			con_ID = Number(contactsInput.options[contactsInput.selectedIndex].parentElement.getAttribute('contactID'))
			ipcEdit.send('open-contacts','edit page',customer, false, contactName[0], contactName[1], con_ID, conMeth)
			console.log('test '+con_ID)
			break;
		case '+ add email':
			contactName = contactsInput.options[contactsInput.selectedIndex].parentElement.label.split(' ')
			index = contactsInput.options[contactsInput.selectedIndex].index
			conMeth = "email"
			con_ID = Number(contactsInput.options[contactsInput.selectedIndex].parentElement.getAttribute('contactID'))
			ipcEdit.send('open-contacts','edit page',customer, false, contactName[0], contactName[1], con_ID, conMeth)
			
			break;
		default:
			showLabel()
			
			break;
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

function updateJob (){
	//alias input fields for easier programming
	let txtCN = document.getElementById('txtCustomerName')
	let txtCon = document.getElementById('txtContacts')
	let txtCost =document.getElementById('txtCost')
	let txtNotes = document.getElementById('txtNotes')
	let designation = document.getElementById('selOrigin')
	let jt = document.getElementById('selJobType')

	let objNewJob = new Object()
	let objChangeLog = new Object()
	
	
	//build job object
	objNewJob.job_ID = editData.job_ID
	
    
	if(txtCon.options[txtCon.selectedIndex].getAttribute("method")=="phone"){
        if(txtCon.options[txtCon.selectedIndex].id != editData.number_ID){
			objNewJob.number_ID = txtCon.options[txtCon.selectedIndex].id			
			objNewJob.email_ID = null
			objChangeLog.number_ID = txtCon.options[txtCon.selectedIndex].id
		}       
		
	}
	if(txtCon.options[txtCon.selectedIndex].getAttribute("method")=="email"){
        if(txtCon.options[txtCon.selectedIndex].id != editData.email_ID){
			objNewJob.email_ID = txtCon.options[txtCon.selectedIndex].id
			objNewJob.number_ID = null
			objChangeLog.email_ID = txtCon.options[txtCon.selectedIndex].id
		}      
		
	}
    if(editData.notes == null && txtNotes.value != null && txtNotes.value != ''){
        objNewJob.notes = txtNotes.value
		objChangeLog.notes = txtNotes.value
    }
    if(editData.notes != null){
        if(editData.notes.localeCompare(txtNotes.value)!=0){
			objNewJob.notes = txtNotes.value
			objChangeLog.notes = txtNotes.value
		}
       
    }
    
    
	if(Boolean(document.getElementById('cbCash').checked)!=Boolean(editData.cash_customer)){
    	(document.getElementById('cbCash').checked == true)
			? objNewJob.cash_customer = 1
			: objNewJob.cash_customer = 0
		objChangeLog.cash_customer = document.getElementById('cbCash').checked
	}
    if(editData.estimated_cost!=null){
        if(editData.estimated_cost.localeCompare(txtCost.value)!=0){
          objNewJob.estimated_cost = txtCost.value
		  objChangeLog.estimated_cost = txtCost.value
		}
    }
    
    if(editData.designation.localeCompare(designation.options[designation.selectedIndex].value)!=0){
     	objNewJob.designation = designation.options[designation.selectedIndex].value	
		objChangeLog.designation = designation.options[designation.selectedIndex].value
	}
    let s
	if(designation.options[designation.selectedIndex].value == "On the Lot"){		
		s = "wfw" 		
	}else{
        s = "sch"
    }

    if(editData.status.localeCompare(s)!=0 && launcher == 'move'){
		objNewJob.status = s
	}
    

    if(editData.date_scheduled != null){
        if(editData.date_scheduled.localeCompare(document.getElementById('datepicker').value)!=0){
          objNewJob.date_scheduled = document.getElementById('datepicker').value
		  
        
		}
    }
    if(editData.julian_date != null){
        (editData.julian_date===jDate(document.getElementById('datepicker').value))
        ? ''
        :objNewJob.julian_date = jDate(document.getElementById('datepicker').value);
    }
	
    if(editData.time_of_day != null && editData.time_of_day != ''){
        (editData.time_of_day.localeCompare($('input[name=ampm2]:checked').val())!=0)
        ? objNewJob.time_of_day = $('input[name=ampm2]:checked').val()
        :'no change to time_of_day';
    }
		
		
	
    if(txtUnit.value.trim().length){
		if(editData.unit!= null && editData.unit!= undefined){
			(editData.unit.localeCompare(txtUnit.value)!=0)
				? objNewJob.unit = txtUnit.value
				: '';
		}else{
			objNewJob.unit = txtUnit.value
		}
        
    }
	
	(editData.job_type.localeCompare(jt.options[jt.selectedIndex].value)!=0)
    ? objNewJob.job_type = jt.options[jt.selectedIndex].value
    : '';
	
    (Boolean(document.getElementById('cbParts').checked)!=Boolean(editData.parts_needed))
    ? (document.getElementById('cbParts').checked == true)
		? objNewJob.parts_needed = 1
		: objNewJob.parts_needed = 0
    : console.log('no change to parts');

    (Boolean(document.getElementById('cbApproval').checked)!=Boolean(editData.approval_needed))
    ? (document.getElementById('cbApproval').checked == true) 
		? objNewJob.approval_needed = 1
		: objNewJob.approval_needed = 0
    : console.log('no change to approval');

    (Boolean(document.getElementById('cbChecked').checked)!=Boolean(editData.checked))
    ? (document.getElementById('cbChecked').checked)
		? objNewJob.checked = 1
		: objNewJob.checked = 0
    : console.log('no change to checked');

    (Boolean(document.getElementById('cbComeback').checked)!=Boolean(editData.comeback_customer))
    ? (document.getElementById('cbComeback').checked)
		? objNewJob.comeback_customer = 1
		: objNewJob.comeback_customer = 0
    : console.log('no change to comeback');

    (Boolean(document.getElementById('cbWaiting').checked)!=Boolean(editData.waiting_customer))
    ? (document.getElementById('cbWaiting').checked)
		? objNewJob.waiting_customer = 1
		: objNewJob.waiting_customer = 0
    : console.log('no change to waiting');

    (Boolean(document.getElementById('cbNoShow').checked)!=Boolean(editData.no_show))
    ? (document.getElementById('cbNoShow').checked)
		? objNewJob.no_show = 1
		: objNewJob.no_show = 0
    : console.log('no change to no-show');
	
	console.log('object length is '+Object.keys(objNewJob))
    if(Object.keys(objNewJob).length>1){
		
	    ipcEdit.send('update-job',objNewJob, launcher, currentUser, txtCN.value)
		ipcEdit.send('close-window')
    }else{
		ipcEdit.send('close-window')
	}

}
function jDate(ds){
	console.log(ds)

	var ds = ds;    

	var dayScheduled = new Date(ds);
	var julian= Math.ceil((dayScheduled - new Date(dayScheduled.getFullYear(),0,0)) / 86400000);

	return julian;
}