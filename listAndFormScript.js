/**
 * Created by Iain on 10/26/2016.
 * Simple local web page for Danielle to track her candidate schools for graduate school
 */

/**** GLOBAL VARIABLES, ACCESSIBLE TO THE WHOLE SCRIPT */
/** the list of all the school objects stored in the pseudo db. */
var candidates = [];

//This is the 'main()' method of this script, and will only run when the page has fully loaded.
$(document).ready(function() {
    if(typeof(Storage) == "undefined") {
        alert("There is no local storage available in this browser. Exiting");
        $(document).close();
    }

    //if there are candidates in storage, load them and parse them into objects
    if(localStorage.length > 0) {
        for(var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            var jsonCandidate = localStorage.getItem(k);
            var school = $.parseJSON(jsonCandidate);
            candidates.push(school);
        }
    }

    //populate the table if there are candidates to fill it
    if(candidates.length > 0) {
       $.each(candidates, function(ind, candidate) {
            convertToTableEntry(candidate);
        });
    }
    //attach handlers to the buttons on the list page
    //add new school
    $("#addNewSchool").click(function() {
        $("#formFrame").hidden = false;
    });

    //edit school


    //delete school
    $("#btnDelete").click(function() {

    });

    //delete ALL schools
    $("#deleteAll").click(function() {
        var r = confirm("Are you sure you wish to delete all records?");
        if(r == true) {
            localStorage.clear();
            $(window).reload();
        }
    });

    //attach handlers to the form page
    //add requirement
    $("#btnAddReq").click(function() {
        var nr = $("#numReqs").val();
        $("#numReqs").val(nr + 1);
    });

    //remove requirement
    $("#btnRemoveReq").click(function() {

    });

    //add op

    //remove op

    //check which values should be in the requirement type dropdown based on the selected requirement group.
    //make the options with the correct class not hidden
    $("#reqGroup").change(function() {
        var selected = $("#reqGroup option:selected");
        switch(selected) {
            case "docReq":
                $(".docreq").prop("hidden",false);
                break;
            case "expReq":
                $(".expreq").prop("hidden",false);
                break;
            case "genReq":
                $(".genreq").prop("hidden",false);
                break;
        }
    });

    //save
    $("#btnSave").click(function() {
        var costType;
        if($("input[name=costType][value=costPerCred]").prop('checked','checked')) {
            costType = 'costPerCred';
        } else if($("input[name=costType][value=costPerSem]").prop('checked','checked')) {
            costType = 'costPerSem';
        } else {
            costType = 'costPerYear';
        }

        var progops = [];

        var program = new Program($("#degree").val(), $("#progLen").val(), $("#creds").val(), costType, $("#cost"), , );

        var school = {
            "schoolName":$("#schoolName").val(),
            "schoolState":$("#schoolState").val(),
            "appDueDate":$("#appDueDate").val(),
            "appFee":$("#appFee").val()
        }
    });

    //cancel
    $("#btnCancel").click(function() {

    });

    //delete
    $("#btnDelete").click(function() {

    });

    function convertToTableEntry(candidate) {
        var prog = candidate.prog;
        var progOps = prog.progOps;
        var progReqs = prog.progReqs;

        var name = $("<td></td>").text(candidate.schoolName);
        var state = $("<td></td>").text(candidate.schoolState);
        var duedate = $("<td></td>").text(candidate.appDueDate);
        var fee = $("<td></td>").text("$"+candidate.appFee);
        var degree = $("<summary></summary>").text(prog.degree);
        var proglen = $("<p></p>").text(prog.progLen);
        var creds = $("<p></p>").text(prog.creds);
        var costpercred = $("<p></p>").text(prog.costPerCred);
        var costpersem = $("<p></p>").text(prog.costPerSem);
        var costperyear = $("<p></p>").text(prog.costPerYear);
        var opliststr = "";
        $.each(progOps, function(ind, op) {
            opliststr += $("<li></li>").text(op.opType + " : " + op.opName);
        });
        var progoplist = $("<ul class='progOpList'></ul>").html(opliststr);

        var reqliststr = "";
        $.each(progReqs, function(ind, req) {
            opliststr += $("<li></li>").text(req.reqGroup + " : " + req.reqParam + " " + req.reqType);
        });
        var progreqlist = $("<ul class='progReqList'></ul>").html(reqliststr);

        var opreqdiv = $("<div class='opsAndReqs'></div>").html(progoplist + progreqlist);

        var progDetails = $("<details></details>").html(degree + proglen + creds + costpercred + costpersem +
            costperyear + opreqdiv);

        var row = $("<tr></tr>").html(name + state + duedate + fee + progDetails);

        $("#schoolTable").appendChild(row);
    }


    /** GraduateSchool candidate object constructor
     * params: school's name, state it's in, application due date and fee, and the program of interest*/
    function School(schoolName, schoolState, appDueDate, appFee, prog) {
        this.schoolName = schoolName;
        this.schoolState = schoolState;
        this.appDueDate = appDueDate;
        this.appFee = appFee;
        this.prog = prog;
    }

    /** Program constructor
     * params: type of degree, length of the program, credits required for completion, whether the entered cost is per credit,
     * per semester, or per academic year, and that individual cost (the rest will be calculated) the program options, and the
     * program requirements for acceptance*/
    function Program(degree, progLen, creds, costType, cost, progOps, progReqs) {
        this.degree = degree;
        this.progLen = progLen;
        this.creds = creds;
        this.costPerCred = 0.0;
        this.costPerSem = 0.0;
        this.costPerYear = 0.0;
        calculateAllCosts(costType, cost);
        this.progOps = progOps;
        this.progReqs = progReqs;

        function calculateAllCosts(costType, cost) {
            //Always 2 semesters in any academic year
            var SPY = 2.0;
            var credsPerSem = this.creds / this.progLen;

            switch(costType) {
                case "costPerCred":
                    this.costPerCred = cost;
                    this.costPerYear = (this.costPerCred * this.creds);
                    this.costPerSem = this.costPerYear / SPY;
                    break;
                case "costPerSem":
                    this.costPerSem = cost;
                    this.costPerCred = this.costPerSem / credsPerSem;
                    this.costPerYear = this.costPerSem * (this.progLen * SPY);
                    break;
                case "costPerYear":
                    this.costPerYear = cost;
                    this.costPerCred = (this.costPerYear / this.creds);
                    this.costPerSem = (this.costPerYear / SPY);
            }
        }
    }

    /** Program Option constructor i.e: Specializations & Concentrations. Given the type and the name*/
    function ProgOp(opType, opName) {
        this.opType = opType;
        this.opName = opName;
    }

    /** Program Requirement constructor (Doc Req, Exp Req, Gen Req). Given the type, the name */
    function ProgReq(reqGroup, reqType, reqParam) {
        this.reqGroup = reqGroup;
        this.reqType = reqType;
        this.reqParam = reqParam;
    }
});