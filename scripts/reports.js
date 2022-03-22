const electron = require('electron')
const ipcReport = electron.ipcRenderer

let chosenJulian 
let chosenYear
$(function(){
    $("#reportStartDate").datepicker({
        dateFormat : "m/d/yy"
    });
    $("#reportEndDate").datepicker({
        dateFormat : "m/d/yy"
    });
})
function todayIs() {
	const objDate = new Date();
	const day = objDate.getDate();
	const month = objDate.getMonth() + 1;
	const year = objDate.getFullYear();
	const today = month + "/" + day + "/" + year;
	return today;
}
function loadModal(){
    //document.getElementById('datepickerReport').focus()
    $("#reportStartDate").click()    
    $("#reportStartDate").value = todayIs()
    $("#reportStartDate").text = todayIs();

    $("#reportEndDate").click()    
    $("#reportEndDate").value = todayIs()
    $("#reportEndDate").text = todayIs();

    $('#reportStartDate').on({
        'change': function (event) {
            let reportStartDate = document.getElementById('reportStartDate').value
            let reportResultBox = document.getElementById('reportResult')
            let chosenDate = setJulianDate(reportStartDate)
            
            console.log('date choice triggered '+ chosenDate.julian + ' '+chosenDate.year)
            let activity = pullLog(chosenDate)
            formatReport(activity)
             reportResultBox.innerHTML = (activity.length >0) ? activity.toString().replace(/\n/g, '<br/><br/>') : `No Activity On ${reportStartDate}`
            
            
            console.log(activity.length)
        }
    });
}
function setJulianDate(ds){
       
    let dayScheduled = new Date(ds);
    let date = new Object()
    date.julian= Math.ceil((dayScheduled - new Date(dayScheduled.getFullYear(),0,0)) / 86400000);
    date.year = dayScheduled.getFullYear()
    return date;
}
function pullLog(date){
    return ipcReport.sendSync('pull-activity-log',date.year,date.julian)    
            
}
function formatReport(a){
    //fill array with chunks of report
    let arr = a.split('\n')
    console.log(arr)
    //reportResult.innerHTML = (activity.length >0) ? activity.toString().replace(/\n/g, '<br/><br/>') : `No Activity On ${reportStartDate}`
}
function makeReport(){

}

function fillUsers(){
    
}
function makeVisible(block){
    document.getElementById('ribbon').setAttribute('class','ribbon visible')
    //console.log(block.getAttribute('class'))
}
function toggleVisibility(el){
    document.getElementById('reportResult').innerHTML = ""
    for(i=1;i<4;i++){
        document.getElementById('option'+i).setAttribute('class','mainOption unchosen')
        document.getElementById('ribbon'+i).setAttribute('class','ribbon hidden')
    }
    const chosenOption = el.getAttribute('id').substring(6)
    const optionStatus = el.getAttribute('class').search('unchosen')
   
    let ribbon = document.getElementById('ribbon'+chosenOption)
    let ribClass = ribbon.getAttribute('class')
    let ribVisibility = ribClass.search('hidden');

    
    //console.log(ribVisibility);
    (optionStatus<0) ? el.setAttribute('class','mainOption unchosen') : el.setAttribute('class', 'mainOption chosen');
    (ribVisibility<0) ? ribbon.setAttribute('class','ribbon hidden') : ribbon.setAttribute('class','ribbon visible');
}