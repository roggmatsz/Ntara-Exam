﻿// Write your Javascript code.
document.addEventListener("DOMContentLoaded", function(event) {
    if(!window.File) {
        //tell user to bugger off
        window.alert('This page requires the File API. Looks like your browser lacks it =(');
        
    }
});

function handleCsv(files) {
    csv = files[0];
    if(csv.type.match('text.csv')) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var container = document.getElementById('dataDisplay');
            container.innerText = event.target.result;
        }
        reader.readAsText(csv);
    }
}