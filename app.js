'use strict';

const Homey = require('homey');

class DomitechApp extends Homey.App {
	onInit() {
		this.log('Starting Domitech Z-Wave app');
	}
}

module.exports = DomitechApp;
