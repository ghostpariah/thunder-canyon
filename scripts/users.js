
const elect = require('electron')
const { remote } = require('electron')

const ipcUser = elect.ipcRenderer
const pathUser = require('path')
const urlUser = require('url')



function createUser(){
    console.log('createUser triggered')
    let userData = new Object()
    let unEl = document.getElementById('user').value;
    let pwEl = document.getElementById('password').value;
    let urEl = document.getElementById('role')
    let ma = document.getElementById('-message-area')
    ma.innerHTML=""
    
    let userExists = false
    userExists = ipcUser.sendSync('check-for-user',unEl)
    console.log(unEl + ' '+userData.user_name)
    console.log(userExists)
    if (unEl == ""){
        ma.innerHTML = ma.innerHTML.concat ("\n Please enter username!<br/>")
    }else{
        if(userExists){
           ma.innerHTML = ma.innerHTML.concat("\n Username already exists!<br/>")
        }else{
        userData.user_name = unEl.toLowerCase()
        }
    }
    if (pwEl == ""){
        ma.innerHTML = ma.innerHTML.concat ("\n Please enter password!<br/>")
    }else{
        userData.password = pwEl.toLowerCase()
    }
     (urEl.options[urEl.selectedIndex].text) ? (userData.role = urEl.options[urEl.selectedIndex].text) : (ma.innerHTML = ma.innerHTML.concat("\n Please select role!<br/>"))
  
    console.log(ma.innerHTML)
    if(ma.innerHTML==""){
        ipcUser.send('create-user', userData)
       // window.close()
       
    }
    
}