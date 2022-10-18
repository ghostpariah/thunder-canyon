
let currentFocusedItem 
let pastFocusedItem
let nextFocusedItem
let gListType
let contactChosen = false
let glComponentType
let currentTabIndex

$('.cb').on({
    keydown: (event)=>{
        event.stopPropagation
        let ti = Number(event.target.getAttribute('tabindex'))
        console.log(ti)
        switch(event.key){
            case 'Enter':
                console.log('enter hit on checkbox')
                if(event.target.checked){
                    event.target.checked = false
                }else{
                    event.target.checked = true
                }
                
                
                break;
            default:
                console.log(event.key)
                break;
        }
        
        
        console.log(ti)
        
    }
})

function createComponent(container, componentType, list, listType, callingPage){
    glComponentType = componentType
    let page = callingPage
    let part = 'text'
    let state = 'closed'
    let focused = false
    
    const focusedElement = document.activeElement;
    let previousFocusedElement
    let usingListBox = true
    itemIndex = 0
   

    const componentContainer = document.getElementById(container)
    
    
           
    
    
    let createComboBox = ()=>{
        container.setAttribute('data-type',componentType)
        //create compnents

        let wrapper = document.createElement('div')
        wrapper.setAttribute('class','inputAndLabelWrapper')
        

        let label = document.createElement('label')
        let txtLabel = document.createTextNode(`${listType}`)
        label.setAttribute('class','label')
        label.appendChild(txtLabel)

        
        let input = document.createElement('div')
        input.setAttribute('id', listType)
        input.setAttribute('class', 'comboBox fullRound');
        

        let txtSection = document.createElement('div')
        txtSection.setAttribute('id',listType+'-choice')
        txtSection.setAttribute('class','choice leftHalfRound')
        txtSection.setAttribute('contenteditable', true)
        txtSection.setAttribute('part','text')
        
        txtSection.tabIndex = getTabIndex(listType, page)
        let filteredList
        $(txtSection).on({
            focus: (event=>{
                event.stopPropagation()
                //event.preventDefault()                
                console.log('txtSection focus fired')
                console.log(txtSection.getAttribute('tabindex'))
                focused = true 
                
                //close all open dropdowns               
                closeDropDowns()

                //toggle between open and closed styling on focused element
                toggleDropDowns('Customer txtSection focus',listBox,arrow)

                
               

            }),
            
            mousedown: (event)=>{                
                
                if(focused){
                    toggleDropDowns('Customer txtSection mousedown',listBox,arrow)
                }
                
                
            },
            dblclick: (event)=>{
                event.target.innerHTML = ''
                $(txtSection).focus()
                resetListBox(listType)
                resetContacts()
                event.target.removeAttribute('data-cid')
            },
            blur: (event)=>{
                focused = false
                if(!usingListBox){
                    closeDropDowns()
                }
                
            },
            mouseup: (event)=>{
                event.preventDefault()
                event.stopPropagation()
                event.stopImmediatePropagation()
            },
            keydown: (event)=>{
               
                // if event.preventDefault() is uncommented
                // then remove the +1 and -1 in the navigateTabs() call
                // in the tab event handler

                //event.preventDefault()
                let focusedIndex 
                let pastIndex 
                let nextIndex 
                
                let ti = Number(event.target.getAttribute('tabindex'))
                let e = $('#'+listType+'-listBox .listItem:visible')
                switch(event.key){
                    case 'Tab':
                        
                        if(event.key == 'Tab' && event.shiftKey){
                            navigateTabs('up', ti +1)
                            console.log('reverse tab focused element is ')
                            console.log(document.activeElement)
                            break;
                         }
                         navigateTabs('down', ti -1)
                         console.log('Tab')
                         break;
                    case 'ArrowDown':
                        event.preventDefault()
                   
                        focusedIndex =0
                        pastIndex = e.length -1
                        nextIndex = 1 
                        for(i=0;i<e.length;i++){
                            if(e[i].classList.contains('focusedListItem')){
                                e[i].classList.remove('focusedListItem')
                                if(i == e.length-1){
                                    focusedIndex = 0
                                    pastIndex = e.length - 1
                                    nextIndex = 1
                                    itemIndex = 0
                                }else{
                                    focusedIndex = i+1
                                    pastIndex = i
                                    nextIndex = i+2
                                    itemIndex = i+1
                                }
                                
                                
                            }
                        }
                        usingListBox = true;
                        
                        
                        console.log(e.length)
                        e[focusedIndex].focus()
                        e[focusedIndex].classList.add('focusedListItem')
                        
                        
                        
                        pastFocusedItem = e[pastIndex]
                        currentFocusedItem = e[focusedIndex]
                        nextFocusedItem = e[nextIndex]
                        console.log(currentFocusedItem)
                        break;
                    case 'ArrowUp':
                        usingListBox = true
                        focusedIndex = e.length - 1
                        pastIndex = 0
                        nextIndex = e.length - 2 
                        for(i=0;i<e.length;i++){
                            if(e[i].classList.contains('focusedListItem')){
                                if(i !== 0){
                                    focusedIndex = i - 1
                                    pastIndex = i
                                    nextIndex = i - 2
                                    itemIndex = i - 1
                                 }
                                
                                
                                e[i].classList.remove('focusedListItem')
                            }
                        }
                        e[focusedIndex].focus()
                        e[focusedIndex].classList.add('focusedListItem')
                        currentFocusedItem = e[focusedIndex]
                        pastFocusedItem = e[pastIndex]
                        nextFocusedItem = e[nextIndex] 
                        break;
                    default:
                        if(listType == 'Designation'){
                            
                        }
                        break;
                }
                
               
                
                
            },
            keyup: (event) =>{
                
                let ti = Number(event.target.getAttribute('tabindex'))
                
                if(listType == 'Designation'){
                    switch(event.key){
                        case 's':
                        case 'S':
                            txtSection.innerHTML = 'Scheduled'
                            usingListBox = false
                            event.preventDefault()                        
                            document.getElementById('dateSchWrapper').classList.remove('hiddenInput')
                            document.getElementById('dateSchWrapper').classList.add('visibleInput')                        
                            $("#radAM").focus()                            
                            navigateTabs('down',ti)
                            chooseListItem(event,input,txtSection,document.getElementById('Designation1'),listBox)
                            break;
                        case 'o':
                        case 'O':
                            txtSection.innerHTML = 'On the Lot'
                            event.preventDefault()
                            navigateTabs('down',ti)
                            chooseListItem(event,input,txtSection,document.getElementById('Designation0'),listBox)
                            document.getElementById('dateSchWrapper').classList.add('hiddenInput')
                            document.getElementById('dateSchWrapper').classList.remove('visibleInput')
                            break;
                        default: 
                            //only allow s and o  
                            let t = txtSection.innerText
                            if(t!= 'Scheduled' && t!= 'On the Lot'){
                            
                                r = /[^sSoO]/gi,
                                v = txtSection.innerText;
                                console.log(r,v)
                                if(r.test(v)) {
                                    txtSection.innerText = v.replace(r,'')                     
                                }
                            }
                            break;
                    
                    }
                   
                }
                if(listType == 'JobType'){  
                    switch(event.key){
                        case 's':
                        case 'S':
                            txtSection.innerHTML = 'Spring'
                            chooseListItem(event,input,txtSection,document.getElementById('JobType0'),listBox)
                            navigateTabs('down',ti)
                            break;
                        case 'c':
                        case 'C':
                            txtSection.innerHTML = 'Check All'
                            chooseListItem(event,input,txtSection,document.getElementById('JobType1'),listBox)
                            navigateTabs('down',ti)
                            break;
                        case 'a':
                        case 'A':
                            txtSection.innerHTML = 'Alignment'
                            chooseListItem(event,input,txtSection,document.getElementById('JobType2'),listBox)
                            navigateTabs('down',ti)
                            break;
                        case 'k':
                        case 'K':
                            txtSection.innerHTML = 'King Pin'
                            chooseListItem(event,input,txtSection,document.getElementById('JobType3'),listBox)
                            navigateTabs('down',ti)
                            break;
                        case 'f':
                        case 'F':
                            txtSection.innerHTML = 'Frame'
                            chooseListItem(event,input,txtSection,document.getElementById('JobType4'),listBox)
                            navigateTabs('down',ti)
                            break;
                        default:
                            //only allow s and o
                            let t = txtSection.innerHTML
                            console.log(t)
                            if(t !== 'Spring' && t !== 'Alignment' && t !== 'Check All' && t !== 'King Pin' && t !== 'Frame'){

                            
                                r = /[^sScCaAkKfF]/gi,
                                v = txtSection.innerText;
                                console.log(r,v)
                                if(r.test(v)) {
                                    txtSection.innerText = v.replace(r,'')                     
                                }
                            }
                            break;
                    } 
                                     
                   
                    
                }
                
                if(listType == 'Customer'){
                    if(document.querySelector('#Customer-listBox').getAttribute('data-state') == 'closed'){
                        toggleDropDowns('Customer txtSection focus',listBox,arrow)
                    }
                    if($('#Customer-MessageContainer')){
                        $('#Customer-MessageContainer').remove()
                    }
                    filterListBox(txtSection, Array.from($('#Customer-listBox div')))
                    let fl =$('#Customer-listBox div:visible')
                    console.log(fl.length, event.key)
                    //if there are no matches then its a new company
                    if(fl.length == 0){
                        //TODO: add programming to add new company
                        console.log('newCompany')
                        fillContactsNew(null)
                    }
                    if(fl.length == 1 && event.key == "Tab"){
                        console.log(fl)
                    }
                    if(txtSection.innerHTML == ''){
                        if($('#Customer-MessageContainer')){
                            $('#Customer-MessageContainer').remove()
                        }
                        txtSection.removeAttribute('data-cid')
                        document.getElementById('Contacts-listBox').innerHTML = ''
                        resetListBox(listType)
                        resetContacts()

                    //Array.from(document.querySelectorAll('#Customer-listBox .listItem'))
                    }
                    if(txtSection.getAttribute('data-cid') && !isExactMatch(txtSection.innerHTML, Array.from(fl))){
                        if($('#Customer-MessageContainer')){
                            $('#Customer-MessageContainer').remove()
                        }
                        txtSection.removeAttribute('data-cid')
                        document.getElementById('Contacts-listBox').innerHTML = ''
                        resetListBox(listType)
                        resetContacts()
                    }else{
                        console.log(true)
                    }
                    
                   
                }

                filteredList = Array.from($('#Customer-listBox div:visible'))
                
            },
            input: (event)=>{
                event.target.innerText = event.target.innerText.toLocaleUpperCase()
                if(event.target.hasChildNodes()){
                let hashtagRange = document.createRange();
                let windowSelection = window.getSelection();
                //remove any previously created ranges
                windowSelection.removeAllRanges();
                let theNodes = event.target.childNodes;
                //this.hashtagsDivElement.focus();
                let firstNode = theNodes[0];
                let lastNode = theNodes[theNodes.length - 1];
                let start = theNodes[0];
                let end = theNodes[theNodes.length - 1];
                console.log('Start is ' + start.nodeName + ' end is ' + end.nodeName + " node count " + theNodes.length);
                hashtagRange.setStartBefore(firstNode);
                hashtagRange.setEndAfter(lastNode);
                hashtagRange.collapse(false);
            //add the range to a window selection object.
                windowSelection.addRange(hashtagRange);
                windowSelection.collapseToEnd();
                }
            }
        })
    
    
       
        //underlying autocomplete box
        let autoComplete = document.createElement('span')
        autoComplete.setAttribute('id',`${listType}-autoComplete`)
        autoComplete.setAttribute('class','choiceAutoComplete')
        let button = document.createElement('div')
        //button.setAttribute('id','btn-'+listType)
        let arrow = document.createElement('div')
        arrow.setAttribute('class','arrow down')
        $(arrow).on({
            click: (event)=>{
                event.stopImmediatePropagation()
                toggleDropDowns(null,listBox,arrow)
            }
        })
        button.setAttribute('id',listType+'-button')
        button.setAttribute('class','arrowBox')
        button.setAttribute('data-part','button')
        $(button).on({
            click: (event)=>{
                state = listBox.getAttribute('data-state')
                console.log('combo box clicked -> click state'+state)
                //txtSection.focus()
                //     usingListBox = true
                if(state == 'closed'){
                    closeDropDowns()
                    
                    listBox.style.animationDuration = '300ms'
                    listBox.style.transform = 'scaleY(1)'
                    arrow.classList.remove('down');
                    arrow.classList.add('up');
                   
                    listBox.setAttribute('data-state','open')
                    txtSection.focus()
                    usingListBox = true
                   
                }else if(state == 'open'){
                   
                    listBox.style.animationDuration = '300ms'
                    listBox.style.transform = 'scaleY(0)'
                    
                    arrow.classList.remove('up')
                    arrow.classList.add('down')
                   
                    listBox.setAttribute('data-state','closed')
                }
                
        }
        })

        let listBox = document.createElement('div')
        
        listBox.setAttribute('id',listType+'-listBox')
        listBox.setAttribute('class','listBox')
        listBox.setAttribute('data-state','closed')
       
        

        //append components
        
        input.appendChild(txtSection)        
        button.appendChild(arrow)
        input.appendChild(button)
        wrapper.appendChild(label)
        wrapper.appendChild(input)       
        container.appendChild(wrapper)
        container.appendChild(listBox)

        //populate dropdown
        fillListBox2(listBox)
    }
    let getTabIndex = (type, page)=>{
        console.log('page ='+page)
        let index
        if(page == 'edit'){
        
            switch(type){
                case 'DateIn':
                    index = 1
                    break;
                case 'Designation':                
                    index = 2
                break;
                case 'radAM':
                    index = 3
                break;
                case 'radPM':
                    index = 3
                break;
                case 'DateSched':
                    index = 4
                break;
                case 'Customer':
                    index = 6
                break;
                case 'Contacts':
                    index = 10
                break;
                case 'Unit':
                    index = 7
                break;
                case 'UnitType':
                    index = 8
                    break;
                case 'JobType':
                    index = 5
                break;
                case 'radAM_OTL':
                    index = 15
                    break;
                case 'DateOTL':
                    index = 16
                    break;
                default:
                    break;
            }
            console.log(`type = ${type}
            page = ${page}
            tabindex = ${index}`)
            return index
        }
        if(page == 'add'){
            switch(type){
                case 'Designation':                
                    index = 1
                break;
                case 'radAM':
                    index = 2
                break;
                case 'radPM':
                    index = 3
                break;
                case 'DateSched':
                    index = 4
                break;
                case 'Customer':
                    index = 6
                break;
                case 'Contacts':
                    index = 10
                break;
                case 'Unit':
                    index = 7
                break;
                case 'UnitType':
                    index = 8
                    break;
                case 'JobType':
                    index = 5
                break;
                default:
                    break;
            }
            console.log('create tabindex')
            console.log(`type = ${type}
        page = ${page}
        tabindex = ${index}`)
            return index            
        }
    }
    let fillListBox2 = (box)=>{
        let input = document.getElementById(listType+'-choice')
        let txtSection = document.getElementById(listType+'-choice')
        let button = document.getElementById(listType+'-button')
        let listBox = document.getElementById(listType+'-listBox')    

        box.innerHTML =''
        for(var member in list){
            let listItem = document.createElement('div')
            listItem.setAttribute('class','listItem')
            listItem.setAttribute('data-selected',false)
            listItem.tabIndex = -1
            let text
            
            switch(listType){
                case 'Customer':
                    list.sort((a, b) => (a.customer_name > b.customer_name) ? 1 : -1)
                    listItem.setAttribute('id', `listItem${list[member].customer_ID}`)
                    text = document.createTextNode(list[member].customer_name)
                    
                    $(listItem).on({
                        keydown: (event)=>{
                            event.preventDefault()
                            let index = Number(listItem.parentNode.previousElementSibling.lastChild.firstChild.getAttribute('tabindex'))
                            let filteredList = $('#'+listType+'-listBox .listItem:visible')
                            switch(event.key){
                                // case 'Tab':
                                //     fillContactsNew(ipc.sendSync('get-contacts',listItem.id.substring(8)))
                                //     closeDropDowns()
                                   
                                // break;
                                case 'ArrowDown':
                                    
                                    navigateListBox(event,box, filteredList, itemIndex)
                                break;
                                case 'ArrowUp':
                                    navigateListBox(event,box,filteredList,itemIndex)
                                break;
                                case 'Enter':
                                case 'Tab':
                                    if(listType =='Customer'){
                                        fillContactsNew(ipc.sendSync('get-contacts',listItem.id.substring(8)),listItem.id.substring(8),listItem.innerText)
                                        // $('#Contacts-choice').click()
                                        // $('#Contacts-choice').focus()
                                        
                                        console.log('index in customer listItem keydown enter = '+index)
                                        navigateTabs('down',index)
                                    }   
                                    //console.log('parent tabindex = '+listItem.parentNode.previousElementSibling.lastChild.firstChild.getAttribute('tabindex'))
                                    //console.log(listItem.parentNode)
                                    chooseListItem(event,input,txtSection,event.target,box)
                                    
                                    //toggleDropDowns('l',listItem.parentNode,listItem.parentNode.parentNode.firstElementChild.lastChild.lastChild.firstChild)
                                    break;
                            }
                            
                           
                        },
                        mousedown: (event)=>{
                            let index = Number(document.getElementById(`${listType}-choice`).getAttribute('tabindex'))
                            // let index = Number(event.target.parentNode.previousElementSibling.lastChild.firstChild.getAttribute('tabindex'))
                            //console.log(txtSection)
                            //console.log('clicking Customer item -> state = '+state)
                            //open schedule input if schedule chosen
                            
                            button.firstChild.classList.remove('up')
                            button.firstChild.classList.add('down')
                            fillContactsNew(ipc.sendSync('get-contacts',listItem.id.substring(8)),listItem.id.substring(8),listItem.innerText)
                            currentFocusedItem = event.target
                            console.log('index in customer listItem mousedown = '+index)
                            
                            chooseListItem(event,input,txtSection,event.target,box)
                            setTimeout(() => {
                                navigateTabs('down',index)
                            }, 75);
                            
                        },
                        // click: (event)=>{
                            
                            
                        // },
                        hover: (event)=>{
                            
                            //$(listItem).focus()
                            //console.log(document.activeElement)
                        }
                    })
                break;
                // case 'Designation':
                //     //console.log(listType)
                //     listItem.setAttribute('id',listType+member)
                //     text = document.createTextNode(list[member])
                //     break;
                // case 'Job-Type':
                //     listItem.setAttribute('id',listType+member)
                //     text = document.createTextNode(list[member])
                default:
                    
                    listItem.setAttribute('id',listType+member)
                    text = document.createTextNode(list[member])
                    $(listItem).on({
                        keydown: (event)=>{
                            let filteredList = $('#'+listType+'-listBox .listItem:visible')
                            let index = Number(document.getElementById(`${listType}-choice`).getAttribute('tabindex'))
                            // let index = Number(listItem.parentNode.previousElementSibling.lastChild.firstChild.getAttribute('tabindex'))
                            switch(event.key){
                                case 'Tab':
                                    closeDropDowns()
                                    chooseListItem(event,input,txtSection,event.target,box)
                                break;
                                case 'ArrowDown':
                                    navigateListBox(event,box,filteredList)
                                break;
                                case 'ArrowUp':
                                    navigateListBox(event,box,filteredList)
                                break;
                                case 'Enter':
                                    console.log('enter hit while focus on listitem')
                                    listItem.click()
                                    switch(listType){
                                        case 'Designation' :
                                            if(event.target.innerHTML == 'Scheduled'){
                                       
                                                document.getElementById('dateSchWrapper').classList.remove('hiddenInput')
                                                document.getElementById('dateSchWrapper').classList.add('visibleInput')
                                            }else{
                                                document.getElementById('dateSchWrapper').classList.remove('visibleInput')
                                                document.getElementById('dateSchWrapper').classList.add('hiddenInput')
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                    navigateTabs('down',index)
                                    chooseListItem(event,input,txtSection,event.target,box)
                                break;
                                default:
                                    break;
                            }
                            
                           
                        },
                        // mousedown: (event)=>{
                        //     console.log('mousedown')
                        // },
                        mousedown: (event)=>{
                            event.preventDefault()
                            // let index = Number(listItem.parentNode.previousElementSibling.lastChild.firstChild.getAttribute('tabindex'))
                            let index = Number(document.getElementById(`${listType}-choice`).getAttribute('tabindex'))
                            console.log(txtSection)
                            console.log('mousedown index ='+index)
                            console.log('clicking designation item and state = '+state)

                            switch(listType){
                                case 'Designation' :
                                    if(event.target.innerHTML == 'Scheduled'){
                               
                                        document.getElementById('dateSchWrapper').classList.remove('hiddenInput')
                                        document.getElementById('dateSchWrapper').classList.add('visibleInput')
                                        if(document.getElementById('cbOTL_scheduled')?.checked){
                                            document.getElementById('cbOTL_scheduled').click()
                                        }
                                    }else{
                                        document.getElementById('dateSchWrapper').classList.remove('visibleInput')
                                        document.getElementById('dateSchWrapper').classList.add('hiddenInput')
                                    }
                                    break;
                                default:
                                    break;
                            }
                            
                            //open schedule input if schedule chosen
                            
                            // if(listType =='Customer'){
                            //     if(!contactChosen){
                            //         // resetListBox(listBox)
                            //     }
                            //     fillContactsNew(ipc.sendSync('get-contacts',listItem.id.substring(8)))
                            // }
                            button.firstChild.classList.remove('up')
                            button.firstChild.classList.add('down')
                            chooseListItem(event,input,txtSection,event.target,box)
                           
                            navigateTabs('down',index)
                           
                        }
                    })
                    break;
                    
            }
            
            
            listItem.appendChild(text)
            
           
            box.appendChild(listItem)
        }
    }
    let fillListBox = (element)=>{
        element.innerHTML =''
        switch(listType){
            case 'Customer':
                list.sort((a, b) => (a.customer_name > b.customer_name) ? 1 : -1)
                for(var member in list){
                    let customer = document.createElement('div')
                    customer.setAttribute('class', 'listItem')
                    customer.setAttribute('id', `listItem${list[member].customer_ID}`)
                    let txtName = document.createTextNode(list[member].customer_name)
                    customer.appendChild(txtName)
                    customer.tabIndex = -1

                    //customer.addEventListener('click',(event)=>{
                        $(customer).on({
                            keydown: (event)=>{
                                console.log('list item keydown')
                                //move to next listItem on arrowdow key
                                if(event.key == 'ArrowDown'){
                                    
                                    pastFocusedItem = currentFocusedItem
                                    currentFocusedItem = nextFocusedItem
                                    nextFocusedItem = document.querySelector(`${element} :nth-Child(${itemIndex})`)
                                    nextFocusedItem.focus()
                                    itemIndex++

                                }
                                if(event.key == 'ArrowUp'){
                                    itemIndex--
                                }
                            },
                            click: ()=>{
                                console.log('listItem clicked. State = '+state)
                                let contactID = ipc.sendSync('get-contacts',event.target.id.substring(8))
                                let txtSection = document.getElementById(listType+'-choice')
                                let listBox = document.getElementById(listType+'-listbox')
                                let input = document.getElementById(listType)
                                let button = document.getElementById(listType+'-button')
                                txtSection.innerHTML = customer.innerHTML
                                listBox.style.animationDuration = '300ms'
                                listBox.style.transform = 'scaleY(0)'
                                input.classList.remove('flatBottom')
                                input.classList.add('fullRound')
                                button.classList.remove('pullUpButton');
                                button.classList.add('dropDownButton');
                                txtSection.classList.add('leftHalfRound')
                                txtSection.classList.remove('leftFlatBottom')
                                fillContactsNew(contactID)
                                listBox.setAttribute('data-state','closed')
                            },
                            blur: ()=>{
                                
                            }
                        })
                       element.appendChild(customer)
                }
            
            break;
            case 'Designation':
                    
                    console.log('list in Designation = '+list[0])
                    let input = document.getElementById(listType+'-choice')
                    let txtSection = document.getElementById(listType+'-choice')
                    let button = document.getElementById(listType+'-button')
                    let listBox = document.getElementById(listType+'-listBox')                        
                    

                    for(var member in list){
                        let designation = document.createElement('div')
                        designation.setAttribute('id',listType+member)
                        designation.setAttribute('class','listItem')
                        designation.tabIndex = -1
                        

                        $(designation).on({
                            keydown: (event)=>{
                                if(event.key == 'ArrowDown' || event.key == 'ArrowUp'){
                                    navigateListBox(event,listBox,list)
                                }
                                if(event.key == 'Enter'){
                                    chooseListItem(event,input,txtSection,button,listBox)
                                }
                                
                            },
                            click: (event)=>{
                                console.log('clicking designation item and state = '+state)
                                //open schedule input if schedule chosen
                                if(event.target.innerHTML == 'Scheduled'){
                                   
                                    document.getElementById('dateWrapper').classList.remove('hiddenInput')
                                    document.getElementById('dateWrapper').classList.add('visibleInput')
                                }else{
                                    document.getElementById('dateWrapper').classList.remove('visibleInput')
                                    document.getElementById('dateWrapper').classList.add('hiddenInput')
                                }
                                chooseListItem(event,input,txtSection,button,listBox)
                            }
                        })
                        
                        let txtDesignation = document.createTextNode(list[member])
                        designation.appendChild(txtDesignation)
                        element.appendChild(designation)    
                    }
                break;
                case 'Job-Type':
                    {
                    console.log('list in Designation = '+list[0])
                    let input = document.getElementById(listType+'-choice')
                    let txtSection = document.getElementById(listType+'-choice')
                    let listBox = document.getElementById(listType+'-listBox')                        
                    let button = document.getElementById(listType+'-button')

                    for(var member in list){
                        let jobType = document.createElement('div')
                        jobType.setAttribute('id',listType+member)
                        jobType.setAttribute('class','listItem')
                        jobType.tabIndex = -1
                        
                        $(jobType).on({
                            keydown: (event)=>{
                                navigateListBox(event,listBox,list)
                            }
                        })
                        jobType.addEventListener('click',(event)=>{
                            console.log('clicking designation item and state = '+state)
                            input.innerHTML = event.target.innerHTML;
                            element.style.animationDuration = '300ms'
                            element.style.transform = 'scaleY(0)'
                            input.classList.remove('flatBottom')
                            input.classList.add('fullRound')
                            button.classList.remove('pullUpButton');
                            button.classList.add('dropDownButton');
                            txtSection.classList.add('leftHalfRound')
                            txtSection.classList.remove('leftFlatBottom')
                            element.setAttribute('data-state','closed')
                        })
                        let txtJobType = document.createTextNode(list[member])
                        jobType.appendChild(txtJobType)
                        element.appendChild(jobType)   
                    } 
                    }
                break;
                default:
                    break;
       
       
        
        }
    }
    let createSplitSelectBox = ()=>{
        container.setAttribute('data-type',componentType)
        //console.log('split select called')
        /**
         * create split select box
         */

        //wrapper for label and simulated select element
        let inputWrapper = document.createElement('div')
        inputWrapper.setAttribute('class','inputAndLabelWrapper')

        //label
        let label = document.createElement('label')
        let txtLabel = document.createTextNode(`${listType}`)
        label.appendChild(txtLabel) 
        label.setAttribute('class','label') 

        
        //select element
        let selectBox = document.createElement('div')
        selectBox.setAttribute('id',`${listType}-input`)
        selectBox.setAttribute('class', 'selectBox fullRound')
        
        
        
        selectBox.addEventListener('mousedown',(event)=>{
            //event.preventDefault()
            console.log('toggling in split select selectBox focus event')
            toggleDropDowns('Customer txtSection mousedown',listBox,arrow)
            
        })

         //left side info section within select input
        let info = document.createElement('div')
        info.setAttribute('class','displayedInfo')
        info.setAttribute('id',`${listType}-info`)

        //center section for displayed input
        let choice = document.createElement('div')
        choice.setAttribute('class','choice')
        choice.setAttribute('id',`${listType}-choice`)
        // choice.setAttribute('contenteditable','true')
        choice.tabIndex = getTabIndex(listType, page)
        $(choice).on({
            focus: (event)=>{
                event.preventDefault()
                closeDropDowns()
                if(state == 'closed'){
                    console.log('toggling in split select choice focus event')
                    toggleDropDowns('Customer txtSection mousedown',listBox,arrow)
                }
                //toggleDropDowns('Customer txtSection mousedown',listBox,arrow)
                console.log('split select choice element focus fired')
            },
            keydown: (event)=>{
                // event.preventDefault()
                let e = $('#'+listType+'-listBox .optionGroup .option')
                let focusedIndex
                let pastIndex
                let nextIndex
                switch(event.key){
                    case 'ArrowDown':
                        focusedIndex =0
                        pastIndex = e.length -1
                        nextIndex = 1 
                        for(i=0;i<e.length;i++){
                            if(e[i].classList.contains('focusedListItem')){
                                if(i == e.length-1){
                                    focusedIndex = 0
                                    pastIndex = e.length - 1
                                    nextIndex = 1
                                    itemIndex = 0
                                }else{
                                    focusedIndex = i+1
                                    pastIndex = i
                                    nextIndex = i+2
                                    itemIndex = i+1
                                }
                                
                                e[i].classList.remove('focusedListItem')
                            }
                        }
                        usingListBox = true; 
                        e[focusedIndex].focus()
                        e[focusedIndex].classList.add('focusedListItem')
                        pastFocusedItem = e[pastIndex]
                        currentFocusedItem = e[focusedIndex]
                        nextFocusedItem = e[nextIndex]
                        break;
                    case 'ArrowUp':
                        usingListBox = true
                        focusedIndex = e.length - 1
                        itemIndex = focusedIndex
                        pastIndex = 0
                        nextIndex = e.length - 2 
                        for(i=0;i<e.length;i++){
                            if(e[i].classList.contains('focusedListItem')){
                                if(i !== 0){
                                    focusedIndex = i - 1
                                    pastIndex = i
                                    nextIndex = i - 2
                                    itemIndex = i - 1
                                 }
                                
                                
                                e[i].classList.remove('focusedListItem')
                            }
                        }
                        e[focusedIndex].focus()
                        e[focusedIndex].classList.add('focusedListItem')
                        currentFocusedItem = e[focusedIndex]//listBox.childNodes[1]
                        pastFocusedItem = e[pastIndex]//listBox.firstChild
                        nextFocusedItem = e[nextIndex]//listBox.childNodes[1] 
                        break;
                    case 'Tab':
                        event.preventDefault()
                        let ti = Number(choice.getAttribute('tabindex'))
                        
                        
                        if(event.shiftKey){
                            console.log('tabindex up = '+ti)
                            navigateTabs('up',ti)
                        }else{
                            console.log('tabindex down = '+ti)
                            navigateTabs('down',ti)
                        }
                        toggleDropDowns(null,listBox,arrow)
                        break;
                    default:
                        break;
                }
                // if(event.key == 'ArrowDown'){                 
                        

                //         let focusedIndex =0
                //         let pastIndex = e.length -1
                //         let nextIndex = 1 
                //         for(i=0;i<e.length;i++){
                //             if(e[i].classList.contains('focusedListItem')){
                //                 if(i == e.length-1){
                //                     focusedIndex = 0
                //                     pastIndex = e.length - 1
                //                     nextIndex = 1
                //                     itemIndex = 0
                //                 }else{
                //                     focusedIndex = i+1
                //                     pastIndex = i
                //                     nextIndex = i+2
                //                     itemIndex = i+1
                //                 }
                                
                //                 e[i].classList.remove('focusedListItem')
                //             }
                //         }
                //         usingListBox = true; 
                //         e[focusedIndex].focus()
                //         e[focusedIndex].classList.add('focusedListItem')
                //         pastFocusedItem = e[pastIndex]
                //         currentFocusedItem = e[focusedIndex]
                //         nextFocusedItem = e[nextIndex]
                       
                       
                // }         
                
            
            // if(event.key == 'ArrowUp'){
            //     usingListBox = true
            //     let focusedIndex = e.length - 1
            //     itemIndex = focusedIndex
            //     let pastIndex = 0
            //     let nextIndex = e.length - 2 
            //     for(i=0;i<e.length;i++){
            //         if(e[i].classList.contains('focusedListItem')){
            //             if(i !== 0){
            //                 focusedIndex = i - 1
            //                 pastIndex = i
            //                 nextIndex = i - 2
            //                 itemIndex = i - 1
            //              }
                        
                        
            //             e[i].classList.remove('focusedListItem')
            //         }
            //     }
            //     e[focusedIndex].focus()
            //     e[focusedIndex].classList.add('focusedListItem')
            //     currentFocusedItem = e[focusedIndex]//listBox.childNodes[1]
            //     pastFocusedItem = e[pastIndex]//listBox.firstChild
            //     nextFocusedItem = e[nextIndex]//listBox.childNodes[1] 
            // }
        }


        })

        //button section with up/down arrow
        let button = document.createElement('div')
        button.setAttribute('class','arrowBox')
        button.setAttribute('id',`${listType}-button`)

        let arrow = document.createElement('div')
        arrow.setAttribute('class','arrow down')
        //box that holds options...simulated datalist
        let listBox = document.createElement('div')
        listBox.setAttribute('class','listBox')
        listBox.setAttribute('id',`${listType}-listBox`)
        listBox.setAttribute('data-state','closed')

        //assemble elements 
        inputWrapper.appendChild(label)
        button.appendChild(arrow)
        selectBox.appendChild(info)
        selectBox.appendChild(choice)
        selectBox.appendChild(button)
        inputWrapper.appendChild(selectBox)
        
        container.appendChild(inputWrapper)
        container.appendChild(listBox)

     
    }

    
    let createSelectBox = ()=>{
        container.setAttribute('data-type',componentType)
       
         //wrapper for label and simulated select element
         let inputWrapper = document.createElement('div')
         inputWrapper.setAttribute('class','inputAndLabelWrapper')
 
         //label
         let label = document.createElement('label')
         let txtLabel = document.createTextNode(`${listType}`)
         label.appendChild(txtLabel) 
         label.setAttribute('class','label') 
 
         
         //select element
         let selectBox = document.createElement('div')
         selectBox.setAttribute('id',`${listType}-input`)
         selectBox.setAttribute('class', 'selectBox fullRound')
         $(selectBox).on({
            click: (event)=>{
                state = listBox.getAttribute('data-state')
                 console.log('selectBox clicked. State:'+state )
                 if(state == 'closed'){
                    
                     listBox.style.animationDuration = '300ms'
                     listBox.style.transform = 'scaleY(1)'                    
                     arrow.classList.remove('down')
                     arrow.classList.add('up')                     
                     fillListBox2(listBox)                     
                     listBox.setAttribute('data-state','open')                    
                     usingListBox = true

                 }else{
                   
                     //selectBox.classList.add('fullRound')
                     //selectBox.classList.remove('flatBottom')
                     listBox.style.animationDuration = '300ms'
                     listBox.style.transform = 'scaleY(0)'
                     //button.classList.remove('pullUpButton');
                     //button.classList.add('dropDownButton');
                     arrow.classList.remove('up')
                     arrow.classList.add('down')
                     //choice.classList.add('leftHalfRound')
                     //choice.classList.remove('leftFlatBottom')
                     listBox.setAttribute('data-state','closed')
                     usingListBox = false
                 }
            }
         })
         //TODO: add a way to determine tabindex order if(selectBox.listType == 'Designation')
         
       
         
        
 
         //center section for displayed input
         let choice = document.createElement('div')
         choice.setAttribute('class','choiceSelect')
         choice.setAttribute('id',`${listType}-choice`)
         choice.tabIndex = getTabIndex(listType, page)
         choice.setAttribute('contenteditable',true)

         
         $(choice).on({
            focus: (event)=>{
                //event.preventDefault()
                //choice.innerHTML = ''
                previousFocusedElement = choice.id
                //choice.style.outline = 'none'
                console.log(document.activeElement)
                closeDropDowns()
                fillListBox2(listBox)
                toggleDropDowns(null,listBox,arrow)
            },
            blur: (event)=>{
                console.log('blur in choice fired')
                
                
                if(!usingListBox){
                    closeDropDowns()
                   
                }
                
                
            },
            mousedown: (event)=>{
                event.preventDefault()
            },
            click: (event)=>{
                
                choice.focus()
                
            },
            dblclick: (event)=>{
                choice.innerHTML = ''
                //choice.focus()
            },
            keydown: (event)=>{
                console.log(event.key)
                let e = $('#'+listType+'-listBox .listItem:visible')
                let ti = Number(event.target.getAttribute('tabindex'))
                switch(event.key){
                    case 'ArrowDown':
                        usingListBox = true

                        e[0].focus()
                        e[0].classList.add('focusedListItem')
                        currentFocusedItem = e[0]
                        
                        nextFocusedItem = e[1]
                        
                        break;
                    case 'Tab': 
                    usingListBox = false
                    console.log('select box TAB event')
                    closeDropDowns()
                        event.preventDefault()
                        
                        if(listType == 'Designation'){
                            if(choice.innerHTML == 'Scheduled'){
                                document.getElementById('dateWrapper').classList.remove('hiddenInput')
                                document.getElementById('dateWrapper').classList.add('visibleInput')
                                //document.getElementById('dateWrapper').style.display = 'block'
                                // $("#radAM").focus()
                                
                            }else{
                                document.getElementById('dateWrapper').classList.add('hiddenInput')
                                document.getElementById('dateWrapper').classList.remove('visibleInput')
                                //document.getElementById('dateWrapper').style.display = 'none'
                                // $('#Customer-choice').focus()
                            }
                            
                        }else{
                        console.log(choice.tabIndex)
                        
                        
                        }
                        navigateTabs('down',ti)
                        if(event.shiftKey){
                            navigateTabs('up',ti)
                        }
                        break;
                    case 'Enter':
                        usingListBox = false
                        event.preventDefault()
                        if(listType == 'Designation'){
                            if(choice.innerHTML == 'Scheduled'){
                                document.getElementById('dateWrapper').classList.remove('hiddenInput')
                                document.getElementById('dateWrapper').classList.add('visibleInput')
                                //document.getElementById('dateWrapper').style.display = 'block'
                                $("#radAM").focus()
                            }else{
                                document.getElementById('dateWrapper').classList.add('hiddenInput')
                                document.getElementById('dateWrapper').classList.remove('visibleInput')
                                //document.getElementById('dateWrapper').style.display = 'none'
                                $('#Customer-choice').focus()
                            }
                            
                        }else{
                        console.log(choice.tabIndex)
                        
                        //currentFocusedItem = listBox.firstChild
                        //currentFocusedItem.focus()
                        }
                        break;
                        
                    default:
                        
                    break;
                }
                
            },
            keyup: (event)=>{
                let ti = Number(event.target.getAttribute('tabindex'))
                if(listType == 'Designation'){
                    if(event.key ==='s' || event.key ==='S'){
                        choice.innerHTML = 'Scheduled'
                        usingListBox = false
                        event.preventDefault()
                        if(listType == 'Designation'){
                            if(choice.innerHTML == 'Scheduled'){
                                document.getElementById('dateWrapper').classList.remove('hiddenInput')
                                document.getElementById('dateWrapper').classList.add('visibleInput')
                                //document.getElementById('dateWrapper').style.display = 'block'
                                $("#radAM").focus()
                            }else{
                                document.getElementById('dateWrapper').classList.add('hiddenInput')
                                document.getElementById('dateWrapper').classList.remove('visibleInput')
                                //document.getElementById('dateWrapper').style.display = 'none'
                                $('#Customer-choice').focus()
                            }
                        }
                        navigateTabs('down',ti)
                    }
                    if(event.key ==='o' || event.key ==='O'){
                        choice.innerHTML = 'On the Lot'
                        navigateTabs('down',ti)
                    }
                }
                if(listType == 'JobType'){                    
                    if(event.key ==='s' || event.key ==='S'){
                        choice.innerHTML = 'Spring'
                        navigateTabs('down',ti)
                    }
                    if(event.key ==='c' || event.key ==='C'){
                        choice.innerHTML = 'Check All'
                        navigateTabs('down',ti)
                    }
                    if(event.key ==='a' || event.key ==='A'){
                        choice.innerHTML = 'Alignment'
                        navigateTabs('down',ti)
                    }
                    if(event.key ==='k' || event.key ==='K'){
                        choice.innerHTML = 'King Pin'
                        navigateTabs('down',ti)
                    }
                    if(event.key ==='f' || event.key ==='F'){
                        choice.innerHTML = 'Frame'
                        navigateTabs('down',ti)
                    }
                    
                }
                var text = choice.innerText.toUpperCase();
                        // for (let option of document.getElementsByClassName('listItem')) {
                        //     if(option.innerText.toUpperCase().indexOf(text) > -1){
                        //         option.style.display = "block";
                        //         if(option.innerText.toUpperCase()===text){
                        //             option.classList.add('exactMatch')
                        //             //fillContactsNew(ipc.sendSync('get-contacts',option.id.substring(8)))
                        //             //createDropDown(list[member])
                        //         }else{
                        //             option.classList.remove('exactMatch')
                                
                        //         }
                        //     }else{
                        //         option.style.display = "none";
                        //     }
                        // } 
                        // let visibleListItems = $('#'+listType+'-listBox .listItem:visible') 
                        //     if(visibleListItems.length == 1){
                        //         autoComplete.innerHTML = visibleListItems[0].innerHTML
                                
                        //         // let end = choice.innerHTML.length
                        //         // $(choice).setSelectionRange(end,end)
                                
                        //     }
                        //     if(choice.innerHTML.length == 0){
                        //         autoComplete.innerHTML = ''
                        //     }
                        
                        
            }

         })
        //  for(var member in list){
        //     let opt = document.createElement('option')
        //     let optText = document.createTextNode(list[member])
        //     opt.appendChild(optText)
        //     choice.appendChild(opt)
        //  }

        //underlying autocomplete box
        let autoComplete = document.createElement('span')
        autoComplete.setAttribute('id',`${listType}-autoComplete`)
        autoComplete.setAttribute('class','choiceAutoComplete')
        
         //button section with up/down arrow
         let button = document.createElement('div')
         button.setAttribute('class','arrowBox')
         button.setAttribute('id',`${listType}-button`)

         let arrow = document.createElement('div')
         arrow.setAttribute('class','arrow down')
        //  $(button).on({
        //     click : (event)=>{
        //         //choice.blur()
        //         //choice.focus()
        //         state = listBox.getAttribute('data-state')
        //         console.log('button click. State:'+state )
        //         if(state == 'closed'){
        //             console.log('state = '+state+' from button click')
        //         //console.log('dropdown is closed click event')
        //         //closeDropDowns()
        //         choice.focus()
        //             // selectBox.classList.remove('fullRound')
        //             // selectBox.classList.add('flatBottom')
        //             // listBox.style.animationDuration = '300ms'
        //             // listBox.style.transform = 'scaleY(1)'
        //             // button.classList.remove('dropDownButton');
        //             // button.classList.add('pullUpButton');
        //             // choice.classList.add('leftFlatBottom')
        //             // choice.classList.remove('leftHalfRound')
        //             // fillListBox2(listBox)
        //             // //listBox.firstChild.focus()
        //             // //listBox.firstChild.classList.add('focusedListItem')
        //             // //currentFocusedItem = listBox.firstChild
        //             listBox.setAttribute('data-state','open')
        //             // console.log(document.activeElement)
                    
        //         }else{
        //             choice.blur()
        //             // selectBox.classList.add('fullRound')
        //             // selectBox.classList.remove('flatBottom')
        //             // listBox.style.animationDuration = '300ms'
        //             // listBox.style.transform = 'scaleY(0)'
        //             // button.classList.remove('pullUpButton');
        //             // button.classList.add('dropDownButton');
        //             // choice.classList.add('leftHalfRound')
        //             // choice.classList.remove('leftFlatBottom')
        //             // listBox.setAttribute('data-state','closed')
        //         }
        //     }
        //  })
 
         //box that holds options...simulated datalist
         let listBox = document.createElement('div')
         listBox.setAttribute('class','listBox')
         listBox.setAttribute('id',`${listType}-listBox`)
         listBox.setAttribute('data-state','closed')
 
         //assemble elements 
         inputWrapper.appendChild(label)
         //choice.appendChild(autoComplete)
         button.appendChild(arrow)
         selectBox.appendChild(choice)
         //selectBox.appendChild(autoComplete)
         selectBox.appendChild(button)
         inputWrapper.appendChild(selectBox)
         
         container.appendChild(inputWrapper)
         container.appendChild(listBox)


         $(listBox).on({
            // focus: ()=>{
            //     console.log('select box focus fired')
            //     selectBox.classList.remove('fullRound')
            //      selectBox.classList.add('flatBottom')
            //      listBox.style.animationDuration = '300ms'
            //      listBox.style.transform = 'scaleY(1)'
            //      button.classList.remove('dropDownButton');
            //      button.classList.add('pullUpButton');
            //      choice.classList.add('leftFlatBottom')
            //      choice.classList.remove('leftHalfRound')
            //      //fillListBox(listBox)
            //      state= 'open';
            // },
            blur: ()=>{
                console.log('select box blur fired')
                //selectBox.classList.add('fullRound')
                //selectBox.classList.remove('flatBottom')
                listBox.style.animationDuration = '300ms'
                listBox.style.transform = 'scaleY(0)'
                button.classList.remove('up');
                button.classList.add('down');
                //choice.classList.add('leftHalfRound')
                //choice.classList.remove('leftFlatBottom')
                state= 'closed';
            }
         })
    }
    

    let createDateBox = (which)=>{
        let id = `${listType}-choice`
        // if(which){
        //     id = `${listType}${which}-choice`
        // }else{
        //     id = `${listType}-choice`
        // }
        
        container.setAttribute('data-type',componentType)

        //create wrapper
        let wrapper = document.createElement('div')
        wrapper.setAttribute('class','inputAndLabelWrapper')
        wrapper.setAttribute('id',listType+'-wrapper')
        
        

        //create label
        let label = document.createElement('label')
        let labelText 
        switch(which){
            case 'In':
                labelText = 'Date In'
                break;
            case 'Sched':
            case 'OTL':
                labelText = 'Date Scheduled'
                break;
            default:
                labelText = 'Date Scheduled'
                break;
                
        }
        let txtLabel = document.createTextNode(labelText)
        label.setAttribute('class','label')

        //create input
        let input = document.createElement('div')
        input.setAttribute('id', listType)
        input.setAttribute('class', 'comboBox fullRound')
        
        
        //create text field
        let txtSection = document.createElement('input')
        txtSection.setAttribute('id',id)
        txtSection.setAttribute('class','choiceDate')
        txtSection.setAttribute('contenteditable', true)
        txtSection.setAttribute('data-state','closed')
        txtSection.tabIndex = getTabIndex(listType, page)
        $(txtSection).on({
            focus: (event)=>{
                closeDropDowns()
                state = event.target.getAttribute('data-state')
                console.log('mousedown date txtsection')
                if(state == 'closed'){
                    
                    event.target.setAttribute('data-state','open')
                    arrow.classList.remove('down');
                    arrow.classList.add('up');
                    
                }
                
            },
            blur: (event)=>{
                event.target.setAttribute('data-state','closed')
                arrow.classList.remove('up');
                arrow.classList.add('down');
            },
            
            mousedown: (event)=>{
                closeDropDowns()
                state = event.target.getAttribute('data-state')
                console.log('mousedown date txtsection')
                if(state == 'closed'){
                    
                    event.target.setAttribute('data-state','open')
                    arrow.classList.remove('down');
                    arrow.classList.add('up');
                    
                }
                if(state == 'open'){
                    // event.target.setAttribute('data-state','closed')
                    // arrow.classList.remove('up');
                    // arrow.classList.add('down');
                    
                }
            }
        })

        //create button
        let button = document.createElement('div')
        button.setAttribute('id','btn-'+listType)
        button.setAttribute('class','arrowBox')
        $(button).on({
            click: (event)=>{
                closeDropDowns()
                
                state = txtSection.getAttribute('data-state')
                console.log('mousedown date button, state = '+state)
                if(state == 'closed'){
                    txtSection.focus()
                    txtSection.setAttribute('data-state','open')
                    arrow.classList.remove('down');
                    arrow.classList.add('up');
                    //txtSection.focus()
                    
                }
                if(state == 'open'){
                    txtSection.setAttribute('data-state','closed')
                    arrow.classList.remove('up');
                    arrow.classList.add('down');
                    txtSection.blur()
                    
                }
            }
        })

        //create arrow
        let arrow = document.createElement('div')
        arrow.setAttribute('class', 'arrow down')
        $(arrow).on({
            
            click: (event)=>{
                event.stopImmediatePropagation()
                closeDropDowns()
                
                state = txtSection.getAttribute('data-state')
                console.log('mousedown date button, state = '+state)
                if(state == 'closed'){
                    txtSection.focus()
                    txtSection.setAttribute('data-state','open')
                    arrow.classList.remove('down');
                    arrow.classList.add('up');
                    //txtSection.focus()
                    
                }
                if(state == 'open'){
                    txtSection.setAttribute('data-state','closed')
                    arrow.classList.remove('up');
                    arrow.classList.add('down');
                    txtSection.blur()
                    
                }
            }
        })


        if(which !== 'In'){
            //create radio buttons
            let rbWrapper = document.createElement('div')
            rbWrapper.setAttribute('class','dateInfo')

            let amWrapper = document.createElement('div')
            amWrapper.setAttribute('class','ampmWrapper')
            
            let pmWrapper = document.createElement('div')
            pmWrapper.setAttribute('class','ampmWrapper')

            let amLabel = document.createElement('label')
            
            let txtAMlabel = document.createTextNode('AM')
            amLabel.appendChild(txtAMlabel)

            //

            let radAM = document.createElement('input')
            radAM.setAttribute('type','radio')
            
            radAM.setAttribute('value','am')
            radAM.setAttribute('checked',true)
            
            $(radAM).on({
                focus: (event)=>{
                    closeDropDowns()
                }
            })
            

            let radPM = document.createElement('input')
            radPM.setAttribute('type','radio')
            
            radPM.setAttribute('value','pm')
            
            $(radPM).on({
                focus: (event)=>{
                    closeDropDowns()
                }
            })

            //determine if Sched or OTL datebox
            if(which == 'Sched'){
                radAM.setAttribute('id','radAM')
                radAM.setAttribute('name','ampmSched')
                radAM.tabIndex = getTabIndex('radAM', page)
                
                radPM.setAttribute('id','radPM')
                radPM.setAttribute('name','ampmSched')
                radPM.tabIndex = getTabIndex('radPM', page)
            }else{
                radAM.setAttribute('id','radAM_OTL')
                radAM.setAttribute('name','ampmOTL')
                radPM.tabIndex = getTabIndex('radAM_OTL', page)
                
                radPM.setAttribute('id','radPM_OTL')
                radPM.setAttribute('name','ampmOTL')
                radPM.tabIndex = getTabIndex('radPM_OTL', page)
            }

            let pmLabel = document.createElement('label')
            // pmLabel.setAttribute('class','smallRadioLabel')
            let txtPMlabel = document.createTextNode('PM')
            pmLabel.appendChild(txtPMlabel)


            amWrapper.appendChild(amLabel)
            amWrapper.appendChild(radAM)
            pmWrapper.appendChild(pmLabel)
            pmWrapper.appendChild(radPM)

            rbWrapper.appendChild(amWrapper)
            rbWrapper.appendChild(pmWrapper)

            input.appendChild(rbWrapper)

        }//end if

        //assemble pieces

        label.appendChild(txtLabel)
        wrapper.appendChild(label)

        button.appendChild(arrow)

        
        
        input.appendChild(txtSection)
        input.appendChild(button)
        wrapper.appendChild(input)
        
        container.appendChild(wrapper)



    }

    let createTextBox = ()=>{
        let wrapper = document.createElement('div')
        wrapper.setAttribute('class','inputAndLabelWrapper')

        let label = document.createElement('label')
        label.setAttribute('class','label')
        let txtLabel = document.createTextNode(listType)
        label.appendChild(txtLabel)

        let textBox = document.createElement('input')//div
        textBox.setAttribute('type','text')
        textBox.setAttribute('id',listType+"-choice")
        //textBox.setAttribute('class','selectBox')
        textBox.tabIndex = getTabIndex(listType, page)
        $(textBox).on({
            focus: (event)=>{
                closeDropDowns()
            },
            keydown: (event)=>{
                if(listType == 'Unit' || listType == 'UnitType')
                if($('#Unit-MessageContainer') || $('#UnitType-MessageContainer')){
                    $('#Unit-MessageContainer').remove()
                    $('#UnitType-MessageContainer').remove()
                }
            }
        })

       

        let button = document.createElement('div')
        button.setAttribute('class','dropDownButton')
        

        wrapper.appendChild(label)
        wrapper.appendChild(textBox)
        container.appendChild(wrapper)
    }

    switch(componentType){
        case 'comboBox':
            createComboBox()
            break;
        case 'select':
            createSelectBox()
            break;
        case 'split select':
            createSplitSelectBox()
        break;
        case 'textBox':
            createTextBox()
            break;
        case 'date':
            createDateBox()
            break;
        case 'date in':
            createDateBox('In')
            break;
        case 'date sched':
            createDateBox('Sched')
            break;
        case 'date OTL':
            createDateBox('OTL')
        default:
            break;
    }
   
    
}
let isDOM = (Obj)=> {
              
    // Function that checks whether 
    // object is of type Element
   return Obj instanceof Element;
}
   
    let navigateListBox = (event,listBox,list,ii)=>{
        console.log(list)
        
        if(event.key == 'ArrowDown'){
            event.preventDefault()
            console.log(currentFocusedItem)
            
            //console.log(list[itemIndex])
            /***
             *  if its not the last item in the list increment index by one
             *  if it is the last reset index to 0
             */
            
            if(itemIndex<list.length-1){
                if(event.target.id == 'addNewContact'){
                    itemIndex = 1
                }else{
                itemIndex++
                }
            }else{
                itemIndex = 0
            }

            console.log('itemIndex after increment in arrow down = '+itemIndex)
            currentFocusedItem = list[itemIndex]
                   
            if(itemIndex == 0){
                pastFocusedItem = list[list.length - 1]
            }else{
                pastFocusedItem = list[itemIndex-1]
            }
            
            if(itemIndex == list.length -1){
                console.log('itemIndex = length -1')
                nextFocusedItem = list[0]
            }else{
                nextFocusedItem = list[itemIndex+1]
            }
           

            
            console.log(itemIndex)
            console.log('curentFocusedItem below')
            console.log(currentFocusedItem)
            currentFocusedItem.focus()
            console.log(document.activeElement)
            currentFocusedItem.classList.add('focusedListItem')
            pastFocusedItem.classList.remove('focusedListItem')
            
            console.log(' ArrowDown past focused item = '+pastFocusedItem.innerHTML)
            console.log('ArrowDown current focused item = '+currentFocusedItem.innerHTML)
            console.log('ArrowDown next focused item = '+nextFocusedItem.innerHTML)
            console.log('itemIndex = '+itemIndex)
        }
        if(event.key == 'ArrowUp'){
            event.preventDefault()
            console.log('itemIndex before arrow down = '+itemIndex)
            if(itemIndex< 1){
                itemIndex = list.length-1
                
            }else{
                
                itemIndex--
            }
            console.log('itemIndex after arrow down = '+itemIndex)
            if(itemIndex == list.length - 1){
                pastFocusedItem = list[0]
            }else{
                pastFocusedItem = list[itemIndex+1]
            }
            
            if(itemIndex == 0){
                nextFocusedItem = list[list.length -1]
            }else{
                nextFocusedItem = list[itemIndex-1]
            }
            //nextFocusedItem = list[itemIndex - 1]
            
            //pastFocusedItem = currentFocusedItem
            currentFocusedItem = list[itemIndex]
            

           
            console.log('itemIndex after = '+itemIndex)
            //pastFocusedItem = (pastFocusedItem.previousElementSibling)? pastFocusedItem.previousElementSibling : listBox.lastChild
            //console.log(listBox.childNodes)
            //console.log(nextFocusedItem.nextElementSibling)
           // nextFocusedItem = (nextFocusedItem.nextElementSibling)? nextFocusedItem.nextElementSibling : listBox.firstChild
            //$(`#${listType+'-listBox'} :nth-Child(${itemIndex})`)
            console.log('ArrowUp past focused item = '+pastFocusedItem.innerHTML)
            console.log('ArrowUp current focused item = '+currentFocusedItem.innerHTML)
            console.log('ArrowUp next focused item = '+nextFocusedItem.innerHTML)
            currentFocusedItem.focus()
            currentFocusedItem.classList.add('focusedListItem')
            pastFocusedItem.classList.remove('focusedListItem')
            //navigateTabs()
        }
    

    }
let navigateTabs = (direction, ind)=>{
    let tabbable = document.querySelectorAll('[tabindex]:not(.listItem):not(.option)')
    let rect
    console.log(tabbable.length)
    let nextElement 
    let dex = ind
    // ind = 7
    //direction = 'up'
    console.log(document.querySelectorAll(`[tabindex="${ind}"]`))
    if(direction == 'up'){
        if(dex > 1){
            dex = ind -1           
        }else{
            dex = tabbable.length             
        }
        
        rect = document.querySelectorAll(`[tabindex="${dex}"]`)[0].getBoundingClientRect()
        while(rect.top == 0){
            dex-=1
            rect = document.querySelectorAll(`[tabindex="${dex}"]`)[0].getBoundingClientRect()
        }
        
        nextElement = document.querySelectorAll(`[tabindex="${dex}"]`)[0]  
        console.log('next element index is '+nextElement.getAttribute('tabindex'))     
        nextElement.focus()
    }


    if(direction == 'down'){
        if(dex == tabbable.length){
            dex = 1           
        }else{
            dex = ind + 1            
        }
        console.log(dex)
        rect = document.querySelectorAll(`[tabindex="${dex}"]`)[0].getBoundingClientRect()
        while(rect.top == 0){
            console.log('dex = '+dex)
            dex+=1
            rect = document.querySelectorAll(`[tabindex="${dex}"]`)[0].getBoundingClientRect()
        }
        
        nextElement = document.querySelectorAll(`[tabindex="${dex}"]`)[0]  
        console.log('next element index is '+nextElement.getAttribute('tabindex'))     
        nextElement.focus()
    }
    tabbable.forEach(item =>{
        // console.log(item)
    })
    // console.log(tabbable)

}

let clearSuggestion = (type)=>{
   // document.getElementById(`${type}-autoComplete`).innerHTML =''
} 
let clearSelected = (type)=>{
    let filteredListItems
    if(type == 'Contacts'){
        filteredListItems = $('#'+type+'-listBox .option')
    }else{
        filteredListItems = $('#'+type+'-listBox .listItem')
    }
    console.log('length of list = '+filteredListItems.length)
    for(let el in filteredListItems){
        if(isDOM(filteredListItems[el])){
            filteredListItems[el].classList.remove('focusedListItem')
        }
    }
}
let chooseListItem = (event, input, txtSection, chosen,listBox)=>{
    usingListBox = false
    contactChosen = true
    //console.log(chosen)
    console.log(event.type)
    //console.log(input.id)
    let type = input.getAttribute('id').split('-')

    if($(`#${type[0]}-MessageContainer`)){
        $(`#${type[0]}-MessageContainer`).remove()
    }
    
    clearSelected(type[0])
    if(event.type == 'keyup'){
        chosen.classList.add('focusedListItem')
        chosen.setAttribute('data-selected',true)
        currentFocusedItem = chosen
       
        txtSection.innerHTML = chosen.innerHTML;
        
    }else{
        event.target.classList.add('focusedListItem')
        currentFocusedItem = event.target
        event.target.setAttribute('data-selected',true)
        txtSection.innerHTML = event.target.innerHTML;
    }
    let arrVisibleItems = Array.from($(`#${type[0]}-listBox .listItem:visible`))
    switch(type[0]){
        case 'JobType':
        case 'Designation':
            chosen.classList.add('focusedListItem')
            chosen.setAttribute('data-selected',true)
            currentFocusedItem = chosen
            txtSection.innerHTML = chosen.innerHTML;
            break;
        case 'Customer':
            let cid = chosen.getAttribute('id').substring(8)
            console.log('cid = '+cid)
            txtSection.setAttribute('data-cid',cid)			
			
			//if(arrVisibleItems.length == 1){
				//if(checkForNoShows(arrVisibleItems[0].getAttribute('id').substring(8))){
                    console.log('before check for no shows')
                if(checkForNoShows(cid)){
					if($('#Customer-MessageContainer')){
						$('#Customer-MessageContainer').remove()
					}
					
					//if(arrVisibleItems[0].innerHTML == txtSection.innerHTML.toUpperCase()){
                        console.log('inside check for no show')
						txtSection.parentNode.parentNode.appendChild(createMessageBox(type[0],'no_show'))
					//}
				
					
				}
			// }else{
			// 	if($('#Customer-MessageContainer')){
			// 		$('#Customer-MessageContainer').remove()
			// 	}
				
			// }
            break;
        case 'Contacts':
            txtSection.setAttribute('method',`${chosen.getAttribute('method')}`)
            txtSection.setAttribute('method-ID',`${chosen.getAttribute('method-ID')}`)
            break;
        
    }
    
    
    console.log(txtSection)
    if(glComponentType == 'split select'){
        txtSection.previousSibling.innerHTML = event.target.parentNode.firstElementChild.innerHTML 
    }
    
    console.log(input)
    //split input id by - in order to get the listType for clearing suggestion
    
    console.log(type)
    clearSuggestion(type[0])
    listBox.style.animationDuration = '100ms'
    listBox.style.transform = 'scaleY(0)'
   
    listBox.setAttribute('data-state','closed')
    
    
}

let closeDropDowns = ()=>{
    let lb = document.getElementsByClassName('listBox')
    let listBoxes = Array.from(lb)
    listBoxes.forEach((item)=>{
        
        if(item.getAttribute('data-state')== 'open'){
            let type = item.getAttribute('id').split('-')
            
            toggleDropDowns('l',item, document.getElementById(`${type[0]}-button`).firstChild)
              
            item.setAttribute('data-state','closed');
            
        }
    })
    
       
}  

let toggleDropDowns = (state,dropDown,arrow)=>{
            
   
    state = dropDown.getAttribute('data-state')
    
    if(state == 'closed'){
        closeDropDowns()
        dropDown.style.animationDuration = '300ms'
        dropDown.style.transform = 'scaleY(1)'
        dropDown.setAttribute('data-state','open')
        arrow.classList.remove('down');
        arrow.classList.add('up');
        //usingListBox = true
        //dropDown.setAttribute('state','open')
    }
    if(state == 'open'){
        dropDown.style.animationDuration = '300ms'
        dropDown.style.transform = 'scaleY(0)'
        dropDown.setAttribute('data-state','closed')
        arrow.classList.remove('up');
        arrow.classList.add('down');
        //usingListBox = false
        //dropDown.setAttribute('state','closed')
    }
}

let resetListBox  = (lt)=>{
    //console.log(box)
    let arrFL = Array.from($('#'+lt+'-listBox .listItem'))
    if(lt != 'Contacts'){
        //document.getElementById('Contacts-listBox').innerHTML = '' 
        e = $('#'+lt+'-listBox .listItem:visible')
    }else{
        e = $('#'+lt+'-listBox  .option:not(.addNewOption)')
    }
    
    itemIndex = 0
    arrFL.forEach(element =>{
        //console.log('l')
        element.classList.remove('focusedListItem')
        element.style.display = 'flex'
    })
    if($('#Customer-MessageContainer')){
        $('#Customer-MessageContainer').remove()
    }
    
            
    
}
let resetContacts = ()=>{
    document.querySelector('#Contacts-listBox').innerHTML = ''
    document.querySelector('#Contacts-choice').innerHTML = ''
    document.querySelector('#Contacts-info').innerHTML = ''
    document.querySelector('#Contacts-choice').removeAttribute('method')
    document.querySelector('#Contacts-choice').removeAttribute('method-id')
}
let filterListBox = (el, arrElements)=>{
    let val =el.innerText                
    let arrNames = arrElements
    let fl
    arrNames.forEach((element) =>{
        
        if(element.innerText.toUpperCase().includes(val.toUpperCase().replace(/\u00a0/g,' '))){
            element.style.display = 'flex'
        }else{
            
            element.style.display = 'none'
        }
    })
    fl = arrNames
    //console.log('arrNames length ='+arrNames.length)

    return fl
}

let isExactMatch = (text, list)=>{
    
    let is = false
    //loop through list items
    for (let option of list) {
       
            if(option.innerText.toUpperCase()===text.toUpperCase()){
               is = true
               break; 
            }else{
                is = false            
            }
       
    } 
   return is
}

let createMessageBox = (lt, messageType)=>{
    let messageContainer = document.createElement('div')
    messageContainer.setAttribute('id',`${lt}-MessageContainer`)
    messageContainer.setAttribute('class','messageContainer')

    let message = document.createElement('span')
    let messageText

    switch(lt){
        case 'Customer':
            /**
             *  if no show message box add a link 
             *  to the no show report
             */
            let name = document.querySelector('#Customer-choice').innerText
            console.log(name)
            if(messageType == 'no_show'){
                messageContainer.setAttribute('class','messageContainer warning')
                messageText = document.createTextNode('CUSTOMER HAS NO-SHOW ON RECORD')
                
                let link = document.createElement('span')            
                link.setAttribute('class','actionLink')
                let linkText = document.createTextNode('view')
                link.appendChild(linkText)	
                link.addEventListener('click',()=>{                    
                    ipc.send('open-report-window',currentUser.role, chosenCompanyID,"no_shows",name)
                })
                message.appendChild(messageText)
                messageContainer.appendChild(message)
                messageContainer.appendChild(link)
            }else{
                messageText = document.createTextNode('CUSTOMER REQUIRED')
                message.appendChild(messageText)
                messageContainer.appendChild(message) 
                messageContainer.setAttribute('class','messageContainer invalid')               
            }
            
                
            break;
        case 'Unit':
        case 'UnitType':
            messageText = document.createTextNode(`Unit OR UnitType REQUIRED`)
            message.appendChild(messageText)
            messageContainer.appendChild(message)
            messageContainer.setAttribute('class','messageContainer invalid')
            break;
        
        default:
            
            messageText = document.createTextNode(`${lt} REQUIRED`)
            message.appendChild(messageText)
            messageContainer.appendChild(message)
            messageContainer.setAttribute('class','messageContainer invalid')
            break;
    }          
    
    return messageContainer
}