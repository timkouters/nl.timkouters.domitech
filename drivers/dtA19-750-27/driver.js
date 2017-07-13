'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');


module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		'onoff': {
			'command_class': 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			'command_get': 'SWITCH_MULTILEVEL_GET',
			'command_set': 'SWITCH_MULTILEVEL_SET',
			'command_set_parser': value => {
				return {
					'Value': (value > 0) ? 'on/enable' : 'off/disable'
				};
			},
			'command_report': 'SWITCH_MULTILEVEL_REPORT',
			'command_report_parser': report => {
				if (typeof report['Value'] === 'string') return report['Value'] === 'on/enable';

				return report['Value (Raw)'][0] > 0;
			},
			'getOnWakeUp': true,
			'pollInterval': "poll_interval"
		},
		'dim': {
			'command_class': 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			'command_get': 'SWITCH_MULTILEVEL_GET',
			'command_set': 'SWITCH_MULTILEVEL_SET',
			'command_set_parser': value => {
				if (value >= 1) value = 0.99;

				return {
					'Value': value * 100
				};
			},
			'command_report': 'SWITCH_MULTILEVEL_REPORT',
			'command_report_parser': report => report['Value (Raw)'][0] / 100,
			'pollInterval': "poll_interval"
		}
	},
	settings: {
		"dimming_step_auto": {
			"index": 8,
			"size": 1,
		},
		"time_dimming_step_manual": {
			"index": 9,
			"size": 2,
		},
		"time_dimming_step_auto": {
			"index": 10,
			"size": 2,
		},
		"dimming_step_manual": {
			"index": 11,
			"size": 1,
		},
		"maximum_brightness": {
			"index": 12,
			"size": 1,
		},
		"minimum_brightness": {
			"index": 13,
			"size": 1,
		},
		"poll_interval": {
        			"index": 13,
        			"size": 1,
        },
	}
});

Homey.manager('flow').on('trigger.lamp_turned_on', (callback, args) => {
    const node = module.exports.nodes[args.device.token];
    if(node.value > 0){
        return callback( null, true );
    } else return callback( null, false );
});

Homey.manager('flow').on('trigger.lamp_turned_off', (callback, args) => {
    const node = module.exports.nodes[args.device.token];
    if(node.value > 0){
        return callback( null, false );
    } else return callback( null, true );
});