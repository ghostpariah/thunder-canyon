let optionsBox = document.getElementById('optionsBox');
const button = document.getElementById('dropDownButton');
let state = 'closed'
setTimeout(() => {
    //createdropDown()
}, 300);



// document.getElementById('addInfo').addEventListener('click', (event)=>{
//     alert('do something')
// })

function createdropDown(contacts){
    console.log('in dropDown.js')
    console.log(contacts)

    document.getElementById('dropDownButton').addEventListener('click', (event)=>{
        // optionsBox.style.display = 'flex';
        if(state == 'closed'){
            optionsBox.style.animationDuration = '300ms'
            optionsBox.style.transform = 'scaleY(1)'
            button.classList.remove('dropDownButton');
            button.classList.add('pullUpButton');
            state= 'open';
        }else{
            optionsBox.style.animationDuration = '300ms'
            optionsBox.style.transform = 'scaleY(0)'
            button.classList.remove('pullUpButton');
            button.classList.add('dropDownButton');
            state= 'closed';
        }
        
    })
    
    //create optionGroup at the top and create option with "add new contact" (no header needed)
    let addNewContactOptionGroup = document.createElement('div')
    addNewContactOptionGroup.setAttribute('class', 'optionGroup')
    addNewContactOptionGroup.setAttribute('id','optionGroup1')
    let addNewContactOption = document.createElement('div')
    addNewContactOption.setAttribute('class','addNewOption')
    addNewContactOption.setAttribute('id','addNewContact')
    let ancogText = document.createTextNode('+ add new contact')
    addNewContactOption.appendChild(ancogText)
    addNewContactOptionGroup.appendChild(addNewContactOption)
    optionsBox.appendChild(addNewContactOptionGroup)

    //create optionGroup for each contact 
    //--then create header and create name and plus sign divs and fill name with contact name
    //----thencreate an option for each contact info item and fill with phone number or email
   for(i=0;i<contacts.length;i++){
            //create group
            let contactOptionGroup = document.createElement('div')
            contactOptionGroup.setAttribute('class', 'optionGroup')
            contactOptionGroup.setAttribute('id','optionGroup'+i)

            //create header container
            let coh = document.createElement('div')
            coh.setAttribute('class', 'optionHeader')

            //create header name container
            let cohName = document.createElement('div')
            cohName.setAttribute('class','name')
            let cohNameText = document.createTextNode(`${contacts[i].first_name} ${contacts[i].last_name}`)
            cohName.appendChild(cohNameText)

            //create header add item container
            let cohAdd = document.createElement('div')
            cohAdd.setAttribute('class','add')
            cohAdd.setAttribute('id',contacts[i].contact_ID)
            let cohAddText = document.createTextNode('+')
            cohAdd.appendChild(cohAddText)

            
            coh.appendChild(cohName)
            coh.appendChild(cohAdd)
            
            contactOptionGroup.appendChild(coh)

            //create
            for(n in contacts[i].emails){
                //create number element unless there is no number
                if(contacts[i].emails[n].email !=null){

                    let contactOption = document.createElement('div')
                    contactOption.setAttribute('class','option')
                    contactOption.setAttribute('id','option')    
                    contactOption.addEventListener('click',(event)=>{
                        document.getElementById('choice').innerHTML = event.target.innerHTML
                        optionsBox.style.animationDuration = '300ms'
                        optionsBox.style.transform = 'scaleY(0)'
                        button.classList.remove('pullUpButton');
                        button.classList.add('dropDownButton');
                        state= 'closed';
                    })
                    let contactOptionText = document.createTextNode(contacts[i].emails[n].email)
                    contactOption.appendChild(contactOptionText)			 	
                                    
                

                    
                        
                    contactOptionGroup.appendChild(contactOption)
                    
                        
                    
                }
                
                        
            }
            optionsBox.appendChild(contactOptionGroup)
            for(n in contacts[i].phonenumbers){
                //create number element unless there is no number
                if(contacts[i].phonenumbers[n].number !=null){

                    let contactOption = document.createElement('div')
                    contactOption.setAttribute('class','option')
                    contactOption.setAttribute('id','option')    
                    contactOption.addEventListener('click',(event)=>{
                        document.getElementById('choice').innerHTML = event.target.innerHTML
                        optionsBox.style.animationDuration = '300ms'
                        optionsBox.style.transform = 'scaleY(0)'
                        button.classList.remove('pullUpButton');
                        button.classList.add('dropDownButton');
                        state= 'closed';
                    })
                    let contactOptionText = document.createTextNode(contacts[i].phonenumbers[n].number)
                    contactOption.appendChild(contactOptionText)			 	
                                    
                

                
                        
                        contactOptionGroup.appendChild(contactOption)
                    
                        
                    
                }
                
                        
            }
            optionsBox.appendChild(contactOptionGroup)
            
            
    }

    
}