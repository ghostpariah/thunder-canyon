
      //node.js variables
      //const conElectron = require("electron");
      //const ipc = conElectron.ipcRenderer;
      

      //DOM element variables
      const customerNameWrapper = document.getElementById("customerNameWrapper");
      const contactForm = document.getElementById("newContactFormContainer");
      const companyHeader = document.getElementById("companyHeader");
      const contactsMain = document.getElementById("contactsMain");
      const header = document.getElementById("contactsHeader");
      const inpCompany = document.getElementById("txtCompanyName");
      const inpFirstname = document.getElementById("txtFirstName");
      const inpLastname = document.getElementById("txtLastName");
      const inpPhoneNumber = document.getElementById("txtPhoneNumber1");
      const inpEmail = document.getElementById("txtEmail");
      const inpPrimary = document.getElementById("cbPrimary");
      const dataList = document.getElementById("lstCustomers");
      const ecnWrapper = document.getElementById("editCustNameWrapper")
      const CNEI = document.getElementById("inpCompanyNameEdit")
      const contactContent = document.getElementById("currentContacts");
     
     
      //global variables
      let companyIsNew = false;
      let contactExists = false;
      let conID;
      let val;
      var test;
      let objListItemTray = new Object();
      let objPhoneNumber;
      let nameForHeader;
      let pageLauncher;
      let currentPrimary
      let companyID
      let allowChar = false;
      let contactMethodIndex;
      let addCN;
      let addFN;
      let addLN;
      let addCID;
      let addCustomer_ID
      let addPN;
      let addEm;
      let addCM;
      let globalObjectContact
      let currentUser
      let state ="view";
      let addedItemID
      let contactInfoValid = false
      let emailValid = false
      let phoneValid = false
      let props


      $(inpFirstname).on({
        keydown: function(event){
          let visibility = document.getElementById('firstname_message_container').style.display
          if(visibility == 'block'){
            document.getElementById('firstname_message_container').style.display = 'none' ;
            document.getElementById('firstname_message').innerHTML = ''
          }
          
        },
        blur:function(){
          console.log(' firstname blur -- contactInfoValid : '+contactInfoValid)
        }
      })

        
          $(inpEmail).on({ 
            keydown: function(event){
              //console.log(event.key)

            },
            keypress: function(event){

            },
            input: function(event){

            },
            keyup: function(event){
              if(emailValid){
                document.getElementById('email_message').innerHTML = "";
                document.getElementById('email_message_container').style.display = 'none';
              }
              emailValid = false
              const exp = /[^@][@]/
              const exp2 = /[^/.][/.]/
              
              let hasAtSymbol = exp.test(this.value)
              

              if(hasAtSymbol){  
                //bring string into two after @ found
                let rest = this.value.substring(this.value.lastIndexOf("@") + 1)  
                
                //search the string after @ for a period
                if(exp2.test(rest)){
                  let afterPeriod = rest.substring(rest.lastIndexOf(".") + 1)
                  if(afterPeriod.length>=2){
                    emailValid = true;
                    document.getElementById('email_message').innerHTML = "";
                    document.getElementById('email_message_container').style.display = 'none';
                    document.getElementById('message').innerHTML = "";
                    document.getElementById('message_container').style.display = 'none';
                  }
                
                }
                
              }else{
                
                emailValid = (this.value=="")? true:false;
                if(emailValid){
                  document.getElementById('email_message').innerHTML = "";
                  document.getElementById('email_message_container').style.display = 'none';
                  
                }
              }

              
            },           
            blur: function(event){
              console.log(' email blur -- contactInfoValid : '+contactInfoValid)
              if(emailValid === false){
                console.log('condition triggered');
                
                document.getElementById("email_message").innerText = "Invalid email";
                document.getElementById('email_message_container').style.display = 'block';             
                inpEmail.focus();
                contactInfoValid = false
            }else{
              //TODO:insert search for no show here
              contactInfoValid = true
            }
          }
          })
         
        
        
        
      /*******
       ********
       *function to format phone number on add contact page
       ********
       *******/
      function formatPN(inp) {
        /*declare variables scope::function formatPN */
        let cursorPosition;
        let keyPressed;
        let isBackspace;
        let isShift;
        let isEmpty;
        let isAnEdit;
        let notNumeric;
        let areaCode;
        let prefix;
        let postfix;
        let ext;
        let isAreaCode;
        let isPrefix;
        let isPostfix;
        let isExt;
        let firstDash;
        let secondDash;
        let firstSpace;
        let secondSpace;
        let extLabel;

        let valid = false;


        
        /*define event listeners for input field that are applying formatPN*/
        $(inp).on({
          /* 'keydown' is the first event fired when typing a key*/
          keydown: function (event) {
            /*load variables*/
            val = this.value;
            cursorPosition = event.target.selectionStart;
            isEmpty = val == "" ? true : false;
            isAnEdit = cursorPosition < val.length ? true : false;
            isAreaCode = 0 <= cursorPosition && cursorPosition < 5;            
            isBackspace = event.keyCode == 8 ? true : false;
            isShift = event.keyCode == 16 ? true : false;
            keyPressed = event.key;
          },

          /* keypress' is the second event fired when typing a key. Doesn't fire on keys that don't leave input (i.e. shift, ctrl*/
          keypress: function (event) {
            const numberKey = /[0-9\/]+/;
            const regex = RegExp(
              "^[\\(]{0,1}([0-9]){3}[\\)]{0,1}[ ]?([^0-1]){1}([0-9]){2}[ ]?[-]?[ ]?([0-9]){4}[ ]*((x){0,1}([0-9]){1,5}){0,1}$"
            );
           
            if (!numberKey.test(keyPressed)) {
              event.preventDefault();
            }
          },

          /* 'input' is not a keyboard event but it is fired after keypress and before keyup*/
          input: function (event) {
            
            event.preventDefault();

          
          },
          /*
           * keyup is the third keyboard event and last event fired when typing a key
           */
          keyup: function (event) {
            if(valid){
                document.getElementById('phone_message').innerHTML = "";
                document.getElementById('phone_message_container').style.display = 'none';
              }
            valid = (inpPhoneNumber.value !="")? false: true;
            //valid=false;
            val = this.value;
            num = val.replace(/\D/g, "");
            if (num.length >= 10) {
              valid=true;
              document.getElementById('phone_message').innerHTML = ""
              document.getElementById('phone_message_container').style.display = 'none';
              document.getElementById('message').innerHTML = "";
              document.getElementById('message_container').style.display = 'none';
              areaCode = `(${num.substr(0, 3)}) `;

              prefix = `${num.substr(3, 3)}-`;

              postfix = num.substr(6, 4);

              ext = ` ext:${num.substr(10)}`;
              if (num.length > 10) {
                val = `${areaCode}${prefix}${postfix}${ext}`;
              } else {
                val = `${areaCode}${prefix}${postfix}`;
              }
              
            }else{
              if(this.value == ""){
                valid=true
                if(valid){
                document.getElementById('phone_message').innerHTML = "";
                document.getElementById('phone_message_container').style.display = 'none';
                
              }
              }
              
            }
            
            this.value = val;
          
          },
          blur: function (event) {
            console.log(' phone blur -- contactInfoValid : '+contactInfoValid)
            if(!valid){
              inpPhoneNumber.focus()
              document.getElementById('phone_message').innerHTML = "Phone number must be at least 10 digits"
              document.getElementById('phone_message_container').style.display = 'block';
              contactInfoValid = false
            }else{
              //TODO: insert search for no shows here
              contactInfoValid = true
            }
          },
        });
      }


      formatPN(inpPhoneNumber);
      ipc.on("open-contact-page", (event, args) => {
      customerNameWrapper.style.display = "block";
      });
      ipc.on('reload', (event,args, args2)=>{
        reloadPage(args,args2)
      })

     
      function togglePageView(action) {
        try{
          let buttonList = document.getElementsByClassName('mainContactButton')
          let allIndicators = document.getElementsByClassName('indicator')
          let allCheckboxes = document.getElementsByClassName('cbPrimary')
          let all = document.getElementsByClassName('divPrimaryCheckbox')
          
          
          //reset buttons to default style        
          for(i=0;i<buttonList.length;i++){
            buttonList[i].setAttribute('class','mainContactButton buttonUnselected')
          }
          
          switch(action){
            case 'add':
                contactContent.style.display = "none";
                contactForm.style.display = "block";              
                document.getElementById('btnMainAdd').setAttribute('class','mainContactButton buttonSelected')
                
                
              break;
            case 'edit':
              
                document.getElementById('btnMainEdit').click()
                document.getElementById('btnMainEdit').setAttribute('class','mainContactButton buttonSelected')
                contactContent.style.display = "block";
                contactForm.style.display = "none";              
                
                for(i=0;i<allIndicators.length;i++){
                    allIndicators[i].setAttribute('class','indicator hidden')                               
                }
                for(i=0;i<all.length;i++){
                  if(all[i].childNodes[2]){
                    all[i].childNodes[2].remove()
                  }
                  all[i].style.display = 'block'
                }

              break;
            case 'cancel':
                  clearMessageCenters()
                  if(state == "view"){
                    factoryReset();
                  }else{
                    state = "view"
                    contactContent.style.display = "block";
                    contactForm.style.display = "none";
                  }
                
                for(i=0;i<allIndicators.length;i++){
                    allIndicators[i].setAttribute('class','indicator visible')                               
                }
                for(i=0;i<all.length;i++){
                  all[i].style.display ='none'
                }
                
              break;
            default:
              console.log('default')
              break;

          }
        
        }catch(e){

        }
        
      }

      ipc.on('item-added', (event,args)=>{
              objC = ipc.sendSync("get-contacts", globalObjectContact.customer_ID);
              

              if(pageLauncher == 'edit'){
                ipc.send("pass-contact", objC,args);
               
              }
        
      })

      /*************************
       * communication sent from main when the contacts page has been requested to open
       * @param args1 --page that originated opening. 
       *        "main page" -- (clicking 'contacts; button), 
       *        "add job page" -- (when adding a new job and either adding a new contact or editing one)
       *        "edit page" -- (when editing an existing job and either adding a new contact or editing one)
       * 
       * @param args2 -- customer name
       * @param args3 -- boolian value stating  whether its a brand new customer or existing customer
       * @param args4 -- contact first name
       * @param args5 -- contact last name
       * @param args6 -- existing contact ID
       * @param args7 -- index of contact method (phone or email) ||NOT currently in use
       * @param args8 -- user object for logging
       * @param args9 -- customer ID
       * 
       * 
       * 
       ************************/ 

      ipc.on(
        "name-chosen",
        (event, args1, args2, args3, args4, args5, args6, args7, args8, args9) => {
          
         
        try{  
          
          let argCount = 0;
          props = args1

          addCN = props.customer_name
          addCID = props.customer_ID
          console.log(props)
          //launching page
          switch (props.launcher) {
            case "main page":
              customerNameWrapper.style.display = "block";
              pageLauncher = "main";
              loadContactsPage(true)
              return
              break;
            case 'add':
            case "add job page":
              //console.log(`${args1} ${args2} ${args3} ${args4} ${args5} ${args6} ${args7} ${args8} ${args9}`)
              if(props.action == 'add'){
                contactsMain.style.display = "block";
                contactForm.style.display = "block";
                inpFirstname.focus();
                //setTimeout(() => {
                  togglePageView("add");
               // }, 50);
              }
              if(props.action == 'edit'){
                document.getElementById('customerNameWrapper').style.display = 'none'
                addCN = props.customer_name
                addCID = props.customer_ID
                setTimeout(() => {
                  document.getElementById('btnMainEdit').click()
                }, 300);
                
              }
              pageLauncher = "add job";
              loadContactsPage(false)
              
              pullContacts(props.customer_ID)
              
             
              break;
            case "edit page":
              
              pageLauncher = "edit";
              if(props.action == 'edit'){
                
                  
                  loadHeader(addCN);
                  pullContacts(ipc.sendSync('get-customer-ID',addCN))
                  //togglePageView("edit");
                  setTimeout(() => {
                  document.getElementById('btnMainEdit').click()
                  
                }, 300);
              }
              if(props.action == 'add'){

              
              //setTimeout(() => {
                
                loadHeader(addCN);
                pullContacts(ipc.sendSync('get-customer-ID',addCN))
                togglePageView("add");
              //}, 300);
              }
              break;
            default:
              break;
              
          }
          // company name
          if (args1?.customer_name) {   
            addCN = args1.customer_name        
            //addCN = args2;
            argCount += 1;
            contactsMain.style.display = "block";
            contactForm.style.display = "block";
            inpFirstname.focus();
          }

          // boolean telling if new
          if (args1?.isNew) {
            companyIsNew = args1.isNew
            //companyIsNew = args3;
            argCount += 1;
            
            contactsMain.style.display = "block";
            contactForm.style.display = "block";
            inpFirstname.focus();
            
          }

          // contact first name
          if (args1?.contacts?.[0].first_name) {
            //inpFirstname.value = args1.contacts[0].first_name;
            addFN = args1.contacts[0].first_name;
            contactExists = true;
            argCount += 1;
          }

          // contact last name
          if (args1?.contacts?.[0].last_name) {
            //inpLastname.value = args1.contacts[0].last_name;
            addLN = args1.contacts[0].last_name;
            argCount += 1;
          }

          // contactID
          if (args1?.customer_ID) {            
            addCID = args1.customer_ID
            conID = args1.customer_ID;
            //addCID = args6;            
            argCount += 1;
          }

          //index of selected item
          if (args7) {
            addCM = args7;
            contactMethodIndex = args7;
            argCount += 1;
            if(args7 == 'phone'){
              inpPhoneNumber.focus()
            }else{
              inpEmail.focus()
            }
          }

          //logged in user object
          if(args1?.user){            
            currentUser = args1.user
          }
          if(args9){
            addCustomer_ID = args9
          }
          // // company name
          // if (args2) {   
          //   addCN = args1.customer_name        
          //   //addCN = args2;
          //   argCount += 1;
          //   contactsMain.style.display = "block";
          //   contactForm.style.display = "block";
          //   inpFirstname.focus();
          // }

          // // boolean telling if new
          // if (args3) {
          //   companyIsNew = args1.isNew
          //   //companyIsNew = args3;
          //   argCount += 1;
            
          //   contactsMain.style.display = "block";
          //   contactForm.style.display = "block";
          //   inpFirstname.focus();
            
          // }

          // // contact first name
          // if (args4) {
          //   inpFirstname.value = args4;
          //   addFN = args4;
          //   contactExists = true;
          //   argCount += 1;
          // }

          // // contact last name
          // if (args5) {
          //   inpLastname.value = args5;
          //   addLN = args5;
          //   argCount += 1;
          // }

          // // contactID
          // if (args6) {            
          //   addCID = args1.customer_ID
          //   conID = args6;
          //   //addCID = args6;            
          //   argCount += 1;
          // }

          // //index of selected item
          // if (args7) {
          //   addCM = args7;
          //   contactMethodIndex = args7;
          //   argCount += 1;
          //   if(args7 == 'phone'){
          //     inpPhoneNumber.focus()
          //   }else{
          //     inpEmail.focus()
          //   }
          // }

          // //logged in user object
          // if(args8){            
          //   currentUser = args8
          // }
          // if(args9){
          //   addCustomer_ID = args9
          // }
          //alert(argCount)
          if (argCount == 0) {
            customerNameWrapper.style.display = "block";
          }
          loadContactsPage(false);
        
        }catch(e){
          ipc.send('log-error',e)
        }
    });
      

    // setTimeout(() => {
    //   loadContactsPage();
    // }, 200);


    function factoryReset(){
      companyHeader.style.display = "none";
      customerNameWrapper.style.display = "block";
      contactContent.style.display = "none";
      document.getElementById("txtCustomerName").value="";
      clearMessageCenters()
    }

    function showCompanyNameEditInput(name){
      companyHeader.style.display = "none";
      customerNameWrapper.style.display = "none";
      ecnWrapper.style.display="flex";
      console.log(CNEI.value)
      let val =(CNEI.value =="")?name:CNEI.value;
      CNEI.value = val.toUpperCase();
      CNEI.focus()
    }
    function cancelCustomerNameEdit(){
      companyHeader.style.display = "block";
      ecnWrapper.style.display="none";
    }

    function editCustomerName(){
      let c =CNEI.value.toUpperCase();
      console.log(c)
      ipc.send('edit-customer-name',c,Number(companyID))
    }

    ipc.on('customer-name-updated', (event,args1,args2)=>{
      console.log(args2)
      ipc.send('update-main-page')
      document.getElementById(String(args2).padStart(5,'0')).innerHTML = args1
      pullContacts(args2)
      companyHeader.style.display = "block";
      ecnWrapper.style.display="none";
      
      
    })


      function loadHeader(arg, id) {
        //gaurdian clause to exit function if arg is undefined
        if(props.launcher == 'main page'){
          props.customer_ID = id
        }
        console.log(`companyName is ${arg} and companyID is ${props.customer_ID}`)
        console.log(props)
        
        if(arg == undefined || arg == null ) return console.log(`arg was undefined line 414 in loadHeader()`)
        //companyID = addCN;
        //companyID = ipc.sendSync('get-customer-ID', arg);
        console.log(`companyName is ${arg} and companyID is ${companyID} after guardian clause`)
        
        //create header
        companyHeader.innerHTML = "";
        let h2Container = document.createElement("section")
        let compH2 = document.createElement("div");

        let editCompanyNameLink = document.createElement('span')
        let linkText = document.createTextNode('edit')
        editCompanyNameLink.appendChild(linkText)
        editCompanyNameLink.setAttribute('class','actionLink')
        editCompanyNameLink.addEventListener("click", (e) => {
          showCompanyNameEditInput(arg.toUpperCase())
        });

        let compHeadText = document.createTextNode(
          arg.toUpperCase()
        );
        compH2.appendChild(compHeadText);
        // compH2.addEventListener("click", (e) => {
        //   showCompanyNameEditInput(arg.toUpperCase())
        // });
        compH2.setAttribute("class", "compHeader");
        if(id){
          compH2.setAttribute('id',id)
        }else{
          compH2.setAttribute('id',props.customer_ID)
        }
        h2Container.appendChild(compH2)
        h2Container.appendChild(editCompanyNameLink)
        h2Container.setAttribute('class','headerContainer')
        companyHeader.appendChild(h2Container);

        //create button container
        let bc = document.createElement('div')
        bc.setAttribute('id','buttonContainer')
        
        //*****create action buttons******
        //create cancel button
        let btnCancel = document.createElement("div");
        let btnCancelText = document.createTextNode("BACK");
        btnCancel.appendChild(btnCancelText);

        btnCancel.addEventListener("click", () => {
          
            togglePageView("cancel");
          
          
          let selectedCompany = document.getElementById("txtCustomerName");            
          toggleActionLinkVisibility('on')       
          
        });
        btnCancel.setAttribute('class','mainContactButton buttonUnselected')
        btnCancel.setAttribute('id','btnMainCancel')
        bc.appendChild(btnCancel);
        bc.style.display = "block";
        companyHeader.appendChild(bc);
      
        

        //create add button          
        let btnAddCompanyContact = document.createElement("div");
        let btnAddText = document.createTextNode("ADD CONTACT");
        btnAddCompanyContact.appendChild(btnAddText);

        btnAddCompanyContact.addEventListener("click", () => {
          //clear fields
          inpPrimary.checked = false;
          inpFirstname.value="";
          inpLastname.value="";
          inpPhoneNumber.value="";
          inpEmail.value=""

          state = "add"
          let selectedCompany = document.getElementById("txtCustomerName"); 
          togglePageView("add");
          inpFirstname.focus();

        });
        companyHeader.style.display = "block";
        btnAddCompanyContact.setAttribute("class", "mainContactButton buttonUnselected");
        btnAddCompanyContact.setAttribute('id','btnMainAdd')
        bc.appendChild(btnAddCompanyContact);

        
        //create edit button
        let btnEditCompanyContact = document.createElement("div");
        let btnEditText = document.createTextNode("EDIT CONTACTS");
        btnEditCompanyContact.appendChild(btnEditText);
        
        btnEditCompanyContact.addEventListener("click", () => {
          state = "edit"
          toggleActionLinkVisibility("off");
          togglePageView("edit");            
          
        });
        btnEditCompanyContact.setAttribute("class", "mainContactButton buttonUnselected");
        btnEditCompanyContact.setAttribute('id','btnMainEdit')
        bc.appendChild(btnEditCompanyContact);
      }

      //control function to set up page
      function loadContactsPage(firstInstance) {
        console.log(pageLauncher)
        if(!firstInstance){

          //customerNameWrapper.style.display ="none"
          console.log('the customer id in loadContactsPage is '+props.customer_ID)
          loadHeader(props.customer_name);
          pullContacts(props.customer_ID)//addCN
          //pullContacts(ipc.sendSync('get-customer-ID',addCN))//addCN
        }
        var val;
        
        $("#txtCustomerName").on({
          click: function () {
            
          },
          mouseover: function () {},
          mousedown: function () {},
          mouseup: function () {},
          keydown: function (event) {
            val = this.value;

            if (event.keyCode == 13 || event.keyCode == 9) {
             
              $("#txtContacts").focus();
            }
          },
          keyup: function () {
            val = this.value;

            // if (val == "") {
              
            // }
          },
          input: function () {
            

            val = this.value;
            if(val =="")return
            if (
              $("#lstCustomer option").filter(function () {
                return this.value.toUpperCase() === val.toUpperCase();
              }).length
            ) {
              var opt = $('option[value="' + $(this).val().toUpperCase() + '"]');
              console.log($(this).val())

              chosenCompany = val;
              console.log(chosenCompany)
              
              customerNameWrapper.style.display ="none"
              let cusID = opt.length
                ? opt
                    .attr("customer_id")
                    .substring(opt.attr("customer_id").indexOf("-") + 1)
                : "NO OPTION";
                loadHeader(chosenCompany,cusID);
              contactContent.style.display="block";
              contactContent.innerHTML = "";
              companyID = cusID;
              pullContacts(cusID);
              
            } else {
              
              
            }
          },
          

          blur: function () {
            
            val = this.value;
            
          },
          dblclick: function () {
            
            
            this.value = "";
          },
        });
      }
      
      //function to fill datalist for customer select
      function fillCustomerDataList() {
        
        var element = document.getElementById("lstCustomer");
        companyList = [];
        element.innerHTML = "";
        
        customerList = ipc.sendSync("get-customer-names");
        for (member in customerList) {
          companyList.push(customerList[member].customer_name);
        }
        
        
        var uNames = customerList.sort((a, b) =>
          a.customer_name > b.customer_name ? 1 : -1
        );
        var uniqueNames = companyList
          .sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          })
          .filter(onlyUnique);

        for (i = 0; i < customerList.length; i++) {
         
          var newOption = document.createElement("OPTION");         
          newOption.setAttribute(
            "value",
            uNames[i].customer_name.toUpperCase()
          );
          newOption.setAttribute(
            "customer_ID",
            "customer_ID-" + String(uNames[i].customer_ID).padStart(5, "0")
          );
          element.appendChild(newOption);
        }
        
      }
      
      function validateForm(){
        console.log(`${contactInfoValid} ${inpFirstname.value} ${inpPhoneNumber.value} ${inpEmail.value}`)
        contactInfoValid = (inpPhoneNumber.value != "")? true : (inpEmail.value !="")?true : false;
        
        if(contactInfoValid && inpFirstname.value != "") {
          newAdd()
          return
        }
        if(inpFirstname.value ==""){
          document.getElementById('firstname_message_container').style.display = 'block'
          document.getElementById('firstname_message').innerHTML = 'First name is required'
          
          
        }
        if(!contactInfoValid || (inpPhoneNumber.value=="" && inpEmail.value =="")) {
          document.getElementById('message').innerHTML = "A valid phone number or email is required"
          document.getElementById('message_container').style.display = 'block';
          
       }
      
      }
      //function for adding contact
      function newAdd() {
        
        
        let cn = companyHeader.firstChild.innerText        
        let data = new Object();
        let itemID

        
        
        data.customer_name = props.customer_name;
        
        if (inpFirstname.value != "") {
          data.first_name = inpFirstname.value;
        }
        if (inpLastname.value != "" && inpLastname != undefined) {
          data.last_name = inpLastname.value;
        }
        if (inpPhoneNumber.value != "") {
          data.number = inpPhoneNumber.value;
        }
        if (inpEmail.value != "") {
          data.email = inpEmail.value;
        }
        if(props.contacts){
          if(cbPrimary.checked){
            data.primary_contact = 1
          }
        }else{
          data.primary_contact = 1
        }
        
        data.active = 1
        
        
        
        data.customer_ID = props.customer_ID//ipc.sendSync("get-customer-ID", cn);
        //console.log(`customer name is ${cn}`)
        //console.log(`customer ID is ${data.customer_ID}`)
        itemID = ipc.sendSync("db-contact-add", data);
      //}
        switch (pageLauncher) {
          case "main":           
            
            setTimeout(() => {
              pullContacts(data.customer_ID);
            }, 30);
            
            toggleActionLinkVisibility("off");
            togglePageView("cancel");
            break;
          case "add job":
          
            setTimeout(() => {              
              ipc.send("refresh-add-page", "go", data.customer_ID,itemID); 
              window.close()             
            }, 200);
            
            break;
          case "edit":
            let objC;

            setTimeout(() => {              
              objC = ipc.sendSync("get-contacts", data.customer_ID);
              ipc.send("pass-contact", objC, itemID);
              window.close()
            }, 400);

            break;
          default:
            break;
        }
      }
      function clearMessageCenters(){
        document.getElementById('email_message').innerHTML = "";
        document.getElementById('email_message_container').style.display = 'none';
        document.getElementById('message').innerHTML = "";
        document.getElementById('message_container').style.display = 'none';
        document.getElementById('phone_message').innerHTML = "";
        document.getElementById('phone_message_container').style.display = 'none';
        document.getElementById('firstname_message').innerHTML = "";
        document.getElementById('firstname_message_container').style.display = 'none';
        contactInfoValid = false
      }
      function cancelAdd() {
        if(pageLauncher!='main'){
          ipc.send('close-window');
        }
        contactContent.style.display = "block";
        contactForm.style.display = "none";
        clearMessageCenters();
        toggleActionLinkVisibility("on");
        togglePageView("cancel");
      }
     
      function pullContacts(comp) {
        if (comp) {
          ipc.send("get-contacts", comp);         
           console.log('pullContacts triggered') ;
          //  console.time('pull')     
        }
      }

      //response from main on 'get-contacts' call
      ipc.on('set-contacts', (event, args) => { 
        console.log('set-contacts triggered')       
        globalObjectContact = args[0]
        console.log(args)
        fillContacts(args);
        
      });
      ipc.on('contact-edited',(event,args)=>{
        console.log('contact-edited sent from main')
        console.timeEnd('edits')
        pullContacts(args);
      })
      //function to create inputs for editing contact name
      function createDoubleInputs(contactID, fNameText, lNameText, custID, trigger) {
        let wrapper = document.createElement("div");
        let inpFN = document.createElement("input");
        let inpLN = document.createElement("input");
        let customer_ID = custID;
        

        let btnSave = document.createElement("div");
        let txtSave = document.createTextNode("save");
        let btnCancel = document.createElement("div");
        let txtCancel = document.createTextNode("cancel");

        wrapper.setAttribute("class", "wrapper");
        wrapper.setAttribute("id", "inputNameWrapper");
        inpFN.setAttribute("class", "nameInput");
        inpFN.setAttribute("id", `fnInp${contactID}`);
        inpLN.setAttribute("class", "nameInput");
        inpLN.setAttribute("id", `lnInp${contactID}`);
        inpFN.value = fNameText;
        inpLN.value = lNameText;

        btnSave.setAttribute("class", "contactButton");
        btnSave.appendChild(txtSave);
        btnCancel.setAttribute("class", "contactButton");
        btnCancel.appendChild(txtCancel);

        btnSave.addEventListener("click", (event) => {
          let fnID = event.target.parentNode.firstChild.id;
          let lnID = event.target.parentNode.firstChild.nextSibling.id;
          let fnValue = document.getElementById(fnID).value;
          let lnValue = document.getElementById(lnID).value;
          let cid = parseInt(Number(event.target.parentNode.firstChild.id.substr(5)));
          console.log(`first name input ID = ${fnID}
        last name input ID = ${lnID}
        first name value = ${fnValue}
        last name value = ${lnValue}
        contact id = ${cid}`);
          let objChange = new Object();
          let changes = false
          if(fnValue != fNameText){
            objChange.first_name = fnValue;
            changes = true
          }
          if(lnValue != lNameText){
            objChange.last_name = lnValue;
            changes = true
          }          
          objChange.contact_ID = cid;
          
          
          if(changes){
            console.time('edits')
            ipc.send("edit-contact-name", objChange, customer_ID);
          }
          document.getElementById("inputNameWrapper").remove();
          console
          setTimeout(function () {
            // pullContacts(customer_ID);
          }, 50);
        });

        btnCancel.addEventListener("click", (event) => {
          document.getElementById("inputNameWrapper").remove();
          toggleActionLinkVisibility('off')
        });

        wrapper.appendChild(inpFN);
        wrapper.appendChild(inpLN);
        wrapper.appendChild(btnSave);
        wrapper.appendChild(btnCancel);

        return wrapper;
      }

      //function to determine if item being deleted is associated with 
      //a current job and return an array with count of jobs, boolean of 
      //on current jobs, and job objects for each job
      function checkJobsForItem(obj){
        let allJobs = ipc.sendSync('pull_jobs')
        let onCurrentJob         
        let count = 0
        let jobs = new Array()
        console.log(obj)
       
        for(member in allJobs){
               
               let om = (obj.searchGroup == 'p')?allJobs[member].number_ID:allJobs[member].email_ID               
                if(obj.methodID == om){
                 console.log(om+" "+obj.methodID)
                    count++
                    jobs.push(allJobs[member])
                }else{
                    
                }

                           
        }
        jobs.onCurrentJob = (count>0)?true:false;
        jobs.jobCount = count
        
        return jobs
      }


      /*
      / function to create an input for editing or adding to existing contact
      /
      / @param {string} conMethod - will be 'phone' or 'email'
      / @param {string} contactToAddTo - contact ID as string. Will need to be converted to Number type when accessing JSON
      / @param {string} text - text of phone number or email address ex. '(513) 825-7345' or 'sean@email.com'
      / @param {string} actionType - will be 'add' or 'edit'
      */
      function createInput(conMethod, contactToAddTo, text, actionType) {
        const cm = conMethod;
        let id = contactToAddTo;
        const t = text;
       
        const at = actionType;

        let editDataFieldList = document.createElement("li");
        let inpA = document.createElement("input");
        let saveButton = document.createElement("div");
        let sb = document.createTextNode("save");

        saveButton.appendChild(sb);
        saveButton.setAttribute("class", "contactButton");
        saveButton.addEventListener("click", () => {
          //create object to send to edit function
          // let objData = new Object();
          
          
          //determine whether an item is being added or edited

          if (at == "add") {            
            let objAdd = new Object();
            objAdd.contact_ID = id;
            objAdd.text = saveButton.parentNode.firstChild.value;
            objAdd.active = 1
            console.log(objAdd)
            console.log(cm)
            ipc.send(`add-${cm}`, objAdd,globalObjectContact.customer_ID);
            togglePageView('cancel')

          } else if (at == "edit") {
            
            let objEdit = new Object();
            objEdit.id = id;
            objEdit.text = saveButton.parentNode.firstChild.value;
            ipc.send(`edit-${cm}`, objEdit, globalObjectContact.customer_ID);
            ipc.send('update-main-page')
            togglePageView('cancel')
            
          } else {
            //TODO: neither add or edit passed. Error processing needed
          }
          
         

         
          if(pageLauncher!="edit"){
            setTimeout(function () {
                  pullContacts(
                    saveButton.parentNode.parentNode.parentNode.parentNode.id.substr(
                      4
                    )
                  );
            }, 30);
        }
        });
        let cancelButton = document.createElement("div");
        let cb = document.createTextNode("cancel");

        cancelButton.appendChild(cb);
        cancelButton.setAttribute("class", "contactButton");
        cancelButton.addEventListener("click", () => {
          let listSpotHolder = cancelButton.parentNode.parentNode;
          let thingToRemove = cancelButton.parentNode;
          if (at == "edit") {
            listSpotHolder.replaceChild(
              objListItemTray.listItem,
              thingToRemove
            );
          } else {
            thingToRemove.remove();
          }
          toggleActionLinkVisibility("off");
        });
        inpA.setAttribute("id", "inp" + id);
        inpA.setAttribute("value", t);
        editDataFieldList.appendChild(inpA);
        editDataFieldList.appendChild(saveButton);
        editDataFieldList.appendChild(cancelButton);
        editDataFieldList.setAttribute("id", at + "CreatedListItem");

        if (cm == "phone") {
          formatPN(inpA);
        }

        return editDataFieldList;
      }

      //function to toggle action link visibilty while still on edit section
      function toggleActionLinkVisibility(state) {
        let al = document.getElementsByClassName("actionLink");
        if (state == "off") {
          for (i = 0; i < al.length; i++) {
            al[i].style.display = "inline-block";
          }
        }
        if (state == "on") {
          for (i = 0; i < al.length; i++) {
            al[i].style.display = "none";
          }
        }
      }

      function reloadPage(cont,from){
        switch(from){
          case 'primary':
            pullContacts(cont)
            
            toggleActionLinkVisibility('off')
            togglePageView()
          break;
          default: 
          break;
        }
      }

      //function to create contact elements and load contacts
      function fillContacts(cont) {
        console.log('fill contacts started')
        console.time('fill')
        //cont.sort((a, b) => (a.primary_contact > b.primary_contact) ? -1 : 1)
        let first = cont.primary_contact
        cont.sort((x,y)=> x.contact_ID == first ? -1 : y.contact_ID == first ? 1 : 0 );
        
        contactContent.innerHTML = "";
        let wholeCompanyList = document.createElement("ul");
        wholeCompanyList.setAttribute(
          "id",
          `cust${String(cont[0].customer_ID).padStart(5, "0")}`
        );
        let pnText = "";

        for (member in cont) {
          console.log(member)
          if(member != 'primary_contact'){
            let li = document.createElement("li");
            li.setAttribute(
              "id",
              `c${String(cont[member].contact_ID).padStart(5, "0")}`
            );
            
            let divPrimaryIndicator = document.createElement('div')
            divPrimaryIndicator.setAttribute('class','primary')

            let spanPrimaryIndicator = document.createElement('span')
            
            spanPrimaryIndicator.setAttribute('class','indicator visible')
            let divPrimaryCheckbox = document.createElement('div')
            divPrimaryCheckbox.setAttribute('class','divPrimaryCheckbox')
            let cbPrimary = document.createElement('input')
            
            cbPrimary.setAttribute('type', 'radio')
            cbPrimary.setAttribute('name','primary')
            //cbPrimary.setAttribute('class','cbPrimary hidden')
            cbPrimary.setAttribute('class','cbPrimary')
            cbPrimary.setAttribute('id',`ci${String(cont[member].contact_ID).padStart(5, "0")}`)
            cbPrimary.addEventListener('click',(event)=>{
              let isPrimary = (event.target.checked) ? 1:0
              let id = parseInt(Number(event.target.id.substring(2)),10)
              let cuID = parseInt(Number(event.target.parentNode.parentNode.parentNode.id.substring(5)),10)
              console.log(cuID)
              ipc.send('edit-primary-contact', isPrimary,id,cuID)
              
              // setTimeout(() => {
              //   reloadPage(cont[member].customer_ID, 'primary')
                
              // }, 200);
              
            })
            let cbLabel = document.createElement('label')
            let cbText = document.createTextNode(` Primary Contact`)
            cbLabel.appendChild(cbText)
            
            // if(cont[member].primary_contact == 1){
            //   currentPrimary = cont[member].contact_ID
            //   cbPrimary.setAttribute('checked', true)
            //   let indicatorText = document.createTextNode('P')
            //   spanPrimaryIndicator.appendChild(indicatorText)
            // }
            if(cont.primary_contact == cont[member].contact_ID){
              currentPrimary = cont[member].contact_ID
              cbPrimary.setAttribute('checked', true)
              let indicatorText = document.createTextNode('P')
              spanPrimaryIndicator.appendChild(indicatorText)
            }
            divPrimaryIndicator.appendChild(spanPrimaryIndicator)
            divPrimaryCheckbox.appendChild(cbPrimary)
            divPrimaryCheckbox.appendChild(cbLabel)
            

            let spanFirstName = document.createElement("span");
            spanFirstName.setAttribute("class", "contactName");
            let spanFirstNameText = document.createTextNode(
              cont[member].first_name
            );
            spanFirstName.appendChild(spanFirstNameText);
            let spanLastName = document.createElement("span");
            spanLastName.setAttribute("class", "contactName");
            let spanLastNameText =
              cont[member].last_name != null
                ? document.createTextNode(cont[member].last_name)
                : document.createTextNode("");
            spanLastName.appendChild(spanLastNameText);
            let linkEl1 = document.createElement("span");
            let linkEl2 = document.createElement("span");
            //linkEl1.setAttribute('id', `${cont[member].contacts[member].contactID}editLink`)
            linkEl1.setAttribute("class", "actionLink");
            //linkEl2.setAttribute('id', `${cont[member].contacts[member].contactID}deleteLink`)
            linkEl2.setAttribute("class", "actionLink");
            let link = document.createTextNode(`  edit  `);
            let deleteLink = document.createTextNode(`  delete  `);
            linkEl1.appendChild(link);
            linkEl2.appendChild(deleteLink);
            linkEl1.addEventListener("click", () => {
              toggleActionLinkVisibility("on");
              //remove open created input for add
              if (document.getElementById("addCreatedListItem") != null) {
                document.getElementById("addCreatedListItem").remove();
              }
              //close open edit box when 'add' clicked
              if (document.getElementById("editCreatedListItem") != null) {
                document
                  .getElementById("editCreatedListItem")
                  .childNodes[2].click();
              }

              let pnList = event.target.parentNode;
              let pnListItem = event.target.nextSibling;
              let fnText = event.target.parentNode.childNodes[2].textContent;
              let lnText = event.target.parentNode.childNodes[3].textContent;
              let p = event.target.parentNode.id;
              let cust_ID = event.target.parentNode.parentNode.id.substr(4);
              objListItemTray.listItem = pnListItem;
              let newListItem = createDoubleInputs(
                p.substr(1),
                fnText,
                lnText,
                cust_ID
              );
              pnList.insertBefore(newListItem, pnListItem);
              
              newListItem.firstChild.focus();
            });

            
            linkEl2.addEventListener("click", () => {
              
              toggleActionLinkVisibility("on");
              let p = event.target.parentNode.id;
              let gp = event.target.parentNode.parentNode.id;
              let gggp =
                event.target.parentNode.parentNode.parentNode.parentNode.id;
              let objDel = new Object();
              let pJobs
              let eJobs
              let aJobs =[]
              let count = 0
              let method = p.substr(0, 1);
              let contact_ID = p.substr(1);
              
              for(i=0;i<cont.length;i++){
                
                if(cont[i].contact_ID == p.substring(1)){
                  
                  //compare list of numbers with numbers in jobs  
                  //console.log('phonenumbers length is'+cont[i].phonenumbers.length)
                
                  for(member in cont[i].phonenumbers){//for(j=0;j<cont[i].phonenumbers.length;j++){
                    let objD = new Object()
                    pJobs = new Array()
                      
                    console.log(cont[i].phonenumbers[member].phone_ID)
                    objD.method = method
                    objD.contact_ID = contact_ID
                    objD.methodID = cont[i].phonenumbers[member].phone_ID 
                    objD.searchGroup = 'p'
                    console.log(objD)                 
                    pJobs = checkJobsForItem(objD)
                    console.log(pJobs)
                    aJobs.push(pJobs)
                    count+= Number(pJobs.jobCount)
                    
                  }
                  console.log()
                  
                //compare list of emails with emails in jobs
                
                for(member in cont[i].emails){ 
                    let objD = new Object()                 
                    objD.method = method
                    objD.contact_ID = contact_ID
                    objD.methodID = cont[i].emails[member].email_ID   
                    objD.searchGroup = 'e'               
                    eJobs = checkJobsForItem(objD)
                    aJobs.push(eJobs)
                    count+= Number(eJobs.jobCount)
                  }
                  
                  
                }
              }
              aJobs.jobCount = count
              aJobs.onCurrentJob = (count>0) ?  true : false
              aJobs.method = 'c'
              aJobs.contact_ID = contact_ID
              console.log(aJobs);
              processDeleteDecision(aJobs, 'Contact', objDel)
              
              
              
              setTimeout(() => {
                pullContacts(gp.substr(4));
              }, 100);
            });
            wholeCompanyList.appendChild(li);
            li.appendChild(divPrimaryIndicator)
            li.appendChild(spanFirstName);
            li.appendChild(spanLastName);
            li.appendChild(linkEl1);
            li.appendChild(linkEl2);
            var nUl = document.createElement("ul");
            nUl.setAttribute(
              "id",
              `pnList${String(cont[member].contact_ID).padStart(5, "0")}`
            );
            let ULheader = document.createTextNode(`Phone Numbers `);
            nUl.appendChild(ULheader);

            //create add links for each category header(Phone Numbers, Email)

            //Phone Numbers
            let pnHeaderLinkBox = document.createElement("span");
            let pnHeaderLinkText = document.createTextNode("add");
            pnHeaderLinkBox.appendChild(pnHeaderLinkText);
            pnHeaderLinkBox.setAttribute("class", "actionLink");

            pnHeaderLinkBox.setAttribute(
              "id",
              `${cont[member].contact_ID}pnHeaderEditLink`
            );
            pnHeaderLinkBox.addEventListener("click", () => {
              
              toggleActionLinkVisibility("on");
              //remove open created input for add
              if (document.getElementById("addCreatedListItem") != null) {
                document.getElementById("addCreatedListItem").remove();
              }
              //close open edit box when 'add' clicked
              if (document.getElementById("editCreatedListItem") != null) {
                document
                  .getElementById("editCreatedListItem")
                  .childNodes[2].click();
              }

              let p = event.target.parentNode.id.substr(6);
              let newListItem = createInput("phone", p, "", "add");

              event.target.parentNode.insertBefore(
                newListItem,
                event.target.nextSibling
              );
              
              event.target.nextSibling.firstChild.focus();
            });
            nUl.appendChild(pnHeaderLinkBox);

            //create phone number list for contact

            for (n in cont[member].phonenumbers) {
              let nLi = document.createElement("li");
              let tNu = document.createTextNode(
                cont[member].phonenumbers[n].number
              );
              nLi.appendChild(tNu);
              /*------/
                  * naming convention for list item ID
                  * first character - p for phone or e for email
                  * followed by 13 digit contact ID
                  * followed by a dash - then the position of the item in the main file array
                  * example p1596725987081-0 for a (p)phone number for contact id 1596725987081 that is first in the list(0)
                  /------*/
              nLi.setAttribute(
                "id",
                `p${String(cont[member].phonenumbers[n].phone_ID).padStart(
                  5,
                  "0"
                )}`
              );

              //create edit link for each number
              let pnEditLinkBox = document.createElement("span");
              let pnEditLinkText = document.createTextNode(" edit");
              pnEditLinkBox.appendChild(pnEditLinkText);
              pnEditLinkBox.setAttribute("class", "actionLink");
              pnEditLinkBox.addEventListener("click", (event) => {
                toggleActionLinkVisibility("on");
                /*
                      let al = document.getElementsByClassName('actionLink');
                          for(i=0;i<al.length;i++){
                          al[i].style.display = "none"
                      }
                      */
                if (document.getElementById("editCreatedListItem") != null) {
                  document
                    .getElementById("editCreatedListItem")
                    .childNodes[2].click();
                }
                if (document.getElementById("addCreatedListItem") != null) {
                  document
                    .getElementById("addCreatedListItem")
                    .childNodes[2].click();
                }

                let pnList = event.target.parentNode.parentNode;
                let pnListItem = event.target.parentNode;
                let pnText = pnListItem.firstChild.textContent;
                let p = event.target.parentNode.id;
                objListItemTray.listItem = pnListItem;
                let newListItem = createInput(
                  "phone",
                  p.substr(1),
                  pnText,
                  "edit"
                );
                pnList.replaceChild(newListItem, pnListItem);
                newListItem.firstChild.focus();
              });
              nLi.appendChild(pnEditLinkBox);

              //create delete link for each phone number
              let pnDeleteLinkBox = document.createElement("span");
              let pnDeleteLinkText = document.createTextNode(" delete");
              pnDeleteLinkBox.appendChild(pnDeleteLinkText);
              pnDeleteLinkBox.setAttribute("class", "actionLink");
              
              pnDeleteLinkBox.addEventListener("click", (event) => {
                toggleActionLinkVisibility("on");
                let p = event.target.parentNode.id;
                let gp = event.target.parentNode.parentNode.id;
                let gggp = event.target.parentNode.parentNode.parentNode.parentNode.id;
                let objDel = new Object();
                objDel.companyID = gggp.substr(4);
                objDel.contactID = gp.substr(6);
                objDel.method = p.substr(0, 1);
                objDel.methodID = p.substr(1);
                objDel.searchGroup = 'p'
                let jobs = checkJobsForItem(objDel)
                console.log(jobs)
                console.log(objDel)
                processDeleteDecision(jobs, 'Phone Number', objDel)
                
                
                setTimeout(() => {
                  pullContacts(gggp.substr(4));
                }, 30);
              });
              nLi.appendChild(pnDeleteLinkBox);

              nUl.appendChild(nLi);
              
            }
            li.appendChild(nUl);
            
            // create input field for the contact chosen on add page
            if (cont[member].contact_ID == conID && addCM == "phone") {
              console.log(`input created foradding ${addCM} to contact id ${conID}`)
              nUl.appendChild(createInput(addCM, conID,"",'add'));
              $("#inp" + conID).focus();
              formatPN("#inp" + conID);
            }

            var eUl = document.createElement("ul");
            let ULEmailHeader = document.createTextNode(`Email `);
            eUl.setAttribute(
              "id",
              `emList${String(cont[member].contact_ID).padStart(5, "0")}`
            );
            eUl.appendChild(ULEmailHeader);

            let eHeaderLinkBox = document.createElement("span");
            let eHeaderLinkText = document.createTextNode("add");
            eHeaderLinkBox.appendChild(eHeaderLinkText);
            eHeaderLinkBox.setAttribute("class", "actionLink");

            eHeaderLinkBox.setAttribute(
              "id",
              `${cont[member].contact_ID}eHeaderEditLink`
            );
            eHeaderLinkBox.addEventListener("click", () => {
              
              toggleActionLinkVisibility("on");

              //remove open created input for add
              if (document.getElementById("addCreatedListItem") != null) {
                document.getElementById("addCreatedListItem").remove();
              }
              //close open edit box when 'add' clicked
              if (document.getElementById("editCreatedListItem") != null) {
                document
                  .getElementById("editCreatedListItem")
                  .childNodes[2].click();
              }
              let p = event.target.parentNode.id.substr(6);

              let newListItem = createInput("email", p, "", "add");

              event.target.parentNode.insertBefore(
                newListItem,
                event.target.nextSibling
              );
              event.target.nextSibling.firstChild.focus();
            });
            eUl.appendChild(eHeaderLinkBox);

            for (n in cont[member].emails) {
              let nLi = document.createElement("li");
              let tNu = document.createTextNode(cont[member].emails[n].email);
              nLi.appendChild(tNu);
              nLi.setAttribute(
                "id",
                `e${String(cont[member].emails[n].email_ID).padStart(5, "0")}`
              );

              //create edit link for each email
              let eEditLinkBox = document.createElement("span");
              let eEditLinkText = document.createTextNode(" edit");
              eEditLinkBox.appendChild(eEditLinkText);
              eEditLinkBox.setAttribute("class", "actionLink");
              eEditLinkBox.addEventListener("click", (event) => {
                toggleActionLinkVisibility("on");

                if (document.getElementById("editCreatedListItem") != null) {
                  document
                    .getElementById("editCreatedListItem")
                    .childNodes[2].click();
                }
                if (document.getElementById("addCreatedListItem") != null) {
                  document
                    .getElementById("addCreatedListItem")
                    .childNodes[2].click();
                }
                let eList = event.target.parentNode.parentNode;
                let eListItem = event.target.parentNode;
                let eText = eListItem.firstChild.textContent;
                let p = event.target.parentNode.parentNode.id;
                objListItemTray.listItem = eListItem;
                //alert(cont[member].id)
                console.log(
                  "the parameter p in createInput() = " +
                    p +
                    " which should be a single digit position marker"
                );
                let newListItem = createInput(
                  "email",
                  event.target.parentNode.id.substr(1),
                  eText,
                  "edit"
                );
                eList.replaceChild(newListItem, eListItem);
                newListItem.firstChild.focus();
              });
              nLi.appendChild(eEditLinkBox);
              eUl.appendChild(nLi);

              //create delete link for each email
              let eDeleteLinkBox = document.createElement("span");
              let eDeleteLinkText = document.createTextNode(" delete");
              eDeleteLinkBox.appendChild(eDeleteLinkText);
              eDeleteLinkBox.setAttribute("class", "actionLink");
            
              eDeleteLinkBox.addEventListener("click", (event) => {
                toggleActionLinkVisibility("on");
                let p = event.target.parentNode.id;
                let gp = event.target.parentNode.parentNode.id;
                let gggp =
                  event.target.parentNode.parentNode.parentNode.parentNode.id;
                let objDel = new Object();
                objDel.companyID = gggp.substr(4);
                objDel.contactID = gp.substr(6);
                objDel.method = p.substr(0, 1);
                objDel.methodID = p.substr(1);
                objDel.searchGroup = 'e'
                
                let jobs = checkJobsForItem(objDel)
                
                
                processDeleteDecision(jobs, 'Email', objDel)
              
                setTimeout(() => {
                  pullContacts(gggp.substr(4));
                }, 30);
              });
              nLi.appendChild(eDeleteLinkBox);

              eUl.appendChild(nLi);
            }

            li.appendChild(eUl);
            li.insertBefore(divPrimaryCheckbox,li.firstChild)
          
            if (cont[member].contact_ID == conID && addCM == "email") {
              eUl.appendChild(createInput('email', conID, "",'add'));
              $("#inp" + conID).focus();
            
            }        
            
          }
        }//end if member != primary_contact
        //append list of contacts for company to container
        contactContent.appendChild(wholeCompanyList);
        console.log('fill contacts ended')
        console.timeEnd('fill')
      }

      //function to verify that value is unique
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }

     function processDeleteDecision(jobs, level, objContact){
        //array of jobs for opening edit windows
        console.log(jobs)
        console.log(objContact)
        let arrEditWindowJobs = new Array()

        //if item to be deleted is listed on one or more current jobs
        if(jobs?.onCurrentJob){
                ipc.send('reset-edit-window-count')
                let goingToEditJobContact = false
                
                //window.confirm() popup to determine if user wants to edit jobs associated
                //or cancel the delete
                if(jobs.jobCount>1){
                    goingToEditJobContact = confirm(`${level} is currently connected to active jobs. Click 'OK' to change the job contacts`);
                }else{
                    goingToEditJobContact = confirm(`${level} is currently connected to an active job. Click 'OK' to change the job contact`);
                }

                //if 'OK' was chosen on confirm popup
                if(goingToEditJobContact){  
                  
                    //if there is only one current job associated with the contact
                    //open the edit window for the item and reset contact window to default state
                    if(jobs.jobCount==1){   
                               
                      ipc.send('open-edit',jobs[0], 'contacts page')
                      togglePageView('cancel')
                      return

                    //else if there was more than one job associated with the contact
                    }else{  
                      //loop through jobs and determine if there is more than one job for a contact method item
                      for(i=0;i<jobs.length;i++){


                      //determine deletion level 'Contact','Phone Number', or 'Email'
                        switch(level){
                          //if user is trying to delete whole contact
                          case 'Contact':
                            
                            //if more than one job associated with single contact method item (phone, email)
                            if(jobs[i].length>1){                              

                              //loop through the multiple jobs per contact method item and push job info 
                              //into @param array arrEditWindowJobs for launching of edit window on each item
                              for(z=0;z<jobs[i].length;z++){                           
                                
                                  if(typeof jobs[i][z] === 'object'){
                                    arrEditWindowJobs.push(jobs[i][z])                                                      
                                  }                                
                              }                                  
                                
                            //if there was only one job    
                            }else{
                              //verify that array entry is an object and not a property and push to
                              //array arrEditWindowJobs                   
                              if(typeof jobs[i][0] === 'object'){
                                arrEditWindowJobs.push(jobs[i][0])
                              }                            
                            }                          
                          break;

                          //if deleting a single phone number
                          case 'Phone Number':
                              if(typeof jobs[i] === 'object'){
                                arrEditWindowJobs.push(jobs[i])
                              }
                          break;

                          //if deleting a single email
                          case 'Email':
                              if(typeof jobs[i] === 'object'){
                                arrEditWindowJobs.push(jobs[i]) 
                              }
                          break;

                          //if level not stated exit function
                          default: 
                              return
                          break;
                        }
                    }
                    } 
                    //open edit windows for the multiple jobs                
                    let c=0
                    let newWindow = setInterval(() => {  
                      console.log(currentUser)                      
                      ipc.send('open-edit-multiple',arrEditWindowJobs[c], 'contacts page',currentUser)
                      c++
                      if(c==arrEditWindowJobs.length){clearInterval(newWindow)}
                    }, 400);   
                }
                //if cancel was chosen on confirm popup
                togglePageView('cancel')
        
        //no jobs were associated with contact. process deletion
        }else{          
          console.log("jobs in processDeleteDecision is "+JSON.stringify(objContact))
          if(level=="Contact"){
            ipc.send("delete-item", jobs);
          }else{
            ipc.send("delete-item", objContact);
          }
          
          togglePageView('cancel')
         
        }       
        
      }
      function checkNumberForNoShows(input){
        console.log(input.value)
        //let contactInfoFound = ipcReport.sendSync('search-for-contact-info', input.value)
        //if(numberNotFound()) return


      }
     
     
     
    