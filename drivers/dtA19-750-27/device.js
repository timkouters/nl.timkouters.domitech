'use strict';
const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const RAW_DIVIDER = 99;
const MAX_RAW = 255;

class DomitechDevice extends ZwaveDevice {
	
	/**
	 * Invalidate last known value
	 */
	onDeleted() {
		Homey.ManagerSettings.set('Domitech_dim_level_valid', false);
	}
	
	onMeshInit() {
		// enable debugging
		this.disableDebug();
		
		// register the `onoff` capability
		this.registerCapability('onoff', 'SWITCH_MULTILEVEL', {
			getOpts: {
			    getOnStart: true,
			    getOnline: true
			}
		});
		
		// register the `dim` capability
		this.registerCapability('dim', 'SWITCH_MULTILEVEL', {
			
			// Overwrite setParserV1 to save the latest dim level
			setParserV1(value) {
				if (this.hasCapability('onoff')) this.setCapabilityValue('onoff', value > 0);
				
				Homey.ManagerSettings.set('Domitech_dim_level', Math.round(value * RAW_DIVIDER));
				Homey.ManagerSettings.set('Domitech_dim_level_valid', true);
				
				return {
					Value: Math.round(value * RAW_DIVIDER),
				};
			},
			// Overwrite reportParserV1 to set the lamp to the latest known dim level at physical turn-on
			reportParserV1(report) {
				var lampLevel = 0;
				var last_known_value = Homey.ManagerSettings.get('Domitech_dim_level');
				var remember_dim = this.getSetting('remember_dim', false);
				var last_known_value_valid = Homey.ManagerSettings.get('Domitech_dim_level_valid');
				
				if (report['Value (Raw)'][0] === MAX_RAW) {
					lampLevel = 1;
				} 
				else {
					lampLevel = report['Value (Raw)'][0] / RAW_DIVIDER;
				}
				
				if ((lampLevel != last_known_value) && (this.hasCapability('dim')) && (remember_dim) && (last_known_value_valid)) {
					// Send out new SET command to put the lamp back to its original dim level
					this.node.CommandClass.COMMAND_CLASS_SWITCH_MULTILEVEL.SWITCH_MULTILEVEL_SET({Value : last_known_value});
					
					// Update the administration of Homey with the original dim level
					lampLevel = last_known_value / RAW_DIVIDER;
					this.setCapabilityValue('dim', lampLevel)
					.then( result => {
						return result;
				    })
				    .catch( err => {
				        return err;
				    })
					
					return lampLevel;
				}
				
				if (report && report.hasOwnProperty('Value (Raw)')) {
					if (this.hasCapability('onoff')) this.setCapabilityValue('onoff', report['Value (Raw)'][0] > 0);					
					
					if (report['Value (Raw)'][0] === MAX_RAW) {
						lampLevel = 1;
					} 
					else {
						lampLevel = report['Value (Raw)'][0] / RAW_DIVIDER;
					}
					
					return lampLevel;
				}
				return null;
			}
		});
		
		//this.node.nodeId 
	}
}

module.exports = DomitechDevice;
