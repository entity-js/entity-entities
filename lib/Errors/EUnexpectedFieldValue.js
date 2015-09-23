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
 * Provides the EUnexpectedFieldValue error which is used when attempting to
 * sanitize an unexpected field data type.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when sanitizing a value of an unexpected data type.
 *
 * @class {EUnexpectedFieldValue}
 * @extends {EError}
 */
function EUnexpectedFieldValue () {
  'use strict';

  EUnexpectedFieldValue.super_.call(this);
}

util.inherits(EUnexpectedFieldValue, EError);

/**
 * Exports the EUnexpectedFieldValue class.
 */
module.exports = EUnexpectedFieldValue;
