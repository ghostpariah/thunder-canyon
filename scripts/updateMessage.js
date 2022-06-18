const electron = require('electron')
const ipcUpdate = electron.ipcRenderer
const mb = document.querySelector('#message')

//updater doesnt work in dev environment so starting app by default just for dev.
//ipcUpdate.send('start-app')


ipcUpdate.on('updater', (event , args, args2)=>{
    if(!args2){
        mb.innerHTML = args
    }else{
        createProgressIndicator()
        document.querySelector('.circle-progress').setAttribute('data-percentage', `${args2}%`)
        document.querySelector('.circle-progress').style.background = `conic-gradient(
            #5e81ad ${args2*3.6}deg,
            white ${args2*3.6}deg
        )`;
    }
    
     
   
    if(args == 'Update not available.'|| args.includes('error')){
      
        setTimeout(() => {
            ipcUpdate.send('no-updates')
           
        }, 3000);
    }
    if(args == 'Update available.'){
       
    }


    
})

ipcUpdate.on('no-mapped-drive', (event,args)=>{
    document.querySelector("#message").innerHTML ="v: drive must be mapped to continue"
    let btn = document.createElement('button')
    btn.setAttribute('value','OK')
    btn.setAttribute('type','button')
    let text = document.createTextNode('OK')
    btn.appendChild(text)
    btn.addEventListener('click', ()=>{
        ipcUpdate.send('quit')
    })
    document.querySelector("#message").appendChild(btn)
    
})
ipcUpdate.on('new-database',(event,args)=>{
    console.log('new-database triggered')
    let createDatabase = confirm('Database not found. Is this a new installation?')
    if(createDatabase){
        console.log('creating database')
        ipcUpdate.send('create-new-database')
        ipcUpdate.send('start-app')
    }else{
        let restoreDatabase = confirm('Would you like to restore from last backup file?')
        if(restoreDatabase){
            console.log('restoring databse')
            ipcUpdate.send('restore-database')
            ipcUpdate.send('start-app')
        }else{
            //ipcUpdate.send()
        }
    }
})

function createProgressIndicator(){
    mb.innerHTML=""
    let circleProg = document.createElement('div')
    circleProg.setAttribute('class','circle-progress')
    circleProg.setAttribute('data-percentage', '0%')

    let circleVal = document.createElement('div')
    circleVal.setAttribute('class','circle-value')

    circleProg.appendChild(circleVal)
    mb.appendChild(circleProg)
}