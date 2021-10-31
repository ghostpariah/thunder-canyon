
const electron = require('electron')
const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

const { serialize } = require('v8')
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require('constants')
const { get } = require('https')
const { resolve } = require('path')
const sqlite3 = require('sqlite3').verbose()
 
const location = path.join(__dirname, 'data')

const fileToOpen = path.join(__dirname, 'data','vehicles.json')
const users = path.join(__dirname, 'data', 'users.json')
const testDB = path.join(__dirname, 'data', 'workflow_app.db')
const white_board = path.join(__dirname, 'data', 'whiteBoardContent.txt')


const date = new Date()
const m= date.getMonth()+1
const d = date.getDate()
const y = date.getFullYear()
const strToday = `${m}/${d}/${y}`
const dayOfYear = date =>
    Math.floor((date - new Date(date.getFullYear(),0 ,0)) / (1000 * 60 * 60 * 24));
let today = dayOfYear(new Date()); 
const appStartDay = today

//console.log(`${m}/${d}/${y} ${today}`)
const logArchive = path.join(__dirname, `data/logs/${y}/${today}/`)

const logLocation = path.join(__dirname, `data/logs/`)
const broadcaster = path.join(__dirname, 'data/logs', `activityLog${today}.txt`)
const errorLog = path.join(__dirname, 'data/logs', `errorLog${today}.txt`)
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
var checkDate
/*******
********
onload operations
**********
**********/


app.on('ready', ()=>{

    // prompt restart if app was left open on previous day
    //TODO: change increment to every hour instead of every 5 seconds
    checkDate = setInterval(function (){
        let currentDay = dayOfYear(new Date());
        (appStartDay == currentDay) ? console.log(`app opened today ${currentDay}`) : restartApp();
    }, 3600000)
    
    

    // ready the files. create folder for year and day if it doesn't exist and then
    // copy log files to the directory and empty the daily logs

    //check if logs/ directory is empty

    // create activityLog and archive folders if activityLog doesn't exist (this
    // means the app is opened for the first time)


    

    console.log(isLeapYear(y))

    console.log('app started')
    fs.readdir(logLocation, function(err, data) {
        if (data.length == 0) {
            console.log("Directory is empty!");
            // create activity log
            fs.closeSync(fs.openSync(broadcaster,'w'))
            // create error log
            fs.closeSync(fs.openSync(errorLog,'w'))
            //create archive folder for today
            fs.mkdirSync(logArchive, {
                recursive: true
            });  

        } else {
            console.log("Directory is not empty!");
            let needsActivityLog = true
            let needsErrorLog = true
            let doy
            let oldPath
            let newPath
            // iterate through items in logs folder
            data.forEach(file => {
                // if item is a file and not year directory i.e. 2021
                if(file.length>4){
                    doy = file.substr(file.indexOf('g')+1,3)
                    
                    console.log(doy)
                    if(file.includes(`activityLog${today}`)){
                        
                        needsActivityLog = false
                    }
                    if(file.includes(`errorLog${today}`)){
                        needsErrorLog = false
                    }
                    if(doy != today){
                     let lastDay = (isLeapYear(y)) ? 366 : 365   
                        switch(file.substr(0,1)){
                            case 'a':
                                oldALogPath = path.join(__dirname, 'data/logs', `activityLog${doy}.txt`)
                                if(doy == "365" || doy =="366"){
                                    if (!fs.existsSync(`${logLocation}${y-1}/${doy}/`)){ 
                                        fs.mkdirSync(`${logLocation}${y-1}/${doy}/`, {
                                            recursive: true
                                        });  
                                    }
                                    newALogPath = path.join(__dirname, `data/logs/${y-1}/${doy}/activityLog.txt`)                                                               
                                }else{
                                    if (!fs.existsSync(`${logLocation}${y}/${doy}/`)){ 
                                        fs.mkdirSync(`${logLocation}${y}/${doy}/`, {
                                            recursive: true
                                        });  
                                    }
                                    newALogPath = path.join(__dirname, `data/logs/${y}/${doy}/activityLog.txt`)                                    
                                }
                                fs.rename(oldALogPath, newALogPath, function (err) {
                                    if (err) throw err
                                    console.log('Successfully moved to '+newALogPath)
                                })
                                break;
                            case 'e':
                                oldELogPath = path.join(__dirname, 'data/logs', `errorLog${doy}.txt`)
                                if(doy == lastDay){
                                    if (!fs.existsSync(`${logLocation}${y-1}/${doy}/`)){ 
                                        fs.mkdirSync(`${logLocation}${y-1}/${doy}/`, {
                                            recursive: true
                                        });  
                                    }                                   
                                    newELogPath = path.join(__dirname, `data/logs/${y-1}/${doy}/errorLog.txt`)                           
                                }else{
                                    if (!fs.existsSync(`${logLocation}${y}/${doy}/`)){ 
                                        fs.mkdirSync(`${logLocation}${y}/${doy}/`, {
                                            recursive: true
                                        });  
                                    }                                     
                                    newELogPath = path.join(__dirname, `data/logs/${y}/${doy}/errorLog.txt`)
                                }
                                fs.rename(oldELogPath, newELogPath, function (err) {
                                    if (err){ 
                                        console.log(err)
                                    }else{
                                        console.log('Successfully moved to '+newELogPath)
                                    }
                                    
                                })
                                break;
                            default:
                                break;
                        }
                        
                        
                        
                        
                        
                       
                    }

                }
                
                
            });

            if(needsActivityLog){
                fs.closeSync(fs.openSync(broadcaster,'w'))
            }
            if(needsErrorLog){
                fs.closeSync(fs.openSync(errorLog,'w'))
            }
        
            if (!fs.existsSync(logArchive)){ 
                fs.mkdirSync(logArchive, {
                    recursive: true
                });  
            }
        }
        //watch file for changes
    fs.watch(broadcaster, (event, filename) => {
    
        if (filename) {        
          if (fsWait) return;    
          fsWait = setTimeout(() => {
            fsWait = false;      
          }, 5);      
          
          setTimeout(function() {
              console.log(' fs watch triggered. Log file changed')
              win.webContents.send('update')
          }, 5);      
        }
        
    });
    })
    
   
    
    
        // if (fs.existsSync(logArchive)){             
                
        //         fs.copyFile(broadcaster, logArchive+'activityLog.txt', fs.constants.COPYFILE_EXC, (err)=>{
        //             if (err) {
        //                 console.log("Error Found:", err);
        //             }
        //             else {
        //                 console.log('File copied to '+logArchive)
        //                 fs.truncate(broadcaster,()=>{
        //                     console.log('Activity Log archived and emptied')
        //                 })
        //             }
        //         });
            
            
        //         fs.copyFile(errorLog, logArchive+'errorLog.txt', fs.constants.COPYFILE_EXC, (err)=>{
        //             if (err) {
        //                 console.log("Error Found:", err);
        //             }
        //             else {
        //                 console.log('File copied to '+logArchive)
        //                 fs.truncate(errorLog,()=>{
        //                     console.log('Error Log archived and emptied')
        //                 })
        //             }
        //         });
            
        // }else{
        //     fs.mkdirSync(logArchive, {
        //         recursive: true
        //     });    
        // }
   

    
    //launch app by creating the main window
    createMainWindow();
})
app.on('window-all-closed', ()=>{
    if(process.platform !== 'darwin'){
        app.quit()
    }
})
app.on('activate', () => {
    createMainWindow()
    
})

function restartApp(){
    console.log('restarting app');
    clearInterval(checkDate);
    app.relaunch();
    app.quit();
}
function isLeapYear(year) {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}
    
    //TODO: change name of file and function to logging references like (logChange()).
    //use fs.createWriteStream
    
    async function logActivity(args1, args2){

        const log = fs.createWriteStream(broadcaster, { flags: 'a' });      
        
        let action = args1
        let logEvent
        let k = Object.keys(args2)
        let v = Object.values(args2)
        let change =""
        let timeStamp = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
       
        
       
       
        
            
       
        switch(action){
            case 'moved':
                logEvent = `USERID:${args2.user.user_ID} USERNAME:${args2.user.user_name} ACTION:Moved JOBID:${args2.job_ID} TO LOCATION:${args2.shop_location} AT:${timeStamp}\n`
                break;
            case 'added':
                for(i=0;i<k.length;i++){
                    if(k[i] != 'job_ID' && k[i]!= 'user_ID' && k[i]!= 'user' && k[i]!= 'customer_ID'){
                        
                        change+= `${k[i]}:${v[i]}, `
                    }
                }
                logEvent = `USERID:${args2.user.user_ID} USERNAME:${args2.user.user_name} CUSTOMERID:${args2.customer_ID} ACTION:Added  JOBID:${args2.job_ID} ${change} AT:${timeStamp}\n`
                break;
            case 'edited':
                for(i=0;i<k.length;i++){
                    if(k[i] != 'job_ID' && k[i]!= 'user_ID' && k[i]!= 'user'){
                        
                        change+= `CHANGED:${k[i]} TO:${v[i]}, `
                    }
                }
                logEvent = `USERID:${args2.user.user_ID} USERNAME:${args2.user.user_name} ACTION:Edited JOBID:${args2.job_ID} ${change} AT:${timeStamp}\n`
                break;
            case 'delete':
                logEvent = `USERID:${args2.user.user_ID} USERNAME:${args2.user.user_name} ACTION:Deactivated JOBID:${args2.job_ID} AT:${timeStamp}\n`
                break;
                default:
                    break;
        }
       
        
       log.write(logEvent)
       log.close()
    
       
    }
    async function getUserName(args){
        
        let result = 'b'
        
        let dboUsers = new sqlite3.Database(testDB, (err)=>{
            if(err){
                console.error(err.message)
            }        
        })
        let sql = `SELECT user_name FROM users WHERE user_ID = ${args}`
            dboUsers.all(sql, [],function(err, row){
                if(err){
                    console.log(err.message)
                    return err
                }
                console.log(row)
                
               return row
                       
                           
            })
            dboUsers.close()
           // return result
    }
    async function pullUserName(args){
        let result = await getUserName(args)
        console.log(result)
        return result
    }
   
    function logError(args1, args2){

        const log = fs.createWriteStream(errorLog, { flags: 'a' });      
        
        let action = args1
        let logEvent
        
        switch(action){
            case 'moved':
                logEvent = `USERID:${args2.user_ID} ACTION:Moved JOBID:${args2.job_ID} TOLOCATION:${args2.shop_location} \n`
                break;
            case 'added':
                logEvent = `USERID:${args2.user_ID} ACTION:Added JOBID:${args2.job_ID} \n`
                break;
            case 'edited':
                logEvent = `USERID:${args2.user_ID} ACTION:Edited JOBID:${args2.job_ID} \n`
                break;
            case 'delete':
                logEvent = `USERID:${args2.user_ID} ACTION:Deactivated JOBID:${args2.job_ID} \n`
                break;
                default:
                    break;
        }
       
        
       log.write(logEvent)
       log.close()
       
    }

  
  /**
   * user maintenance
   */
  ipcMain.on('get-users', (event, args)=>{
      
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
  //TODO: if user exists add option to make user active again
  ipcMain.on('check-for-user', (event, args)=>{
      
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
        
        if(row.length>0){
            event.returnValue = true
        }else{
            event.returnValue = false
        }
                    
                    
    })
    dboUser.close()

  })

  ipcMain.on('create-user',(event,args)=>{
      
    let dboUser = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        } 
    }) 
    let data = [args.user_name,args.role,1, args.password]
    let sql = 'INSERT INTO users(user_name,role,active,password) VALUES(?,?,?,?)'
    let sql2 = `SELECT *FROM users WHERE active=1`
    dboUser.serialize(()=>{
    dboUser.run(sql, data, function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      })
      .all(sql2,function (err,row){
        if(err){
            console.log('first select'+err.message)
            return err
        }else{
           
            
            event.returnValue = row
        }
    })   

      
    })
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
ipcMain.on('add-job', (event,args, args2, args3)=>{
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
                
            
                //console.log(`${this.changes} items inserted at row: ${this.lastID}`)
                
                //win.webContents.send('reload', row)
                dboAddJob.close()
                dboRefresh.close()
                addJobWin.close()
            })
            args.job_ID = this.lastID
            args.user = args2
            if(args3 == 'calendar'){
                calendarWin.webContents.send('refresh')
            }
            logActivity('added',args)
            console.log(`${this.changes} items inserted at row: ${this.lastID}`)
    }
        
    }) 
    
    
    
})

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
        objCon.active = 1

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

            
            
            if(args.number != null){
                objPhone.number = args.number
                objPhone.active = 1
            
            p = Object.keys(objPhone)
            v = Object.values(objPhone)    
            columnPlaceholders = p.map((col) => '?').join(',');
            sql = `INSERT INTO phone_numbers(${p}) VALUES(${columnPlaceholders})`;    
            }else{
                
                v=0
                sql = 'SELECT * FROM phone_numbers WHERE phone_ID=? AND active=1'
            }
            dboContacts.run(sql,v, function(err){
                if(err){
                    console.log(err.message)
                }
                
                item_ID =  this.lastID
                console.log(`${this.changes} items inserted at row: ${this.lastID} of phone_numbers`)
                if(args.email !=null){
                    objEmail.email = args.email
                    objEmail.active = 1

                p = Object.keys(objEmail)
                v = Object.values(objEmail)
        
                columnPlaceholders = p.map((col) => '?').join(',');
                sql = `INSERT INTO emails(${p}) VALUES(${columnPlaceholders})`;    
                }else{
                    v=0
                    sql = 'SELECT * FROM emails WHERE email_ID =? AND active=1'
                }
                dboContacts.run(sql,v, function(err){
                    if(err){
                        console.log(err.message)
                    }
                    
                    item_ID =  this.lastID
                    console.log(`${this.changes} items inserted at row: ${this.lastID} of emails`)
                    event.returnValue = item_ID
                }) 
                
    
            }) 
            
            dboContacts.close()
        })
      
        
    })
    
    
})

//watches for changes on JSON file and reloads page with changed file
 fs.watch(white_board, (event, filename) => {
    if (filename) {        
      if (fsWait) return;    
      fsWait = setTimeout(() => {
        fsWait = false;      
      }, 200);      
      
      setTimeout(function() {
          win.webContents.send('whiteboard-updated')
      }, 50);      
    }
    
});

//TODO: set up logging on database actions and watch for change to log
/**
 * write to broadcast.txt on every dtabase change action. At the end of day look for year folder, create if not there
 * and save broadcast.txt as julian date.txt (238.txt) in folder and then clear broadcast. Secondary methos is to change 
 * name of broadcast and then create new broadcast.txt file.
 * On change reload jobs. Maybe change all reloads of page to rely on this instead
 
 */


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
        dboPullJob.close()
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
            
            event.returnValue = row
        }
        dboPullJobs.close()
    })
    
    
})


ipcMain.on('edit-location-drop',(event,args,args2)=>{
    
    let dboLocation = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    dboLocation.serialize(()=>{
        
        let p = Object.keys(args)

        //assign an array of key/column values for sql statement from the javascript object
        let v = Object.values(args)
    
        
    
        //building placeholder for SQL based on amount of items in object
        let columnPlaceholders = p.join("=?, ")
        columnPlaceholders = columnPlaceholders+'=?'
        
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
            args.user = args2
            logActivity('moved',args)
        }) 
        
        
        .all(sql2,function (err,row){
            if(err){
                console.log('first select'+err.message)
                return err
            }else{                
                
                event.returnValue = row
            }
        })   
        
        dboLocation.close()
         
    })
    
})
ipcMain.on('edit-location',(event,args)=>{
    console.log(args.shop_location)
    let dboLocation = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let data = [args.shop_location, args.job_ID]
    
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


/*******
 * functions regarding contacts
 *******/


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
        dboJob.close() 
    })
    
      
})
ipcMain.on('db-get-customer-name',(event, args)=>{
    
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
        dboCustomerName.close()
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
                
                if(cmTable == 'emails' && row1[0].e_contact_ID != 'null'){
                    w = row1[0].e_contact_ID
                    it = row1[0].email
                }else if(cmTable == 'phone_numbers'){
                    
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
                       
                        let contactInfo = new Object()
                        contactInfo.first_name = row2[0].first_name
                        contactInfo.last_name = row2[0].last_name
                        contactInfo.item = it
                        contactInfo.customer_ID = row2[0].customer_ID                    
                        event.returnValue = contactInfo
                        dboContactID.close()

                    }
                    dboContactName.close()
                })
                
            }
                
            
            
        })
           
        
})

/******* 
*create browser windows
********/



function createMainWindow(){
    
    win = new BrowserWindow({
        width: 1650,
        height: 900,        
        icon: path.join(__dirname, '/images/logo.ico'),
        
        
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
let editWindowCount = 0
function createEditWindow(args, args2, args3){
    editWindowCount++
    const opts = {  
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
    };
    
  if (BrowserWindow.getFocusedWindow()) {
      editWindowCount++
    current_win = BrowserWindow.getFocusedWindow();
    const pos = current_win.getPosition();
    if(editWindowCount<3 && args2 != 'context-menu'){
        Object.assign(opts, {
        x: pos[0] + 100,
        y: pos[1] - 100,
        });
    }else{
        Object.assign(opts, {
            x: pos[0] + 250,
            y: pos[1] + 0,
            });
    }
  };

        winEdit = new BrowserWindow(opts)
    
    
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
        
        
    })
    //winEdit.webContents.openDevTools()
    winEdit.webContents.focus()         
    winEdit.on('closed', ()=>{
        winEdit = null
    })
    winEdit.webContents.once('did-finish-load',()=>{
        winEdit.webContents.send('edit-data',args , args2, args3)            
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
            pathname: path.join(__dirname, '/pages/reports.html'),
            protocol: 'file',
            slashes:true
        }))
        reportWin.once('ready-to-show', () => {
            //reportWin.show()
            //attachDatePicker()
            
          })

          reportWin.webContents.focus()
         
        
    
}
function createAddJobWindow(args, launcher){
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
        addJobWin.webContents.once('did-finish-load',()=>{
            addJobWin.webContents.send('user-data', args, launcher)            
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
        width:540,
        height: 650,//w425 h300
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
function createCalendarWindow(args,args2){
    calendarWin = new BrowserWindow({
            parent: win,
            modal: true,
            width:1400,//1140
            height: 800,//600
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
        
        calendarWin.webContents.once('did-finish-load',()=>{
            calendarWin.webContents.send('opened',args,args2)
        })
       
    
}
ipcMain.on('reset-edit-window-count',(event,args)=>{
    editWindowCount = 0
})
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
ipcMain.on('delete-scheduled', (event,args,args2)=>{
    let objChange = new Object()
    objChange.job_ID = args
    objChange.user = args2
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
        logActivity('delete', args)
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
ipcMain.on('open-add-job',(event, args,launcher)=>{
    createAddJobWindow(args, launcher)
})
ipcMain.on('edit', (event, args)=>{    
    
    edit(args)  
     
});
ipcMain.on('message', (event)=>{
    
    event.sender.send('message',objList)
    
});
ipcMain.on('open-edit',(event,args, args2,args3)=>{
    createEditWindow(args, args2,args3)
})

ipcMain.on('get-users', (event,args)=>{
    let dboUsers = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })

    let sql = `SELECT * FROM users WHERE active=1`
    dboUsers.all(sql,[], (err, row)=>{
        if(err){
            return err
        }else{
            
            event.returnValue = row
        }
        dboUsers.close()
    })
    
    
})

 
 
ipcMain.on('delete-user', (event,args)=>{
    let dboUsers = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    }) 
    dboUsers.serialize(()=>{

    
        let sql = `UPDATE users SET active = 0 WHERE user_ID = ?`
        let sql2 = `SELECT * FROM users WHERE active = 1`
    
        dboUsers.run(sql,[args], function (err, row){
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
        dboUsers.close()
    })
    
    
})
// ipcMain.on('addNew', (event, args)=>{
   
//     if (db.valid('vehicles',location)) {
//         db.insertTableContent('vehicles', location, args, (succ, msg) => {
//             });
//       }
//      win.webContents.send('count') 
     
//      addJobWin.hide()
//      addJobWin = null
// });
ipcMain.on('reloadPage', (event) =>{
   
    event.sender.send('reload', objList)
})












ipcMain.on('deactivate', (event,args, args2)=>{
    let objChange = new Object()
    objChange.job_ID = args
    objChange.user = args2

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
                logActivity('delete',objChange)
            }
        })
        dboDeactivate.close()
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






ipcMain.on('add-new-customer', (event,args)=>{
    let dboCustomer = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    sql = `INSERT INTO customers(customer_name) VALUES (?)`
    dboCustomer.run(sql,args.toUpperCase(), function(err){
        if(err){
            console.log(err.message)
        }
        event.returnValue = this.lastID
        console.log(`${this.changes} items inserted at row: ${this.lastID}`)
    }) 
    dboCustomer.close()
})



// ipcMain.on('get-company-id', (event, args)=>{

//     let compID = getID(args)    
//     event.returnValue = compID    
        
// })






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
            
            event.returnValue = row
        }
        dboCustomers.close()
    })
    
    
    
        
})
ipcMain.on('refresh-add-page', (event,args,args2)=>{
    
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
            
            if(row.length>0){
            event.returnValue =row[0].customer_ID
            }else{
                event.returnValue = false
            }
            //return row[0].customer_ID
            
            
            dboCustomers.close()

    })
    
    
})

ipcMain.on('open-contacts', (event,args1,args2, args3, args4, args5, args6, args7)=>{
    //test to see which page launched the contacts page
    //right now the options are 'add job page' from addJob.js and 'main page' from index.js
    if(args1 == 'add job page'){
        let dboCustomers = new sqlite3.Database(testDB, (err)=>{
            if(err){
                console.error(err.message)
            }
            
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
                
            
                dboCustomers.close()
    
        })
        
        
    }
    
         createContactsWindow(args1,args2, args3, args4,args5,args6,args7)        
    
})

ipcMain.on('update-job',(event,args,args2, args3)=>{
    let k = Object.keys(args)
    let v = Object.values(args)
    let arrC = new Array()
    let arrV = new Array()
    let strColumns 
    let strValues 
    for(i=1;i<k.length;i++){
            
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
   

    let dboUpdate = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let pull = `SELECT * FROM jobs WHERE active = 1 AND cancelled = 0`
    let sql = `UPDATE jobs SET ${strColumns} WHERE job_ID = ${args.job_ID}`
    
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
                args.user = args3
                switch(args2){
                    case 'context-menu' :
                        
                        
                        break;
                    case 'edit job':
                        winEdit.close()
                        break;
                    case 'calendar':                        
                        calendarWin.webContents.send('refresh')
                        break;
                    default:
                        
                        break;
                }
                logActivity('edited',args)
                
                win.webContents.send('update',row)
                
            }
        }) 

        dboUpdate.close()
    });
    
})
ipcMain.on('move', (event, args)=>{
    
    switch(event.sender.getTtitle()){
        case 'Edit Job':
            winEdit.close();
            break;
        default:
            break;
    }
   
})
ipcMain.on('pass-contact', (event,args, args2)=>{
    
    
    winEdit.webContents.send('contacts-updated',args, args2)
    contactWin.close()
})
ipcMain.on('get-contacts', (event, args)=>{
    
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
        let sql1 = `SELECT * FROM contacts WHERE customer_ID=${args} AND active=1`
        
            dboContacts.all(sql1,[], function (err, row){
                if(err){
                    console.log(err)
                    return err
                }else{
                    
                    if(row.length>0){
                    for(let member in row){
                    let sql2 = `SELECT * FROM phone_numbers WHERE EXISTS (SELECT p_contact_ID FROM phone_numbers) AND p_contact_ID = ${row[member].contact_ID} AND active=1`
                        dboContacts.all(sql2,[], function (err, row2){
                            if(err){
                                console.log(err)
                                return err
                            }else{
                                
                            
                                let sql3 = `SELECT * FROM emails WHERE EXISTS (SELECT e_contact_ID FROM emails) AND e_contact_ID = ${row[member].contact_ID} AND active=1`
                                dboContacts.all(sql3,[], function (err, row3){
                                    if(err){
                                        console.log(err)
                                        return err
                                    }else{
                                        
                                        
                                            if(row2.length){
                                                row[member].phonenumbers = row2
                                            }
                                            if(row3.length){
                                                row[member].emails = row3
                                            }
                                            let packagedData = new Array()
                                            packagedData = row
                                            insertCount++
                                              if(insertCount==row.length){

                                                
                                                 
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
   
})
ipcMain.on('edit-phone', (event,args)=>{
    let dboPhone = new sqlite3.Database(testDB, (err)=>{
        if(err){
            console.error(err.message)
        }
        
    })
    let data = [args.text, args.id]
    
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
    objAdd.active = args.active
     //assign an array of key/column names for sql statement from the javascript object
     let p = Object.keys(objAdd)

     //assign an array of key/column values for sql statement from the javascript object
     let v = Object.values(objAdd)
 
    
 
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
    
    if(args.method == 'p'){
        
        sql = `UPDATE phone_numbers SET active=0 WHERE phone_ID=?`
    }
    if(args.method == 'e'){
        sql = `UPDATE emails SET active=0 WHERE email_ID=?`
    }
    if(args.method =='c'){
        sql = `UPDATE contacts SET active=0 WHERE contact_ID=?`
        sql2 = `UPDATE phone_numbers SET active=0 WHERE p_contact_ID=?`
        sql3 = `UPDATE emails SET active=0 WHERE e_contact_ID=?`
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
        dboDelPhone.close()
        
      });
     
      
})

/************
 * communications regarding users and login
 ************/
ipcMain.on('open-create-user', (event,args)=>{
    createCreateUserWindow()
})


ipcMain.on('login-success',(event, args)=>{
    
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
ipcMain.on('open-calendar',(event,args,args2)=>{
    
    createCalendarWindow(args,args2)
   
})  


    
    