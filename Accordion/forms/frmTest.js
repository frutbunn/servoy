/**
 * @properties={typeid:35,uuid:"8296B962-6EF0-45C5-B416-BD19E3E4B3E9",variableType:-4}
 */
var dp = null;

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"546AF7AF-728E-4653-8876-1AF14D53B949"}
 */
function onAction(event) {

	var testCases = [
"test.txt", 
"testing/test.txt", 
"https:///test/one\\/two//three.html", 
"/////test/one\\/two//three.txt", 
"X:\\test/test.html", 
"https://test", 
"D:application_server\\config.txt"
	];
	
	for(var i in testCases) {
		application.output( new globals.Path(testCases[i]).getFormattedPath() );
		
		application.output("");
		
		var _p = new globals.Path(testCases[i]);
		application.output("THIS IS THE PREFIX: \"" + _p.prefix + "\"");
		application.output("THIS IS THE PATH & PREFIX: \"" + _p.prefix + _p.path + "\"");
		application.output(_p.getFormattedPath());
		application.output(_p.dumpOut());
		
		application.output("");
		application.output(globals.cleanPath(testCases[i]));
		
		application.output("--------------------------------------------------------------------------------------------------");
	}

}
