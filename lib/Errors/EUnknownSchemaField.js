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
 * Provides the EUnknownSchemaField error which is used when attempting to do
 * something with an unknown schema field.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when do something with an unknown field.
 *
 * @class {EUnknownSchemaField}
 * @extends {EError}
 * @param {String} field The name of the field.
 */
function EUnknownSchemaField (field) {
  'use strict';

  EUnknownSchemaField.super_.call(this);

  /**
   * The schema field name.
   *
   * @type {String}
   */
  Object.defineProperty(this, 'field', {
    value: field
  });
}

util.inherits(EUnknownSchemaField, EError);

/**
 * Exports the EUnknownSchemaField class.
 */
module.exports = EUnknownSchemaField;
