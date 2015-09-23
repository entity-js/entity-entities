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
 * Provides the EMachineNameExists error which is used when saving an entity
 * with a machine name that is already being used.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when saving an entity with a taken machine name.
 *
 * @class {EMachineNameExists}
 * @extends {EError}
 * @param {String} machineName The machine name causing the error.
 */
function EMachineNameExists (machineName) {
  'use strict';

  EMachineNameExists.super_.call(this);

  /**
   * The machine name that is causing this error.
   *
   * @type {String}
   */
  Object.defineProperty(this, 'machineName', {
    value: machineName
  });
}

util.inherits(EMachineNameExists, EError);

/**
 * Exports the EMachineNameExists class.
 */
module.exports = EMachineNameExists;
