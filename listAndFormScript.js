/**
 * Created by Iain on 10/26/2016.
 * Simple local web page for Danielle to track her candidate schools for graduate school
 */
/**** GLOBAL VARIABLES, ACCESSIBLE TO THE WHOLE SCRIPT */
/** the list of all the school objects stored in the pseudo db.*/
var candidates = [];
var progReqTemplate = $("<div class='reqSection'><select")

//This is the 'main()' method of this script, and will only run when the page has fully loaded.
$(document).ready(function() {
    console.log("Entering document ready() function... " + document.title);
    if(typeof(Storage) == "undefined") {
        alert("There is no local storage available in this browser. Exiting");
        $(document).close();
    }

    //attach handlers to the buttons on the list page
    //add new school
    $("#btnAddSchool").on("click", function() {
        console.log("Pressed the add school button...");
        $("#schoolForm").css('visibility','visible');
    });

    //delete ALL schools
    $("#btnDeleteAll").on("click", function() {
        var r = confirm("Are you sure you wish to delete all records?");
        if(r == true && localStorage.length > 0) {
            localStorage.clear();
            reload();
        }
    });

    //add requirement
    $("#btnAddReq").on("click", function() {
        var orig = $(".reqSection:last");
        var clone = orig.clone();
        orig.append($("<br>"));
        orig.append(clone);
    });

    //remove requirement
    $("#btnRemoveReq").on("click", function() {
        var orig = $(".reqSection:last");
        orig.remove();
    });

    //add op
    $("#btnAddOp").on("click", function() {
        var orig = $(".opSection:last");
        var clone = orig.clone();
        orig.append($("<br>"));
        orig.append(clone);
    });
    //remove op
    $("#btnRemoveOp").on("click", function() {
        var orig = $(".opSection:last");
        orig.remove();
    });

    //update available req types based on selected req group
    $(".reqGroup").on("change", function() {
        var reqGroup = $(this).val();
        if(reqGroup == "Document Requirement") {
            $(".expreq").css("visibility","hidden");
            $(".genreq").css("visibility","hidden");
            $(".docreq").css("visibility","visible");
            $(".reqType").val("Personal Statement");
        } else if(reqGroup == "Experience Requirement") {
            $(".docreq").css("visibility","hidden");
            $(".expreq").css("visibility","visible");
            $(".genreq").css("visibility","hidden");
            $(".reqType").val("Volunteer Experience");
        } else {
            $(".docreq").css("visibility","hidden");
            $(".expreq").css("visibility","hidden");
            $(".genreq").css("visibility","visible");
            $(".reqType").val("Minimum GPA");
        }
    });

    //save/create -- performed whenever the save button is pressed, for a edited or new entry
    $("#btnSave").on("click", function() {
        var ops = [];
        $(".opSection").each(function() {
            var otype = $(this).children(".opType").val();
            var oname = $(this).children(".opName").val();
            ops.push(new ProgOp(otype, oname));
        });

        var reqs = [];
        $(".reqSection").each(function() {
            var g = $(this).children(".reqGroup").val();
            var t = $(this).children(".reqType").val();
            var p = $(this).children(".reqParam").val();
            reqs.push(new ProgReq(g, t, p));
        });

        console.log("reqs : " + reqs.length);

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

        var jsonschool = JSON.stringify(school);

        localStorage.setItem(key, jsonschool);
        $("#schoolForm").css("visibility","hidden");
        clearForm();
    });

    //cancel
    $("#btnCancel").on('click', function(){
       console.log("school addition cancelled");
       $("#schoolForm").css('visibility','hidden');
       clearForm();
    });

    //delete
    $("#btnDelete").on("click", function() {
        var key = $("#schoolName");
        localStorage.removeItem(key);
        $("#schoolForm").css('visibility','hidden');
        clearForm();
    });

    $("#btnAddFile").on("click", function() {
       $("#extrasSection").append($("<input type='file'>"));
    });

    //if there are candidates in storage, load them and parse them into objects
    if(localStorage.length > 0) {
        console.log("Candidates in storage: " + localStorage.length);
        console.log("Retrieving candidates from storage...");
        for(var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            console.log("At index["+i+"] key = '"+k+"'.");
            var jsonCandidate = localStorage.getItem(k);
            console.log("JSON with with key:\n" + jsonCandidate);
            var jsonObj = JSON.parse(jsonCandidate);

            var rawprog = jsonObj['prog'];

            var rawops = rawprog['progOps'];
            var ops = [];
            $.each(rawops, function(ind, rawop){
               ops.push(new ProgOp(rawop['opType'],rawop['opName']));
            });

            var rawreqs = rawprog['progReqs'];
            var reqs = [];
            $.each(rawreqs, function(ind, rawreq){
                reqs.push(new ProgReq(rawreq['reqGroup'],rawreq['reqType'],rawreq['reqParam']));
            });

            var school = new School(
                jsonObj["schoolName"],jsonObj["schoolState"],jsonObj["appDueDate"],jsonObj["appFee"],
                new Program(rawprog['degree'],rawprog['progLen'],rawprog['creds'],rawprog['costPerCred'],
                    rawprog['costPerSem'],rawprog['costPerYear'],
                    ops,
                    reqs
                )
            );

            if(school instanceof School) {
                console.log("JSON object in local storage successfully converted into a School!");
            } else {
                console.log("Failed to parse JSON object into a School!");
            }

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
                        .append($("<summary>").text("Degree:"+prog.degree))
                        .append($("<p>").text("Credits to Complete:"+prog.creds))
                        .append($("<p>").text("Program Length:"+prog.progLen))
                        .append($("<p>").text("Cost per Credit: $"+prog.costPerCred))
                        .append($("<p>").text("Cost per Semester: $"+prog.costPerSem))
                        .append($("<p>").text("Cost per Academic Year: $"+prog.costPerYear))
                        .append($("<div>")
                            .append(ops)
                            .append(reqs)
                        )
                    )
                )
            );
        });
    } else {
        alert("No school candidates have been added yet. Click on the 'Add New School' button below to add one.");
    }

    //edit school
    $('#schoolTable').on('dblclick', '.editable', function() {
        var key = $(event.target).text();
        var candidate;
        for(var i = 0; i < candidates.length; i++) {
            if(candidates[i].schoolName == key) {
                candidate = candidates[i];
            }
        }

        console.log("Opening form to edit object:\n"+JSON.stringify(candidate));
        //show the form
        $("#schoolForm").css('visibility','visible');

        //tell the school to populate the visible form with its data
        candidate.populateSchoolFormData();
    });

    function clearForm() {
        $("#schoolName").val("");
        $("#schoolState").val("New York");
        $("#appDueDate").val('');
        $("#appFee").val("");
        $("#creds").val("");
        $("#costPerCred").val("");
        $("#costPerSem").val("");
        $("#costPerYear").val("");
        $(".reqGroup").val("Document Requirement");
        $(".reqType").val("Personal Statement");
        $(".opType").val("Concentration");
        $(".opName").val("");
        $("#degree").val("MSW");
        $("#progLen").val("");
        $(".opSection").not(":first").remove();
        $(".reqSection").not(":first").remove();
        $("#extrasSection").empty();
    }

    /** GraduateSchool candidate object constructor
     * params: school's name, state it's in, application due date and fee, and the program of interest*/
    function School(schoolName, schoolState, appDueDate, appFee, prog) {
        this.schoolName = schoolName;
        this.schoolState = schoolState;
        this.appDueDate = appDueDate;
        this.appFee = appFee;
        this.prog = prog;
        this.populateSchoolFormData = function () {
            $("#schoolName").val(this.schoolName);
            $("#schoolState").val(this.schoolState);
            $("#appDueDate").val(this.appDueDate);
            $("#appFee").val(this.appFee);
            this.prog.populateProgramFormData();
        };
    }

    /** Program constructor
     * params: type of degree, length of the program, credits required for completion, whether the entered cost is per credit,
     * per semester, or per academic year, and that individual cost (the rest will be calculated) the program options, and the
     * program requirements for acceptance*/
    function Program(degree, progLen, creds, cpc, cps, cpy, progOps, progReqs) {
        var SPY = 2.0;
        this.degree = degree;
        this.progLen = progLen;
        this.creds = creds;
        this.costPerCred = 0.0;
        this.costPerSem = 0.0;
        this.costPerYear = 0.0;
        this.costType = "";
        var credsPerSem = this.creds / this.progLen;
        //Check which, if any, of the costs are still 0.
        if(cpc && (!cps && !cpy)) {
            this.costPerCred = cpc;
            this.costPerYear = (this.costPerCred * this.creds);
            this.costPerSem = this.costPerYear / SPY;
        } else if(cps && (!cpc && !cpy)) {
            this.costPerSem = cps;
            this.costPerCred = this.costPerSem / credsPerSem;
            this.costPerYear = this.costPerSem * (this.progLen * SPY);
        } else if(cpy && (!cpc && !cps)) {
            this.costPerYear = cpy;
            this.costPerCred = (this.costPerYear / this.creds);
            this.costPerSem = (this.costPerYear / SPY);
        } else {
            this.costPerCred = cpc;
            this.costPerSem = cps;
            this.costPerYear = cpy;
        }
        this.progOps = [];
        this.progReqs = [];
        if(progOps instanceof Array) {
            this.progOps = progOps.slice();
        }

        if(progReqs instanceof  Array) {
            this.progReqs = progReqs.slice();
        }
        /** Program functions */
        this.populateProgramFormData = function () {
            $("#degree").val(this.degree);
            $("#progLen").val(this.progLen);
            $("#creds").val(this.creds);
            $("#costPerCred").val(parseFloat(this.costPerCred).toFixed(2));
            $("#costPerSem").val(parseFloat(this.costPerSem).toFixed(2));
            $("#costPerYear").val(parseFloat(this.costPerYear).toFixed(2));

            if(this.progOps.length == 0) {
                $("#opRoot").remove();
            } else if(this.progOps.length == 1) {
                this.progOps[0].populateProgOpFormData(1);
            } else {
                this.progOps[0].populateProgOpFormData(1);
                var root = $("#opRoot");
                $.each(this.progOps.slice(1), function(ind, op) {
                    var clone = root.clone();
                    clone.remove('id');
                    op.populateProgOpFormData(ind+1);
                });
            }

            if(this.progReqs.length == 0) {
                $("#reqRoot").remove();
            } else if(this.progReqs.length == 1) {
                this.progReqs[0].populateProgReqFormData(1);
            } else {
                this.progReqs[0].populateProgReqFormData(1);
                var root = $("#reqRoot");
                $.each(this.progReqs.slice(1), function(ind, op) {
                    var clone = root.clone();
                    clone.remove('id');
                    op.populateProgReqFormData(ind+1);
                });
            }

        };
    }

    /** Program Option constructor i.e: Specializations & Concentrations. Given the type and the name*/
    function ProgOp(opType, opName) {
        this.opType = opType;
        this.opName = opName;
        this.populateProgOpFormData = function (ind) {
            $("div:nth-of-type("+ind+")").children(".opType").val(this.opType);
            $("div:nth-of-type("+ind+")").children(".opName").val(this.opName);
        };
    }

    /** Program Requirement constructor (Doc Req, Exp Req, Gen Req). Given the type, the name */
    function ProgReq(reqGroup, reqType, reqParam) {
        this.reqGroup = reqGroup;
        this.reqType = reqType;
        this.reqParam = reqParam;
        this.populateProgReqFormData = function(ind) {
            $("div:nth-of-type("+ind+")").children(".reqGroup").val(this.reqGroup);
            $("div:nth-of-type("+ind+")").children(".reqType").val(this.reqType);
            $("div:nth-of-type("+ind+")").children(".reqParam").val(this.reqParam);
            if(this.reqGroup == "Document Requirement") {
                $(".expreq").css("visibility","hidden");
                $(".genreq").css("visibility","hidden");
                $(".docreq").css("visibility","visible");
            } else if(this.reqGroup == "Experience Requirement") {
                $(".docreq").css("visibility","hidden");
                $(".expreq").css("visibility","visible");
                $(".genreq").css("visibility","hidden");
            } else {
                $(".docreq").css("visibility","hidden");
                $(".expreq").css("visibility","hidden");
                $(".genreq").css("visibility","visible");
            }
        }
    }
});