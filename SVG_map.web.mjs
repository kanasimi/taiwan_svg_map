/*

npm i http-server
node_modules\.bin\http-server E:\cgi-bin\program\SVG_map

http://127.0.0.1:8080/SVG_map.html

*/

import * as SVG_map_functions from './SVG_map.core.mjs';

window.addEventListener("load", () => {
	CeL.run(['data.XML', 'application.storage', 'data.native', 'interact.DOM', 'data.CSV'], main_process);
});


// http://xn--dahlstrm-t4a.net/svg/html/get-embedded-svg-document-script.html
// https://stackoverflow.com/questions/8102528/how-do-you-access-the-contents-of-an-svg-file-in-an-img-element
function getSubDocument(embedding_element) {
	try {
		return embedding_element.contentDocument || embedding_element.getSVGDocument();
	} catch (e) {
		CeL.error(`Cannot get .contentDocument!`);
		console.error(e);
	}
}

let SVG_image_text;
function load_SVG_image() {
	if (false) {
		const SVG_image_node = document.createElement('object');
		SVG_image_node.type = "image/svg+xml";
		SVG_image_node.addEventListener("load", function (event) {
			console.log(event);
			console.log(getSubDocument(SVG_image_node));
		});
		//SVG_image_node.src = SVG_map_functions.default_SVG_file_name;
		SVG_image_node.data = SVG_map_functions.default_SVG_file_name;
	}

	const SVG_image_node = getSubDocument(document.getElementById('original_SVG_file'));
	SVG_image_text = SVG_image_node.documentElement.outerHTML;
}

function get_adapted_SVG_data() {
	const SVG_data = SVG_map_functions.convert_to_SVG_data(SVG_image_text, { remove_town: true });
	const map_options = CeL.parse_CSV(CeL.DOM.node_value('#map_options_panel'));

	SVG_map_functions.adapt_map_options(SVG_data, map_options);

	return SVG_data;
}

function main_process() {
	load_SVG_image();

	//console.log(SVG_data.toString());

	// ----------------------------------------------------

	CeL.new_node([{
		input: null,
		id: "preview_SVG_button",
		type: "button",
		value: "preview SVG",
		onclick: function () {
			text_to_img_element(get_adapted_SVG_data(), "preview_image");
		}
	}, {
		input: null,
		id: "download_SVG_button",
		type: "button",
		value: "download SVG",
		onclick: function () {
			downloadString(get_adapted_SVG_data(), 'Taiwan map generated.svg', 'image/svg+xml');
		}
	}], 'main_panel');

	CeL.toggle_display("loading_panel", false);

	CeL.toggle_display("main_panel", true);
}

function text_to_img_element(text, img_element = new Image) {
	if (typeof img_element === 'string')
		img_element = document.getElementById(img_element);
	// https://stackoverflow.com/questions/5433806/convert-embedded-svg-to-png-in-place
	img_element.src = "data:image/svg+xml," + encodeURIComponent(text);
	return img_element;
}

function text_to_a_element(text, fileName, fileType) {
	var blob = new Blob([String(text)], { type: fileType });

	var a_element = document.createElement('a');
	a_element.download = fileName;
	a_element.href = URL.createObjectURL(blob);
	a_element.dataset.downloadurl = [fileType, a_element.download, a_element.href].join(':');
	a_element.style.display = "none";
	return a_element;
}

// https://gist.github.com/danallison/3ec9d5314788b337b682
function downloadString(text, fileName, fileType) {
	var a_element = text_to_a_element(text, fileName, fileType);
	document.body.appendChild(a_element);
	a_element.click();
	document.body.removeChild(a_element);
	setTimeout(function () { URL.revokeObjectURL(a_element.href); }, 2000);
}
