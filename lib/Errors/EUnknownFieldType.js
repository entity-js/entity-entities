/**
 *  ____            __        __
 * /\  _`\         /\ \__  __/\ \__
 * \ \ \L\_\    ___\ \ ,_\/\_\ \ ,_\  __  __
 *  \ \  _\L  /' _ `\ \ \/\/\ \ \ \/ /\ \/\ \
 *   \ \ \L\ \/\ \/\ \ \ \_\ \ \ \ \_\ \ \_\ \
 *    \ \____/\ \_\ \_\ \__\\ \_\ \__\\/`____ \
 *     \/___/  \/_/\/_/\/__/ \/_/\/__/ `/___/> \
 *                                        /\___/
 *                                        \/__/
 *
 * Entity Core
 */

/**
 * Provides the EUnknownFieldType error which is used when attempting to add a
 * field with an unknown field type.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when adding a new field with an unknown field type.
 *
 * @class {EUnknownFieldType}
 * @extends {EError}
 * @param {String} field The name of the field.
 * @param {String} fieldType The field type.
 */
function EUnknownFieldType (field, fieldType) {
  'use strict';

  EUnknownFieldType.super_.call(this);

  /**
   * The schema field name.
   *
   * @type {String}
   */
  Object.defineProperty(this, 'field', {
    value: field
  });

  /**
   * The field type.
   *
   * @type {String}
   */
  Object.defineProperty(this, 'fieldType', {
    value: fieldType
  });
}

util.inherits(EUnknownFieldType, EError);

/**
 * Exports the EUnknownFieldType class.
 */
module.exports = EUnknownFieldType;
