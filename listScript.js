/**
 * Created by Iain on 10/26/2016.
 * Simple local web page for Danielle to track her candidate schools for graduate school
 */

/**** GLOBAL VARIABLES, ACCESSIBLE TO THE WHOLE SCRIPT */
var schoolForm = $("#schoolForm");
var schoolTable = $("#schoolTable");
var btnCancel = $("#btnCancel");
var candidates = [];


//This is the 'main()' method of this script
$(document).ready(function() {
    $(document).ondblclick(".editableRow",openEditDialog($(this)));

    if(typeof(Storage) == "undefined") {
        alert("There is no local storage available in this browser. Exiting");
        $(document).close();
    } else if(localStorage.length > 0) {
        alert("Length of the local storage:" + localStorage.length);
        loadFromLocal();
    } else {
        var response = confirm("It looks like you haven't added anything yet. Would you like to?");
        if(response == true) {
            alert(response);
            //open dialog here
        }
    }

    //Populate the table
    populateTable();
});


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

/** Open the form dialog with all empty data, to create an entirely new entry */
function openCreateDialog() {
    schoolForm.dialog({
        title: "Dialog",
        modal: true,
        open: function () {
            schoolForm.dialog("open");
        }
    });
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


function GradSchool(schoolName, state, appDueDate, appFee, program) {
    this.schoolName = schoolName;
    this.state = state;
    this.appDueDate = appDueDate;
    this.appFee = appFee;
    this.program = program;
}

function Program(degree, credits, length, cost, costType) {
    this.degree = degree;
    this.credits = credits;
    this.cost = cost;
    this.costType = costType;
    calculateAllCosts(credits, length, cost, costType);
}

function ProgOp(type, opName) {
    this.type = type;
    this.opName = opName;
}

function ProgReq(reqType, req, reqParam) {
    this.reqType;
    this.req = req;
    this.reqParam = reqParam;
}

function calculateAllCosts(creds, len, cost, costType) {

}

function selectRow() {
    openEditDialog($())
}