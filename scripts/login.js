//const electronLogin = require('electron')
//const { remote } = require('remote')
//const ipc = remote.ipcRenderer
//const pathLogin = require('path')
//const urlLogin = require('url')


setTimeout(()=>{
    $('#user').trigger('click')
   },2000)

setTimeout(()=>{
   $('#user').keypress(function(e){
    if((e.keyCode ? e.keyCode : e.which) == 13){
        $("#password").focus()
       //alert("hello")
    }
    });
},2000);

setTimeout(()=>{
    $('#password').keypress(function(e){
     if((e.keyCode ? e.keyCode : e.which) == 13){
         $("#loginSubmit").click()
        //alert("hello")
     }
     });
 },2000);
        let matchedUsername = false
        let matchedPassword = false
        function focusUsername(){
           setTimeout(()=>{
            $('#user').trigger('click')
           },2000) 
        }
    function login(){
        let unEl = document.getElementById('user').value;
        let pwEl = document.getElementById('password').value;
        let ma = document.getElementById('-message-area')
        
       
        if (unEl == ""){
            ma.innerHTML = ma.innerHTML.concat ("\n Please enter username!<br/>")
        }else{
            verifyUsername(unEl)
        }
        // if (pwEl == ""){
        //     ma.innerHTML = ma.innerHTML.concat ("\n Please enter password!<br/>")
        // }else{
        //    verify(pwEl, 'pw')
        // }
}
        function verifyUsername(args1){
            const electron1  = require('electron')
            const ipc = electron1.ipcRenderer
            
            let unSucc = false
            let ma = document.getElementById('-message-area')
            ma.innerHTML=""
            //alert(arg)
            let users = ipc.sendSync('get-users')
            let userID=""           
                
                for(let member in users){
                    //console.log(users[member].user_name)
                    if(users[member].user_name == args1){ 
                        userID = users[member].id 
                                        
                        matchedUsername = true
                        if(!matchedPassword) {verifyPassword(users[member])}
                        break;   
                        //if(matchedPassword){alert('congrats 1')}                
                    }else{
                        matchedUsername = false
                    }
                }
               if (matchedUsername == false) {ma.innerHTML= ma.innerHTML.concat("Invalid username!</br>")}
            
                
               
            if(matchedUsername && matchedPassword){ma.innerHTML=""}
        } 
        function verifyPassword(args){
            const electron1  = require('electron')
            const ipc = electron1.ipcRenderer
            let enteredPW =document.getElementById('password').value
            let unSucc = false
            let ma = document.getElementById('-message-area')
            ma.innerHTML=""
            //alert(arg)
            let users = ipc.sendSync('get-users')
            //let userID=args.id     
                
            if(matchedUsername){               
                    
                    if(args.password == enteredPW){                   
                        matchedPassword = true
                        console.log('both matched')
                        
                        ipc.send('login-success', args) 
                       

                    }
                
            }
                
                if (!matchedPassword) {ma.innerHTML=ma.innerHTML+ "Invalid password!<br/>"} 
            
            if(matchedUsername && matchedPassword){ma.innerHTML=""}
        }        
    