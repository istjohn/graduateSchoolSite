/**
 * Created by Iain on 10/30/2016.
 * This file contains javascript code which defines the objects used in the grad school candidate tracking
 */
/* Global variables, which should be accessible to both screens and their respective script files. */
/** the 'object' stored in localStorage, which holds an array of all the graduate school candidates entered */
var pseudodb;

/** the list of all the school objects stored in the pseudo db. */
var candidates = [];


function loadFromLocalStorage() {

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

}

/** Program Option constructor i.e: Specializations & Concentrations*/
function ProgOp() {

}

function ProgReq() {

}