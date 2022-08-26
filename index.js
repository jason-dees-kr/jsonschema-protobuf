var protobuf = require('protocol-buffers-schema')
var mappings = {
  'array': 'repeated',
  'object': 'message',
  'integer': 'int32',
  'number': 'int32',
  'string': 'string',
  'boolean': 'bool'
}

module.exports = function (schema, name) {
  if (typeof schema === 'string') schema = JSON.parse(schema)
  var result = {
    syntax: 2,
    package: null,
    enums: [],
    messages: []
  }

  if (schema.type === 'object') {
    result.messages.push(Message(schema, name))
  }
  return protobuf.stringify(result)
}

function Message (schema, name) {
  var message = {
    name: name ?? schema.name,
    enums: [],
    messages: [],
    fields: []
  }

  var tag = 1
  for (var key in schema.properties) {
    var field = schema.properties[key]
    if (field.type === 'object') {
      field.name = key
      message.messages.push(Message(field))
    } else {
      if (field.enum !== undefined){
        console.log("enum", field);
        message.enums.push(Enum(key, field.enum));
      }
      if(field.const !== undefined) {
        console.log("const", field);
      }
      field.name = key
      message.fields.push(Field(field, tag))
      tag += 1
    }
  }

  for (var i in schema.required) {
    var required = schema.required[i]
    for (var i in message.fields) {
      var field = message.fields[i]
      if (required === field.name) field.required = true
    }
  }

  return message
}

function Enum(name, options) {
  var optionsObj = {};
  for( var i = 0; i < options.length;  i++) {
    optionsObj[options[i].replace(/ /g, "")] = i;
  }
  return {
    name: name.toLocaleUpperCase(),
    values: optionsObj
  }
}

function Field (field, tag) {
  var type = mappings[field.type] || field.type
  var repeated = false

  if (field.type === 'array') {
    repeated = true
    type = field.items.type
  }
  var constant = undefined
  if(field.const !== undefined) {
    var val = field.const;
    if(field.type == "string") {
      val = '"'+val+'"';
    }
    constant = {
      default: val
    };
  }
  if(field.enum !== undefined){
    type = field.name.toLocaleUpperCase();
  }

  return {
    name: field.name,
    type: type,
    tag: tag,
    repeated: repeated,
    options: constant
  }
}
