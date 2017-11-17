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
			    getOnStart: true
			},
		});
		// register the `dim` capability
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');
	}
}
module.exports = DomitechDevice;
