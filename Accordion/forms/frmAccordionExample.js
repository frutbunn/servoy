/**
 * @properties={typeid:35,uuid:"A11FBADA-A361-4C93-BA95-A589985C03F4",variableType:-4}
 */
var ab = new scopes.accordion.Builder(controller.getName(), 'tabAccordionMenu', "ACCORDION_CALLBACK");

/**
 * @param {JSEvent} event
 * @param {String} value
 *
 * @properties={typeid:24,uuid:"B6010273-79A5-4871-B6CF-A216B8470EA9"}
 */
function ACCORDION_CALLBACK(event, value) {
	
	// Simulate slow opening of a subform - like in RISCm Analysis
	application.sleep(2000);
	
	application.output('VALUE OF PRESSED ITEM IS: ' + value);
}

/**
 * TODO generated, please specify type and doc for the params
 * @param firstShow
 * @param event
 *
 * @properties={typeid:24,uuid:"6730FCDC-7979-4FC3-BF2D-C0BF17706B7E"}
 */
function onShow(firstShow, event) {
	if (firstShow) {
		
		ab.start();
		
		ab.addButton("Button One", "but_1");
		ab.makeDefaultSelection();
		
		ab.addButton("Button Two", "but_2");

		ab.addGroup('Group One');
		for(var i=1; i<=15; i++) {
			ab.addEntry("Entry you can select number " + i, "a_" + i);
			//if (i==5 || i==10) ab.addSpacer();
		} i--;
		//ab.makeDefaultSelection();
		ab.addGroup('Group Two');
		for(var j=1; j<=5; j++) {
			ab.addEntry("More entries you can select: " + (i + j), "b_" + j)
		} j--;

		ab.addGroup('Group Three');
		for(var k=1; k<=10; k++) {
			ab.addEntry("Yet more entries to select: " + (i + j + k), "c_" + k)
		} k--;
		
		ab.addButton('Button Three', 'but_3');
		ab.addButton('Button Four', 'but_4');
		ab.addButton('Button Five', 'but_5');

		ab.addGroup('Group Four');
		for(var l=1; l<=10; l++) {
			ab.addEntry("Still some more entries to select: " + (i + j + k + l), "d_" + l)
		} l--;

		ab.end();

	}

}

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"5B1729AE-30B3-43B0-B0F9-3A7688AF734D"}
 */
function onUnload(event) {
	ab.onUnload();
}

