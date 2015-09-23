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
 * Provides the EInvalidEntityType error which is used when attempting to
 * sanitize a field with an invalid entity type.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when sanitizing with an invalid entity type.
 *
 * @class {EInvalidEntityType}
 * @extends {EError}
 */
function EInvalidEntityType (expected, got) {
  'use strict';

  EInvalidEntityType.super_.call(this);

  Object.defineProperties(this, {
    expected: {
      value: expected
    },
    got: {
      value: got
    }
  });
}

util.inherits(EInvalidEntityType, EError);

/**
 * Exports the EInvalidEntityType class.
 */
module.exports = EInvalidEntityType;
