'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');
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
  switch (type) {
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

      window.blocklyList.forEach(function(blockly) {
        var args = [];
        var blocklyValue = blockly.value,
            methods = blockly.methods;
        args.push('blockly.' + blocklyValue);
        methods.forEach(function(method) {
          var methodName = method.name,
              methodValue = method.value,
              paramNum = method.parameters.length;

          args.push(methodValue);

          for (var i = 0; i < paramNum; i++) {
            args.push('param' + i);
          }

          var call = '${blockly.call(' + args +')}';
          blocklyCalls.push({ name: blocklyValue + ' -> ' + methodName, value: call });
        });
      });
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
      return isDelegate(getImplementationType(element)) && !values.delegate ? { delegate: 'Must provide a value' } : {};
    },

    disabled: function(element, node) {
      if (typeof hideDelegateSelect === 'function') {
        return hideDelegateSelect.apply(delegateEntrySelect, arguments);
      }
    }
  });

  return [delegateEntrySelect];
};
