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
 * Provides the EMissingMachineName error which is used when validating an
 * entity with a missing machine name.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when validating an entity which is missing a machine name.
 *
 * @class {EMissingMachineName}
 * @extends {EError}
 */
function EMissingMachineName () {
  'use strict';

  EMissingMachineName.super_.call(this);
}

util.inherits(EMissingMachineName, EError);

/**
 * Exports the EMissingMachineName class.
 */
module.exports = EMissingMachineName;
