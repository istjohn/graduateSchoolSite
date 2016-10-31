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
        var form = $("<iframe></iframe>");
        form.attr("src",'schoolForm.html');
       $("#schoolTable").append("<iframe src='schoolForm.html'></iframe>");
    });







    function save() {
        var school = {
        "schoolName":$("#schoolName")
        };
        alert(school.schoolName);
    }
});