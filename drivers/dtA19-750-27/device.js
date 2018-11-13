'use strict';
const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
class DomitechDevice extends ZwaveDevice {
	onMeshInit() {
		// enable debugging
		this.disableDebug();
		// register the `onoff` capability
		this.registerCapability('onoff', 'SWITCH_MULTILEVEL', {
			getOpts: {
			    getOnStart: true,
			    getOnline: true
			    //pollInterval: 5,
			    //pollMultiplication: 1000
			},
		});
		// register the `dim` capability
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');
	}
}
module.exports = DomitechDevice;
