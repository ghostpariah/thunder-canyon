const calElectron = require('electron')
const calIPC = calElectron.ipcRenderer
const date = new Date();
let allJobs
let scheduledJobs
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
//let today = month + "/" + day + "/" + year;
    var d = new Date();
    var month_name=['January','February','March','April','May','June','July','August','September','October','November','December'];
    var monthIndex = d.getMonth();// 0-11
    var thisYear = d.getFullYear();// xxxx
    var today = d.getDate();
    var thisMonth = month_name[monthIndex];
    //var first_day = month_name[monthIndex]+" "+ 1 + " "+ thisYear;
    //var firstDay = new Date(year, monthIndex).getDay();//use monthIndex+1 to get the next month etc
    var nYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)); 
    var lYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1));   
    var nextYear = nYear.getFullYear();
    var lastYear = lYear.getFullYear();
    var firstDay;
    var selectedYear;
    var totalBlocks;
    var daysBefore;
    var daysAfter;
    var inc;
    var dayOfYear={
        January : 31,
        February : 29,
    };
    var dayHolder=[];
    
    //alert(firstDay);
    var daysInMonth= function (month,year){
        
        return 32 -new Date(thisYear,month,32).getDate();
    };
calIPC.on('load-calendar', (event,args)=>{
    resetCalendar();
    setCalendarMonth();    
})
function loadCalendar(){
    //resetCalendar()
    //setCalendarMonth()
    calendarLoad()
}
function reloadCalender(){
    clearDays();
    clearDayBlocks();
    createDayBlocks();
    fillDays();
}
function calendarLoad(){
    //clearDays(); 
    //clearDayBlocks();
    createDayBlocks();
       
    setFirstDay(thisYear);
    fillDays(thisYear);    
    setMonth(thisYear);    
    inc=0;
    setSelectedYear(inc);
    setToday();
    createDayHolders();
    countSchJobsForCalendar();
    selectCalendarType(document.getElementById("cal-tab0"));
    
}
function resetCalendar(){
    monthIndex = d.getMonth();// 0-11
    thisYear = d.getFullYear();// xxxx
    today = d.getDate();
    thisMonth = month_name[monthIndex];
    inc=0;
    //alert(inc);
    //clearDayBlocks();
}
function setToday(){
    //thisMonth = month_name[monthIndex];
    var selectedMonth= month_name[monthIndex];
    //console.log(selectedMonth+ " "+today+" "+selectedYear);
    if(selectedMonth==thisMonth && selectedYear==thisYear){
        var t=today+firstDay-1;
        document.getElementById("dayNumber"+t).style.background='#803b3b'//"#fa9600";//rgb(78, 77, 77)";
        document.getElementById("dayNumber"+t).style.color="white";
    }
}
function setFirstDay(y){
    var year = y;
   firstDay= new Date(year, monthIndex).getDay();
   //console.log(firstDay);
}
function clearDayBlocks(){
    for(i=0;i<totalBlocks;i++){
        $("#dayBlock"+i).remove();
    }
}
function clearDays(){
    for(var i=0;i<totalBlocks;i++){
       // $("#dayNumber"+i).remove();
       document.getElementById("dayNumber"+i).innerHTML="";
        document.getElementById("dayNumber"+i).style.background="";
    }

}
function fillDays(y){
    var year = y;
   // alert(firstDay);
    //console.log(monthIndex +" "+ firstDay + " " + year);
    //console.log(daysInMonth(monthIndex,year));
    //clearCalendar();
    let dim = daysInMonth(monthIndex, year);
    daysBefore = firstDay;
    daysAfter = totalBlocks-dim-daysBefore;
    var test=totalBlocks - dim;
    //alert("days before="+daysBefore+" days after="+daysAfter);
    for(i=0;i<dim+daysAfter;i++){
        //alert(i);
        var cell= i+firstDay;
        //assignJulian to block
        var m = monthIndex+1;
        var dnumber = i+1;
        if(dnumber>dim) {
            dnumber=dnumber - dim; 
            m+=1;
        }
        var jd = jDate(m.toString()+"/"+dnumber.toString()+"/"+year.toString());
        document.getElementById("dayBlock"+cell).setAttribute("data-julian",jd);
        if(cell<daysInMonth(monthIndex, year)+daysBefore){
        document.getElementById("dayNumber"+cell).innerHTML=i+1;
        document.getElementById("dayNumber"+cell).style.background="white";
        }else{
            document.getElementById("dayNumber"+cell).innerHTML=i-daysInMonth(monthIndex, year)+1;
            document.getElementById("dayBlock"+cell).classList.add("preview");
        }
        //document.getElementById("dayNumber"+cell).style.background="white";
        var am = document.createElement('div');
        if(cell<daysInMonth(monthIndex, year)+daysBefore){
            am.className="am";
        }else{
            am.className="am preview";
        }
        am.setAttribute("id","am"+cell);
        am.ondblclick = function(){
            scheduleJob(this);
        };
        
        document.getElementById("dayBlock"+cell).appendChild(am);
        var pm = document.createElement('div');
        if(cell<daysInMonth(monthIndex, year)+daysBefore){
            pm.className="pm";
        }else{
            pm.className="pm preview";
        }
        pm.setAttribute("id","pm"+cell);
        pm.ondblclick = function(){
            scheduleJob(this);
        };
        document.getElementById("dayBlock"+cell).appendChild(pm);
        var j;
        for(j=0;j<6;j++){
            var indicator = document.createElement('div');
            indicator.className="indicator";
            indicator.setAttribute("id","indicatorAM"+jd+"_"+j)//i+"_"+j
            document.getElementById("am"+cell).appendChild(indicator);
            //console.log(j);
            var thisIndicator=document.getElementById("indicatorAM"+jd+"_"+j);
            //thisIndicator.style.display="none";
            switch(j){
                case 0:
                    thisIndicator.innerHTML="AM";
                    thisIndicator.style.color="black";
                    if(cell>=daysInMonth(monthIndex, year)+daysBefore){
                        thisIndicator.classList.add("preview");
                    }
                    break;
                case 1:
                    thisIndicator.style.backgroundColor="#ff9e0c";
                    thisIndicator.style.visibility="hidden";
                    break;
                case 2:
                    thisIndicator.style.backgroundColor="#5e81ad";
                    thisIndicator.style.visibility="hidden";
                    break;
                case 3:
                    thisIndicator.style.backgroundColor="#ff2d00";
                    thisIndicator.style.visibility="hidden";
                    break;
                case 4:
                    thisIndicator.style.backgroundColor="#ad5ea8";
                    thisIndicator.style.visibility="hidden";
                    break;
                case 5:
                    thisIndicator.style.backgroundColor="#5ead63";
                    thisIndicator.style.visibility="hidden";
                    break;
                default:
                    break;

            }
        
        }
        for(j=0;j<6;j++){
            var indicator = document.createElement('div');
            indicator.className="indicator";
            indicator.setAttribute("id","indicatorPM"+jd+"_"+j);        
            document.getElementById("pm"+cell).appendChild(indicator);
            var thisIndicator=document.getElementById("indicatorPM"+jd+"_"+j);
           
            switch(j){
                case 0:
                    thisIndicator.innerHTML="PM";
                    thisIndicator.style.color="black";
                    if(cell>=daysInMonth(monthIndex, year)+daysBefore){
                        thisIndicator.classList.add("preview");
                    }
                    break;
                case 1:
                    thisIndicator.style.backgroundColor="#ff9e0c";
                    thisIndicator.style.visibility="hidden";
                    break;
                case 2:
                    thisIndicator.style.backgroundColor="#5e81ad";
                    thisIndicator.style.visibility="hidden";
                    break;
                case 3:
                    thisIndicator.style.backgroundColor="#ff2d00";
                    thisIndicator.style.visibility="hidden";
                    break;
                case 4:
                    thisIndicator.style.backgroundColor="#ad5ea8";
                    thisIndicator.style.visibility="hidden";
                    break;
                case 5:
                    thisIndicator.style.backgroundColor="#5ead63";
                    thisIndicator.style.visibility="hidden";
                    break;
                default:
                    break;

            }
        }
    }
   
    
    
}
function getScheduled(){
    arrScheduledJobs = []

    allJobs = calIPC.sendSync('pull_jobs')
    for(member in allJobs){

		(allJobs[member].status == 'sch')? arrScheduledJobs.push(allJobs[member]):'';
	}
    console.log(arrScheduledJobs)
   for(i=0;i<arrScheduledJobs.length;i++){
       arrScheduledJobs[i].customer_name = calIPC.sendSync('db-get-customer-name',arrScheduledJobs[i].customer_ID)
   }
    
    return arrScheduledJobs
}
function countSchJobsForCalendar(){
    m=monthIndex+1;
    resetSCHcounts();
    
    
    scheduledJobs = getScheduled()
    //console.log(scheduledJobs)
    //alert("kingpin count after calling reset is "+dayHolder[168].pm.kingpinCount);
    for(i=1;i<=daysInMonth(monthIndex, year)+daysAfter;i++){
        for(j=0;j<scheduledJobs.length;j++){
            let schD=scheduledJobs[j].date_scheduled;
            //console.log(schD)
            var calYear = schD.substr(schD.length - 4);
            //alert("year listed in XML"+calYear);
            var todaysJulianDate=jDate(m.toString()+"/"+i.toString()+"/"+year.toString());
            var isEligible = (selectedYear==calYear || monthIndex==11) ? true:false;
            //console.log(scheduledJobs[j].julian)
            //alert(isNextYearPreview());
            if(todaysJulianDate==scheduledJobs[j].julian_date &&isEligible){
               //console.log(JSON.stringify(scheduledJobs[j]))
                var ampm = scheduledJobs[j].time_of_day;
                var jd = scheduledJobs[j].julian_date;
                //alert(scheduledJobs[j].jobType + " ")
                switch(scheduledJobs[j].job_type){
                    
                    case "Check All":
                        if(ampm=="am"){
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"1").style.visibility="visible";
                            dayHolder[jd].am.checkallCount++;
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"1").innerHTML=dayHolder[jd].am.checkallCount;
                            }
                            else if(ampm=="pm"){
                                document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"1").style.visibility="visible";
                                dayHolder[jd].pm.checkallCount++;
                                document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"1").innerHTML=dayHolder[jd].pm.checkallCount;
                                }
                            else if(ampm==""){
                                document.getElementById("indicatorAM"+jd+"_"+"1").style.visibility="visible";
                                dayHolder[jd].am.checkallCount++;
                                document.getElementById("indicatorAM"+jd+"_"+"1").innerHTML=dayHolder[jd].am.checkallCount;
                                     
                                }
                        break;
                    case "King Pin":
                        //alert("year listed in XML"+calYear);
                        if(ampm=="am"){
                        document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"5").style.visibility="visible";
                        dayHolder[jd].am.kingpinCount++;
                        document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"5").innerHTML=dayHolder[jd].am.kingpinCount;
                        }
                        else if(ampm=="pm"){
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"5").style.visibility="visible";
                            dayHolder[jd].pm.kingpinCount++;
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"5").innerHTML=dayHolder[jd].pm.kingpinCount;
                            }
                            else if(ampm==""){
                                document.getElementById("indicatorAM"+jd+"_"+"5").style.visibility="visible";
                                dayHolder[jd].am.kingpinCount++;
                                document.getElementById("indicatorAM"+jd+"_"+"5").innerHTML=dayHolder[jd].am.kingpinCount;
                                 
                            }            
                        break;
                    case "Frame":
                        if(ampm=="am"){
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"3").style.visibility="visible";
                            dayHolder[jd].am.frameCount++;
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"3").innerHTML=dayHolder[jd].am.frameCount;
                            }
                            else if(ampm=="pm"){
                                document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"3").style.visibility="visible";
                                dayHolder[jd].pm.frameCount++;
                                document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"3").innerHTML=dayHolder[jd].pm.frameCount;
                                }
                            else if(ampm==""){
                                document.getElementById("indicatorAM"+jd+"_"+"3").style.visibility="visible";
                                dayHolder[jd].am.frameCount++;
                                document.getElementById("indicatorAM"+jd+"_"+"3").innerHTML=dayHolder[jd].am.frameCount;
                                     
                            }
                    break;
                    case "Spring":
                        if(ampm=="am"){
                            //alert(vehicles.SCH[j].custName+"<br/>"+vehicles.SCH[j].julian+"<br/>"+vehicles.SCH[j].schDate+"<br/>"+ jDate(vehicles.SCH[j].schDate)+",br/>"+t);
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"2").style.visibility="visible";
                            dayHolder[jd].am.springCount++;
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"2").innerHTML=dayHolder[jd].am.springCount;
                            }
                            else if(ampm=="pm"){
                                document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"2").style.visibility="visible";
                                dayHolder[jd].pm.springCount++;
                                document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"2").innerHTML=dayHolder[jd].pm.springCount;
                                }
                            else if(ampm==""){
                                document.getElementById("indicatorAM"+jd+"_"+"2").style.visibility="visible";
                                dayHolder[jd].am.springCount++;
                                document.getElementById("indicatorAM"+jd+"_"+"2").innerHTML=dayHolder[jd].am.springCount;
                                 
                            }
                    break;
                    case "Alignment":
                        if(ampm=="am"){
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"4").style.visibility="visible";
                            dayHolder[jd].am.alignmentCount++;
                            document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"4").innerHTML=dayHolder[jd].am.alignmentCount;
                            }
                            else if(ampm=="pm"){
                                document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"4").style.visibility="visible";
                                dayHolder[jd].pm.alignmentCount++;
                                document.getElementById("indicator"+ampm.toUpperCase()+jd+"_"+"4").innerHTML=dayHolder[jd].pm.alignmentCount;
                            }
                            else if(ampm==""){
                                document.getElementById("indicatorAM"+jd+"_"+"4").style.visibility="visible";
                                dayHolder[jd].am.alignmentCount++;
                                document.getElementById("indicatorAM"+jd+"_"+"4").innerHTML=dayHolder[jd].am.alignmentCount;
                                 
                            }
                        break;
                    default:
                    break;
                }
            }
        }
    }
    
}

function fillDayBlock(){
    //setToday();
    var am = document.createElement('div');
    am.className="am";
    am.setAttribute("id","am41");
    document.getElementById("dayBlock41").appendChild(am);
    var pm = document.createElement('div');
    pm.className="pm";
    pm.setAttribute("id","pm41");
    document.getElementById("dayBlock41").appendChild(pm);
    for(i=0;i<6;i++){
        var indicator = document.createElement('div');
        indicator.className="indicator";
        document.getElementById("am41").appendChild(indicator);
        
    }
    for(i=0;i<6;i++){
        var indicator = document.createElement('div');
        indicator.className="indicator";
        
        document.getElementById("pm41").appendChild(indicator);
    }
}
function setMonth(y){
    var year = y;

    document.getElementById("calendar-month-year").innerHTML=month_name[monthIndex]+" "+year;
}
function clearDayBlock(){
    for(i=0;i<totalBlocks;i++){
        
        $("#am"+i).remove();
        
        $("#pm"+i).remove();
    }
    
}
function setSelectedYear(incrementor){
    //alert(incrementor);
    var incrementor=incrementor;
    var sYear=new Date(new Date().setFullYear(new Date().getFullYear() + incrementor)); 
    selectedYear=sYear.getFullYear();
    //console.log(selectedYear);

}
function setCalendarMonth(direction){
    var direction = direction;
    //resetCalendar()
    clearDays();
    clearDayBlock();
    clearDayBlocks();
    //createDayBlocks();
    //makeDayBlocksVisible();
    
    if(direction=="next"){
        if(monthIndex<month_name.length-1){
            //alert(month_name[monthIndex]+" "+selectedYear);
            setSelectedYear(inc);
            monthIndex=monthIndex+1;
            setMonth(selectedYear);
            setFirstDay(selectedYear);
            createDayBlocks();//added
            fillDays(selectedYear);
            countSchJobsForCalendar();
            
        }else{
           // alert("month index is "+monthIndex);
           inc++;
           setSelectedYear(inc);
            monthIndex=0;
            setMonth(selectedYear);
            setFirstDay(selectedYear);
            createDayBlocks();
            fillDays(selectedYear);
            //alert(thisMonth + " "+selectedYear);
            countSchJobsForCalendar();
        } 
        
        
    }else if(direction=="previous"){
        if(monthIndex>0 ){
            monthIndex=monthIndex-1;
            setSelectedYear(inc);
            setMonth(selectedYear);
            setFirstDay(selectedYear);
            createDayBlocks();
            fillDays(selectedYear);
            countSchJobsForCalendar();
            }else{
                monthIndex=11;
                inc--;
                setSelectedYear(inc);
                setMonth(selectedYear);
                setFirstDay(selectedYear);
                createDayBlocks();
                fillDays(selectedYear);
                countSchJobsForCalendar();            
            }
        //monthIndex=monthIndex-1;
        
        
       
    }else{
        setSelectedYear(inc);
        setMonth(selectedYear);
        setFirstDay(selectedYear);
        createDayBlocks();
        fillDays(selectedYear);
        countSchJobsForCalendar();
    }
    
    setToday();
    
}
function makeDayBlocksVisible(){
    for(i=0;i<totalBlocks;i++){
        document.getElementById("dayBlock"+i).style.visibility="visible";
    }
}
function createDayBlocks(){
    //alert("createDayBlocks triggered");
    totalBlocks = weekCount(selectedYear || thisYear, monthIndex+1)*7;
    //alert(totalBlocks);
    for(i=0;i<totalBlocks;i++){
        //alert(i);
        //var cell= i+firstDay;
        var db = document.createElement('div');
        db.setAttribute("id","dayBlock"+i);
        db.setAttribute("class","day-block");
        // db.onmouseenter = function(event){
        //     if(document.getElementById('jobWallet')){
        //     $('#jobWallet').remove();
        //     }
        // };
        db.onmouseover = function(event){
            event.stopPropagation();
            if(this.childNodes.length>1){
                for(i=0;i<this.childNodes.length;i++){
                    if(this.childNodes[i].hasChildNodes()){
                        //alert(this.id);
                        for(j=1;j<this.childNodes[i].childNodes.length;j++){
                            //alert(this.childNodes[i].childNodes.length);
                            if(this.childNodes[i].childNodes[j].style.visibility=="visible"){
                                if(document.getElementById("jobWallet")){
                                       //$('#jobWallet').remove();
                                }else{
                                showJobs(this);
                                makeCalenderJobContainers(this);
                                //var bounding=this.getBoundingClientRect();
                                }
                                break;
                            }
                            
                        }
                    }
                }
                
                //if(this.childNodes[1].hasChildNodes() && this.childNodes[2].hasChildNodes()){
                //showJobs(this);
                //}
            }
            };
        db.onmouseout = function(event){
            event.stopPropagation();
            event.preventDefault();
            if(document.getElementById('jobWallet')){
                if(event.relatedTarget==null || event.relatedTarget.id != "jobWallet" && 
                !event.target.parentNode.contains(event.relatedTarget)&& event.target.className != "calJobContainer"&&
                !event.relatedTarget.parentNode.contains(event.target)){
                   
                    $('#jobWallet').remove();
                }
            }
        }
        //db.setAttribute("data-Julian","");
        document.getElementById("calendar-days-container").appendChild(db);
        //var bounding=document.getElementById("dayBlock"+i).getBoundingClientRect();
        
        var dn =document.createElement('div');
        dn.setAttribute("id","dayNumber"+i);
        dn.setAttribute("class","day-number");
        document.getElementById("dayBlock"+i).appendChild(dn);
        
        
        //document.getElementById("dayBlock"+i).innerHTML=i+1;
    }
   // document.getElementById("dayBlock0").setAttribute("data-hello","I like fries");
   // alert(document.getElementById("dayBlock0").getAttribute("data-hello"));
}
function jDate(ds){
    //console.log(ds)

    var ds = ds;    
    
    var dayScheduled = new Date(ds);
    var julian= Math.ceil((dayScheduled - new Date(dayScheduled.getFullYear(),0,0)) / 86400000);
    
    return julian;
}
function days_of_a_year(year) 
{
   
  return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year) {
     return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}
//var dayholder=[];
function createDayHolders(){
    
    for(i=0;i<days_of_a_year(selectedYear)-1;i++){
        var dh="day"+i;
        dayHolder.push({
                "am":{
                    "kingpinCount": 0,
                    "alignmentCount": 0,
                    "springCount": 0,
                    "frameCount": 0,
                    "checkallCount": 0
                },
                "pm":{
                    "kingpinCount": 0,
                    "alignmentCount": 0,
                    "springCount": 0,
                    "frameCount": 0,
                    "checkallCount": 0
                }
            
        });
    }
}
function resetSCHcounts(){
    for(i=0;i<dayHolder.length;i++){
        dayHolder[i].am.kingpinCount=0;
        dayHolder[i].am.alignmentCount=0;
        dayHolder[i].am.springCount=0;
        dayHolder[i].am.frameCount=0;
        dayHolder[i].am.checkallCount=0;
        dayHolder[i].pm.kingpinCount=0;
        dayHolder[i].pm.alignmentCount=0;
        dayHolder[i].pm.springCount=0;
        dayHolder[i].pm.frameCount=0;
        dayHolder[i].pm.checkallCount=0;
    }
    //alert(dayHolder[168].pm.kingpinCount);
}
function showJobs(e){
    //alert(e.id);
    
    
    var element = e;
    
    
    var bounding=element.getBoundingClientRect();
    //alert(bounding.top + " "+window.innerHeight);

    var schJobWallet = document.createElement("div");
    
        schJobWallet.setAttribute("class","jobWallet");
        //schJobWallet.style.top="-500px";
        //schJobWallet.style.position = "absolute";
       // schJobWallet.style.bottom="30px";
    
    schJobWallet.setAttribute("id","jobWallet");
    element.appendChild(schJobWallet);
    //document.getElementById("jobWallet").style.top="-100px;"
    //alert($("#jobWallet").position().top);
}
var thisDaysSchJobs=[];
function makeCalenderJobContainers(e){
    
    for(i=thisDaysSchJobs.length;i>0;i--){
        thisDaysSchJobs.pop();
    }
    var element=e;
    var dayBlockJulian=element.getAttribute("data-julian");
    //alert(dayBlockJulian);

    //var thisDaysSchJobs = [];
    //console.log(scheduledJobs.length)
    for(i=0;i<scheduledJobs.length;i++){
        if(scheduledJobs[i].julian_date == dayBlockJulian){
            thisDaysSchJobs.push(scheduledJobs[i]);
            //alert(scheduledJobs[i].customerName)
        }
        
    }
    //console.log(thisDaysSchJobs)
    //alert(thisDaysSchJobs[0].recordNumber);
    for(i=0;i<2;i++){
        var ampmContainer = document.createElement('div');
        ampmContainer.setAttribute("id","container"+i);
        ampmContainer.setAttribute("class","ampmContainer");
        document.getElementById("jobWallet").appendChild(ampmContainer);

    
    
    }
    var jobHeader = document.createElement('div');
    jobHeader.setAttribute("class","calJobHeader");
    jobHeader.setAttribute("id","jobHeaderAM");    
    document.getElementById("container0").appendChild(jobHeader);

    var jobHeader2=document.createElement('div');
    jobHeader2.setAttribute("class","calJobHeader");
    jobHeader2.setAttribute("id","jobHeaderPM");    
    document.getElementById("container1").appendChild(jobHeader2);

    document.getElementById("jobHeaderAM").innerHTML="AM";
    document.getElementById("jobHeaderPM").innerHTML="PM";
    //console.log(thisDaysSchJobs)
    for(j=0;j<thisDaysSchJobs.length;j++){
        let schJobType = thisDaysSchJobs[j].job_type;
        //let schJobRecordNumber = thisDaysSchJobs[j].recordNumber;

        let jcName = thisDaysSchJobs[j].customerName;
        let jcNotes = thisDaysSchJobs[j].notes;        
        let jcUnitNumber = thisDaysSchJobs[j].unit;
        let jcWaiting = thisDaysSchJobs[j].waiting;
       
    var jobContainer = document.createElement('div');
    jobContainer.setAttribute("id","jobContainer"+j);
    jobContainer.setAttribute("class", "calJobContainer");
    //jobContainer.setAttribute("data-recordNumber", thisDaysSchJobs[j].id);
    jobContainer.onclick = function (event){
        if(event.target.tagName.toLowerCase() === 'a'){
            
          } else {
            event.stopPropagation()
        event.target.className = (event.target.className == 'explode')?event.target.className= 'calJobContainer':event.target.className = 'explode';
       
          }
        
        
    };
    jobContainer.oncontextmenu = function (event){
        if(event.target.nodeName == "A"){
            openContextMenu(event.target.parentNode);
        }else{
        openContextMenu(event.target);
        }
        //event.stopPropagation();
        return false;
    };
    /*
    jobContainer.oncontextmenu = function (event){
        if(document.getElementById("cal_cm")){$("#cal_cm").remove();}
        var cm = document.createElement('div');
        cm.setAttribute("id","cal_cm");
        cm.setAttribute("class","cal_cm");  
    
        cm.innerHTML="<ul><li class='cal_cm_item'>send to lot</li><li>edit</li><li>no show || completed</li></ul>";
   
        this.appendChild(cm);
        return false;
    };
    */

    //job_type should be customer name. just used job_type to test
    jobContainer.innerHTML=
    "<a class='customerName'>"+thisDaysSchJobs[j].customer_name.toUpperCase()+
    "</a><br/>" + "Unit #: "+thisDaysSchJobs[j].unit+"<br/>"+thisDaysSchJobs[j].notes;
    if(thisDaysSchJobs[j].waiting_customer=="-1"){
        jobContainer.innerHTML+="<br/>Customer will be waiting";
    }
        switch(schJobType){
            case "Spring":
                jobContainer.style.color="#5e81ad";
                //jobContainer.style.fontWeight = "bold"
                jobContainer.style.borderColor="#5e81ad";
                //jobContainer.style.borderWidth="2px";
            break;
            case "Check All":
                jobContainer.style.color="#ff9e0c"; 
                //jobContainer.style.fontWeight = "bold"  
                jobContainer.style.borderColor="#ff9e0c";  
                //jobContainer.style.borderWidth="2px";               
                break;
                
            case "Alignment":
                jobContainer.style.color="#ad5ea8";
                //jobContainer.style.fontWeight = "bold"
                jobContainer.style.borderColor="#ad5ea8";
                //jobContainer.style.borderWidth="2px";
                break;
            case "King Pin":
                jobContainer.style.color="#5ead63";  
                //jobContainer.style.fontWeight = "bold"                  
                jobContainer.style.borderColor="#5ead63"; 
               // jobContainer.style.borderWidth="2px";      
                break;
            case "Frame":
                jobContainer.style.color="#ff2d00";
                //jobContainer.style.fontWeight = "bold"
                jobContainer.style.borderColor="#ff2d00";
                //jobContainer.style.borderWidth="2px";
                break;
            default:
                break;
        }
        
        if(thisDaysSchJobs[j].time_of_day=="am"){
            document.getElementById("container0").appendChild(jobContainer);
        }else if(thisDaysSchJobs[j].time_of_day=="pm"){
            document.getElementById("container1").appendChild(jobContainer);
        }else{
            document.getElementById("container0").appendChild(jobContainer);
        }
        

        
    
    }
    var element = e;
    var bounding=element.getBoundingClientRect();
    var height = Math.floor($("#jobWallet").height());
    //var shift = height*-1/1.5;
    var shift = height*-1+1;
    //if(bounding.top>window.innerHeight/2){
        
        document.getElementById("jobWallet").style.top = shift+"px";
        
   // }
    
}
function clearCalendar(){
    var amContainers=document.getElementsByClassName("am");
    var pmContainers=document.getElementsByClassName("pm");
    for(i=0;i<amContainers.length;i++){
        amContainers[i].innerHTML="";
        pmContainers[i].innerHTML="";
    }
}

function openContextMenu(e){
    try{
    //alert(thisDaysSchJobs.length);
    
    let callingElement = e;

    var rn = callingElement.getAttribute("data-recordNumber");
    //alert(rn);
    cId=callingElement.id;
    var existingCMs = document.getElementsByClassName("cal_cm");
    if(existingCMs){
        for(var k in existingCMs){
            $("#"+existingCMs[k].id).remove();
        };
    }
        //$("#"+cId+"_cm").remove();}
    let cm = document.createElement('div');
    cm.setAttribute("id", cId+"_cm");
    cm.setAttribute("class","cal_cm");
    
    callingElement.appendChild(cm);
    //document.getElementById(cId+"_cm").style.left="75px";
    //document.getElementById(cId+"_cm").style.top="-25px";
    let cmList = document.createElement('ul');
    cmList.setAttribute("class","cm_list");
    cmList.setAttribute("id","cmList");
    document.getElementById(cId+"_cm").appendChild(cmList);
    let listItems =["send to lot","edit","no-show","completed"];
    for(i=0;i<listItems.length;i++){
        var cmListItem =document.createElement('li');
        cmListItem.setAttribute("id","cmListItem"+i);
        cmListItem.setAttribute("class","cmListItem"); 
        cmListItem.onclick= function(e){
            e.stopPropagation();
            switch(e.target.id){
                case "cmListItem0":
                    sendTo("lot",rn);
                    break;
                case "cmListItem1":
                    editCalenderJob(rn);
                    break;
                case "cmListItem2":
                    sendTo("completed",rn);
                    break;
                default:
                    break;
            }
        };
        document.getElementById("cmList").appendChild(cmListItem);     
    }
    for(i=0;i<listItems.length;i++){
        document.getElementById("cmListItem"+i).innerHTML=listItems[i];
    }
    }catch(e){
        alert("error"+ e);
    }
}

function sendTo(where,rn){
    var x;
    var jo;
    for(i=0;i<scheduledJobs.length;i++){
        if(scheduledJobs[i].recordNumber == rn){
            x=scheduledJobs[i].xmlPosition;
            jo= scheduledJobs[i].jobCat; 
           
        }
        else{}
        
    }

    var vehicleToSend = xmlDoc.getElementsByTagName("workflow")[0].childNodes[x];
    switch(where){
        case "lot":
            
                let arrLocationBucket =[];
                var z = 0;
                    
                    switch(jo) {
                        case "Frame":
                        case "frame":
                            arrLocationBucket=frameBucket;                           
                            break;
    
                        case "Spring":
                        case "spring":
                            arrLocationBucket = springBucket;                            
                            break;
    
                        case "Alignment":
                        case "alignment":
                            arrLocationBucket = alignmentBucket;                            
                            break;
    
                        case "King Pin":
                        case "kingPin":
                            arrLocationBucket = kingpinBucket;                           
                            break;
    
                        case "Check All":
                            arrLocationBucket = checkallBucket;                            
                            break;
    
                        default:
                            alert("error assigning job category");
                            break;
                    }
                    for ( z = 0; z < 20; z++){
                        var hasKids = document.getElementById(arrLocationBucket[z]).hasChildNodes();
                        //alert(hasKids);
                        if(!hasKids) {
                            vehicleToSend.setAttribute("status","wfw");
                            vehicleToSend.setAttribute("shopLocation",arrLocationBucket[z]);
                            xmlDoc.save("fs.xml");
                            break;
                        }
                    }
            
                
        break;
        case "completed":
                
                
                for(i=0;i<20;i++){
                    if(document.getElementById("wpu"+i).hasChildNodes()){

                    }else{
                        vehicleToSend.setAttribute("status","wpu"); 
                        vehicleToSend.setAttribute("shopLocation","wpu"+i); 
                        xmlDoc.save("fs.xml");
                        break;
                    }

                }
                
                //vehicleToSend.setAttribute("origin","On The Lot");
    
                
        break;
        default:
            break;
    }
    reloadPage();
    setCalendarMonth();
    //calendarLoad();
    //alert("Send To "+where);
}
function editCalenderJob(c){
    //alert(vehicles.SCH[1].recordNumber);
    var x;
    
        for(i=0;i<scheduledJobs.length;i++){
            if(scheduledJobs[i].recordNumber == c){
                x=scheduledJobs[i].xmlPosition;
            
               
            }
            else{}
            
        }
        
    getEditVehicle(null,x);
    //alert(x);
}
function scheduleJob(e){
    let el = e;
    let cn = el.className.toUpperCase();
    let strCN = cn.substring(0,2);
    let strID = e.id.substring(2,4);
    let dim = daysInMonth(monthIndex, year);
    let strDoM = strID-daysBefore;
    //alert(el.parentNode.getAttribute("data-julian"));
    addNewJob();
    document.getElementById("addBlock").style.zIndex="9999999";
    document.getElementById("selOrigin").options[2].selected="selected";
    document.getElementById("selOrigin").onchange();
    document.getElementById("rad"+strCN).checked=true;
    if(strDoM<dim){
    document.getElementById("datepicker").value=monthIndex+1+"/"+el.parentNode.childNodes[0].innerHTML+"/"+selectedYear;
    }else{
        if(monthIndex==11){
        document.getElementById("datepicker").value=monthIndex-10+"/"+el.parentNode.childNodes[0].innerHTML+"/"+nextYear;
        }else{
            document.getElementById("datepicker").value=monthIndex+2+"/"+el.parentNode.childNodes[0].innerHTML+"/"+selectedYear;
     
        }
            }
    $("#txtCustomerName").focus();
}

function selectCalendarType(e){
    let selectedCalendarType = e.innerHTML;
    let selectedTab = e;
    let selectedTabId = e.id;
    let selectedClass = e.className;
    let otherTab;
    switch(selectedCalendarType){
        case "Monthly":
            e.style.backgroundColor="#5e81ad";
            e.style.color="white";
            otherTab = document.getElementById("cal-tab1");
            otherTab.style.backgroundColor="white";
            otherTab.style.color="#5e81ad";
            break;
        case "Weekly":
            e.style.backgroundColor="#5e81ad";
            e.style.color="white";
            otherTab = document.getElementById("cal-tab0");
            otherTab.style.backgroundColor="white";
            otherTab.style.color="#5e81ad";
            
            
            //alert(weekCount(selectedYear || thisYear, monthIndex+1));
            break;
        default:
            e.style.backgroundColor="rgb(78, 77, 77)";
            e.style.color="white";
            otherTab = document.getElementById("cal-tab1");
            otherTab.style.backgroundColor="white";
            otherTab.style.color="#5e81ad";
            break;
    }
   
}
function weekCount(year, month_number) {

    // month_number is in the range 1..12

    var firstOfMonth = new Date(year, month_number-1, 1);
    var lastOfMonth = new Date(year, month_number, 0);

    var used = firstOfMonth.getDay() + lastOfMonth.getDate();

    return Math.ceil( used / 7);
}
function showToolTip(e){
    //e.innerHTML=e.innerHTML+"howdy";
    if(e.nodeName == "A"){
        e.parentNode.innerHTML+="<br/>howdy";
        }else{
            //alert(event.target.style.zIndex);
            e.innerHTML+="<br/>howdy";
        }
    /*
    let calToolTip = document.createElement("div");
        calToolTip.setAttribute("id", "calToolTip"+j);
        calToolTip.setAttribute("class", "calToolTip");
        calToolTip.innerHTML="howdy <br/>yall<br/> come at me<br/> bro";
        //alert(event.target.parentNode.id);
        if(e.nodeName == "A"){
        e.parentNode.appendChild(calToolTip);
        }else{
            //alert(event.target.style.zIndex);
            e.appendChild(calToolTip);
        }
        */
}