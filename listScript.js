/**
 * Created by Iain on 10/26/2016.
 * Simple local web page for Danielle to track her candidate schools for graduate school
 */

/**** GLOBAL VARIABLES, ACCESSIBLE TO THE WHOLE SCRIPT */


//This is the 'main()' method of this script, and will only run when the page has fully loaded.
$(document).ready(function() {
    if(typeof(Storage) == "undefined") {
        alert("There is no local storage available in this browser. Exiting");
        $(document).close();
    }

    $("#addNewSchool").click(function() {
        alert("pressed da button, yo!");
    });
});

function openFormPage() {
    //$(window).open("schoolForm.html","Form","width=500,height=500");
    $(window).open("http://stackoverflow.com/questions/2412001/select-table-row-in-jquery","new wind","width=500,height=500");
}


function populateTable() {
    var row = "<tr></tr>";
    row.class = "editableRow";
    for(var i = 0; i < candidates.length; i++) {
        var school = candidates[i];
        row += $("<td></td>").text(school.schoolName);
        row += $("<td></td>").text(school.state);

    }
}

function buildProgramCell(school) {
    var prog = school.program;
}

/** This function loads a collection of graduate school candidates from the local storage of the browser */
function loadFromLocal() {

}

/** Saves all objects as JSON objects, and puts it in the browser's local storage */
function saveToLocal() {

}

/** Open the form dialog for an existing row in the grad school table, for editing or deletion */
function openEditDialog(row) {

}

function cancelAndClose() {
    schoolForm.close();
}

function fillTable() {
    for(var i = 0; i < length(schools); i++) {

    }
}