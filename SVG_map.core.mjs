/*

2021/5/18 14:48:50

@see
Pixel Map Generator | amCharts
https://pixelmap.amcharts.com/

 */

function SVG_data_toString() {
    return JSON.to_XML(this.SVG_JSON);
}

export function convert_to_SVG_data(SVG_content, options) {
    const SVG_JSON = JSON.from_XML(SVG_content.trim());
    // groups[id] = [ nodes ]
    const groups = Object.create(null);
    const index_of_group = Object.create(null);

    SVG_JSON.svg.forEach((node, index) => {
        if (!node.id || Object.keys(node)[0] !== 'g')
            return;
        groups[node.id] = node.g;
        index_of_group[node.id] = index;
    });

    if (options?.remove_town && index_of_group.town >= 0) {
        // Remove town data
        SVG_JSON.svg[index_of_group.town] = '';
    }

    //console.log(Object.keys(groups));

    key_groups.forEach(id => {
        const group = groups[id];
        // assert: Array.isArray(group);
        const index_of = group.index_of = Object.create(null);
        function set_index_of(value, index) {
            if (value) {
                index_of[value.toString().trim().replace(/\s[\s\S]+/, '')] = index;
                return true;
            }
        }
        group.forEach((node, index) => {
            set_index_of(node.title, index);
            if (node.text) {
                set_index_of(node.text.tspan, index);
                set_index_of(node.text.title, index);
            } else if (node.path) {
                node.path.forEach(n => {
                    set_index_of(n.title, index);
                });
            }
        });
    });
    //console.log(groups.county);

    return { SVG_JSON, groups, index_of_group, toString: SVG_data_toString };
}

// ----------------------------------------------------------------------------

// @see [[臺灣行政區劃]], original from [[File:Blank Taiwan map.svg]]
export const default_SVG_file_name = 'Taiwan map labeled - no town.svg';
// default value
export const KEY_default = '*';
const key_groups = ['county', 'county_label', 'information_label'];
const node_properties = ['fill', 'stroke', 'stroke-width'];

function normalize_sub_map_options(sub_map_options, default_options) {
    if (!sub_map_options)
        return;

    sub_map_options = Object.clone(sub_map_options);
    key_groups.forEach(id => sub_map_options[id] = { ...sub_map_options[id] });

    if (sub_map_options.fill && !sub_map_options.county.fill) {
        sub_map_options.county.fill = sub_map_options.fill;
    }

    if (sub_map_options.color && !sub_map_options.information_label.fill) {
        sub_map_options.information_label.fill = sub_map_options.color;
    }

    if (sub_map_options.label && !sub_map_options.information_label.text) {
        sub_map_options.information_label.text = sub_map_options.label;
    }

    if (default_options) {
        sub_map_options = { ...default_options, ...sub_map_options };
        key_groups.forEach(id => sub_map_options[id] = { ...default_options[id], ...sub_map_options[id] });
    }
    return sub_map_options;
}

function convert_map_options(array_map_options) {
    const map_options = Object.create(null);
    const header = ['county', 'label', 'fill', 'color'];
    array_map_options.forEach(line => {
        const county = line[0];
        if (!county) {
            return;
        }
        if (!map_options[county])
            map_options[county] = Object.create(null);
        line.forEach((item, index) => {
            if (header[index] !== 'county' && line[index])
                map_options[county][header[index]] = line[index];
        });
    });
    return map_options;
}


export function adapt_map_options(SVG_data, map_options) {
    if (Array.isArray(map_options)) {
        map_options = convert_map_options(map_options);
    }
    map_options = map_options || Object.create(null);

    const { SVG_JSON, groups, index_of_group } = SVG_data;
    const default_options = normalize_sub_map_options(map_options[KEY_default]);
    if (default_options) {
        key_groups.forEach(id => {
            node_properties.forEach(key => {
                if (default_options[id][key])
                    groups[id][key] = default_options[id][key];
            });
        });
    }

    for (let county in map_options) {
        if (county === KEY_default) continue;
        const sub_map_options = normalize_sub_map_options(map_options[county], default_options);
        //console.log([county, sub_map_options]);

        if (!(county in groups.county_label.index_of)
            && !Object.keys(groups.county_label.index_of).some(_county => {
                if (_county.includes(county)) {
                    county = _county;
                    return true;
                }
            })) {
            CeL.error(`Cannot find county: ${county}!`);
            continue;
        }

        key_groups.forEach(id => {
            const group_index = groups[id].index_of[county];
            if (!(group_index >= 0)) {
                if (id !== 'county')
                    CeL.error(`Cannot find county: ${id}.${county}!`);
                return;
            }
            const _sub_map_options = sub_map_options[id];
            if (!_sub_map_options)
                return;
            const node = groups[id][group_index];
            if (_sub_map_options.text) {
                if (node.text) {
                    node.text.tspan = _sub_map_options.text;
                } else if (node.path) {
                    node.path.forEach(n => {
                        if (n.title)
                            n.title = _sub_map_options.text;
                    });
                }
            }
            node_properties.forEach(key => {
                if (_sub_map_options[key])
                    node[key] = _sub_map_options[key];
            });
        });
    }
}
