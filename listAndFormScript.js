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
           var prog = candidate.prog;
           var ops = $("<ul class='progOpsList'>");
           $.each(prog.progOps, function(ind, op) {
               ops.append($("<li>").text(op.opType + " : " + op.opName));
           });

           var reqs = $("<ul class='progReqsList'>");
           $.each(prog.progReqs, function(ind, req) {
               reqs.append($("<li>").text("["+req.reqGroup+"] : "+req.reqParam + " " + req.reqType));
           });

            $("#schoolTable").append($("<tr>")
                .append($("<td class='editable'>").text(candidate.schoolName))
                .append($("<td>").text(candidate.schoolState))
                .append($("<td>").text(candidate.appDueDate))
                .append($("<td>").text(candidate.appFee))
                .append($("<td>")
                    .append($("<details>")
                        .append($("<summary>").text(prog.degree))
                        .append($("<p>"))
                        .append($("<p>"))
                        .append($("<p>").text("Costs:"))
                        .append($("<p>").text("Per:(Credit, Semester, Year)"))
                        .append($("<p>").text("("+prog.costPerCred+", "+prog.costPerSem+", "+prog.costPerYear+")"))
                        .append($("<div>")
                            .append(ops)
                            .append(reqs)
                        )
                    )
                )
            );
        });
    }
    //attach handlers to the buttons on the list page
    //add new school
    $("#btnAddSchool").click(function() {
        $("#formFrame").show();
    });

    //edit school
    $('.editable').dblclick(function() {
        var key = $(event.target).attr("id");
        var candidate = candidates.get(key);

        //show the form
        $("#formFrame").show();

        //tell the school to populate the visible form with its data
        candidate.populateSchoolFormData();
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
        var orig = $("#schoolForm").find(".reqSection:last");
        var clone = orig.clone();
        orig.append(clone);
    });

    //remove requirement
    $("#btnRemoveReq").click(function() {
        var orig = $("#schoolForm").find(".reqSection:last");
        orig.remove();
    });

    //add op
    $("#btnAddOp").click(function() {
        var orig = $("#schoolForm").find(".opSection:last");
        var clone = orig.clone();
        orig.append(clone);
    });
    //remove op
    $("#btnRemoveReq").click(function() {
        var orig = $("#schoolForm").find(".opSection:last");
        orig.remove();
    });

    //save
    $("#btnSave").click(function() {
        var ops = [];
        $("#schoolForm").find(".opSection").each(function() {
            var otype = $(this).children(".opType").val();
            var oname = $(this).children(".opName").val();
            ops.push(new ProgOp(otype, oname));
        });


        var reqs = [];
        $("#schoolForm").find(".reqSection").each(function() {
            var g = $(this).children(".reqGroup").val();
            var t = $(this).children(".reqType").val();
            var p = $(this).children(".reqParam").val();
            reqs.push(new ProgReq(g, t, p));
        });
        var key = $("#schoolName").val();
        var school = new School(
            key,
            $("#schoolState").val(),
            $("#appDueDate").val(),
            $("#appFee").val(),
            new Program(
                $("#degree").val(),
                $("#progLen").val(),
                $("#creds").val(),
                $("#costPerCred").val(),
                $("#costPerSem").val(),
                $("#costPerYear").val(),
                ops,
                reqs
            )
        );

        localStorage.setItem(key, school);
        var frame = $("#formFrame");
        frame.hide();
    });

    //cancel
    $("#btnCancel").click(function() {
        var frame = $("#formFrame");
        frame.hide();
    });

    //delete
    $("#btnDelete").click(function() {
        var key = $("#schoolForm").find("#schoolName");
        localStorage.removeItem(key);
        var frame = $("#formFrame");
        frame.hide();
    });

    /** GraduateSchool candidate object constructor
     * params: school's name, state it's in, application due date and fee, and the program of interest*/
    function School(schoolName, schoolState, appDueDate, appFee, prog) {
        this.schoolName = schoolName;
        this.schoolState = schoolState;
        this.appDueDate = appDueDate;
        this.appFee = appFee;
        this.prog = prog;
        this.populateSchoolFormData = function() {
            $("#schoolName").val(this.schoolName);
            $("#schoolState").val(this.schoolState);
            $("#appDueDate").val(this.appDueDate);
            $("#appFee").val(this.appFee);
            this.prog.populateProgramFormData();
        }
    }

    /** Program constructor
     * params: type of degree, length of the program, credits required for completion, whether the entered cost is per credit,
     * per semester, or per academic year, and that individual cost (the rest will be calculated) the program options, and the
     * program requirements for acceptance*/
    function Program(degree, progLen, creds, cpc, cps, cpy, progOps, progReqs) {
        this.degree = degree;
        this.progLen = progLen;
        this.creds = creds;
        this.costPerCred = 0.0;
        this.costPerSem = 0.0;
        this.costPerYear = 0.0;

        //Check which, if any, of the costs are still 0.
        if(cpc && (!cps && !cpy)) {
            this.calculateAllCosts("costPerCred",cpc);
        } else if(cps && (!cpc && !cpy)) {
            this.calculateAllCosts("costPerSem",cps);
        } else if(cpy && (!cpc && !cps)) {
            this.calculateAllCosts("costPerYear", cpy);
        } else {
            this.costPerCred = cpc;
            this.costPerSem = cps;
            this.costPerYear = cpy;
        }
        this.progOps = progOps;
        this.progReqs = progReqs;

        /** Program functions */
        this.calculateAllCosts = function(costType, cost) {
            //Always 2 semesters in any academic year
            var SPY = 2.0;
            var credsPerSem = this.creds / this.progLen;

            if (costType == "costPerCred") {
                this.costPerCred = cost;
                this.costPerYear = (this.costPerCred * this.creds);
                this.costPerSem = this.costPerYear / SPY;
            } else if (costType == "costPerSem") {
                this.costPerSem = cost;
                this.costPerCred = this.costPerSem / credsPerSem;
                this.costPerYear = this.costPerSem * (this.progLen * SPY);
            } else {
                this.costPerYear = cost;
                this.costPerCred = (this.costPerYear / this.creds);
                this.costPerSem = (this.costPerYear / SPY);
            }
        }
        this.populateProgramFormData = function() {
            $("#degree").val(this.degree);
            $("#progLen").val(this.progLen);
            $("#creds").val(this.creds);
            $("#costPerCred").val(this.costPerCred);
            $("#costPerSem").val(this.costPerSem);
            $("#costPerYear").val(this.costPerYear);
            $.each(progOps, function(ind, op) {
                var orig = $(".opSection");
                var clone = orig.clone();
                orig.append(clone);
                op.populateProgOpFormData(ind);
            });

            $.each(progReqs, function(ind, req) {
                var orig = $(".reqSection");
                var clone = orig.clone();
                orig.append(clone);
                req.populateProgReqFormData(ind);
            });
        }
    }

    /** Program Option constructor i.e: Specializations & Concentrations. Given the type and the name*/
    function ProgOp(opType, opName) {
        this.opType = opType;
        this.opName = opName;
        this.populateProgOpFormData = function(inputId) {
            $(".opType:eq(inputId)").val(this.opType);
            $(".opName:eq(inputId)").val(this.opName);
        }
    }

    /** Program Requirement constructor (Doc Req, Exp Req, Gen Req). Given the type, the name */
    function ProgReq(reqGroup, reqType, reqParam) {
        this.reqGroup = reqGroup;
        this.reqType = reqType;
        this.reqParam = reqParam;
        this.populateProgReqFormData = function(inputId) {
            $("#reqGroup").val(this.reqGroup);
            $("#reqType").val(this.reqType);
            $("#reqParam").val(this.reqParam);
            if(this.reqGroup == "Document Requirement") {
                $(".expreq").hide();
                $(".genreq").hide();
                $(".docreq").show();
            } else if(this.reqGroup == "Experience Requirement") {
                $(".docreq").hide();
                $(".expreq").show();
                $(".genreq").hide();
            } else {
                $(".docreq").hide();
                $(".expreq").hide();
                $(".genreq").show();
            }
        }
    }
});