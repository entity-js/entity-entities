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
 * The entity sanitizer rule.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var loader = require('nsloader'),
    Entity = loader('Entity/Entities/Entity'),
    EUnexpectedFieldValue = loader(
      'Entity/Entities/Errors/EUnexpectedFieldValue'
    );

/**
 * Entity sanitizer.
 *
 * @param {Mixed} orig The original value.
 * @param {Mixed} value The value to santiize.
 * @param {Object} options The options passed to the sanitizer.
 * @param {Function} next The next callback.
 * @param {Error} next.err Any raised errors.
 * @throws {EInvalidValue} Thrown if the value is not a string.
 */
module.exports = function sanitizeEntity (orig, value, options, next) {
  'use strict';

  if (
    value instanceof Entity === false && (
      typeof value !== 'object' || (
        value.type === undefined ||
        value.machineName === undefined
      )
    )
  ) {
    return next(new EUnexpectedFieldValue());
  }

  this.core.entities.load(
    value.type,
    value.machineName,
    function (err, entity) {
      if (err) {
        return next(err);
      }

      next(null, entity);
    }
  );
};
