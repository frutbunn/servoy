/**
 * Will take a dirty path string, format it, and return a cleaned path string.
 * 
 * @example application.output(globals.cleanPath("C:/not/correct/for/windows/document.txt"));
 * 
 * @param {String} _p
 * @public
 * 
 * @properties={typeid:24,uuid:"0F80D10A-5BB4-4993-B157-D940224ABD1B"}
 */
function cleanPath(_p) {
	return String( new Path(_p).getFormattedPath() );
}


Path.prototype.constructor = Path;
/**
 * Will take a dirty path string, and return a Path object.
 * 
 * @param {String} [source]
 * @public 
 *
 * @example var path = new Path("https://myurl.com/test.html"); application.output(path);
 *
 * @properties={typeid:24,uuid:"CFBF12F9-EF44-4377-9DD2-F88C0A5FFEFD"}
 */
function Path(source) {
	
	// PUBLIC ATTRIBUTES:
	
	/** @type {String} */
	this.fileType = ''; 
	/** @type {String} */
	this.client = ''; 
	
	/** @type {String} */
	this.prefix = ''; 
	
	/** @type {String} */
	this.path = ''; 
	
	/** @type {String} */
	this.name='';
	/** @type {String} */
	this.extension='';
	
	/** @type {String} */
	this.raw='';
	
	/** @type {String} */
	this.error='';

	
	// PRIVATE ENUMERATIONS:
	
	/**
	 * @type {Object}
	 */
	this.TYPES = {
WINDOWS: "WINDOWS",
UNIX: "UNIX",
URL: "URL",
SERVER: "SERVER"
	};
	
	
	// PUBLIC METHODS:

	/**
	 * Returns the complete filename.
	 * 
	 * @return {String}
	 * @public
	 */
	this.getFilename = function() {
		return this.name + (this.extension != '' ? '.' + this.extension : '');
	}
	
	/**
	 * Will remake an existing Path object from a supplied path string.
	 * 
	 * @param {String} newSource
	 * @public 
	 */
	this.remake = function(newSource) {
		if (newSource === undefined) newSource = new String();
	
		// Determine Servoy client OS file format (direction of slash)
		this.client = application.getOSName().match(/Windows/) ? this.TYPES.WINDOWS : this.TYPES.UNIX;
		this.raw = String(newSource);
	
		// Make all slashes a forward slash '/'
		var _str = this.raw.replace(/\\/g, '/');	
		
		// Get file type & prefix
		if (_str.match(/^(https|http|ftp)\:(\/){2}/)) {
			this.fileType = this.TYPES.URL;
			this.prefix = _str.replace(/^([a-zA-Z]*:(\/){2}).*$/, '$1');
		} else if (_str.match(/^(\/){2}/)) {
			this.fileType = this.TYPES.SERVER;
			this.prefix = '//';
		} else if (_str.match(/^[A-Za-z]{1}\:/)) {
			this.fileType = this.TYPES.WINDOWS;
			this.prefix = _str.replace(/^([a-zA-Z]:).*$/, '$1');
		} else {
			this.fileType = this.TYPES.UNIX;
			this.prefix = '';
		}
		
		// Get filename parts
		var _filename = '';
		if (_str.match(/\./))
			if (_str.match(/\/{1}/)) _filename = _str.substr(_str.lastIndexOf('\/')+1);
			else _filename = _str;
		this.name = _filename.replace(/^(.*)\.(.*)$/, '$1');
		this.extension = _filename.replace(/^(.*)\.(.*)$/, '$2');
		
		// Get path part
		_str = _str.substr(this.prefix.length, _str.length-this.prefix.length);
		_str = _str.substr(0, _str.length-_filename.length);
		this.path = _str;
		
		// Remove duplicate slashes in path
		this.path = this.path.replace(/\/{2,}/g, '/');

		// If file type is Windows, convert forward slashes to back slashes
		if (this.fileType == this.TYPES.WINDOWS) {
			this.path = this.path.replace(/\//g,'\\');
			
			// If this is a Windows path, but client isn't Windows, warn
			if (this.client != this.TYPES.WINDOWS) this.error = "Warning: Windows path on non Windows system";
		}
		
		// If client is Windows, and prefix is blank, assume is a Windows path
		if (this.client == this.TYPES.WINDOWS && this.prefix == '') {
			this.path = this.path.replace(/\//g,'\\');
			this.fileType = this.TYPES.WINDOWS;
		}
		
		// If fileType is server, and path starts with a slash, then remove the slash
		if (this.fileType == this.TYPES.SERVER || this.fileType == this.TYPES.URL)
			this.path = this.path.replace(/^(\/)(.*)$/, '$2');

		// If client is Windows and fileType is server, use back slashes
		if (this.client == this.TYPES.WINDOWS && this.fileType == this.TYPES.SERVER) {
			this.path = this.path.replace(/\//g,'\\');
			this.prefix = '\\\\';
		}
	}
	
	/**
	 * Dump out a string containing all Path properties.
	 * 
	 * @public
	 */
	this.dumpOut = function() {
		var r = '{';
		for (var p in this) {
			if (typeof this[p] != "function") r += p + ':' + this[p]+',';
		}
		r = r.substr(0, r.length-1) + '}';
		
		return r;
	}
	
	/**
	 * Return complete (cleaned) path as a string.
	 * 
	 * @return {String}
	 * @public
	 */
	this.getFormattedPath = function() {
		return this.prefix + this.path + this.name + (this.extension != '' ? '.' + this.extension : '');
	}
	
	/**
	 * If true, supplied path string contains an error.
	 * 
	 * @return {Boolean}
	 * @public 
	 */
	this.hasError = function() {
		return this.error ? false : true;
	}
	
	/**
	 * If supplied path string contained an error, returns it's description
	 *
	 * @return {String}
	 * @public 
	 */
	this.getErrorDescription = function() {
		return this.error;
	}
	
	
	// CONSTRUCTOR:
	
	this.remake(source);
}


// Example derived class

extendsPath.prototype = new Path;
extendsPath.constructor = extendsPath;
/**
 * @param {String} source
 *
 * @properties={typeid:24,uuid:"ED208E6A-22A1-40AC-87BD-D3EFF5647D75"}
 */
function extendsPath(source) {
	
	// CONSTRUCTOR:
	
	Path.call(this, source);
}
