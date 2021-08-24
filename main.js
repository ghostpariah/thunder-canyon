
const electron = require('electron')
const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

const { serialize } = require('v8')
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require('constants')
const sqlite3 = require('sqlite3').verbose()
 
const location = path.join(__dirname, 'data')
const fileToOpen = path.join(__dirname, 'data','vehicles.json')
const users = path.join(__dirname, 'data', 'users.json')
const testDB = path.join(__dirname, 'data', 'workflow_app.db')
const white_board = path.join(__dirname, 'data', 'whiteBoardContent.txt')

let objCompanyList
let objList
let win 

let fsWait = false;
let loginWin
let contactWin
let reportsWin
let addJobWin
let calendarWindow
let cuWin
const date = new Date()
/*******
********
onload operations
**********
**********/
//parseString = require("xml2js").parseString;
//read();
//console.log(read())
app.on('ready',createMainWindow)
app.on('window-all-closed', ()=>{
    if(process.platform !== 'darwin'){
        app.quit()
    }
})
app.on('activate', () => {
    createMainWindow()
    
})

function createDatabase(file){
    var db = new sqlite3.Database(file);
    if(!fs.existsSync(file)){
      console.log("creating database file");
      fs.openSync(file, "w");
      db.run("CREATE TABLE users (username TEXT, password TEXT, email TEXT)", function(createResult){
        if(createResult) throw createResult;
      });
      
      console.log("database initialized");
    }
  
    return db;
  }

  function testWrite(args){
    //##### create autoconnected database object
      let dboContacts = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    
    //##### deleting example
    /*
    let id = 11
    dboContacts.run(`DELETE FROM jobs WHERE job_id=?`, id, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) deleted ${this.changes}`);
      });
      */
    /*
    //##### updating table example
    let data = ['Jackson Freight',2]
    let sql = `UPDATE customers
            SET customer_name = ?
            WHERE customer_ID = ?`;
    dboContacts.run(sql, data, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
        
        });
    */
    
    //##### selecting from table example
    
    //TODO: set up to pull job data from database instead of JSON file and load in objList
    let sql = //"SELECT * FROM jobs WHERE active = 1";
    //this pulls all job data from jobs plus customer name and contact name from customers and contacts
    `SELECT jobs.*, customers.customer_name, contacts.contact_ID, contacts.last_Name, phone_numbers.number, emails.email 
    FROM jobs 
    INNER JOIN customers ON jobs.customer_ID = customers.customer_ID 
    INNER JOIN contacts ON jobs.contact_ID = contacts.contact_ID 
    LEFT JOIN phone_numbers ON jobs.number_ID = phone_numbers.phone_ID
    LEFT JOIN emails ON jobs.email_ID = emails.email_ID WHERE  jobs.active = 1`;
    dboContacts.each(sql, [], (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        return row
          ? console.log(`job id: ${row.job_ID} -- ${row.number} -- ${row.email} -- ${row.last_name}`)
          : console.log(`No customer found`);
      
      });
      
    
    
    /*
    //##### inserting example

    //javascript object of properties to add to database
    let objData ={
        'customer_ID': 3,
        'contact_ID': 1,
        'status': 'sch',
        'job_type': 'alignment',
        'designation': 'scheduled'
    } 
    //assign an array of key/column names for sql statement from the javascript object
    let p = Object.keys(objData)

    //assign an array of key/column values for sql statement from the javascript object
    let v = Object.values(objData)

    console.log(Object.keys(objData).length)
    console.log(Object.keys(objData))

    //building placeholder for SQL based on amount of items in object
    let columnPlaceholders = p.map((col) => '?').join(',');
    
    let sql = `INSERT INTO jobs(${p}) VALUES(${columnPlaceholders})`;
    
    //inserting single item into one table
    dboContacts.run(sql,v, function(err){
        if(err){
            console.log(err.message)
        }
        console.log(`${this.changes} items inserted at row: ${this.lastID}`)
    }) 
    //end insert
    */
    dboContacts.close()
  }
  /**
   * user maintenance
   */
  ipcMain.on('get-users', (event, args)=>{
      console.log('get-users called')
    let dboUsers = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }        
    })
    let sql = `SELECT * FROM users WHERE active = 1`
        dboUsers.all(sql, [],function(err, row){
            if(err){
                console.log(err.message)
                return err
            }
            event.returnValue = row           
                       
        })
        dboUsers.close()
  })

  ipcMain.on('check-for-user', (event, args)=>{
      console.log('check-user called')
    let dboUser = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        } 
    })
    let userName = args.toUpperCase()
    let sql = `SELECT user_ID FROM users WHERE UPPER(user_name) = ?`
    dboUser.all(sql, [userName],function(err, row){
        if(err){
            console.log(err.message)
            return err
        }
        console.log(row.length)
        if(row.length>0){
            event.returnValue = true
        }else{
            event.returnValue = false
        }
                    
                    
    })
    dboUser.close()

  })

  ipcMain.on('create-user',(event,args)=>{
      console.log('create-user called')
    let dboUser = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        } 
    }) 
    let data = [args.user_name,args.role,1, args.password]
    let sql = 'INSERT INTO users(user_name,role,active,password) VALUES(?,?,?,?)'

    dboUser.run(sql, data, function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      });
      dboUser.close()
  })

  ipcMain.on('get-whiteboard', (event, args1, args2)=>{
    let d
    
    if(args1 == 'read'){
        d= fs.readFileSync(white_board, 'UTF-8',function (err, data) {
            if (err) console.log(err);
            return data
        });
        event.returnValue = d
        
    }
    if(args1 == 'write'){
        fs.writeFile(white_board, args2, function (err) { 
            if (err)
                console.log(err);
            else
                console.log('Write operation complete.');
                
                
        });
        if(win){
            win.webContents.send('whiteboard-updated')
        }
    }
      // fs.close()
  })
ipcMain.on('add-job', (event,args)=>{
    let objData =args

    let dboAddJob = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    //assign an array of key/column names for sql statement from the javascript object
    let p = Object.keys(objData)

    //assign an array of key/column values for sql statement from the javascript object
    let v = Object.values(objData)

    console.log(Object.keys(objData).length)
    console.log(Object.keys(objData))

    //building placeholder for SQL based on amount of items in object
    let columnPlaceholders = p.map((col) => '?').join(',');
    
    let sql = `INSERT INTO jobs(${p}) VALUES(${columnPlaceholders})`;
    
    //inserting single item into one table
    dboAddJob.run(sql,v, function(err){
        if(err){
            console.log(err.message)
        }else{
        let dboRefresh = new sqlite3.Database(testDB, (err)=>{
            if(err){
                console.error(err.message)
            }
            
        })
        let sql2 = `SELECT * FROM jobs WHERE active = 1 AND cancelled = 0`
        dboRefresh.all(sql2, [],function(err, row){
            if(err){
                console.log(err.message)
                return err
            }
            console.log(row)
           
            console.log(`${this.changes} items inserted at row: ${this.lastID}`)
            win.webContents.send('reload', row)
            dboAddJob.close()
            dboRefresh.close()
            addJobWin.close()
        })
    }
        
    }) 
    
    
    
})
function testDBcreation(){
    sdb = new sqlite3.Database(testDB, (err) => {
        if (err) {
          console.error(err.message);
        }
        
      });
      
    sdb.serialize(function() {
    sdb.run("CREATE TABLE company (company_name TEXT)");

    var stmt = sdb.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    // sdb.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
    // console.log(row.id + ": " + row.info);
    // });
    });

    sdb.close();
    
}
ipcMain.on('db-contact-add', (event,args)=>{
    
    let dboContacts = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
    })
    let new_contact_ID
    let item_ID
    dboContacts.serialize(function(){
        //add contact
        let objCon = new Object()
        let objPhone = new Object()
        let objEmail = new Object()
        objCon.first_name = args.first_name
        objCon.last_name = args.last_name
        objCon.customer_ID = args.customer_ID

        let p = Object.keys(objCon)
        let v = Object.values(objCon)

         

        let columnPlaceholders = p.map((col) => '?').join(',');

        
        let sql = `INSERT INTO contacts(${p}) VALUES(${columnPlaceholders})`;
        
        dboContacts.run(sql,v, function(err){
            if(err){
                console.log(err.message)
            }
            
            new_contact_ID = this.lastID
            console.log(`${this.changes} items inserted at row: ${this.lastID} of contacts`)
            objPhone.p_contact_ID = this.lastID
            objEmail.e_contact_ID = this.lastID

            console.log('listed first contacts in call back: new _contact_ID = '+new_contact_ID)
            
            if(args.number != null){
                objPhone.number = args.number
            
            p = Object.keys(objPhone)
            v = Object.values(objPhone)    
            columnPlaceholders = p.map((col) => '?').join(',');
            sql = `INSERT INTO phone_numbers(${p}) VALUES(${columnPlaceholders})`;    
            }else{
                
                v=0
                sql = 'SELECT * FROM phone_numbers WHERE phone_ID=?'
            }
            dboContacts.run(sql,v, function(err){
                if(err){
                    console.log(err.message)
                }
                
                item_ID =  this.lastID
                console.log(`${this.changes} items inserted at row: ${this.lastID} of phone_numbers`)
                console.log('listed second in phone_number call back: new _contact_ID = '+new_contact_ID)
                if(args.email !=null){
                    objEmail.email = args.email
                

                p = Object.keys(objEmail)
                v = Object.values(objEmail)
        
                columnPlaceholders = p.map((col) => '?').join(',');
                sql = `INSERT INTO emails(${p}) VALUES(${columnPlaceholders})`;    
                }else{
                    v=0
                    sql = 'SELECT * FROM emails WHERE email_ID =?'
                }
                dboContacts.run(sql,v, function(err){
                    if(err){
                        console.log(err.message)
                    }
                    
                    item_ID =  this.lastID
                    console.log(`${this.changes} items inserted at row: ${this.lastID} of emails`)
                    console.log('listed third in emails call back: new _contact_ID = '+new_contact_ID)
                    event.returnValue = item_ID
                }) 
                
    
            }) 
            
            dboContacts.close()
        })
       
         

        
        

        //add email
        
        //objEmail.contact_ID = new_contact_ID
       
        
    })
    console.log('4 new _contact_ID = '+new_contact_ID)
    
})

//watches for changes on JSON file and reloads page with changed file
 fs.watch(white_board, (event, filename) => {
    if (filename) {        
      if (fsWait) return;    
      fsWait = setTimeout(() => {
        fsWait = false;      
      }, 200);      
      //read();
      setTimeout(function() {
          win.webContents.send('whiteboard-updated')
      }, 50);      
    }
    console.log("fs watch triggered")
});


/********
 * functions
 ********/


ipcMain.on('pull-job',(event,args)=>{
    let dboPullJob = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let sql = `SELECT * FROM jobs WHERE job_ID = ?`
    let id = args
    dboPullJob.all(sql,[id],function (err,row){
        if(err){
            return err
        }else{
            
            event.returnValue = row
        }
        
    })
})
ipcMain.on('pull_jobs', (event,args)=>{
    let dboPullJobs = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let sql = `SELECT * FROM jobs WHERE active = 1 AND cancelled = 0`
    dboPullJobs.all(sql,function (err,row){
        if(err){
            return err
        }else{
            //console.log(row)
            event.returnValue = row
        }
        
    })
})

function read(){
    
     for (var member in objList) delete objList[member];          
      
     db.getRows('vehicles',location, {
         active: true
    
     }, (succ, result) => {
    
         objList = result;
     }) 
     testWrite()         
    
}

function editContact(){

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

/******
 *  function to retrieve company ID from customer table
 *  @param {string} args - company name
 * 
*/
function getID(args){
    let company_ID = ""
    db.search('customers', location, 'companyName', args, (succ, data) => {
        if (succ) {
            console.log(data)
            company_ID = data[0].id
        }else{
            company_ID = ""
        }
        
      });
      return company_ID
}
ipcMain.on('edit-location-drop',(event,args,)=>{
    
    let dboLocation = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    dboLocation.serialize(()=>{
        
        let p = Object.keys(args)

        //assign an array of key/column values for sql statement from the javascript object
        let v = Object.values(args)
    
        console.log(Object.keys(args).length)
        console.log(Object.keys(args))
        console.log(Object.values(args))
    
        //building placeholder for SQL based on amount of items in object
        let columnPlaceholders = p.join("=?, ")
        columnPlaceholders = columnPlaceholders+'=?'
        //console.log('columnPlaceholders = '+columnPlaceholders)
        //let columnPlaceholders = p.map((col) => '?').join(',');
        let sql = `UPDATE jobs SET status=?, shop_location=?, designation=?, date_in=? WHERE job_ID= ?`;
        
        let sql1 = `UPDATE jobs
                SET shop_location = ?,
                status = ?
                WHERE job_ID = ?`;
        let sql2 = `SELECT * FROM jobs WHERE job_ID = ${args.job_ID}`
        dboLocation.run(sql, v, function(err) {
            if (err) {
                return console.error(err.message);
            }

        }) 
        
        
        .all(sql2,function (err,row){
            if(err){
                console.log('first select'+err.message)
                return err
            }else{
                console.log(row)
                //console.log('second passed arg= '+id)
                //console.log(`Row(s) updated: ${this.changes}`);
                
                event.returnValue = row
            }
        })   
        dboLocation.close()
        
         
    })
})
ipcMain.on('edit-location',(event,args)=>{
    let dboLocation = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let data = [args.shop_location, args.job_ID]
    //console.log(data)
    let sql = `UPDATE jobs
            SET shop_location = ?
            WHERE job_ID = ?`;
    dboLocation.run(sql, data, function(err) {
        if (err) {
            return console.error(err.message);
        }
        
        console.log(`Row(s) updated: ${this.changes}`);
        dboLocation.close()
        });   
})
function edit(args){
    
    let where = {
        "id" : Number(args.id)       
        
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
        
        console.log("Success: " + succ);
        console.log("Message: " + msg);

      });
      
}
var announce = async function (f){
    console.log("from announce():" +JSON.stringify(f))
}
/*******
 * functions regarding contacts
 *******/

function getCustomerNames(){
    let custNameList = new Array()
    let x
    let dboContacts = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
     
        let r 
        let sql = `SELECT * FROM customers`
        dboContacts.all(sql,function (err,row){
            custNameList = row
            console.log("inside dboContacts.all "+custNameList)
        })
    /* 
        dboContacts.each(sql, [], function (err, row) {
            if (err) {
                return console.error(err.message);
            }
            custNameList.push(row)
            return await row
            ? console.log(row)
            : console.log(`No playlist found with the id `);
        }, function(){    
           announce(custNameList)
            console.log("inside"+custNameList+" row="+row)
            dboContacts.close()
      });
      */
    /*
    let key = 'companyName'
    let list =[]
    db.getAll('customers', location, (succ, data) => {
        if (succ) {
            for(member in data){
                list.push(data[member].companyName)                
            }          
          
        }else{console.log('failure')}
    }) 
    return list

    */
   //dboContacts.close()
    
    console.log("outside"+custNameList)

   return x

}
ipcMain.on('get-job', (event,args)=>{
    let dboJob = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let sql = `SELECT * FROM jobs WHERE job_ID = ${args}`
    dboJob.all(sql,function (err,row){
        if(err){
            console.log('first select'+err.message)
            return err
        }else{
            event.returnValue = row
        }
    })   
})
ipcMain.on('db-get-customer-name',(event, args)=>{
    console.log(args)
    let dboCustomerName = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    
    let sql = `SELECT customer_name FROM customers WHERE customer_ID = ?`
    dboCustomerName.all(sql,[args],function (err,row){
        if(err){
            console.log('first select'+err.message)
            return err
        }else{
            event.returnValue = row[0].customer_name
        }
    })

})
ipcMain.on('db-get-contact-name',(event, args1, args2)=>{
    
    let dboContactID = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let cmTable
    let cmColumn
    let cmID = args2
    if(args1 != null){
        if(args1 == 'phone'){
            cmTable = 'phone_numbers'
            cmColumn = 'phone_ID'
            secColumn = 'p_contact_ID'
            
        }else if(args1 == 'email'){
            cmTable = 'emails'
            cmColumn = 'email_ID'
            secColumn = 'e_contact_ID'
        }
    }
    
     
        
        let sql = `SELECT * FROM ${cmTable} WHERE ${cmColumn} = ${cmID}`
        dboContactID.all(sql,function (err,row1){
            if(err){
                console.log('first select'+err.message)
                return err
            }else{
                let dboContactName = new sqlite3.Database(testDB, (err)=>{
                    if(err){
                        console.error(err.message)
                    }
                    
                })
                let w
                let it
                
                if(cmTable == 'emails'){
                    w = row1[0].e_contact_ID
                    it = row1[0].email
                }else if(cmTable == 'phone_numbers'){
                    //console.log("712 error on load contact object = "+cmTable)
                    w = row1[0].p_contact_ID
                    it = row1[0].number
                }
                let sql2 = `SELECT * FROM contacts WHERE contact_ID = ${w}`
                //let name
                //let where = row1.contact_ID
                dboContactName.all(sql2, function (err,row2){
                    if(err){
                        console.log('second select '+err.message)
                        return err
                    }else{
                        //console.log(row2)
                        let contactInfo = new Object()
                        contactInfo.first_name = row2[0].first_name
                        contactInfo.last_name = row2[0].last_name
                        contactInfo.item = it
                        contactInfo.customer_ID = row2[0].customer_ID
                    //name = `${row2[0].first_name} ${row2[0].last_name}`
                    //console.log('contactInfo after fill'+contactInfo.item)
                    event.returnValue = contactInfo
                    dboContactID.close()

                    }
                })
                dboContactName.close()
            }
                
            
            
        })
            
        
})
function getContacts(comp){
    let c 
    console.log(comp)
    let dboContacts = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    //make sql query for dboContacts
    let sql = `SELECT * FROM customers`
    dboContacts.all(sql,[], function (err, row){
        if(err){
            return err
        }else{
            console.log("inside else of db.all"+row)
            event.returnValue = row
        }

    })
    /*
    db.getRows('customers', location,{        
        companyName: comp
      }, (succ, result) => {         
        
        if(succ){            
            c = result
        }
    }) 
    */  
    return c
}
/******* 
*create browser windows
********/



function createMainWindow(){
    
    win = new BrowserWindow({
        width: 1650,
        height: 900,        
        icon: path.join(__dirname, '/images/icon.png'),
        
        
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false,
            enableRemoteModule: true,

        }
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, '/pages/workflow.html'),
        protocol: 'file',
        slashes:true
    }))
    
    win.on('ready', ()=>{
        
       
       
    })
    
    win.on('closed', ()=>{
        win = null
    })
    win.once('ready-to-show', () => {
        win.webContents.send('load-page')
      })
    
    
}

function createEditWindow(args, args2){
    
    winEdit = new BrowserWindow({
        parent: win,
        width: 500,
        height: 950,
        autoHideMenuBar: true,
        modal: true,     
        icon: path.join(__dirname, '/images/icon.png'),
        
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false

        }
    })
    winEdit.loadURL(url.format({
        pathname: path.join(__dirname, '/pages/edit.html'),
        protocol: 'file',
        slashes:true
    }))
    
    winEdit.on('ready', ()=>{
        
       winEdit.webContents.focus()
       
    })
    winEdit.once('ready-to-show', () => {
        winEdit.show()
        win.preventDefault
        //attachDatePicker()
        
    })
    //winEdit.webContents.openDevTools()
    winEdit.webContents.focus()         
    winEdit.on('closed', ()=>{
        winEdit = null
    })
    winEdit.webContents.once('did-finish-load',()=>{
        winEdit.webContents.send('edit-data',args , args2)            
    })
   
    
    
    
}
function createLoginWindow(){
    
    loginWin = new BrowserWindow({
        parent: win,
        width: 425,
        height: 250,
        autoHideMenuBar: true,
        modal: true,
        icon: path.join(__dirname, '/images/icon.png'),
        
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false
            
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
       
       
    })
    
    loginWin.on('closed', ()=>{
        loginWin = null
    })
    //win.webContents.openDevTools()
    
    
    
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
                webSecurity: false,
                contextIsolation: false
    
            }
            
          })
          reportWin.loadURL(url.format({
            pathname: path.join(__dirname, '/pages/report.html'),
            protocol: 'file',
            slashes:true
        }))
        reportWin.once('ready-to-show', () => {
            //reportWin.show()
            //attachDatePicker()
            
          })

          reportWin.webContents.focus()
         
        
    
}
function createAddJobWindow(){
    addJobWin = new BrowserWindow({
            parent: win,
            modal: true,            
            width:570,
            height: 950,
            
            autoHideMenuBar: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                contextIsolation: false
    
            }
            
          })
          addJobWin.loadURL(url.format({
            pathname: path.join(__dirname, '/pages/addJob.html'),
            protocol: 'file',
            slashes:true
        }))
        addJobWin.once('ready-to-show', () => {
            addJobWin.show()
            win.preventDefault
            //attachDatePicker()
            
        })
        //addJobWin.webContents.openDevTools()
        addJobWin.webContents.focus()         
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
            webSecurity: false,
            contextIsolation: false

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
function createContactsWindow(args1, args2, args3, args4, args5,args6,args7){
    contactWin = new BrowserWindow({
            parent: win,
            modal: false,            
            width:525,
            height: 650,
            
            autoHideMenuBar: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                contextIsolation: false
    
            }
            
          })
          contactWin.loadURL(url.format({
            pathname: path.join(__dirname, '/pages/contacts.html'),
            protocol: 'file',
            slashes:true
        }))
        contactWin.once('ready-to-show', () => {
            //contactWin.webContents.openDevTools()
            contactWin.show()
            contactWin.preventDefault
            //attachDatePicker()
            
          })

        contactWin.webContents.focus()
         
        contactWin.webContents.once('did-finish-load',()=>{
            contactWin.webContents.send('name-chosen', args1, args2, args3, args4, args5,args6,args7)            
        })

        contactWin.on('closed', ()=>{
            contactsWin = null
        })
        
    
}
function createCalendarWindow(){
    calendarWin = new BrowserWindow({
            parent: win,
            modal: true,
            width:1140,
            height: 600,
            autoHideMenuBar: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                contextIsolation: false
    
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
         
         calendarWin.on('closed', ()=>{
            calendarWin = null
        })
       // calendarWin.webContents.openDevTools()
    
}
/*********
 * communications regarding vehicles.json
 *********/
ipcMain.on('close-window', (event,args)=>{
    let who = event.sender.getTitle()
    switch(who){
        case 'Edit Job':
            winEdit.close()
            break;
        case 'Add Job':
            addJobWin.close()
            break;
    }
})
ipcMain.on('delete-scheduled', (event,args)=>{
    let db = new sqlite3.Database(testDB, (err) => {
        if (err) {
          console.error(err.message);
        }
      });
      
      let id = args;
      // delete a row based on id
      db.run(`UPDATE jobs SET cancelled = 1  WHERE job_ID=?`, id, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) deleted ${this.changes}`);
      });
      
      // close the database connection
      db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
      });
})
ipcMain.on('close-add-window', (event,args)=>{
    addJobWin.close()
})
ipcMain.on('open-add-job',(event, args)=>{
    createAddJobWindow()
})
ipcMain.on('edit', (event, args)=>{    
    
    edit(args)  
     
});
ipcMain.on('message', (event)=>{
    
    event.sender.send('message',objList)
    
});
ipcMain.on('open-edit',(event,args, args2)=>{
    createEditWindow(args, args2)
})
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
   
    event.sender.send('reload', objList)
})


ipcMain.on('editLocation', (event, args1, args2, args3)=>{    
    
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
        
        event.returnValue = result

      })
})
ipcMain.on('getID', (event,args)=>{

    //read()    
    let newJobId = objList[objList.length-1].id;    
    event.returnValue = newJobId

})


ipcMain.on('getVehicle', (event,args)=>{
    
    db.getRows('vehicles', location, {
        "id" : Number(args)
        
      }, (succ, result) => {
        
        event.returnValue = result
      })
})


ipcMain.on('deactivate', (event,args)=>{

    let dboDeactivate = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    dboDeactivate.serialize(()=>{

    
    let sql = `UPDATE jobs SET active = 0 WHERE job_ID = ?`
    let sql2 = `SELECT * FROM jobs WHERE active = 1`

    dboDeactivate.run(sql,[args], function (err, row){
        if(err){
            return err
        }else{
            
            
        }


    })
    .all(sql2,[], function (err,row2){
        if(err){
            return err
        }else{
            
            event.returnValue = row2
        }
    })
})
})
/*****
 * ****
 * communication regarding company
 * ****
 */




/********
 * ******
 * communications regarding contacts
 * ******
 ********/
ipcMain.on('test-dit', (event, args)=>{
    console.log("hello darlin' it's been a long time")
    console.log(args)
    //console.log(args)
    let contact
    let phone_number
    let emails
    db.getRows('customers', location, {
        
        
        "id": Number(args.companyID),
        
        //"contacts": {"contactID": args.contactID}
        
        
    }, (succ, result)=>{
        
        if(succ){
            
            result[0].contacts[args.position].phoneNumbers[0].number = "(616) 666-6677"
            console.log(result[0].contacts[args.position].phoneNumbers[0].number)
        
         } 
        
    }) 
    
    console.log("test-dit args.contactID::"+args.contactID)
    
   
    let where = {
         
           
        "contactID" : Number(args.contactID)
        
    
    }
    
    let set = {
     "customers" : [
        {"contacts" : [
    {"phoneNumbers" : [
        {"number": "edited"}
    ]}
]
}]
}

    db.updateRow('customers',location, where, set, (succ, msg) => {
    // succ - boolean, tells if the call is successful
        console.log("test dit Success: " + succ);
        console.log("trst dit Message: " + msg);
    }); 
    //console.log(testC.phoneNumbers[args.numberPosition])
     
})
function lookup(obj, k) {
    for (var key in obj) {
      var value = obj[key];
  
      if (k == key) {
        return [k, value];
      }
  
      if (typeof(value) === "object" && !Array.isArray(value)) {
        var y = lookup(value, k);
        if (y && y[0] == k) return y;
      }
      if (Array.isArray(value)) {
        // for..in doesn't work the way you want on arrays in some browsers
        //
        for (var i = 0; i < value.length; ++i) {
          var x = lookup(value[i], k);
          if (x && x[0] == k) return x;
        }
      }
    }
  
    return null;
  }
ipcMain.on('test-edit', (event, args)=>{
    console.log(args)
    db.getRows('customers', location, {
        id: args.companyID
        //contacts:[{contactID:args.contactID}]
        
    }, (succ, result)=>{
        //console.log("when editing the result is "+succ +"result-- "+JSON.stringify(result[0].contacts[args.position]))
        console.log(succ+" "+result)
        if(succ){
            company=result
        }    
    }) 
    let compCons = company[0].contacts
    for(c in compCons){
        if(compCons[c].contactID == args.contactID){
            console.log("when editing the result is "+compCons[c].phoneNumbers[args.position].number)
            compCons[c].phoneNumbers[args.position].number = args.phoneNumber
            console.log("when editing the result is "+compCons[c].phoneNumbers[args.position].number)
        }
    }  
    let where = {
        "id" : company[0].id
        
    }
    
    let set = {
        "contacts" : compCons        
    } 

db.updateRow('customers',location, where, set, (succ, msg) => {
    // succ - boolean, tells if the call is successful
    console.log("Success: " + succ);
    console.log("Message: " + msg);
  }); 

})


ipcMain.on('edit-contact', (event,args)=>{
    console.log('edit-contact triggered ' + args)
    //  variable to load customer object for manipulation
    let company
    
    //  electron-db function to pull data
    if(args.id || args.companyID){
    db.getRows('customers', location, {
        id :args.id
        
        //id : args.companyID
        //companyName: args.companyName
    }, (succ, result)=>{
        console.log("when editing the result is "+succ +"result-- "+result[0].companyName)
        if(succ){
            company=result
        }    
    })


    
    /*********************************************
     * the following if statement checks to see if there are contacts for the company
     *  
    *********************************************/
   if(typeof(company[0].contacts != "undefined")){
    //if(company[0].contacts){
        //console.log(args2)
        console.log(args.phoneNumber)
            /*********************************************
             * the following if statement checks to see if an existing contact is getting a number/email added
             * 
            *********************************************/
        for(i in company[0].contacts){
              if(company[0].contacts[i].contactID == args.contactID){
                
                //insert first name if name has changed
                if(args.firstname){
                    company[0].contacts[i].firstname = args.firstname
                }
                /*
                if(company[0].contacts[i].firstname != args.firstname){
                    company[0].contacts[i].firstname = args.firstname                    
                }
                */
                //insert last name if name has changed
                if(args.lastname){
                    company[0].contacts[i].lastname = args.lastname
                }
                /*
                if(company[0].contacts[i].lastname != args.lastname){
                    company[0].contacts[i].lastname = args.lastname
                }
                */
                //insert new number into object
                if(args.phoneNumber && args.phoneNumber != ""){
                    if(!company[0].contacts[i].phoneNumbers){
                        company[0].contacts[i].phoneNumbers = []
                    }
                    company[0].contacts[i].phoneNumbers.push({
                    "number": args.phoneNumber
                    })
                }
                //insert new email into object
                if(args.email && args.email != ""){
                    if(!company[0].contacts[i].emails){                   
                        company[0].contacts[0].emails = []
                    }
                    company[0].contacts[i].emails.push({"email": args.email})                                    
                }              
                break;
                
             }
        }
        
    }
    
        let where = {
            "id" : company[0].id
            //"id" : args.companyID
        }
               
            
        
       // let where = {
       //     "companyName" : args.companyName       
       // };
        
        let set = {
            "contacts" : company[0].contacts        
        } 

    db.updateRow('customers',location, where, set, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        console.log("Success: " + succ);
        console.log("Message: " + msg);
      }); 
      //contactWin.hide()
      //contactWin = null
      addJobWin.webContents.send('refresh', args)
      addJobWin.focus()
    
    }
    
})
ipcMain.on('add-new-customer', (event,args)=>{
    let dboCustomer = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    sql = `INSERT INTO customers(customer_name) VALUES (?)`
    dboCustomer.run(sql,args, function(err){
        if(err){
            console.log(err.message)
        }
        event.returnValue = this.lastID
        console.log(`${this.changes} items inserted at row: ${this.lastID}`)
    }) 
    dboCustomer.close()
})
ipcMain.on('add-new-contact', (event, args1, args2) =>{
    let company_ID = args1
    let objContact = args2

    db.getRows('customers', location, {
        "id" : company_ID
        
      }, (succ, result) => {
          
        console.log(result)
        objCompany = result

      })
    let reformatted = new Object()
        reformatted.lastname = args2.lastname
        reformatted.firstname = args2.firstname
        if(args2.phoneNumber){
            reformatted.phoneNumbers =[{'number' : args2.phoneNumber}]
        }
        if(args2.email){
            reformatted.emails = [{"email" :args2.email}]
        }
        reformatted.contactID = args2.contactID
        
            
        objCompany[0].contacts.push(reformatted)
        let set = {"contacts": objCompany[0].contacts}

        let where = {
            "id" : args1        
          };

          db.updateRow('customers',location, where, set, (succ, msg) => {
            // succ - boolean, tells if the call is successful
            console.log("Success: " + succ);
            console.log("Message: " + msg);
          });
          addJobWin.webContents.send('refresh', args2.contactID) 
})
ipcMain.on('add-contact',(event,args1,args2, args3)=>{
    let objCompany
    let set
    let isNew = args3
    console.log('add-contact triggered '+ args1+" "+args2+" "+args3)
    db.getRows('customers', location, {
        "companyName" : args1
        
      }, (succ, result) => {
          
       console.log(result)
        objCompany = result
        //console.log(result[0].jobs[0].jobID)

      })
      if(isNew){
          //send object to add job window to add to the new company object that doesnt exist yet
          addJobWin.webContents.send('new-contact-for-new-company',args2)
            console.log('send object to addjob window')
      }else{
        if(objCompany[0].contacts){
            console.log('adding contact to existing contact array')
            let reformatted = new Object()
            reformatted.lastname = args2.lastname
            reformatted.firstname = args2.firstname
            if(args2.phoneNumber){
                reformatted.phoneNumbers =[{'number' : args2.phoneNumber}]
            }
            if(args2.email){
                reformatted.emails = [{"email" :args2.email}]
            }
            reformatted.contactID = args2.contactID
            
             
            objCompany[0].contacts.push(reformatted)
            set = {"contacts": objCompany[0].contacts}
        }else{
            console.log("adding contact array and new contact")
            let reformatted = new Object()
            reformatted.lastname = args2.lastname
            reformatted.firstname = args2.firstname
            if(args2.phoneNumber){
                reformatted.phoneNumbers =[{'number' : args2.phoneNumber}]
            }
            if(args2.email){
                reformatted.emails = [{"email" :args2.email}]
            }
            //reformatted.contactID = date.getTime()
            reformatted.contactID = args2.contactID
            let contacts = {
                "contacts":[
                    reformatted
                ]
            }
            objCompany.push(contacts)
            set = contacts
        } 
     //objCompany[0].contacts.push(args2)
      
     // console.log(JSON.stringify(objCompany))
      let where = {
        "companyName" : args1        
      };
    // let set = {
    //     "contacts" : objCompany[0].contacts
       
    // } 
    db.updateRow('customers',location, where, set, (succ, msg) => {
        // succ - boolean, tells if the call is successful
        console.log("Success: " + succ);
        console.log("Message: " + msg);
      });  
    }
    if(addJobWin){
    contactWin.hide()
    contactWin = null
    addJobWin.webContents.send('refresh', args2.contactID)
    }
})

ipcMain.on('get-company-id', (event, args)=>{

    let compID = getID(args)    
    event.returnValue = compID    
        
})






/*used to pull names for dropdown datalist of names when adding jobs or contacts*/
ipcMain.on('get-customer-names', (event,args)=>{
    //create database object that autoconnects to database
    let dboCustomers = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    //make sql query for dboContacts
    let sql = `SELECT * FROM customers`
    dboCustomers.all(sql,[], function (err, row){
        if(err){
            return err
        }else{
            console.log("inside else of db.all"+row)
            event.returnValue = row
        }

    })

    //event.returnValue = getCustomerNames()
        
})
ipcMain.on('refresh-add-page', (event,args,args2)=>{
    //addJobWin.webContents.focus()
    addJobWin.webContents.send('refresh', args,args2)
    addJobWin.show()
    contactWin.close()
    contactWin = null
    
    
    
})
let r
let dbCallBack = (data)=>{
    r = data[0].customer_ID
    return data[0].customer_ID
}
ipcMain.on('get-customer-ID', (event,args)=>{
    let dboCustomers = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    var data = []
    //make sql query for dboContacts
    let sql = `SELECT customer_ID FROM customers WHERE UPPER(customer_name) =?`
    
    dboCustomers.all(sql,args.toUpperCase(), function (err, row){
        
        if(err){
            return err
        }
            console.log(row)
            if(row.length>0){
            event.returnValue =row[0].customer_ID
            }else{
                event.returnValue = false
            }
            //return row[0].customer_ID
            
            
        

    })
})
let getCustomerID = (name)=>{
    let dboCustomers = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    var data = []
    //make sql query for dboContacts
    let sql = `SELECT customer_ID FROM customers WHERE UPPER(customer_name) =?`
    
    dboCustomers.all(sql,name.toUpperCase(), function (err, row){
        
        if(err){
            return err
        }
            console.log(row)
            dbCallBack(row)
            return row[0].customer_ID
            
        
        

    })
      
}
ipcMain.on('open-contacts', (event,args1,args2, args3, args4, args5, args6, args7)=>{
    //test to see which page launched the contacts page
    //right now the options are 'add job page' from addJob.js and 'main page' from index.js
    if(args1 == 'add job page'){
        let dboCustomers = new sqlite3.Database(testDB, (err)=>{
            if(err){
                console.error(err.message)
            }
            console.log(args2)
        })
        var data = []
        //make sql query for dboContacts
        let sql = `SELECT customer_ID FROM customers WHERE UPPER(customer_name) =?`
        
        dboCustomers.all(sql,args2.toUpperCase(), function (err, row){
            
            if(err){
                return err
            }
            
            createContactsWindow(args1,args2, args3, args4,args5,row[0].customer_ID,args7)        
   
                return row[0].customer_ID
                
            
            
    
        })
       
    }
    setTimeout(() => {
        console.log(`${args1} ${args2} ${args3} ${args4} ${args5} ${r} ${args7}`)
       
    },40);
         createContactsWindow(args1,args2, args3, args4,args5,args6,args7)        
    //}else{
    //    createContactsWindow()        
    //}
})

ipcMain.on('update-job',(event,args)=>{
    let k = Object.keys(args)
    let v = Object.values(args)
    let arrC = new Array()
    let arrV = new Array()
    let strColumns 
    let strValues 
    for(i=1;i<k.length;i++){
            //let val = (v[i] == '')? null : "'"+ v[i]+"'";
            arrC.push(`${k[i]}='${v[i]}'`)
            arrV.push(v[i])
    }
    if(arrC.length > 1){
    strColumns = arrC.join(',')
    }else{
        strColumns = arrC[0]
    }
    if(arrV.length > 1){
    strValues = arrV.join(',')
    }else{
        strValues =arrV[0]
    }
    console.log('columns= '+strColumns + ' '+ args.job_ID)
    console.log('values= '+strValues)

    let dboUpdate = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let pull = `SELECT * FROM jobs WHERE active = 1 AND cancelled = 0`
    let sql = `UPDATE jobs SET ${strColumns} WHERE job_ID = ${args.job_ID}`
    console.log(sql)
    dboUpdate.serialize(()=>{
        dboUpdate.run(sql, function(err,row) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Row(s) updated: ${this.changes}${row}`);

            
        })
        .all(pull, [], (err,row)=>{
            if(err){
            return console.error(err.message);
            }else{
                switch(event.sender.getTitle()){
                    case 'Edit Job' :
                        winEdit.close()
                        break;
                    case 'Frame & Spring':
                        console.log('triggered by main page');
                        break;
                    default:
                        break;
                }
                win.webContents.send('update',row)
                
            }
        }) 

        dboUpdate.close()
    });
})
ipcMain.on('move', (event, args)=>{
    console.log(event.sender.getTitle())
    switch(event.sender.getTtitle()){
        case 'Edit Job':
            winEdit.close();
            break;
        default:
            break;
    }
    //console.log('processId is '+event.processId +', frameid is '+event.frameId)
})
ipcMain.on('pass-contact', (event,args, args2)=>{
    
    console.log('in pass-contact'+args)
    winEdit.webContents.send('contacts-updated',args, args2)
    contactWin.close()
})
ipcMain.on('get-contacts', (event, args)=>{
    console.log('on(get-contacts'+args)
    let insertCount = 0
    if(args != undefined){
        let dboContacts = new sqlite3.Database(testDB, (err)=>{
            if(err){
                console.error(err.message)
            }
            
        })
        dboContacts.serialize(function(){
        //make sql query for dboContacts
        let sql = `SELECT DISTINCT contacts.*, phone_numbers.phone_ID, phone_numbers.number, emails.email_ID, emails.email
        FROM contacts 
        LEFT JOIN phone_numbers ON contacts.contact_ID = phone_numbers.p_contact_ID
        LEFT JOIN emails ON contacts.contact_ID = emails.e_contact_ID        
        WHERE contacts.customer_ID=${args}`;
        let sqltest = `SELECT * FROM contacts WHERE customer_ID = ${args}
        UNION 
        SELECT * FROM contacts, phone_numbers WHERE p_contact_ID = contacts.contact_ID
        UNION
        SELECT * FROM contacts, emails WHERE e_contact_ID = contacts.contact_ID`
        let sql1 = `SELECT * FROM contacts WHERE customer_ID=${args}`
        console.log("before select query")
            dboContacts.all(sql1,[], function (err, row){
                if(err){
                    console.log(err)
                    return err
                }else{
                    console.log("contacts table query result: "+JSON.stringify(row) +row.length)
                    if(row.length>0){
                    for(let member in row){
                    let sql2 = `SELECT * FROM phone_numbers WHERE EXISTS (SELECT p_contact_ID FROM phone_numbers) AND p_contact_ID = ${row[member].contact_ID}`
                        dboContacts.all(sql2,[], function (err, row2){
                            if(err){
                                console.log(err)
                                return err
                            }else{
                                //console.log("phone# query results "+JSON.stringify(row2))
                            
                                let sql3 = `SELECT * FROM emails WHERE EXISTS (SELECT e_contact_ID FROM emails) AND e_contact_ID = ${row[member].contact_ID}`
                                dboContacts.all(sql3,[], function (err, row3){
                                    if(err){
                                        console.log(err)
                                        return err
                                    }else{
                                        
                                        //console.log(member+" email address query results "+JSON.stringify(row3))
                                            if(row2.length){
                                                row[member].phonenumbers = row2
                                            }
                                            if(row3.length){
                                                row[member].emails = row3
                                            }
                                            let packagedData = new Array()
                                            packagedData = row
                                            insertCount++
                                            //console.log(insertCount+" "+row.length)
                                            //console.log('after inserting phone object'+JSON.stringify(row[member]))
                                            if(insertCount==row.length){

                                                //console.log(JSON.stringify(row))
                                                 
                                                event.returnValue = row
                                                
                                            
                                            event.sender.send('dbResponse', row)
                                            dboContacts.close()
                                            }
                                        
                                    }
                            
                                }) 
                                
                            }   
            
                            
                        
                
                        })//end second .all
                    }//end for loop
                    }else{
                        event.returnValue = false
                    }
                }//end second .all else phone
        
            })//end first .all    
        })//end serialize
    }//end main if
    /*else{
        event.returnValue = true
    }*/
})
ipcMain.on('edit-phone', (event,args)=>{
    let dboPhone = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let data = [args.text, args.id]
    console.log(data)
    let sql = `UPDATE phone_numbers
            SET number = ?
            WHERE phone_ID = ?`;
    dboPhone.run(sql, data, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
        dboPhone.close()
        });   
})

ipcMain.on('edit-email', (event,args)=>{
    let dboEmail = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let data = [args.text, args.id]
    console.log(data)
    let sql = `UPDATE emails
            SET email = ?
            WHERE email_ID = ?`;
    dboEmail.run(sql, data, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
        dboEmail.close()
        });   
})
ipcMain.on('edit-contact-name', (event,args)=>{
    let dboCN = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let data = [args.fn, args.ln,args.cid]
    console.log(data)
    let sql = `UPDATE contacts
            SET first_name = ?,
            last_name = ?
            WHERE contact_ID = ?`;
    dboCN.run(sql, data, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
        dboCN.close()
        });   
})
ipcMain.on('add-phone', (event,args)=>{
    let dboNewPhone = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let objAdd = new Object()
    objAdd.p_contact_ID = args.contact_ID
    objAdd.number = args.text
     //assign an array of key/column names for sql statement from the javascript object
     let p = Object.keys(objAdd)

     //assign an array of key/column values for sql statement from the javascript object
     let v = Object.values(objAdd)
 
     console.log(Object.keys(objAdd).length)
     console.log(Object.keys(objAdd))
 
     //building placeholder for SQL based on amount of items in object
     let columnPlaceholders = p.map((col) => '?').join(',');
     
     let sql = `INSERT INTO phone_numbers(${p}) VALUES(${columnPlaceholders})`;
     
     //inserting single item into one table
     dboNewPhone.run(sql,v, function(err){
         if(err){
             console.log(err.message)
         }
         console.log(`${this.changes} items inserted at row: ${this.lastID}`)
         dboNewPhone.close()
        }) 
     //end insert
    
         
})
ipcMain.on('add-email', (event,args)=>{
    let dboNewEmail = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let objAdd = new Object()
    objAdd.e_contact_ID = args.contact_ID
    objAdd.email = args.text
     //assign an array of key/column names for sql statement from the javascript object
     let p = Object.keys(objAdd)

     //assign an array of key/column values for sql statement from the javascript object
     let v = Object.values(objAdd)
 
     console.log(Object.keys(objAdd).length)
     console.log(Object.keys(objAdd))
 
     //building placeholder for SQL based on amount of items in object
     let columnPlaceholders = p.map((col) => '?').join(',');
     
     let sql = `INSERT INTO emails(${p}) VALUES(${columnPlaceholders})`;
     
     //inserting single item into one table
     dboNewEmail.run(sql,v, function(err){
         if(err){
             console.log(err.message)
         }
         console.log(`${this.changes} items inserted at row: ${this.lastID}`)
         dboNewEmail.close()
        }) 
     //end insert
    
         
})
ipcMain.on('delete-item', (event,args)=>{
    let dboDelPhone = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let sql
    let id
    console.log(args.method)
    if(args.method == 'p'){
        sql = `DELETE FROM phone_numbers WHERE phone_ID=?`
    }
    if(args.method == 'e'){
        sql = `DELETE FROM emails WHERE email_ID=?`
    }
    if(args.method =='c'){
        sql = `DELETE FROM contacts WHERE contact_ID=?`
        sql2 = `DELETE FROM phone_numbers WHERE p_contact_ID=?`
        sql3 = `DELETE FROM emails WHERE e_contact_ID=?`
        id = args.contact_ID

        dboDelPhone.run(sql2, id, function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log(`Row(s) deleted ${this.changes}`);
    
            
          }); 
          dboDelPhone.run(sql3, id, function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log(`Row(s) deleted ${this.changes}`);
    
            
          });    
    }else{
    id = args.methodID
    }
    dboDelPhone.run(sql, id, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) deleted ${this.changes}`);
        
        
      });
      
})

/************
 * communications regarding users and login
 ************/
ipcMain.on('open-create-user', (event,args)=>{
    createCreateUserWindow()
})


ipcMain.on('login-success',(event, args)=>{
    //console.log(args)
    if(args.role == 'admin'){
     win.webContents.send('show-admin-elements', args)
    }else{
        win.webContents.send('show-user-elements', args)
      
    }
    loginWin.hide()
    loginWin.close()
    loginWin = null
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


    
    