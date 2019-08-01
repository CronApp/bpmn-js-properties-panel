'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
  cmdHelper = require('../../../../helper/CmdHelper'),
  $ = require("jquery");
var DELEGATE_TYPES = [
  'class',
  'expression',
  'delegateExpression'
];

var PROPERTIES = {
  class: 'camunda:class',
  expression: 'camunda:expression',
  delegateExpression: 'camunda:delegateExpression'
};

function isDelegate(type) {
  return DELEGATE_TYPES.indexOf(type) !== -1;
}

function getAttribute(type) {
  return PROPERTIES[type];
}

function getDelegationLabel(type) {
  switch(type) {
    case 'class':
      return 'Java Class';
    case 'expression':
      return 'Expression';
    case 'delegateExpression':
      return 'Delegate Expression';
    default:
      return '';
  }
}


module.exports = function(element, bpmnFactory, options) {

  var getImplementationType = options.getImplementationType,
    getBusinessObject = options.getBusinessObject,
    hideDelegateSelect = options.hideDelegateSelect;

  var delegateEntrySelect = entryFactory.selectBox({
    id: 'delegateSelect',
    label: 'Value',
    selectOptions: function(element, node) {
      var blocklyCalls = [];
      var blocklyList;

      $.ajax({
        url: "https://e4a0d5b6-ee87-43af-8938-6cecc58ef904.mock.pstmn.io/blockly",
        method: "GET",
        async: false,
        success: function(data) {
          blocklyList = JSON.parse(data);
        }
      })

      blocklyList.forEach(function(blockly) {
        var blocklyValue = blockly.value,
          blocklyName = blockly.name,
          methods = blockly.methods;
        methods.forEach(function(method) {
          var methodName = method.name,
            methodValue = method.value,
            paramNum = method.parameters.length;

          var paramString = '';

          for(var i = 0; i < paramNum; i++) {
            paramString += "," + "param" + i;
          }

          var call = '${blockly.call(\'' + blocklyValue + ',' + methodValue + (paramString ? paramString : "") + '\')}';
          blocklyCalls.push({name: blocklyValue + ' -> ' + methodName, value: call, parameterNum: paramNum});
        })
      })
      return blocklyCalls;
    },
    setControlValue: true,
    modelProperty: 'delegate',
    emptyParameter: false,

    get: function(element, node) {
      var bo = getBusinessObject(element);
      var type = getImplementationType(element);
      var attr = getAttribute(type);
      var label = getDelegationLabel(type);
      return {
        delegate: bo.get(attr),
        delegationLabel: label
      };
    },

    set: function(element, values, node) {
      var bo = getBusinessObject(element);
      var type = getImplementationType(element);
      var attr = getAttribute(type);
      var prop = {};
      prop[attr] = values.delegate || '';
      return cmdHelper.updateBusinessObject(element, bo, prop);
    },

    validate: function(element, values, node) {
      return isDelegate(getImplementationType(element)) && !values.delegate ? {delegate: 'Must provide a value'} : {};
    },

    disabled: function(element, node) {
      if(typeof hideDelegateSelect === 'function') {
        return hideDelegateSelect.apply(delegateEntrySelect, arguments);
      }
    }
  });

  return [delegateEntrySelect];
};
