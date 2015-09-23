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
 * Provides the Entities validator rule.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var loader = require('nsloader'),
    Entity = loader('Entity/Entities/Entity'),
    EInvalidEntity = loader('Entity/Entities/Errors/EInvalidEntity'),
    EFailedEntity = loader('Entity/Entities/Errors/EFailedEntity');

/**
 * Validate an Entities.
 *
 * @param {Mixed} value The value to validate.
 * @param {Object} options The options passed to the validator.
 * @param {Function} next The next callback.
 * @param {Error} next.err Any raised errors.
 * @throws {EInvalidUrl} Thrown if the value is an invalid url address.
 */
module.exports = function validateEntities (value, options, next) {
  'use strict';

  if (value === undefined || value === null) {
    return next();
  }

  for (var idx in value) {
    if (value[idx] instanceof Entity === false) {
      return next(new EInvalidEntity());
    }

    if (options) {
      for (var key in options) {
        var v = typeof value[idx][key] === 'function' ?
          value[idx][key]() :
          value[key];

        if (v !== options[key]) {
          return next(new EFailedEntity(key));
        }
      }
    }
  }

  next();
};
