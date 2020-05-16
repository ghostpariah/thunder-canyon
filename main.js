
const electron = require('electron')
const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const db = require('electron-db')
const location = path.join(__dirname, 'data')
const fileToOpen = path.join(__dirname, 'data','vehicles.json')
const users = path.join(__dirname, 'data', 'users.json')

let objList
let win 
let x
let fsWait = false;
let loginWin
let contactWin
let reportsWin
let addJobWin
let calendarWindow
let cuWin

/*******
********
onload operations
**********
**********/
parseString = require("xml2js").parseString;
read();
app.on('ready',createMainWindow)
app.on('window-all-closed', ()=>{
    if(process.platform !== 'darwin'){
        app.quit()
    }
})
app.on('activate', () => {
    createMainWindow()
    
})
fs.watch(fileToOpen, (event, filename) => {
    if (filename) {        
      if (fsWait) return;    
      fsWait = setTimeout(() => {
        fsWait = false;      
      }, 200);      
      read();
      setTimeout(function() {
          win.webContents.send('reload',objList)
      }, 50);      
    }
    console.log("fs watch triggered")
});


/********
 * functions
 ********/
function read(){
    for (var member in objList) delete objList[member];    
       
      // fs.readFile(fileToOpen, "utf-8", function(err, data) {
       //  if (err) console.log(err);   
       db.getRows('vehicles',location, {
        active: true
        
      }, (succ, result) => {
        // succ - boolean, tells if the call is successful
        //console.log("Success: " + succ);
        //console.log(result);
        objList = result;
      })             
        
        
       
      // });
}
function write(x){
    let jsonContent = JSON.stringify(x)
    fs.writeFile(fileToOpen, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    
        
    });

    //console.log("JSON file has been saved.");
};
function edit(args){
    // console.log('args is a '+typeof args)
    // let thing
    // (args.id) ? thing = args.id : thing = args

    
    let where = {
        "id" : Number(args.id)       
        // "id": Number(x.id)
      };
       
      let set = {
        "ampm": args.ampm,
        "cash": args.cash,
        "comeback": args.comeback,
        "customerName": args.customerName,
        "dateIn": args.dateIn,
        "estimatedCost": args.estimatedCost,
        "jobType": args.jobType,
        "julian": args.julian,
        "notes": args.notes,
        "origin": args.origin,
        "parts": args.parts,
        "approval": args.approval,
        "scheduledDate": args.scheduledDate,
        "shopLocation": args.shopLocation,
        "status": args.status,
        "unit": args.unit,
        "checked": args.checked,
        "noShow": args.noShow
      }
       
      db.updateRow('vehicles',location, where, set, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        console.log("Success: " + succ);
        console.log("Message: " + msg);
      });
      
}

/*******
 * functions regarding contacts
 *******/

function getCustomerNames(){
    let key = 'companyName'
    let list =[]
    db.getAll('customers', location, (succ, data) => {
        if (succ) {
            for(member in data){list.push(data[member].companyName)}
          //console.log(data)
          
        }else{console.log('failure')}
    }) 
    return list
}

function getContacts(comp){
    let c 
    console.log(comp)
    db.getRows('customers', location,{
        companyName: comp
      }, (succ, result) => {
         console.log('getContacts()'+result)
        // succ - boolean, tells if the call is successful
        if(succ){
            console.log('From getContacts '+result[0].contacts[0].lastname)
            c = result
        }
      })   
      return c
}
/******* 
*create browser windows
********/



function createMainWindow(){
    //console.log('creating window')
    win = new BrowserWindow({
        width: 1600,
        height: 900,        
        icon: path.join(__dirname, '/images/icon.png'),
        
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false

        }
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, '/pages/workflow.html'),
        protocol: 'file',
        slashes:true
    }))
    //win.removeMenu()
    win.on('ready', ()=>{
        
       // console.log('Browser window finished loading')
       
    })
    //win.once("read-to-show", () =>{win.show()})
    win.on('closed', ()=>{
        win = null
    })
    win.webContents.openDevTools()
    //win.webContents.send('asynchronous-message', objList)
    
    
}
function createLoginWindow(){
    //console.log('creating window')
        loginWin = new BrowserWindow({
        parent: win,
        width: 425,
        height: 250,
        autoHideMenuBar: true,
        modal: true,
        icon: path.join(__dirname, '/images/icon.png'),
        
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
            
        }
    })
    loginWin.loadURL(url.format({
        pathname: path.join(__dirname, '/pages/login.html'),
        protocol: 'file',
        slashes:true
    }))
    //win.removeMenu()
    loginWin.on('ready', ()=>{
        loginWin.webContents.focus()
       // console.log('Browser window finished loading')
       
    })
    //win.once("read-to-show", () =>{win.show()})
    loginWin.on('closed', ()=>{
        loginWin = null
    })
    //win.webContents.openDevTools()
    //win.webContents.send('asynchronous-message', objList)
    
    
}
function createReportWindow(){
    reportWin = new BrowserWindow({
            parent: win,
            modal: true,
            width:900,
            height:550,
            autoHideMenuBar: true,
            show: true,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false
    
            }
            
          })
          reportWin.loadURL(url.format({
            pathname: path.join(__dirname, '/pages/report.html'),
            protocol: 'file',
            slashes:true
        }))
        reportWin.once('ready-to-show', () => {
            //reportWin.show()
            attachDatePicker()
            
          })

          reportWin.webContents.focus()
         // console.log(win.webContents.isFocused())
        
    
}
function createAddJobWindow(){
    addJobWin = new BrowserWindow({
            parent: win,
            modal: true,            
            width:465,
            height: 650,
            autoHideMenuBar: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false
    
            }
            
          })
          addJobWin.loadURL(url.format({
            pathname: path.join(__dirname, '/pages/addJob2.html'),
            protocol: 'file',
            slashes:true
        }))
        addJobWin.once('ready-to-show', () => {
            addJobWin.show()
            win.preventDefault
            //attachDatePicker()
            
          })

          addJobWin.webContents.focus()
         // console.log(win.webContents.isFocused())
         addJobWin.on('closed', ()=>{
            addJobWin = null
        })
        
    
}
function createCreateUserWindow(){
        cuWin = new BrowserWindow({
        parent: win,
        modal: true,
        width:425,
        height: 300,
        autoHideMenuBar: true,
        show: false,
        icon: path.join(__dirname, './images/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false

        }
        
      })
      cuWin.loadURL(url.format({
        pathname: path.join(__dirname, '/pages/createUser.html'),
        protocol: 'file',
        slashes:true
    }))
    cuWin.once('ready-to-show', () => {
        cuWin.show()
        
        
      })
}
function createContactsWindow(args){
    contactsWin = new BrowserWindow({
            parent: win,
            modal: true,            
            width:465,
            height: 650,
            autoHideMenuBar: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false
    
            }
            
          })
          contactsWin.loadURL(url.format({
            pathname: path.join(__dirname, '/pages/contacts.html'),
            protocol: 'file',
            slashes:true
        }))
        contactsWin.once('ready-to-show', () => {
            contactsWin.show()
            contactsWin.preventDefault
            //attachDatePicker()
            
          })

          contactsWin.webContents.focus()
         // console.log(win.webContents.isFocused())
         contactsWin.webContents.once('did-finish-load',()=>{
             console.log('contacts page finish loading')
             contactsWin.webContents.send('name-chosen', args)
         })
         contactsWin.on('closed', ()=>{
            contactsWin = null
        })
        
    
}
function createCalendarWindow(){
    calendarWin = new BrowserWindow({
            parent: win,
            modal: true,
            width:1120,
            height: 800,
            autoHideMenuBar: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false
    
            }
            
          })
          calendarWin.loadURL(url.format({
            pathname: path.join(__dirname, '/pages/calendar.html'),
            protocol: 'file',
            slashes:true
        }))
        calendarWin.once('ready-to-show', () => {
            calendarWin.show()
            //win.preventDefault
            //attachDatePicker()
            
          })

          calendarWin.webContents.focus()
         // console.log(win.webContents.isFocused())
         calendarWin.on('closed', ()=>{
            calendarWin = null
        })
       // calendarWin.webContents.openDevTools()
    
}
/*********
 * communications regarding vehicles.json
 *********/
ipcMain.on('close-add-window', (event,args)=>{
    addJobWin.close()
})
ipcMain.on('open-add-job',(event, args)=>{
    createAddJobWindow()
})
ipcMain.on('edit', (event, args)=>{    
    //console.log(`this is from on(edit ${args}`)
    edit(args)  
     
});
ipcMain.on('message', (event)=>{
    
    event.sender.send('message',objList)
    
});

ipcMain.on('write', (event, args)=>{
   
    console.log('writing to file')
   
});
ipcMain.on('addNew', (event, args)=>{
    //console.log(args)
    if (db.valid('vehicles',location)) {
        db.insertTableContent('vehicles', location, args, (succ, msg) => {
          // succ - boolean, tells if the call is successful
          //console.log("Success: " + succ);
         // console.log("Message: " + msg+" writing new job to vehicles.json from ipcMain on 'addNew'");
        });
      }
     win.webContents.send('count') 
     
     addJobWin.hide()
     addJobWin = null
});
ipcMain.on('reloadPage', (event) =>{
    read();
    event.sender.send('reload', objList)
})
ipcMain.on('editLocation', (event, args1, args2, args3)=>{
    //console.log(args1+" "+args2)
    
    let where = {
        "id" : Number(args1)        
      };
    let set = {
        "shopLocation" : args2,
        "status" : args3
    } 
    db.updateRow('vehicles',location, where, set, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        console.log("Success: " + succ);
        console.log("Message: " + msg);
      });
      
})
ipcMain.on('allJobs', (event, args) =>{
    db.getAll('vehicles', location, (succ, data) => {
        // succ - boolean, tells if the call is successful
        // data - array of objects that represents the rows.
        event.returnValue = data
        
      })

})
ipcMain.on('getActive', (event,args)=>{
    db.getRows('vehicles',location, {
        active: true
        
      }, (succ, result) => {
        // succ - boolean, tells if the call is successful
        //console.log("Success: " + succ);
        
        event.returnValue = result
      })
})
ipcMain.on('getID', (event,args)=>{

    read()
    //console.log(objList[0].customerName)
    //let y = JSON.parse(objList)
    let newJobId = objList[objList.length-1].id;//y.vehicles[y.vehicles.length-1].id
    //console.log()
    event.returnValue = newJobId
})
ipcMain.on('getVehicle', (event,args)=>{
    //console.log(args)
    db.getRows('vehicles', location, {
        "id" : Number(args)
        
      }, (succ, result) => {
        
        event.returnValue = result
      })
})
ipcMain.on('deactivate', (event,args)=>{
    //console.log(args)
    if(typeof args === 'object'){
        for(let item in args){
            //console.log(args[item])
            let where = {
                "id" : Number(args[item])
            }
            let set = {
                "active" : false
            }
            db.updateRow('vehicles',location, where, set, (succ, msg) => {
                // succ - boolean, tells if the call is successful
                console.log("Success: " + succ);
                console.log("Message: " + msg);
              });            
        }
    }else{

    let where = {
        "id" : Number(args)
    }
    let set = {
        "active" : false
    }
    db.updateRow('vehicles',location, where, set, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        console.log("Success: " + succ);
        console.log("Message: " + msg);
      });
    }
})


/********
 * ******
 * communications regarding contacts
 * ******
 ********/
ipcMain.on('add-new-company', (event, args)=>{
    if (db.valid('customers',location)) {
        db.insertTableContent('customers', location, args, (succ, msg) => {
          // succ - boolean, tells if the call is successful
          //console.log("Success: " + succ);
         // console.log("Message: " + msg+" writing new customer to customers.json from ipcMain on 'addNew'");
        });
      }
         
})
ipcMain.on('get-company', (event, args)=>{

    db.search('customers', location, 'companyName', args, (succ, data) => {
        if (succ) {
          //console.log(data);
        }else{
           // console.log("did we find "+args+"? "+succ)
        }
        event.returnValue = data[0].id
      });
        
})
ipcMain.on('add-job-to-company', (event, args1, args2)=>{
    let objCompany
    //console.log(args1)
    db.getRows('customers', location, {
        "id" : args1
        
      }, (succ, result) => {
          
        //console.log("result from getting company for add " +JSON.stringify(result))
        objCompany = result
        //console.log(result[0].jobs[0].jobID)

      })
      objCompany[0].jobs.push({
          'jobID': args2

      })
     //console.log(result.companyName)
     let where = {
         "id" : args1        
       };
     let set = {
         "jobs" : objCompany[0].jobs
        
     } 
     db.updateRow('customers',location, where, set, (succ, msg) => {
         // succ - boolean, tells if the call is successful
         console.log("Success: " + succ);
         console.log("Message: " + msg);
       });  
})


ipcMain.on('get-customers',(event,args)=>{
    db.getAll('customers', location, (succ, data) => {
        // succ - boolean, tells if the call is successful
        // data - array of objects that represents the rows.
        event.returnValue = data
        let jobs = data[0].jobs[0]
        let contacts = data[0].contacts[0]
        //console.log(jobs)
        //console.log(contacts)
    
        db.search('vehicles',location, 'id', Number(jobs.jobID), (succ, data) => {
            if (succ) {
                cname=data[0].customerName
            }
        });
        //console.log(cname) 
    }); 
})
ipcMain.on('get-customer-names', (event,args)=>{
    
    event.returnValue = getCustomerNames()
        
})

ipcMain.on('open-contacts', (events,args)=>{
    createContactsWindow(args)
})
ipcMain.on('get-contacts', (event, args)=>{
    console.log('on(get-contacts'+args)
    if(args != undefined){
        let gc = getContacts(args)    
        event.returnValue = gc
    }else{
        event.returnValue = true
    }
})

/************
 * communications regarding users and login
 ************/
ipcMain.on('open-create-user', (event,args)=>{
    createCreateUserWindow()
})
ipcMain.on('check-for-user', (event,args)=>{
    console.log(args)
    db.getRows('users',location, {
        user_name: args
        
      }, (succ, result) => {
        // succ - boolean, tells if the call is successful
        result.length >0 ? event.returnValue = true : event.returnValue = false
        
        //console.log("Success: " + succ);
        console.log(result);
      })   
})
ipcMain.on('create-user', (event,args)=>{
    if (db.valid('users',location)) {
        db.insertTableContent('users', location, args, (succ, msg) => {
          // succ - boolean, tells if the call is successful
          //console.log("Success: " + succ);
          //console.log("Message: " + msg+" writing new job to vehicles.json from ipcMain on 'addNew'");
        });
      }
      cuWin.hide()
      cuWin = null
        
})
ipcMain.on('login-success',(event, args)=>{
    //console.log(args)
    if(args.role == 'admin'){
     win.webContents.send('show-admin-elements', args)
    }else{
        win.webContents.send('show-user-elements', args)
      
    }
    loginWin.hide()
})
ipcMain.on('get-users', (event, args)=>{
    let list = []
    db.getAll('users', location, (succ, data) =>{
        if(succ){
            for( let member in data){
                list.push(data[member])
            }
        }
        
    })
    event.returnValue = list
})


ipcMain.on('open-login-window', function(){
    createLoginWindow()
})

/********
 * communications regarding reports
 ********/
ipcMain.on('open-report-window',(event,args)=>{
    createReportWindow()
}) 

/********
 * ******
 * communications regarding calendar
 * ******
 ********/
ipcMain.on('open-calendar',(event,args)=>{
    createCalendarWindow()
   // calendarWin.webContents.send('load-calendar',args)
})  
ipcMain.on('get-scheduled', (event,args)=>{
    db.getAll('vehicles', location, (succ, data) =>{
        let list = []
        if(succ){
            for( let member in data){
                if(data[member].status =="sch")
                list.push(data[member])
            }
            //console.log(list)
        }
        event.returnValue = list
    })  
    
})

    
    