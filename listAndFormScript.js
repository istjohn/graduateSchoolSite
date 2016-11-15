/**
 * Created by Iain on 10/26/2016.
 * Simple local web page for Danielle to track her candidate schools for graduate school
 */
/**** GLOBAL VARIABLES, ACCESSIBLE TO THE WHOLE SCRIPT */
/** the list of all the school objects stored in the pseudo db.*/
var candidates = [];

//This is the 'main()' method of this script, and will only run when the page has fully loaded.
$(document).ready(function() {
    console.log("Entering document ready() function... " + document.title);
    if(typeof(Storage) == "undefined") {
        alert("There is no local storage available in this browser. Exiting");
        $(document).close();
    } else {
        //There is valid local storage, check if anything is stored there
        if(localStorage.length > 0) {
            //if so, retrieve the stored candidates and then populate the table
            console.log("local storage length = "+localStorage.length);
            parseCandidatesFromStorage();
            populateTable();
        } else {
            //focus on the add button
            $('#btnAddSchool').focus();
        }
        //regardless of whether or not there are existing candidates, we want to activate
        //this page's interactivity with handlers...
        assignAllEventHandlers();
    }

    /** Assigns ALL event handlers to HTML entities on the page (both the table, and the form) */
    function assignAllEventHandlers() {
        assignFormEventHandlers();
        assignTableEventHandlers();
    }

    /** Assign all necessary event handlers to any and all table elements */
    function assignTableEventHandlers() {
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
    }

    /** Assign all necessary event handlers to any and all form elements */
    function assignFormEventHandlers() {
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

        //add requirement
        $("#btnAddReq").on("click", function() {
            var orig = $("#reqRoot");
            var clone = orig.clone();
            clone.removeProp('id');
            orig.append($("<br>"));
            $("#progReqs").append(clone);
        });

        //remove requirement
        $("#btnRemoveReq").on("click", function() {
            var orig = $(".reqSection:last");
            orig.remove();
        });

        //add op
        $("#btnAddOp").on("click", function() {
            var orig = $("#opRoot");
            var clone = orig.clone();
            clone.removeProp('id');
            orig.append($("<br>"));
            $("#progOps").append(clone);
        });
        //remove op
        $("#btnRemoveOp").on("click", function() {
            var orig = $(".opSection:last");
            orig.remove();
        });

        //add school link
        $("#btnAddSchoolLink").on("click", function() {
            var orig = $("#linkRoot");
            var clone = orig.clone();
            clone.removeProp('id');
            orig.append($("<br>"));
            $("#links").after()
        });

        //remove school link
        $("#btnRemoveSchoolLink").on("click", function() {
            $(".linkSection:last").remove();
        });

        //update available req types based on selected req group
        $(".reqSection").on("change", ".reqGroup", function() {
            var reqGroup = $(this);
            console.log("Selected requirement group set to: " + reqGroup.val());
            var reqType = reqGroup.next(".reqType");
            if(reqGroup.val() == "Document Requirement") {
                console.log("Hide exp reqs and gen reqs");
                reqType.find(".expreq").wrap("<span/>");
                reqType.find(".genreq").wrap("<span/>");
                reqType.find(".docreq").unwrap();
                reqType.val("Personal Statement");
            } else if(reqGroup.val() == "Experience Requirement") {
                console.log("Hide doc reqs and gen reqs");
                reqType.children(".docreq").wrap("<span/>");
                reqType.children(".expreq").unwrap();
                reqType.children(".genreq").wrap("<span/>");
                reqType.val("Volunteer Experience");
            } else {
                console.log("Hide doc reqs and exp reqs");
                reqType.children(".docreq").wrap("<span/>");
                reqType.children(".expreq").wrap("<span/>");
                reqType.children(".genreq").unwrap();
                reqType.val("Minimum GPA");
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

            var links = [];
            $(".linkSection").each(function() {
                var d = $(this).children(".linkDisplayName").val();
                var l = $(this).children(".linkUrl").val();
                links.push(new SchoolLink(d, l));
            });

            console.log("num reqs : " + reqs.length);
            console.log("num ops : " + ops.length);
            console.log("num links : " + links.length);

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
                ),
                links,
                $("#schoolNotes").val()
            );

            var jsonschool = JSON.stringify(school);

            localStorage.setItem(key, jsonschool);
            $("#schoolForm").css("visibility","hidden");
            clearForm();
        });
    }

    function parseCandidatesFromStorage() {
        //if there are candidates in storage, load them and parse them into objects
        for(var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            console.log("At index["+i+"] key = '"+k+"'.");
            var jsonCandidate = localStorage.getItem(k);
            console.log("JSON object associated with that key:\n" + jsonCandidate);
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

            var rawlinks = jsonObj['schoolLinks'];
            var links = [];
            if(rawlinks && rawlinks.length) {
                $.each(rawlinks, function (ind, rawlink) {
                    links.push(new SchoolLink(rawlink['linkDisplayName'],rawlink['linkUrl']));
                });
            }

            var school = new School(
                jsonObj["schoolName"],jsonObj["schoolState"],jsonObj["appDueDate"],jsonObj["appFee"],
                new Program(rawprog['degree'],rawprog['progLen'],rawprog['creds'],rawprog['costPerCred'],
                    rawprog['costPerSem'],rawprog['costPerYear'],
                    ops,
                    reqs),
                links,
                jsonObj['schoolNotes']
            );

            if(school instanceof School) {
                console.log("JSON object in local storage successfully converted into a School!");
            } else {
                console.log("Failed to parse JSON object into a School!");
            }
            candidates.push(school);
        }
    }

    /** Fills the table with all persisted school candidates -- if there are any. Else, prints an alert message. */
    function populateTable() {
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

                var links = $("<ul class='schoolLinkList'>");
                if(candidate.schoolLinks.length > 0) {
                    $.each(candidate.schoolLinks, function(ind, link) {
                        var ah = $("<a>").text(link.linkDisplayName);
                        ah.prop('href',link.linkUrl);
                        ah.prop('target','_blank');
                        links.append($("<li>")
                            .append(ah));
                    });
                } else {
                    links = $("<p>").text("N/A");
                    links.css('text-align','center');
                }


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
                    .append($("<td>")
                        .append(links))
                    .append($("<td>")
                        .append($("<pre>").text(candidate.schoolNotes)))
                );
            });
        } else {
            alert("No school candidates have been added yet. Click on the 'Add New School' button below to add one.");
        }
    }

    /** Re-initializes/clears all  */
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
        $(".linkSection").not(":first").remove();
        $("#schoolNotes").val("");
        location.reload();
    }

    /** GraduateSchool candidate object constructor
     * params: school's name, state it's in, application due date and fee, and the program of interest*/
    function School(schoolName, schoolState, appDueDate, appFee, prog, links, notes) {
        this.schoolName = schoolName;
        this.schoolState = schoolState;
        this.appDueDate = appDueDate;
        this.appFee = appFee;
        this.prog = prog;
        this.schoolLinks = [];
        this.schoolNotes = notes;
        if(links instanceof Array) {
            this.schoolLinks = links.slice();
        }
        this.populateSchoolFormData = function () {
            $("#schoolName").val(this.schoolName);
            $("#schoolState").val(this.schoolState);
            $("#appDueDate").val(this.appDueDate);
            $("#appFee").val(this.appFee);
            $.each(this.schoolLinks, function(ind, link){
                if(ind > 0 ) {
                    link.populateSchoolLinkData();
                } else {
                    var root = $("#linkRoot");
                    root.children(".linkDisplayName").val(this.linkDisplayName);
                    root.children(".linkUrl").val(this.linkUrl);
                }
            });
            if(this.schoolNotes) {
                $("#schoolNotes").text(this.schoolNotes);
            }
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
            $.each(this.progReqs, function(ind, req) {
                if(ind > 0) {
                    req.populateProgReqFormData();
                } else {
                    var root = $("#reqRoot");
                    root.children(".reqGroup").val(req.reqGroup);
                    root.children(".reqType").val(req.reqType);
                    root.children(".reqParam").val(req.reqParam);
                }
            });

            $.each(this.progOps, function(ind, op) {
                if(ind > 0) {
                    op.populateProgOpFormData();
                } else {
                    var root = $("#opRoot");
                    root.children(".opType").val(op.opType);
                    root.children(".opName").val(op.opName);
                }
            });
        };
    }

    /** Program Option constructor i.e: Specializations & Concentrations. Given the type and the name*/
    function ProgOp(opType, opName) {
        this.opType = opType;
        this.opName = opName;
        this.populateProgOpFormData = function () {
            var root = $("#opRoot");
            var clone = root.clone();
            clone.removeProp('id');
            root.append(clone);
            clone.children(".opType").val(this.opType);
            clone.children(".opName").val(this.opName);
        };
    }

    /** Program Requirement constructor (Doc Req, Exp Req, Gen Req). Given the type, the name */
    function ProgReq(reqGroup, reqType, reqParam) {
        this.reqGroup = reqGroup;
        this.reqType = reqType;
        this.reqParam = reqParam;
        this.populateProgReqFormData = function() {
            var root = $("#reqRoot");
            var clone = root.clone();
            clone.removeProp('id');
            root.append(clone);
            clone.children(".reqGroup").val(this.reqGroup);
            clone.children(".reqType").val(this.reqType);
            clone.children(".reqParam").val(this.reqParam);

            if(this.reqGroup == "Document Requirement") {
                clone.find(".expreq").css("visibility","hidden");
                clone.find(".genreq").css("visibility","hidden");
                clone.find(".docreq").css("visibility","visible");
            } else if(this.reqGroup == "Experience Requirement") {
                clone.find(".docreq").css("visibility","hidden");
                clone.find(".expreq").css("visibility","visible");
                clone.find(".genreq").css("visibility","hidden");
            } else {
                clone.find(".docreq").css("visibility","hidden");
                clone.find(".expreq").css("visibility","hidden");
                clone.find(".genreq").css("visibility","visible");
            }
        };
    }

    /** Extra School links */
    function SchoolLink(linkDisplayName, linkUrl) {
        this.linkDisplayName = linkDisplayName;
        this.linkUrl = linkUrl;
        this.populateSchoolLinkData = function() {
            var root = $("#linkRoot");
            var clone = root.clone();
            clone.removeProp('id');
            root.append(clone);
            clone.children(".linkDisplayName").val(this.linkDisplayName);
            clone.children(".linkUrl").val(this.linkUrl);
        };
    }
});