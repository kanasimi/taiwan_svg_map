'use strict';

// ----------------------------------------------------------------------------
// Load CeJS library.

// npm: 若有 CeJS module 則用之。
// globalThis.use_cejs_mudule = true;

try {
	require('./_CeL.loader.nodejs.js');
} catch (e) {
	require('cejs');
}

CeL.run(['data.XML', 'application.storage', 'data.native']);

// ----------------------------------------------------------------------------

let SVG_map_functions;

function reaad_SVG_file(file_path) {
	const XML_data = CeL.read_file(file_path);
	return SVG_map_functions.convert_to_SVG_data(XML_data.toString());
}

function write_SVG_file(file_path, SVG_data) {
	CeL.write_file(file_path, SVG_data.toString());
}


function main_process() {
	const SVG_data = reaad_SVG_file(SVG_map_functions.default_SVG_file_name, { remove_town: true });

	const map_options = {
		[SVG_map_functions.KEY_default]: {
			// county > fill
			//fill: '#f00',

			// information_label > fill
			//color: '#eff',

			// information_label > text
			//label: 'label',

			county: {
				//fill: '',
				//stroke: '',
			},
			county_label: {
				//text: '',
				//fill: '',
			},
			information_label: {
				//text: '',
				//fill: '',
			},
		},
		馬祖: {
			fill: 'red',
			color: 'orange',
			label: '馬祖label'
		},
	};

	SVG_map_functions.adapt_map_options(SVG_data, map_options);

	write_SVG_file('Taiwan map generated.svg', SVG_data);
}


(async function () {
	SVG_map_functions = await import('./SVG_map.core.mjs');

	main_process();
})();
