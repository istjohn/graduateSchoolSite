/**
 * Created by Iain on 10/26/2016.
 */
var school = ''


//All functions only available when the document is loaded and ready
$(document).ready(function() {

});


function fillTable() {
    for(var i = 0; i < length(schools); i++) {

    }
}

function putSchoolInTable(gs) {
    $("#schoolName").text(gs.skoolname);
    $("#state").text(gs.state);
    $("#appDueDate").text(gs.appDueDate);
    $("#appFee").text(gs.appFee);
}


function GradSchool(name, state, appDueDate, appFee, program) {
    this.skoolname = name;
    this.state = state;
    this.appDueDate = appDueDate;
    this.appFee = appFee;
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