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
 * Provides the EMissingTypeConfig error which is used when attempting to
 * sanitize without the type option.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when sanitizing a value without the type option.
 *
 * @class {EMissingTypeConfig}
 * @extends {EError}
 */
function EMissingTypeConfig () {
  'use strict';

  EMissingTypeConfig.super_.call(this);
}

util.inherits(EMissingTypeConfig, EError);

/**
 * Exports the EMissingTypeConfig class.
 */
module.exports = EMissingTypeConfig;
