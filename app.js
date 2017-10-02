'use strict';

const Homey = require('homey');
const Log = require('homey-log').Log;

class DomitechApp extends Homey.App {
	onInit() {
		this.log('Starting Domitech Z-Wave app');
	}
}

module.exports = DomitechApp;