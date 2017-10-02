'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class DomitechDevice extends ZwaveDevice {
	
	onMeshInit() {
		
		// Create on and off triggers
		this._flowTriggerLampTurnedOn = new Homey.FlowCardTrigger('lamp_turned_on').register();
			//new Homey.FlowCardTriggerDevice('lamp_turned_on').register()
        this._flowTriggerLampTurnedOff = new Homey.FlowCardTrigger('lamp_turned_off').register();
            //new Homey.FlowCardTriggerDevice('lamp_turned_off').register()
		
		// enable debugging
		this.enableDebug();
		
		// register the `onoff` capability with COMMAND_CLASS_SWITCH_BINARY
		this.registerCapability('onoff', 'SWITCH_MULTILEVEL', {
			getOpts: {
				getOnStart: true, // get the initial value on app start
			},
			
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: value => ({
				Value: (value > 0) ? 'on/enable' : 'off/disable',
				'Dimming Duration': 'Factory default',
			}),
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report.Value === 'on/enable') {
					triggerLampOnOff(true);
					return true;
				}
				else if (report.Value === 'off/disable') {
					triggerLampOnOff(false);
					return false;
				}
				else if (typeof report.Value === 'number') {
					triggerLampOnOff(report.Value > 0);
					return report.Value > 0;
				}
				else if (typeof report['Value (Raw)'] !== 'undefined') {
					triggerLampOnOff(report['Value (Raw)'][0] > 0);
					return report['Value (Raw)'][0] > 0;
				}
				
				return null;
			},
			
			getParserV3: ( value, opts ) => {
				return {};
			}
		});
		
		// register the `dim` capability with COMMAND_CLASS_SWITCH_BINARY
		this.registerCapability('dim', 'SWITCH_MULTILEVEL', {
			getOpts: {
				getOnStart: true, // get the initial value on app start
			},
			
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: (value, node) => {
				return {
					Value: Math.round(value * 99),
					'Dimming Duration': 'Factory default',
				};
			},
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: (report, node) => {
				if (report.Value === 'on/enable') {
					return 1.0;
				}
				else if (report.Value === 'off/disable') {
					return 0.0;
				}
				else if (typeof report.Value === 'number') {
					return report.Value / 99;
				}
				else if (typeof report['Value (Raw)'] !== 'undefined') {
					if (report['Value (Raw)'][0] === 255) return 1.0;
					return report['Value (Raw)'][0] / 99;
				}
				return null;
			},
			
			getParserV3: ( value, opts ) => {
				return {};
			}
		});
		
		// register a report listener
		this.registerReportListener('SWITCH_MULTILEVEL', 'SWITCH_MULTILEVEL_REPORT', ( rawReport, parsedReport ) => {
			if(parsedReport == true) {
				this.triggerLampOnOff(true)
			}
			
			if(parsedReport == false) {
				this.triggerLampOnOff(false)
			}
			
		});
		
	}
	
	triggerLampOnOff(value) {
		console.log('triggerLampOnOff', value);
		if(value) {
			this._flowTriggerLampTurnedOn.trigger()
	        .catch( this.error )
	        .then( this.log )
		}
		else {
			this._flowTriggerLampTurnedOff.trigger()
	        .catch( this.error )
	        .then( this.log )
		}
	}
}

module.exports = DomitechDevice;
