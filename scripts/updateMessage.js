const electron = require('electron')
const ipcUpdate = electron.ipcRenderer

//updater doesnt work in dev environment so starting app by default just for dev.
//ipcUpdate.send('start-app')


ipcUpdate.on('updater', (event , args)=>{
    
    document.getElementById('message').innerHTML = args
    
    if(args == 'Update not available.'|| args.includes('error')){
        ipcUpdate.send('start-app')
    }

    
})
