/**
 * A simple registry class to easily read and write [Key:Value] pairs to and from a table.
 * 
 * @example 
 * <PRE>
 * var reg = new daveTools.Registry('database', 'registry', 'ident', 'payload');
 *
 * if (! reg.test()) {
 *		application.output('Registry failed to initialize.', LOGGINGLEVEL.ERROR);
 * }
 * 
 * // Set a value in the registry:
 * reg.set('my_key', 'new value');
 * 
 * // Retrieve a value from the registry:
 * application.output(reg.get('my_key') );
 * 
 * // You can also check that the registry is still functioning:
 * application.output('Registry ' + (reg.test() ? 'is working' : 'has stopped working') + '.');
 * 
 * Source database table structure should be something like:
 * key:		varchar(50)		PRIMARY KEY, unique value
 * payload:	varchar(MAX)	The payload
 * </PRE>
 * 
 * @constructor 
 * 
 * @param {String} database			Source database name for registry
 * @param {String} table			Source table name for registry
 * @param {String} pkFieldname		Field name of the source table's primary key - should be TEXT and Primary Key
 * @param {String} payloadFieldname	Field name on source table to use as the payload field
 * 
 * @public
 * 
 * @properties={typeid:24,uuid:"4AAAB8E9-C4F7-46EE-9FF0-D66AC7FF066F"}
 */
function Registry(database, table, pkFieldname, payloadFieldname) {
 	
	/// PUBLIC METHODS:
	
	/**
	 * Retrieve a value from the registry by supplying 'key'.
	 * 
	 * On error returns null
	 * 
	 * @example 
	 * <PRE>
	 * // Get a value in registry previously created in globals:
	 * application.output(globals.registry.get('my_key') );
	 * </PRE>
	 * 
	 * @param {String} key
	 * @public
	 * @return {String}
	 */
	this.get = function(key) {
		
		if (! flags.enabled) {
			outputError('.get: Registry has not been initialized yet, so cannot retrieve value.')
			return null;
		}

		// Store and retrieve keys only in upper case to cover for possible case-sensitivity issues
		key = key.toUpperCase();

		// find record with the same primary key as search key and return it
		try {
			if (fs.selectRecord(key)) { 
				var rec = fs.getRecord(fs.getSelectedIndex());
				return rec[dataSource.payload];
			}
		} catch(e) {
			outputError('.get: unable to retrieve record from database.');
			return null;
		}

		// If not found return an empty string
		return '';
	}

	/**
	 * Set a value in the registry for entry 'key', if it does not 
	 * exist, it will be created.
	 * 
	 * @example 
	 * <PRE>
	 * // Set a value in registry previously created in globals:
	 * globals.registry.set('my_key','my value');
	 * </PRE>
	 * 
	 * @param {String} key
	 * @param {String | Number | Boolean | Date} payload
	 * @public 
	 * 
	 * @return {Boolean}
	 */
	this.set = function(key, payload) {
		if (! flags.enabled) 
			return false;

		// Convert key to upper case as RDBMS is not case sensitive, and cast payload to a string value
		payload = (payload + '');
		key = key.toUpperCase();

		// If payload is empty, delete it instead
		if (payload == '') 
			return this.remove(key);

		// Try and find record with this key, if found, update to new payload.
		// Otherwise, create a new record
		try {
			if (! fs.selectRecord(key))
				if (fs.newRecord(false) == -1)
					return false;

			/** @type {JSRecord} */
			var rec = fs.getRecord(fs.getSelectedIndex());
			rec[dataSource.pk] = key;
			rec[dataSource.payload] = payload;

		} catch(e) {
			outputError('.set: unable to retrieve record from database.');
			return false;
		}

		return syncChangesWithDatabase();
	}
	
	/**
	 * Remove an entry from the registry.
	 * 
	 * @example 
	 * <PRE>
	 * // Remove a value in registry previously created in globals:
	 * globals.registry.remove('my_key','my value');
	 * </PRE>
	 *
	 * @param {String} key
	 * @public 
	 * @return {Boolean}
	 */
	this.remove = function(key) {
		if (! flags.enabled)
			return false;
		
		// Convert key to upper case as RDBMS is not case sensitive
		key = key.toUpperCase();
		
		// Try and find record with this key, if found, delete record.
		try {
			if (fs.selectRecord(key)) {
				if (! fs.deleteRecord())
					return false;
			} else {
				// If record not found result is true so succeeded.
				return true;
			}
		} catch(e) {
			outputError('.remove: unable to retrieve/delete record from database.');
			return false;
		}

		return syncChangesWithDatabase();
	}
	
	/**
	 * Test connection to registry database
	 * Returns true if connection OK, false otherwise
	 * 
	 * When a registry is initialized, please call this
	 * method to confirm connection to database is OK.
	 *
	 * Failures on .get will also return null if error.
	 * 
	 * @example
	 * <PRE>
	 * application.output('Registry ' + (globals.registry.test() ? 'is working' : 'has stopped working') + '.');
	 * </PRE>
	 * 
	 * @public 
	 * @return {Boolean}
	 */
	this.test = function() {
		if (! flags.enabled)
			return false;
		
		// If can access back-end RDMS, all is grand
		try {
			return loadInAllRecords(fs);
		} catch(e) {
			outputError('.test: unable to access records from database.');
			return false;
		}

	}

	/**
	 * Not really needed, but nice
	 * 
	 * @public 
	 */
	this.close = function() {
		if (! flags.enabled)
			return;
		
		fs = null;
		flags.enabled = false;
	}

	
	/// PRIVATE METHODS:

	var openBackendDB = function() {
		try {
			fs = databaseManager.getFoundSet(dataSource.db, dataSource.table);
			loadInAllRecords(fs);

		} catch(e) {
			outputError('constructor: unable to connect to database.');
			return false;
		}

		return true;
	}
	
 	/**
 	 * @return {String}
 	 */
 	var errorMessageHeader = function() {
 		return '{Registry [' + dataSource.db + '].[' + dataSource.table + ']}';
 	}
 	
 	/**
 	 * @param {String} msg
 	 */
 	var outputError = function(msg) {
 		//application.output(errorMessageHeader() + msg, LOGGINGLEVEL.ERROR);
 		globals.output(errorMessageHeader() + msg, 1);
 	}
 	
	/** 
	 * @param {JSFoundset} _fs		JSFoundset to load all records
	 * @return {Boolean}				
	 */
	var loadInAllRecords = function(_fs) {
		try {
			_fs.clear();
			_fs.loadAllRecords();

			if (_fs.getSize()>0) {
				_fs.setSelectedIndex(databaseManager.getFoundSetCount(_fs));
				_fs.setSelectedIndex(1);
			}
		} catch(e) {
			outputError('Registry.loadInAllRecords: unable to access database.');
			return false;
		}
		
		return true;
	}
 	
 	/**
 	 * @return {Boolean}
 	 */
 	var syncChangesWithDatabase = function() {
 		try {
 			if (! databaseManager.saveData(fs))
 				return false;
 		} catch(e) {
 			outputError('.set: unable to save changes to database.');
 			return false;
 		}
 		
 		return true;
 	}

	
	/// PRIVATE ATTRIBUTES:
	
	/** 
	 * @type {JSFoundset} 
	 * @protected 
	 */
	var fs;
	
	/** 
	 * @type {Object} 
	 * @protected 
	 */
	var dataSource = {
		/** @type {String} */
		db: undefined,
		/** @type {String} */
		table: undefined,
		/** @type {String} */
		pk: undefined,
		/** @type {String} */
		payload: undefined
	};

	/**
	 * @type {Object}
	 * @protected 
	 */
	var flags = {
		/** Disable everything until there is an actual connection to a backend DB table
		 * @type {Boolean} */
		enabled: false
	};

	
	/// CONSTRUCTOR:

	dataSource.db = database;
	dataSource.table = table;
	dataSource.pk = pkFieldname;
	dataSource.payload = payloadFieldname;

	// Open database table and read in all records
	flags.enabled = openBackendDB();

	Registry.prototype.constructor = Registry;
}
