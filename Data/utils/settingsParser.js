/**
 * Created by jonathan on 2017-01-20.
 */
"use strict";
let date = require('./date');
let formatDate = date.formatDate;

function getValueFromPath (str, data) {
    let path = str.split(".");
    let value = data;
    for (let j = 0; j < path.length; j++) {
        try {
            value = value[path[j]];
        } catch (err) {
            value = undefined;
        }
        if (value == undefined) {
            value = "";
            break;
        }
    }
    return value;
}
function formatSettingsString (str, data) {
    let res_str = "";
    let tmp = str.split("{");
    for (let i = 0; i < tmp.length; i++) {
        if (tmp[i].indexOf('}') > -1) {
            let tmp_list = tmp[i].split("}");
            let func = function (str) {
                return str
            };
            if (tmp_list[0].indexOf('date>') > -1) {
                tmp_list[0] = tmp_list[0].split('date>')[1];
                func = function (str) {
                    return formatDate(str)
                };
            } else if (tmp_list[0].indexOf('listDict>') > -1) {
                tmp_list[0] = tmp_list[0].split('listDict>')[1];
                let temp = tmp_list[0].split('[');
                tmp_list[0] = temp[0];
                let key = temp[1].split(']')[0];
                func = function (obj) {
                    for (let k = 0; k < obj.length; k++) {
                        if (obj[k]["key"] == key) {
                            return obj[k]["value"]
                        }
                    }
                    return "";
                };
            }
            let value = getValueFromPath(tmp_list[0], data);
            res_str = res_str + func(value) + tmp_list[1];
        } else {
            res_str = res_str + tmp[i];
        }
    }
    return res_str;
}

function getDataValue (node, settings) {
    if (settings["events"][node.meta.type] != undefined) {
        if (settings["events"][node.meta.type]["value"] != undefined) {
            return formatSettingsString(settings["events"][node.meta.type]["value"], node)
        }
    }
    return undefined;
}

function getIdentifierValue(node, settings) {
    if (settings["events"][node.meta.type] != undefined) {
        if (settings["events"][node.meta.type]["identifier"] != undefined) {
            return formatSettingsString(settings["events"][node.meta.type]["identifier"], node)
        }
    }
    return undefined;
}

function decorateNode(data, settings) {
    let s = {};
    let id = data.meta.type;
    let key = id;
    if (settings["events"][id]==undefined){
        key = "default";
    }
    s['label'] = formatSettingsString(settings["events"][key]["text"], data);
    s['name'] = formatSettingsString(settings["events"][key]["name"], data);
    let color = settings["events"][key]["color"]["default"];
    if (settings["events"][key]["color"]["path"]!=undefined) {
        let value = formatSettingsString(settings["events"][key]["color"]["path"], data);
        if (settings["events"][key]["color"]["values"][value]!=undefined) {
            color = settings["events"][key]["color"]["values"][value];
        }
    }
    s['color'] = color;
    s['shape'] = settings["events"][key]["shape"]["shape"];
    s['shapeHeight'] = settings["events"][key]["shape"]['height'];
    s['shapeWidth'] = settings["events"][key]["shape"]['width'];

    return s;
}

module.exports = {
    formatSettingsString: formatSettingsString,
    getDataValue: getDataValue,
    getIdentifierValue: getIdentifierValue,
    decorateNode: decorateNode
};