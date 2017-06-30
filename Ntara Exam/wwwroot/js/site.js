// Write your Javascript code.
document.addEventListener("DOMContentLoaded", function(event) {
    if(!window.File) {
        //tell user to bugger off
        window.alert('This page requires the File API. Looks like your browser lacks it =(');
    }
    var parsedCsv = null;
    var parsedHeaders = null;
});

function handleCsv(files) {
    csv = files[0];
    if(csv.name.match('.csv')) {
        var reader = new FileReader();
        reader.onload = function(event) {
            parsedCsv = $.csv.toArrays(event.target.result);
            parsedHeaders = parsedCsv[0];
            renderTable(parsedCsv, parsedHeaders);
            updateDOM();
        }
        reader.readAsText(csv);
    }
}

function updateDOM() {
    document.getElementById('headline').innerText = "Search Away";
    document.getElementById('data-wrapper').style.display = 'table';
    document.getElementById('fileInput').style.display = 'none';
}

function renderTable(data, headers) {
    var table = document.getElementById('altTable');
    table.appendChild(makeHeaders(headers));
    for (var i = 1; i < data.length; i++) {
        var row = document.createElement('tr');
        for (var j = 0; j < data[i].length; j++) {
            var node = document.createElement('td');
            node.innerText = data[i][j];
            row.appendChild(node);
        }
        table.appendChild(row);
    }
}

function makeHeaders(headers) {
    var root = document.createElement('tr');
    for (var i = 0; i < headers.length; i++) {
        var node = document.createElement('th');
        node.innerText = headers[i];
        root.appendChild(node);
    }

    return root;
}