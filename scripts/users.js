
const elect = require('electron')
const { remote } = require('electron')

const ipcUser = elect.ipcRenderer
const pathUser = require('path')
const urlUser = require('url')
let users

window.onload = () =>{
    users = ipcUser.sendSync('get-users')
    //alert(users)
    fillSections(users)
}
function fillSections(users){
    //document.getElementById('editUserWrapper').innerHTML = JSON.stringify(users)
    let res = document.getElementById('selResetUser')
    let del = document.getElementById('selDeleteUser')
    var length = $('#selResetUser').children('option').length;
    for(i=length-1;i>0;i--){
        res.remove(i)
        del.remove(i)
    }
    for(member in users){
        let opt = document.createElement('option')
        let name = document.createTextNode(users[member].user_name)
        opt.setAttribute('id','re'+users[member].user_ID)
        opt.appendChild(name)
        document.getElementById('selResetUser').appendChild(opt)
    }
    for(member in users){
        let opt = document.createElement('option')
        let name = document.createTextNode(users[member].user_name)
        opt.setAttribute('id', 'de'+users[member].user_ID)
        opt.appendChild(name)
        document.getElementById('selDeleteUser').appendChild(opt)
    }
    // document.getElementById('-message-area').innerHTML=JSON.stringify(users)
}
function displaySection(args){
    document.getElementById('createUserWrapper').style.display = 'none'
    document.getElementById('editUserWrapper').style.display = 'none'
    document.getElementById('deleteUserWrapper').style.display = 'none'
    if(args){
        document.getElementById(args.id+'Wrapper').style.display = 'block'
    }
}
function deleteUser(args){
    let selected = $('#selDeleteUser :selected');
    let id=(selected.attr('id').substr(2))
    users = ipcUser.sendSync('delete-user', id)	
    fillSections(users)
}
function resetUser(args){

}
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
        users = ipcUser.sendSync('create-user', userData)
        fillSections(users)
        displaySection()
       // window.close()
       
    }
    
}