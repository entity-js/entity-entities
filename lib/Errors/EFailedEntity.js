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
 * Provides the EFailedEntity error which is used when attempting to validate
 * an entity which doesnt match its options.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when validating an entity which fails the validation options.
 *
 * @class {EFailedEntity}
 * @extends {EError}
 * @param {String} option The name of the failing option.
 */
function EFailedEntity (option) {
  'use strict';

  EFailedEntity.super_.call(this);

  /**
   * The option causing the error.
   *
   * @type {String}
   */
  Object.defineProperty(this, 'option', {
    value: option
  });
}

util.inherits(EFailedEntity, EError);

/**
 * Exports the EFailedEntity class.
 */
module.exports = EFailedEntity;
