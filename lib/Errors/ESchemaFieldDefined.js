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
 * Provides the ESchemaFieldDefined error which is used when attempting to add
 * a new field when it already exists.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when adding a new field when the name is already taken.
 *
 * @class {ESchemaFieldDefined}
 * @extends {EError}
 * @param {String} field The name of the field.
 */
function ESchemaFieldDefined (field) {
  'use strict';

  ESchemaFieldDefined.super_.call(this);

  /**
   * The schema field name.
   *
   * @type {String}
   */
  Object.defineProperty(this, 'field', {
    value: field
  });
}

util.inherits(ESchemaFieldDefined, EError);

/**
 * Exports the ESchemaFieldDefined class.
 */
module.exports = ESchemaFieldDefined;
