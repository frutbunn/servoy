/*
The MIT License (MIT)

Copyright (c) 2015 frutbunn@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * onShow function - call in your form to initialize the accordion.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 * @public 
 * 
 * @properties={typeid:24,uuid:"BB67B07A-363A-4FEB-87E1-36B0AFFD2E77"}
 */
function onShow(firstShow, event) {
	if (firstShow) {
		/** @type {RuntimeForm} */
		var frm = forms[event.getFormName()];
	
		/** @type {scopes.accordion.Administrator} */
		var a = frm['accordion'];
	
		if (a !== undefined) {	
			// Must initialize the Accordion object instance after the form instance
			// was created - so must initialize in forms onShow event.
			a.initialize();
		} else {
			tools.outputError(".onShow: Could not find user form's 'accordion' variable.");
		}
	}
	
}

/**
 * onAction function - add to every element on your form that will be part of the accordion.
 *  
 * (See also 'selectItem' below)
 *
 * @param {JSEvent} event the event that triggered the action
 * @public 
 * 
 * @properties={typeid:24,uuid:"6DF7A1DB-4284-4C59-8C40-D32B47429CF3"}
 */
function onAction(event) {
	/** @type {RuntimeForm} */
	var frm = forms[event.getFormName()];
		
	/** @type {scopes.accordion.Administrator} */
	var a = frm['accordion'];
	
	if (a !== undefined)
		a.onAction(event);
	else
		tools.outputError(".onAction: Could not find user form's 'accordion' variable.");
}

/**
 * function to manually select an item on your accordion outside of an event - to get your form's name use: controller.getName()
 * 
 * @example 
 * scopes.accordion.selectItem(controller.getName(), 'ENTRY_3_4_myvalueD');
 * 
 * @param {String} formName 
 * @param {String} elementName 
 * @public 
 *
 * @properties={typeid:24,uuid:"E8A4C657-8745-465E-908C-E9E2F3E4943B"}
 */
function selectItem(formName, elementName) {
	/** @type {RuntimeForm} */
	var frm = forms[formName];
	
	/** @type {scopes.accordion.Administrator} */
	var a = frm['accordion'];
	
	if (a !== undefined)
		a.selectItem(elementName);
	else
		tools.outputError(".selectItem: Could not find user form's 'accordion' variable.");
}

/**
 * function to dump out the structure of your accordion - to get your form's name use: controller.getName()
 * 
 * Useful for debugging
 * 
 * @example
 * scopes.accordion.dumpOutStructure(controller.getName() );
 * 
 * @param {String} formName 
 * @public 
 *
 * @properties={typeid:24,uuid:"5CE7719E-1E08-4F98-92F7-70BFE9386DBE"}
 */
function dumpOutStructure(formName) {
	/** @type {RuntimeForm} */
	var frm = forms[formName];
	
	/** @type {scopes.accordion.Administrator} */
	var a = frm['accordion'];

	if (a !== undefined)
		a.dumpOutAccordionStructure();
	else
		tools.outputError(".dumpOutStructure: Could not find user form's 'accordion' variable.");
}

/**
 * Functions shared by all scopes.accordion functions/classes.
 * 
 * @type {Object}
 * @public 
 *
 * @properties={typeid:35,uuid:"062CB09F-FBAD-43CC-B706-17844F11008C",variableType:-4}
 */
var tools = {
	/**
	 * @param {String} prefix
	 * @return {String}
	 */
	uniqueString: function uniqueString(prefix) {
		return (prefix === undefined || prefix === null ? '' : prefix + '_') + application.getUUID().toString().replace(/\-/g,'_');
	},
	
 	/**
 	 * @return {String}
 	 */
 	errorMessageHeader: function() {
 		return '{scopes.accordion}';
 	},
 	
 	/**
 	 * @param {String} msg
 	 */
 	outputError: function(msg) {
 		application.output(tools.errorMessageHeader() + msg, LOGGINGLEVEL.ERROR);
 	}
 	
};

/**
 * Simple accordion style menu administration class.
 * 
 * Will re-arrange elements on your form if their name conforms to the naming convention below.
 * 
 * To use, call these Servoy friendly functions from your form:
 *
 * '
 * scopes.accordion.onShow(firstShow, event)		To initialize the accordion object - call in your form's onShow event.
 * scopes.accordion.onAction(event)					Add to each element that will be part of the accordion.
 * '
 * 
 * Add the following variable to your form - NOTE: DO NOT RENAME IT, VARIABLE NAME IS HARDWIRED INTO THE CODE:
 * 
 * '
 * var accordion = new scopes.accordion.Administrator(controller.getName() );
 * 
 * alternatively, if you would like an entry selected by default:
 * 
 * var accordion = new scopes.accordion.Administrator(controller.getName(), "THE NAME OF ELEMENT TO DEFAULT TO" );
 * '
 * 
 * To retrieve click events from the accordion, add the following to your form - NOTE: DO NOT RENAME IT, FUNCTION NAME IS HARDWIRED INTO THE CODE:
 * '
 * function accordion_CALLBACK(event, value) {
 * 		// The value of the entry/button clicked
 *		application.output(value);
 * } 
 * '
 * 
 * You cannot rename 'accordion' variable, and 'accordion_CALLBACK' function to something else. 
 * These two names are hardwired into the code below.
 * Unfortunately, this is the only way I've found so far to make java script objects work with Servoy forms and events.
 * 
 * The name of the element drives the whole administration process. 
 * So your form's element names need to conform to the following syntax:
 *
 * Argument seperator: '_' is the new ',' as it is the only legal symbol you can have in a Servoy form element's name.
 * 
 * There are four arguments that need to be encoded into your element's name:
 * 
 * {'GROUP' | 'BUTTON' | 'ENTRY'} _ group _ index _ {value | sub-group}
 * 
 * GROUP _ 1 _ (index order - a number 1 to n) _ (sub-group - a number 2 to n)
 * 
 * BUTTON _ 1 _ (index order - a number 1 to n) _ (click value returned to your callback function)
 * ENTRY _ (sub-group - a number 2 to n) _ (index order - a number 1 to n) _ (click value returned to your callback function)
 *
 *
 * Elements with following names will make a group with one entry in it, and a button at the bottom:
 *  
 * "GROUP_1_1_2"					create group number 2 at index 1
 * "ENTRY_2_1_myvalue2"				create entry at index 1 for group number 2
 * "BUTTON_1_2_myvalue3"			create a button at index 2
 *
 * 
 * Each group or button element can also have a corresponding 'shadow' element (a line etc).
 * To add them, create a line element on the form and name it:
 * 
 * SHADOW n							where n in the number of the group/button the shadow will underline.
 * 
 * Example for above three would be:
 * SHADOW1							shadow for GROUP_1_1_2
 * SHADOW2							shadow for BUTTON_1_2_myvalue3
 * 
 * 
 * 
 * @param {String} formName 
 * @param {String} [defaultSelection] 
 * @param {Number} [startXaxis] 
 * @param {Number} [startYaxis] 
 * @param {String} [unselectedColor]
 * @param {String} [selectedColor]
 * @param {String} [loadingColor]
 * @param {Boolean} [leaveBlankLineBetweenButtonsAndGroups]
 * @param {Boolean} [showLoading]
 * 
 * @constructor
 * @public 
 * 
 * @properties={typeid:24,uuid:"CDE148BA-2E35-447E-BB83-48966E13D597"}
 */
function Administrator(formName, defaultSelection, startXaxis, startYaxis
 , unselectedColor, selectedColor, loadingColor, leaveBlankLineBetweenButtonsAndGroups, showLoading) {
	
	// PUBLIC METHODS:
	
	/**
	 * Change the displayed accordion group, or handle an entry/button being clicked.
	 * 
	 * DO NOT CALL THIS WITHIN YOUR CODE. Use Servoy friendly function scopes.accordion.onAction(event) above instead.
	 * 
	 * @param {JSEvent} event 
	 * @public
	 */
	this.onAction = function(event) {
		/** @type {String} */
		var name = event.getElementName();

		if (! flags.active) return;
		
		// Handle unnamed elements getting this far.
		if (name === undefined || name === null)
			return;

		// If item already selected, then do nothing.
		if (name == flags.previouslySelected)
			return;
		
		// Handle click
		/** @type {String} */
		var value = changeSelectedItem(name);
		
		// If newly selected item has a value, return it to users callback
		if (value !== undefined) {
			
			// If the form has an accordion callback function, call it with the value of the selected entry.
			if (frm_p['accordion_CALLBACK'] !== undefined) {
				if (args.showLoading) 
					setColor(flags.previouslySelected, colors.loading);
				
				frm_p['accordion_CALLBACK'](event, value);
				setColor(flags.previouslySelected, colors.selected);
			} else {
				tools.outputError("Administrator.onAction: no 'accordion_CALLBACK' function defined on user form. Sending click event to /dev/null");
			}
		}
	}

	/**
	 * DO NOT CALL THIS WITHIN YOUR CODE. Use Servoy friendly function scopes.accordion.selectItem(formName, elementName) above instead.
	 * 
	 * @param {String} name 
	 * @public 
	 */
	this.selectItem = function(name) {
		changeSelectedItem(name);
	}
	
	/**
	 * Dump out whole accordion structure for debugging accordion syntax.
	 * 
	 * DO NOT CALL THIS WITHIN YOUR CODE. Use Servoy friendly function scopes.accordion.dumpOutStructure(formName, elementName) above instead.
	 * 
	 * @public
	 */
	this.dumpOutAccordionStructure = function() {
		if (! flags.active) {
			tools.outputError("Administrator.dumpOutAccordionStructure: Accordion is not active.")
			return;
		}
		
		// Loop through all groups and sub-groups in the accordion arrays and output details
		/** @type {Number} */
		for(var g in a_group) {
			if (typeof a_group[g] == 'object') {
				application.output('---> GROUP : ' + g);
				/** @type {Number} */
				for(var i in a_group[g]) {
					application.output(i + '\tgroup=' + a_group[g][i].group + ',\tname=' + a_group[g][i].name
					 + ',\t\ttype=' + a_group[g][i].type + ',\tvalue='
					 + a_group[g][i].value + ',\tlabel=' + a_group[g][i].label);
					
				}
				application.output('<---');
			} else {
				tools.outputError("Administrator.dumpOutAccordionStructure: (bug) Illegal type '" + typeof a_group[g] + "' in a_group tree.");
			}
		}
	}

	/**
	 * Initialize the accordion.
	 *
	 * DO NOT CALL THIS WITHIN YOUR CODE.
	 *
	 * @public
	 */ 
	this.initialize = function() {
		// Do not re-initialize
		if (flags.active) return;

		// Setup accordion tree's root array
		a_group = new Array();
		
		/** @type {String} */
		for(var i in frm_p.elements) {
			/** @type {String} */
			var name = frm_p.elements[i].getName();
			/** @type {Array} */
			var a = splitArgsIntoAnArray(name);
			
			// If element has no name then it definitely isn't part of the accordion. So do nothing.
			if (a[0] !== undefined) {
				// If it does not contain these values, do nothing, it is not part of the accordion.
				if (a[0] == 'GROUP' || a[0] == 'ENTRY' || a[0] == 'BUTTON') {
					// An accordion element must have four arguments, so check that the remaining three 
					// arguments also exist
					if (a[1] !== undefined && a[2] !== undefined && a[3] !== undefined) {
						addNewEntryToAccordionTree(a, name);
					} else {
						tools.outputError("Administrator.initialize: Illegal syntax in element '" + name + "' name. Not enough arguments."); 
					}
				}
			}
		}

		// Accordion form elements are now initialized, so allow Servoy wrapper functions to work.
		flags.active = true;

		makeDefaultSelection();
	}

	
	// PRIVATE METHODS:

	/**
	 * @param {Entry} entry
	 */
	var makeThisSelectedItem = function(entry) {
		if (flags.selectedGroup != entry.group && entry.group != 1) {
			flags.selectedGroup = Number(entry.group);
		}
		
		if (flags.previouslySelected !== undefined)
			setColor(flags.previouslySelected, colors.unselected);	
		if (args.showLoading)
			setColor(entry.name, colors.selected);
	
		// Remember the selection made, so can deselect it later.
		flags.previouslySelected = entry.name;		
	}
	
	/**
	 * @param {String} name
	 * 
	 * @return {String | undefined}
	 */
	var changeSelectedItem = function(name) {
		if (! flags.active) return ret;
				
		/** @type {String} */
		var ret = undefined;
		
		/** @type {Entry} */
		var entry = findElement(name);
		
		// If user clicked a group. If group is closed, open it, otherwise close it.
		if (entry.type == 'GROUP') {
			if (flags.selectedGroup == entry.value) {
				// Close the open group (set selected group to none)
				flags.selectedGroup = 0;
			} else {
				// Remember the now open group
				flags.selectedGroup = Number(entry.value);
			}
		// If user selected a button or sub-group entry, set it as selected item in accordion.
		} else if (entry.type == 'BUTTON' || entry.type == 'ENTRY') {
			makeThisSelectedItem(entry);
			ret = entry.value;
		}
		
		// Re-render the accordion to take grouping changes into effect.
		render(flags.selectedGroup);
		
		// Return id of the item pressed - if there is one (this is the user defined 
		// 'value' of the accordion item, so they know which button was pressed).
		return ret;
	}
		
	/**
	 * Renders shadow i at currentYaxis, returns height of shadow rendered
	 * 
	 * @param {Number} initialYaxis
	 * @param {String} i
	 * 
	 * @return {Number}
	 */
	var renderShadow = function(initialYaxis, i) {
		if (frm_p.elements['SHADOW'+i] !== undefined) {
		
			frm_p.elements['SHADOW'+i].setLocation(args.startXaxis, initialYaxis);
			frm_p.elements['SHADOW'+i].visible = true;
			
			return frm_p.elements['SHADOW'+i].getHeight();
		}
		else {
			// No shadow
			return 0;
		}
	}
	
	/**
	 * Renders a subgroup 
	 * 
	 * If equal to activeGroup renders the sub-group, otherwise hides it
	 * 
	 * Returns height of rendered subgroup, or 0 if subgroup is not currently open 
	 * 
	 * @param {Number} initialYaxis
	 * @param {Number} activeGroup
	 * @param {Entry} e
	 */
	var renderSubgroup = function(initialYaxis, activeGroup, e) {
		/** @type {Number} */
		var currentGroup = e.value;
		
		/** @type {Number} */
		var currentYaxis = initialYaxis;
		
		/** @type {Number} */
		for(var j in a_group[currentGroup]) {
			/** @type {String} */
			var n = a_group[currentGroup][j].name;

			if (currentGroup == activeGroup) {
				frm_p.elements[n].setLocation(args.startXaxis, currentYaxis);
				currentYaxis+=frm_p.elements[n].getHeight();
				frm_p.elements[n].visible = true;
			} else {
				frm_p.elements[n].visible = false;
			}
		}
		
		return currentYaxis - initialYaxis;
	}
	
	/**
	 * Renders a group (and it's associated subgroup), and returns it's height
	 * 
	 * @param {Number} initialYaxis
	 * @param {Number} activeGroup
	 * @param {Entry} e
	 */
	var renderGroup = function(initialYaxis, activeGroup, e) {
		/** @type {Number} */
		var currentYaxis = initialYaxis;
		
		/** @type {Number} */
		var currentGroup = e.value;
		
		frm_p.elements[e.name].imageURL = (currentGroup == activeGroup ? 'media:///accordion_group_open.png' : 'media:///accordion_group_closed.png');
		
		currentYaxis+=renderSubgroup(currentYaxis, activeGroup, e);
		
		if (currentGroup != activeGroup && args.leaveBlankLineBetweenButtonsAndGroups)
			currentYaxis++;

		return currentYaxis - initialYaxis;
	}
	
	/**
	 * Renders a button, and returns it's height
	 * 
	 * @param {Number} initialYaxis
	 * @param {Entry} e
	 * 
	 * @return {Number}
	 */
	var renderButton = function(initialYaxis, e) {
		/** @type {Number} */
		var currentYaxis = initialYaxis;
		
		frm_p.elements[e.name].imageURL = 'media:///accordion_group_button.png';
		
		if (args.leaveBlankLineBetweenButtonsAndGroups)
			currentYaxis++;
		
		return currentYaxis - initialYaxis;
	}
	
	/**
	 * Re-arrange the accordion form elements.
	 * 
	 * @param {Number} activeGroup 
	 */
	var render = function(activeGroup) {
		/** @type {Number} */
		var yAxis = args.startYaxis;

		if (args.leaveBlankLineBetweenButtonsAndGroups)
			yAxis++;

		// Loop through all root group/button entries and render them
		/** @type {Number} */
		for(var i in a_group[1]) {
			
			/** @type {Entry} */
			var e = a_group[1][i];

			// Set position at current y axis
			frm_p.elements[e.name].setLocation(args.startXaxis, yAxis);
			yAxis+=frm_p.elements[e.name].getHeight();
			
			frm_p.elements[e.name].visible = true;

			yAxis+= renderShadow(yAxis, i);

			// Render entry by type
			switch (e.type) {
			case 'GROUP':
				yAxis+= renderGroup(yAxis, activeGroup, e);
				break;
			
			case 'BUTTON':
				yAxis+=renderButton(yAxis, e);
				break;
				
			default:
				tools.outputError("Administrator.render: Syntax error, cannot have '" + e.name + "' in GROUP 1.");
			}
			
		}
		
	}
		
	/**
	 * Split the four arguments of accordion syntax into an array
	 * 
	 * @param {String} name
	 * @return {Array}
	 */
	var splitArgsIntoAnArray = function(name) {
		// If this element is part of the accordion, then it's name will comprise four arguments
		// eg: "GROUP_1_1_2", "ENTRY_2_1_a", or "BUTTON_1_6_testc"

		// Split these arguments into an array to parse
		/** @type {Array} */
		var a = name.split('_');
		
		// If split to more than 4 args, concat remaining args together as users return value has an _ in it
		/** type {String} */
		if (a.length > 4) {
			a[3] = name.substr( (a[0] + '_' + a[1] + '_' + a[2] + '_').length );
		}

		// Type should be an upper case value
		if (a[0] !== undefined)
			a[0] = a[0].toUpperCase();

		// Result should contain the four arguments used to add this element to the accordion:
		//
		// a[0] = TYPE (in upper case)
		// a[1] = GROUP or '1'
		// a[2] = INDEX
		// a[3] = SUBGROUP or VALUE
		
		return a;
	}
	
	/**
	 * @param {Array} argsArray
	 * @param {String} componentName
	 */
	var addNewEntryToAccordionTree = function(argsArray, componentName) {
		/** @type {Entry} */
		var entry = new Entry();

		/** @type {Number} */
		var groupNumber = Number(argsArray[1]);
		/** @type {Number} */
		var index = Number(argsArray[2]);

		entry.type = argsArray[0];
		entry.name = componentName;
		entry.label = frm_p.elements[componentName].text;
		entry.value = argsArray[3];
		entry.group = groupNumber;
		
		frm_p.elements[componentName].fgcolor = colors.unselected;
		
		// Add element to the accordion tree structure
		addEntry(groupNumber, index, entry);
	}
	
	var makeDefaultSelection = function() {
		// If accordion has a default selection - select it, so it is shown at startup.
		if (args.defaultSelection !== undefined) {
			changeSelectedItem(args.defaultSelection);
			
			// If showLoading colors is disabled, then manually set the default selected item color now as is first run.
			if (! args.showLoading)
				setColor(args.defaultSelection, colors.selected); 
		} else {
		// Otherwise, no default selection, so just render the root of the tree with all groups closed.
			render(0);
		}
	}
	
	/**
	 * @param {String} elmName
	 * @param {String} color 
	 */
	var setColor = function(elmName, color) {
		if (elmName !== undefined)
			frm_p.elements[elmName].fgcolor = color;
	}
	
//	/**
//	 * @param {String} elmName
//	 */
//	var showLoadingColor = function(elmName) {
//		setColor(elmName, colors.loading);
//	}
//
//	/**
//	 * @param {String} elmName
//	 */
//	var showLoadedColor = function(elmName) {
//		setColor(elmName, colors.selected);
//	}
//
//	/**
//	 * @param {String} elmName
//	 */
//	var showSelectedColor = function(elmName) {
//		setColor(elmName, colors.selected);
//	}
//
//	/** 
//	 * @param {String} elmName
//	 */
//	var showUnselectedColor = function(elmName) {
//		setColor(elmName, colors.unselected);
//	}
	
	/**
	 * Find an element by name
	 * 
	 * @param {String} name 
	 * @returns {Entry | undefined}
	 */
	var findElement = function(name) {
		// Loop through all groups and indices checking for requested element name
		/** @type {Number} */
		for(var g in a_group) {
			if (typeof a_group[g] == 'object') {
				/** @type {Number} */
				for(var i in a_group[g]) {
					
					// If found, return Entry object for that element
					if (a_group[g][i].name == name) {
						return a_group[g][i];
					}
				}
			}
		}
		
		// If element name not found, return undefined - this will happen in .initialize when the default selection is checked.
		return undefined;
	}

	/**
	 * Add a new Entry object to the accordion tree.
	 * 
	 * @param {Number} groupIndex 
	 * @param {Number} entryIndex 
	 * @param {Entry} entry 
	 */
	var addEntry = function(groupIndex, entryIndex, entry) {
		// If branch at root of tree does not exist, create it first, by adding a new array at this index
		if (a_group[groupIndex] === undefined)
			a_group[groupIndex] = new Array(); 
		
		// Add the Entry object to the tree
		a_group[groupIndex][entryIndex] = entry;
	}
	
	
	// PRIVATE ATTRIBUTES
	
	/** 
	 * User definable arguments, passed at object construction
	 * 
	 * @type {Object} 
	 * @protected 
	 */
	 var args = {
		/** @type {Number} */
		startXaxis: 0,
		/** @type {Number} */
		startYaxis: 0,
		
		/** @type {String} */
		formName: undefined,
		
		/** @type {String} */
		defaultSelection: undefined,
		
		/** @type {Boolean} */
		showLoading: true,
		
		/**
		 * Leave a 1 line space between root buttons and groups - same as existing RISCm accordion
		 * @type {Boolean}
		 */
		leaveBlankLineBetweenButtonsAndGroups: true
	 };

	 /** 
	  * Colors to use for selected, unselected, loading etc
	  * 
	  * @type {Object}
	  * @protected 
	  */
	 var colors = {
		 /** @type {String} */
		 unselected: '#ffffff',
		 /** @type {String} */
		 selected: '#ff8000',
		 /** @type {String} */
		 loading: '#ff0000'
	 }
	 
	/** 
	 * @type {Object}
	 * @protected  
	 */
	var flags = {
		/** @type {Boolean} */
		active: false,
			
		/**
		 * Previously selected form element name - undefined = no selection has been made yet.
		 * @type {String} 
		 */		
		previouslySelected: undefined,
		/**
		 * Group currently selected on the accordion tree structure - 0 or 1 = the root group, >1 = a sub-group
		 * @type {Number} 
		 */
		selectedGroup: 0
	}
	
	/**
	 * The accordion is arranged in memory as an array of arrays.
	 * 
	 * The root array contains a second array that contains a group's Entry objects.
	 * 
	 * @type {Array}
	 * @protected 
	 */
	var a_group = undefined;
	
	// Pointer to form accordion is on
	/** 
	 * @type {RuntimeForm} 
	 * @protected 
	 */
	var frm_p = undefined;
	
	/**
	 * Entry object - everything that is part of the accordion has one of these.
	 * 
	 * @param {String} [name] 
	 * @param {String} [type] 
	 * @param {String} [value] 
	 * @param {String} [label] 
	 * @param {String} [group] 
	 * 
	 * @constructor 
	 * @private 
	 */
	function Entry(name, type, value, label, group) {
		this.name = name;		// element name
		this.type = type;		// accordion element type (GROUP, BUTTON or ENTRY)
		this.value = value;		// value returned to user's callback on click
		this.label = label;		// text to display on the accordion
		this.group = group;		// 1 = root group, >1 = sub-group
	}

	
	// CONSTRUCTOR:

	
	// Store user arguments:
	args.formName = formName;
	
	if (startXaxis !== undefined && startXaxis !== null)
		args.startXaxis = startXaxis;
	
	if (startYaxis !== undefined && startYaxis !== null)
		args.startYaxis = startYaxis;
	
	if (defaultSelection !== undefined && defaultSelection !== null)
		args.defaultSelection = defaultSelection;
	
	if (unselectedColor !== undefined && unselectedColor !== null)
		colors.unselected = unselectedColor;

	if (selectedColor !== undefined && selectedColor !== null)
		colors.selected = selectedColor;
	
	if (loadingColor !== undefined && loadingColor !== null)
		colors.loading = loadingColor;
	
	if (leaveBlankLineBetweenButtonsAndGroups !== undefined && leaveBlankLineBetweenButtonsAndGroups !== null)
		args.leaveBlankLineBetweenButtonsAndGroups = leaveBlankLineBetweenButtonsAndGroups;

	if (showLoading !== undefined && showLoading !== null)
		args.showLoading = showLoading;
	
	// Set form pointer to users form
	frm_p = forms[args.formName];
	
	// Accordion has not been initialized yet
	flags.active = false;

	Administrator.prototype.constructor = Administrator;
}

/**
 * Accordion Form Builder class - a wrapper for Administrator class
 * 
 * Allows you to automate building a new accordion form (with SolutionModel) and link it to a JSSubForm element on your own form.
 * 
 * See example form 'DAVE_accordion_example1'. 
 * 
 * This is probably the easiest way to use this accordion code.
 * 
 * @example 
 * <PRE>
 * // NOTE quotes around "tabless" and "ACCORDION_CALLBACK"!
 * var ab = new scopes.accordion.AccordionBuilder(controller.getName(), "tabless", "ACCORDION_CALLBACK");
 *
 * function ACCORDION_CALLBACK(event, value) {
 *	// Simulate slow loading of a subform - like RISCm Analysis reports.
 *	application.sleep(2000);
 *
 *	// The click value of the item selected.
 *	application.output('VALUE OF CLICKED ITEM IS: ' + value);
 *}
 *
 * // Build an example accordion
 * function onShow(firstShow, event) {
 *	if (firstShow) {
 *		ab.start();
 *		
 *		ab.addButton('Button1','but1');
 *		ab.makeDefaultSelection();
 *		
 *		ab.addGroup('Group 1');
 *		ab.addEntry("entry 1", "a1");
 *		ab.addEntry('entry 2', 'a2');
 *		ab.addEntry('entry 3', 'a3');
 *
 *		ab.addGroup('Group 2');
 *		ab.addEntry('entry 1', 'b1');
 *		ab.addEntry('entry 2', 'b2');
 *		ab.addEntry('entry 3', 'b3');
 *
 *		ab.addGroup('Group 3');
 *		ab.addEntry('entry 1', 'c1');
 *		ab.addEntry('entry 2', 'c2');
 *		ab.addEntry('entry 3', 'c3');
 * 
 *		ab.end();
 *	} 
 * }
 * 
 * // Not really needed for RISCm
 * function onUnload(event) {
 *	ab.onUnload(); 
 * }
 * </PRE>
 * 
 * @constructor 
 * @public 
 * 
 * @param {String} parentFormName 
 * @param {String} parentSubFormElementName 
 * @param {String} callback  MAKE SURE QUOTES ARE AROUND THIS VALUE OR FUNCTION WILL BE PASSED AND NOT IT'S NAME AS A STRING!
 * 
 * @properties={typeid:24,uuid:"FB66F507-DEFC-4585-A4E1-3AB6000F0D5E"}
 */
function Builder(parentFormName, parentSubFormElementName, callback) {

	// PUBLIC METHODS:
	
	/**
 	 * Start the accordion form building process.
 	 * 
 	 * @public
 	 */
 	this.start = function() {
 		if (flags.finalized) return;
 		
 		flags.totalGroups = flags.currentRootIndex = flags.currentSubGroupIndex = 1;
 		
		createForm();
	}

	/**
	 * Add a new spacer
	 * 
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @public
	 */
	this.addSpacer = function() {
		if (flags.finalized) return;
		
		// No spacers allowed in root menu.
		if (flags.totalGroups == 1) return;
		
		var name = 'ENTRY_' + flags.totalGroups + '_' + flags.currentSubGroupIndex + '_' + '';
	
		/** @type {JSButton} */
		var elm = accordionForm.frm_p.newButton('', 0, 0, accordionForm.width, 3, null);
		elm.name = name;
		elm.background = config.entryBackground;
		elm.foreground = config.entryForeground;
		elm.borderType = solutionModel.createSpecialMatteBorder(0, 0, config.spacerBorderSize, 0, '', '', config.spacerColor, '', 0, null);		
		elm.showClick = false;
		elm.showFocus = false;
		elm.transparent = false;
		elm.visible = false;
		
		flags.currentSubGroupIndex++;
	}

	/**
	 * Add a new group to the accordion
	 * 
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} title
	 * @public
	 */
	this.addGroup = function(title) {
		if (flags.finalized) return;

		flags.totalGroups += 1;
		flags.currentSubGroupIndex = 1;
	
		/** @type {String} */
		var name = 'GROUP_1_' + flags.currentRootIndex + '_' + flags.totalGroups;
		
		/** @type {JSButton} */
		var elm = accordionForm.frm_p.newButton(title, 0, 0, accordionForm.width, config.groupAndButtonHeight, null);
		elm.name = name;
		elm.transparent = false;
		elm.background = config.rootBackground;
		elm.foreground = config.rootForeground;
		elm.showClick = false;
		elm.showFocus = false;
		elm.visible = false;
		elm.verticalAlignment = SM_ALIGNMENT.CENTER;
		elm.horizontalAlignment = SM_ALIGNMENT.LEFT;
		elm.rolloverCursor = SM_CURSOR.HAND_CURSOR;
		elm.fontType = solutionModel.createFont('Verdana', SM_FONTSTYLE.PLAIN /* SM_FONTSTYLE.BOLD */, 10);

		if (config.createShadows) {
			//elm.borderType = 'EmptyBorder,0,0,0,0';
			elm.borderType = solutionModel.createEmptyBorder(0, 0, 0, 0);
			addShadow();
		} else {
			elm.borderType = solutionModel.createSpecialMatteBorder(0, 0, config.rootBorderSize, 0, '', '', config.rootBorderColor, '', 0, null);
		}
		
		elm.onAction = accordionForm.onActionMethod;
		
		flags.previouslyCreatedElementName = name;
		flags.currentRootIndex += 1;
	}

	/**
	 * Add a new button - buttons are always created in the root of the tree.
	 * 
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} title
	 * @param {String} value
	 * @public 
	 */
	this.addButton = function(title, value) {
		if (flags.finalized) return;
		
		/** @type {String} */
		var name = 'BUTTON_' + '1' + '_' + flags.currentRootIndex + '_' + value;
		
		/** @type {JSButton} */
		var elm = accordionForm.frm_p.newButton(title, 0, 0, accordionForm.width, config.groupAndButtonHeight, null);
		elm.name = name;
		elm.transparent = false;
		elm.background = config.rootBackground;
		elm.foreground = config.rootForeground;
		elm.showClick = false;
		elm.showFocus = false;
		elm.visible = false;
		elm.verticalAlignment = SM_ALIGNMENT.CENTER;
		elm.horizontalAlignment = SM_ALIGNMENT.LEFT;
		elm.rolloverCursor = SM_CURSOR.HAND_CURSOR;
		elm.fontType = solutionModel.createFont('Verdana', SM_FONTSTYLE.PLAIN /* SM_FONTSTYLE.BOLD */, 10);
		
		if (config.createShadows) {
			//elm.borderType = 'EmptyBorder,0,0,0,0';
			elm.borderType = solutionModel.createEmptyBorder(0, 0, 0, 0);
			addShadow();			
		} else {
			elm.borderType = solutionModel.createSpecialMatteBorder(0, 0, config.rootBorderSize, 0, '', '', config.rootBorderColor, '', 0, null);
		}
		
		elm.onAction = accordionForm.onActionMethod;
		
		flags.previouslyCreatedElementName = name;

		flags.currentRootIndex++;			
	}

	/**
	 * Add a new entry to a subgroup - you must call this.addGroup at least once first.
	 * 
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} title
	 * @param {String} value
	 * @public
	 */
	this.addEntry = function(title, value) {
		if (flags.finalized) return;
		
		// TODO Check this.addGroup has been called first
		
		/** @type {String} */
		var name = 'ENTRY_' + flags.totalGroups + '_' + flags.currentSubGroupIndex + '_' + value;
		
		/** @type {JSButton} */
		var elm = accordionForm.frm_p.newButton(title, 0, 0, accordionForm.width, config.entryHeight, null);
		elm.name = name;
		elm.transparent = false;
		elm.background = config.entryBackground;
		elm.foreground = config.entryForeground;
		elm.showClick = false;
		elm.showFocus = false;
		elm.visible = false;
		elm.verticalAlignment = SM_ALIGNMENT.CENTER;
		elm.horizontalAlignment = SM_ALIGNMENT.LEFT;
		elm.rolloverCursor = SM_CURSOR.HAND_CURSOR;
		elm.fontType = solutionModel.createFont('Verdana', SM_FONTSTYLE.PLAIN /* SM_FONTSTYLE.BOLD */, 10);
		elm.borderType = solutionModel.createLineBorder(0, '#000000');
		
		elm.onAction = accordionForm.onActionMethod;
		
		flags.previouslyCreatedElementName = name;

		flags.currentSubGroupIndex += 1;
	}
	
	/**
	 * Makes the previous item created the default item - will be 
	 * selected when accordion is first shown - a callback event is NOT triggered.
	 * 
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @public
	 */
	this.makeDefaultSelection = function() {
		if (flags.finalized) return;
		
		if (flags.previouslyCreatedElementName !== undefined) {
			flags.elementNameUserTaggedAsDefaultValue = flags.previouslyCreatedElementName;
			flags.userTaggedAnEntryAsDefaultValue = true;
		}
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} col 
	 * @public
	 */
	this.setGlobalUnselectedColor = function(col) {
		if (flags.finalized) return;
		else config.unselectedColor = col;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @public
	 */
	this.doNotShowLoadingColors = function() {
		if (flags.finalized) return;
		else config.showLoading = false;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} col 
	 * @public
	 */
	this.setGlobalSelectedColor = function(col) {
		if (flags.finalized) return;
		else config.selectedColor = col;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} col 
	 * @public
	 */
	this.setGlobalLoadingColor = function(col) {
		if (flags.finalized) return;
		else config.loadingColor = col;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {Boolean} bool
	 * @public
	 */
	this.createGlobalShadows = function(bool) {
		if (flags.finalized) return;
		else config.createShadows = bool;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} col 
	 * @public
	 */
	this.setGlobalBackgroundColor = function(col) {
		if (flags.finalized) return;
		
		config.accordionBackground = col;
		accordionForm.backgroundButton.background = col;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {Boolean} bool 
	 * @public
	 */
	this.setGlobalBlankLineBetweenRootItems = function(bool) {
		if (flags.finalized) return;
		else config.leaveBlankLineBetweenButtonsAndGroups = bool;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} col 
	 * @public
	 */
	this.setGroupBackgroundColor = function(col) {
		if (flags.finalized) return;
		else config.rootBackground = col;
	}
	
	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} col 
	 * @public
	 */
	this.setEntryBackgroundColor = function(col) {
		if (flags.finalized) return;
		else config.entryBackground = col;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {Number} height
	 * @public
	 */
	this.setShadowHeight = function(height) {
		if (flags.finalized) return;
		else config.rootBorderSize = height;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} col 
	 * @public
	 */
	this.setShadowColor = function(col) {
		if (flags.finalized) return;
		else config.rootBorderColor = col;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {String} col 
	 * @public
	 */
	this.setSpacerColor = function(col) {
		if (flags.finalized) return;
		else config.spacerColor = col;
	}

	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {Number} height 
	 * @public
	 */
	this.setGroupHeight = function(height) {
		if (flags.finalized) return;
		else config.groupAndButtonHeight = height;
	}
	
	/**
	 * CANNOT BE CALLED AFTER this.end() is called
	 * 
	 * @param {Number} height 
	 * @public
	 */
	this.setEntryHeight = function(height) {
		if (flags.finalized) return;
		else config.entryHeight = height;
	}
	
	/**
	 * End construction of the accordion form, and create an instance of it by adding it as a tab on the users JSSubForm.
	 * ONCE CALLED YOU CANNOT MAKE FURTHER CHANGES TO THE ACCORDION'S TREE STRUCTURE
	 * 
	 * @public 
	 */
	this.end = function() {
		if (flags.finalized) return;
		
		// Once form built do not allow any further changes
		flags.finalized = true;
		
		// Add an accordion.Administrator object to this new form.
		/** @type {String} */
		var func = "new scopes.accordion.Administrator('" + accordionForm.name + "'";

		if (flags.elementNameUserTaggedAsDefaultValue !== undefined) 
			func += ", '" + flags.elementNameUserTaggedAsDefaultValue + "'";
		else
			func += ", undefined ";

		func += ", 0, 0 ";
		func += ", '" + config.unselectedColor + "' ";
		func += ", '" + config.selectedColor + "' ";
		func += ", '" + config.loadingColor + "' ";
		func += ", " + config.leaveBlankLineBetweenButtonsAndGroups;
		func += ", " + config.showLoading;
		
		func += ")";
		accordionForm.frm_p.newVariable('accordion', JSVariable.MEDIA, func);
		
		// Create an instance of this new form by attaching it to the parent Form's Subform element.
		/** @type {RuntimeTabPanel} */
		var parentSubform = forms[args.parentFormName].elements[args.parentSubFormElementName];
		parentSubform.addTab(accordionForm.name);
	
		// PS: The actual accordion is initialized via the onShow method added in createForm() below.
	}

	/** 
	 * Unload the form - add to your forms onUnload function.
	 * @public
	 */
	this.onUnload = function() {
		/** @type {RuntimeTabPanel} */
		var parentSubform = forms[args.parentFormName].elements[args.parentSubFormElementName];
		parentSubform.removeAllTabs();
		
		deleteForm();
	}
	
	// PRIVATE METHODS:
	
	/**
	 * @return {Boolean}
	 */
	var createForm = function() {
		// Make new form same width as user's subform element it will attach to
		/** @type {RuntimeComponent} */
		var userSubForm = forms[args.parentFormName].elements[args.parentSubFormElementName];
		/** @type {Number} */
		var w = userSubForm.getWidth();
		/** @type {Number} */
		var h = userSubForm.getHeight();

		// Remember width of form, as needed later when constructing elements
		accordionForm.width = w;
		
		// Make a unique name for the new form we will create
		accordionForm.name = tools.uniqueString('accordion_tmp');
		
		// Delete an existing form with the same name should it exist - it shouldn't exist as name will be unique, see uniqueString above!
		deleteForm();
		
		// Create the new form
		/** @type {JSForm } */
		var frm = solutionModel.newForm(accordionForm.name, null, null, false, w, h);
		frm.navigator = SM_DEFAULTS.NONE;
		frm.scrollbars = SM_SCROLLBAR.HORIZONTAL_SCROLLBAR_NEVER | SM_SCROLLBAR.VERTICAL_SCROLLBAR_NEVER;
		frm.borderType = 'EmptyBorder, 0, 0, 0, 0';
		frm.transparent = true;
		
		// onAction event accordion buttons will call - interacts with accordion Administrator class instance on the new form.
		accordionForm.onActionMethod = frm.newMethod("function onAction(event){ scopes.accordion.onAction(event); }");

		// onShow event new form will call - will initialize the accordion Administrator object we add to the new form later - see this.end()
		accordionForm.onShowMethod = frm.newMethod("function onShow(firstShow, event){scopes.accordion.onShow(firstShow, event);}");
		frm.onShow = accordionForm.onShowMethod;
		
		// Wrap accordion Administrator callback function so we can send clicks back to user's form
		/** @type {String} */
		var callbackFunction;
		if (args.parent_CALLBACK !== undefined && args.parent_CALLBACK !== null) {
			callbackFunction = "function accordion_CALLBACK(event, value) { forms['"
			 + args.parentFormName + "']['" + args.parent_CALLBACK + "'](event, value); }"
		} else {
			// Do not remove this empty function - accordion.Administrator object will assume it exists - and bitch if it doesn't!
			callbackFunction = "function accordion_CALLBACK(event, value) {}";
		}
		accordionForm.CALLBACK_Method = frm.newMethod(callbackFunction);

		// Set accordion background color by adding a button that fills the full form + sets anchors so it can expand.
		/** @type {JSButton } */
		var elm = frm.newButton('', 0, 0, w, h, null);
		elm.name = 'accordion_background';
		elm.transparent = false;
		elm.background = config.accordionBackground;
		elm.showClick = false;
		elm.showFocus = false;
		elm.anchors = SM_ANCHOR.ALL;
		elm.borderType = solutionModel.createLineBorder(0, '#000000');
		accordionForm.backgroundButton = elm;
		
		// Creates pointer to our new form for quick access to it's methods
		accordionForm.frm_p = frm;

		// Succeeded
		return true;
	} 

	var deleteForm = function() {
		if (history.removeForm(accordionForm.name)) {
			solutionModel.removeForm(accordionForm.name);
		}
	}
	
	var addShadow = function() {
		/** @type {String} */
		var name = 'SHADOW' + flags.currentRootIndex;
		
		/** @type {JSButton} */
		var elm = accordionForm.frm_p.newButton('', 0, 0, accordionForm.width, config.rootBorderSize, null);
		elm.name = name;

		elm.background = config.rootBorderColor;
		elm.borderType = solutionModel.createEmptyBorder(0,0,0,0);

		elm.showClick = false;
		elm.showFocus = false;
		elm.transparent = false;
		elm.visible = false;
	}
	
	// PRIVATE ATTRIBUTES
	
	/** 
	 * @type {Object} 
	 * @protected  
	 */
	var config = {
		/** @type {String} */
		accordionBackground: '#dee5f4',

		/** @type {String} */
		rootBackground: '#3f6597',
		/** @type {String} */
		entryBackground: '#325078',
		/** @type {String} */
		
		rootForeground: '#ffffff',
		/** @type {String} */
		entryForeground: '#ffffff',
		
		/** @type {String} */
		rootBorderColor: '#325078',

		/** @type {String} */
		unselectedColor: '#ffffff',
		/** @type {String} */
		selectedColor: '#ff8000',
		/** @type {String} */
		loadingColor: '#ff0000',
		
		/** @type {Boolean} */
		leaveBlankLineBetweenButtonsAndGroups: true,
		
		/** @type {Boolean} */
		showLoading: true,

		/** @type {Boolean} */
		createShadows: true,
		
		/** @type {Number} */
		rootBorderSize: 3,
		
		/** @type {Number} */
		spacerBorderSize: 1,
		/** @type {String} */
		spacerColor: '#214056',
		
		/** @type {Number} */
		groupAndButtonHeight: 32,
		/** @type {Number} */
		entryHeight: 20
	}
	
	// User supplied arguments (passed over at object creation)
	/** 
	 * @type {Object} 
	 * @protected  
	 */
	var args = {
		/** @type {String} */
		parentFormName: undefined,
		/** @type {String} */
		parentSubFormElementName: undefined,
		
		/** @type {String} */
		parent_CALLBACK: undefined
	}

	// Useful form variables for our new form.
	/** 
	 * @type {Object} 
	 * @protected  
	 */
	var accordionForm = {
		/** @type {String} */
		name:undefined,
		/** @type {JSForm} */
		frm_p: undefined,			// pointer to form we create

		/** @type {Number} */
		width: undefined,
		
		/** @type {JSButton} */
		backgroundButton: undefined,
		
		/** @type {JSMethod} */
		onActionMethod: undefined,
		/** @type {JSMethod} */
		onShowMethod: undefined,
		
		/** @type {JSMethod} */
		CALLBACK_Method: undefined
	}
	
	/** 
	 * @type {Object} 
	 * @protected 
	 */
	var flags = {
		/** @type {Number} */
		totalGroups: undefined,
		
		/** @type {Number} */
		currentRootIndex: undefined,
		/** @type {Number} */
		currentSubGroupIndex: undefined,
		/** @type {String} */
		
		previouslyCreatedElementName: undefined,
		/** @type {Boolean} */
		
		userTaggedAnEntryAsDefaultValue: false,
		/** @type {String} */
		elementNameUserTaggedAsDefaultValue: undefined,
		
		/** @type {Boolean} */
		finalized: false
	}
	
	
	// CONSTRUCTOR

	args.parentFormName = parentFormName;
	args.parentSubFormElementName = parentSubFormElementName;
	args.parent_CALLBACK = callback;

	flags.finalized = false;
	
	Builder.prototype.constructor = Builder;
}
