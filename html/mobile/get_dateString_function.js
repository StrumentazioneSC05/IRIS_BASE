function get_dateString(date_input) {

	var yyyy = date_input.getFullYear();	// Get full year (as opposed to last two digits only)
	
	var month = date_input.getMonth() + 1;	// Get month and correct it (getMonth() returns 0 to 11)
	if (month.toString().length == 1) {mm = "0" + month.toString();}
	else {mm = month.toString();}
	
	var day = date_input.getDate(); // Get date within month
	if (day.toString().length == 1) {dd = "0" + day.toString();}
	else {dd = day.toString();}
	
	var hour = date_input.getHours(); // Get hour
	if (hour.toString().length == 1) {hh = "0" + hour.toString();}
	else {hh = hour.toString();}
	
	/*
	//Arrotondo i minuti a 0 o a 5:
	var diviso5 = (date_input.getMinutes() % 5); //mi restituisce il resto della divisione
	if (date_input.getMinutes()-diviso5 < 5) {minutes = "00";}
	else {minutes = date_input.getMinutes() - diviso5;}
	if (minutes.toString().length == 1) {mms = "0"+minutes;}
	else {mms = minutes;}
	*/

	var minutes = date_input.getMinutes(); // Get minutes
	if (minutes.toString().length == 1) {min = "0" + minutes.toString();}
	else {min = minutes.toString();}
	
	//var fullDateString = yyyy.toString() + mm + dd + hh + min; //nella forma "yyyymmddhhmm"
	return yyyy.toString() + mm + dd + hh + min; //nella forma "yyyymmddhhmm"

}
