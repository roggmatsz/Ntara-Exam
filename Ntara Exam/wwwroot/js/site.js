document.addEventListener("DOMContentLoaded", function(event) {
    if(!window.File) {
        //tell user to bugger off
        window.alert('This page requires the File API. Looks like your browser lacks it =(');
    }

    //global variables referenced throughout
    var parsedCsv = null; //holds the CSV file in entirety
    var parsedHeaders = null; //holds only the headers, for convenience only
    var searchedColumns = null; //holds item selected in column dropdown
});

// called when file input element changes aka. a file is picked,
// loads the csv file into memory
function handleCsv(files) {
    // files is a reference to <input>'s files property
    csv = files[0];
    
    // worry only about files with a '.csv' extension
    // originally mime type was used at, turns out systems
    // with ms excel installed alter mime type to something
    // other than 'text/csv' so extension was used instead
    if(csv.name.match('.csv')) {

        // creates an instance of JS object used to read files
        var reader = new FileReader();

        // callback fn that executes when file is successfully loaded
        reader.onload = function(event) {

            // leveraged a jQuery library to correctly parse the csv
            // file into a 2D array. Good chunk of time saved.
            parsedCsv = $.csv.toArrays(event.target.result);

            // save the array containing the field names for 
            // convenince/giggles
            parsedHeaders = parsedCsv[0];

            // display the 2D array containing the CSV data in 
            // the page
            renderTable(parsedCsv, parsedHeaders);

            // a function that encapsulates code pertaining
            // to page manupulation for UI's sake.
            updateDOM();
        }
        
        // execute the method used to read the file as
        // UTF-8 text
        reader.readAsText(csv);
    }
}

// adds field names into the columns dropdown given a 
// reference to the field names array and the containing
// DOM element
function populateDropdown(headers, dropdown) {
    for(var i = 0; i < headers.length; i++) {
        // create the bootstrap structure for a dropdown 
        // element
        var outer = document.createElement('li');
        var inner = document.createElement('a');
        
        // set the text equal to the field name
        inner.innerText = headers[i];

        // add a pound sign to the <a> url because why not
        inner.href = '#';

        // replace the spaces in multi-word field names
        // with underscores
        inner.id = headers[i].toLowerCase().replace(/ /g, "_");
        
        // add the <a> to the <li>
        outer.appendChild(inner);

        // add the <li> to the dropdown
        dropdown.appendChild(outer);
    }
}

// function that enders the table containing the search
// results given a reference to the original data and 
// the object containing the indices corresponding to the
// rows and columns where results were found 
function renderResults(data, results) {
    
    // get a reference to the table
    var table = document.getElementById('altTable');

    // clear all records it holds
    table.innerHTML = "";

    // create the field names
    table.appendChild(makeHeaders(data[0]));

    // for each index pointing to rows with hits,
    for(var i = 0; i < results.rows.length; i++) {

        // create a table row
        var row = document.createElement('tr');

        // for each column in the table,
        for(var j = 0; j < data[0].length; j++) {

            // create a cell
            var node = document.createElement('td');

            // this is really hard to explain in plain
            // sentences, it turns out
            node.innerText = data[results.rows[i]][j];

            // check the current column from the entire
            // set of columns against the set of columns
            // where hits were found for the search term.
            // If the current column index matches an index
            // from the result columns, style it differently
            // to highlight a search result
            for(var k = 0; k < results.fields.length; k++) {
                if (j == results.fields[k]) {
                    node.classList.add('results');
                }
            }
            
            // add the cell to the row
            row.appendChild(node);
        }

        // add the row to the table
        table.appendChild(row);
    }
}

// given a search string, a reference to the parsed 
// data set, and the column chosen, iterate through 
// all the array values and return an object containing
// 2 properties, each pointing to arrays storing the
// index values for the row and column(s) where the hits
// were found.
function search(query, data, column) {

    // create some storage space
    var rows = [];
    var fields = [];
    
    // for each row in the original parsed array,
    for(var i = 1; i < data.length; i++) {

        // 2 possibilities: 1) all columns are searched
        if(searchedColumns == 'all') {

            // for each column in the og parsed array,
            for(var j = 0; j < data[1].length; j++) {
                // compare each value at the ith row, jth column
                // to the query
                if(data[i][j].toLowerCase().indexOf(query) > -1) {
                    
                    // if found, add its coordinates to their 
                    // corresponding arrays
                    rows.push(i);
                    fields.push(j);
                }
            }
        } else { // 2) only a certain column is searched

            // for each field/column name in the og parsed array,
            for(var k = 0; k < data[0].length; k++) {
                // compare the chosen column/field name against
                // all possible field/column names to find its index
                if(data[0][k].indexOf(searchedColumns.toLowerCase()) > -1) {
                    
                    // once the column's index is found, compare the
                    // query against all values at the ith row, found
                    // column index k
                    if(data[i][k].toLowerCase().indexOf(query) > -1) {
                        
                        // push matches' coordinates to their respective
                        // arrays
                        rows.push(i);
                        fields.push(k);
                    }
                }
            }
        }
    }
    return {'rows': rows, 'fields': fields};
}

// Hides and shows DOM elements, creates event listeners 
// for elements revealed after csv file is parsed
function updateDOM() {
    
    // sets the default value of all columns
    searchedColumns = 'all';

    // UI changes. Nothing special here
    document.getElementById('headline').innerText = "Search Away";
    document.getElementById('data-wrapper').style.display = 'table';
    document.getElementById('fileInput').style.display = 'none';
    
    // function call to generate dropdown 
    populateDropdown(parsedHeaders, document.getElementById('ddMenu'));

    // create an click listener for the column dropdown
    document.getElementById('ddMenu').addEventListener('click', function(event) {
        
        // get reference to dropdown button/toggle element
        var button = document.getElementById('ddButton');

        // create a span element with the toggle class. 
        // Deleting the text of the button also deletes
        // the existing span element as well.
        var caret = document.createElement('span');
        caret.classList.add('caret');

        // create the button toggle text from the clicked element's
        // inner text
        button.innerText = 'Columns: ' + event.target.innerText + ' ';
        
        // add the caret symbol back to the button/toggle
        button.appendChild(caret);

        // set global variable for selected column equal to
        // the lowercased inner text of the clicked element
        // for easier comparison later on
        searchedColumns = event.target.innerText.toLowerCase();
    });

    // create key press listener for search box
    document.getElementById('search').addEventListener('keypress', function(event) {
        
        // listen for enter key. When pressed, call the search
        // function on the search text but only if the box 
        // actually has text
        let ENTER_KEY = 13;
        if(event.keyCode == ENTER_KEY && this.value != '') {
            renderResults(parsedCsv, search(this.value, parsedCsv, searchedColumns));
        }
    });
}

// used to initially display the csv array after the 
// csv fle is initially loaded
function renderTable(data, headers) {

    // get a reference to the table element
    var table = document.getElementById('altTable');

    // create the table fields
    table.appendChild(makeHeaders(headers));

    // for each row in the parsed csv array,
    for (var i = 1; i < data.length; i++) {

        // create a row
        var row = document.createElement('tr');

        // for each field/column name in the parsed csv 
        // array,
        for (var j = 0; j < data[i].length; j++) {
            
            // create a table cell
            var node = document.createElement('td');
            
            // set text equal to that found at the ith
            // row, jth column in the array
            node.innerText = data[i][j];

            // add cell to row
            row.appendChild(node);
        }
        
        // add row to table
        table.appendChild(row);
    }
}

// convenience function used to create just table
// headers/column names
function makeHeaders(headers) {

    // create a row element
    var root = document.createElement('tr');

    // for each field/column name in the parsed csv
    // array,
    for (var i = 0; i < headers.length; i++) {
        
        // create a table header element
        var node = document.createElement('th');
        
        // set text equal to the ith element in 
        // the field/column names array
        node.innerText = headers[i];

        // add header elemeent to row
        root.appendChild(node);
    }

    // return the row
    return root;
}