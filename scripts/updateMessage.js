const electron = require('electron')
const ipcUpdate = electron.ipcRenderer

ipcUpdate.send('start-app')
ipcUpdate.on('updater', (event , args)=>{
    
    document.getElementById('message').innerHTML = args
    
    if(args == 'Update not available.' || args.includes('error')){
        ipcUpdate.send('start-app')
    }

    
})
