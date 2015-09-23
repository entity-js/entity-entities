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
 * Provides the Schema class.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    async = require('async'),
    loader = require('nsloader'),
    sortBy = loader('Entity/Utils/SortBy'),
    BaseEntity = loader('Entity/Entities/BaseEntity'),
    EUnknownFieldType = loader(
      'Entity/Entities/Errors/EUnknownFieldType'
    ),
    ESchemaFieldDefined = loader(
      'Entity/Entities/Errors/ESchemaFieldDefined'
    ),
    EUnknownSchemaField = loader(
      'Entity/Entities/Errors/EUnknownSchemaField'
    ),
    EUnknownValidator = loader(
      'Entity/Validators/Errors/EUnknownValidator'
    ),
    EUnknownSanitizer = loader(
      'Entity/Sanitizers/Errors/EUnknownSanitizer'
    );

/**
 * The entity schema class.
 *
 * @class {Schema}
 * @extends {BaseEntity}
 * @param {Entities} manager The entity manager.
 */
function Schema (manager) {
  'use strict';

  Schema.super_.call(this, manager);

  var title = '',
      description = '',
      fields = {};

  var me = this;

  Object.defineProperties(this, {
    /**
     * The owning manager.
     *
     * @var {Entities} manager
     * @memberof Schema
     * @readonly
     * @instance
     */
    manager: {
      value: manager
    },
    /**
     * Get the entity collection.
     *
     * @var {MongoDB#Collection} entityCollection
     * @memberof Schema
     * @readonly
     * @instance
     */
    entityCollection: {
      get: function () {
        var collectionName = me.entityCollectionName();
        return manager.core.database.collection(collectionName);
      }
    },
    /**
     * Get the schemas title.
     *
     * @var {String} title
     * @memberof Schema
     * @instance
     */
    title: {
      get: function () {
        return title;
      },
      set: function (value) {
        me._isUpdated = true;
        title = value;
      }
    },
    /**
     * Get the schemas description.
     *
     * @var {String} description
     * @memberof Schema
     * @instance
     */
    description: {
      get: function () {
        return description;
      },
      set: function (value) {
        me._isUpdated = true;
        description = value;
      }
    },
    /**
     * The defined fields.
     *
     * @var {Object} _fields
     * @memberof Schema
     * @private
     * @instance
     */
    _fields: {
      get: function () {
        return fields;
      },
      set: function (value) {
        me._isUpdated = true;
        fields = value;
      }
    },
    /**
     * Get an array of defined field names.
     *
     * @var {Array} fields
     * @memberof Schema
     * @readonly
     * @instance
     */
    fields: {
      get: function () {
        return Object.keys(fields);
      }
    }
  });
}

util.inherits(Schema, BaseEntity);

/**
 * Get the database collection name.
 *
 * @return {String} The collection name.
 */
Schema.prototype.collectionName = function () {
  'use strict';

  return 'schemas';
};

/**
 * Get the database collection name for the entity.
 *
 * @return {String} The entity collection name.
 */
Schema.prototype.entityCollectionName = function () {
  'use strict';

  return 'entity-' + this.machineName;
};

/**
 * @override
 */
Schema.prototype._docToEntity = function (doc, done) {
  'use strict';

  var me = this;
  Schema.super_.prototype._docToEntity.call(this, doc, function (err) {
    if (err) {
      return done(err);
    }

    me.title = doc.title;
    me.description = doc.description;
    me._fields = doc.fields;
    done();
  });
};

/**
 * @override
 */
Schema.prototype._entityToDoc = function (by, done) {
  'use strict';

  var me = this;
  Schema.super_.prototype._entityToDoc.call(this, by, function (err, doc) {
    if (err) {
      return done(err);
    }

    doc.title = me.title;
    doc.description = me.description;
    doc.fields = me._fields;
    done(null, doc);
  });
};

/**
 * Determines if the field has been defined.
 *
 * @param {String} name The name of the field.
 * @return {Boolean} Returns true if the field has been defined.
 */
Schema.prototype.hasField = function (name) {
  'use strict';

  return this._fields[name] !== undefined;
};

/**
 * Add a new field config.
 *
 * @param {String} name The name of the field.
 * @param {String} title The admin title of the field.
 * @param {String} description The admin description of the field.
 * @param {String} type The field type, see {Entities.fieldTypes}.
 * @param {Object} [options={}] A set of options to pass to the field.
 * @param {String} [options.title] The UI title of the field.
 * @param {String} [options.description] The UI description of the field.
 * @param {Boolean} [options.required] Set to true if this is a required
 *   field.
 * @return {Schema} Returns self.
 * @throws {ESchemaFieldDefined} Thrown if the field has already been defined.
 * @throws {EUnknownFieldType} Thrown if the field type is unknown.
 */
Schema.prototype.addField = function (name, title, description, type, options) {
  'use strict';

  if (this.hasField(name)) {
    throw new ESchemaFieldDefined(name);
  }

  if (loader('Entity/Entities').fieldTypes[type] === undefined) {
    throw new EUnknownFieldType(name, type);
  }

  this._isUpdated = true;
  this._fields[name] = {
    type: type,
    title: title,
    description: description,
    options: options || {},
    validators: [],
    sanitizers: []
  };

  return this;
};

/**
 * Get the defined field.
 *
 * @param {String} name The name of the field.
 * @return {Object} The field config.
 * @throws {EUnknownSchemaField} If the field is unknown.
 */
Schema.prototype.getField = function (name) {
  'use strict';

  if (this._fields[name] === undefined) {
    throw new EUnknownSchemaField(name);
  }

  return this._fields[name];
};

/**
 * Delete the specified field config.
 *
 * @param {String} name The name of the field.
 * @return {Schema} Returns self.
 * @throws {EUnknownSchemaField} If the field is unknown.
 */
Schema.prototype.delField = function (name) {
  'use strict';

  if (this._fields[name] === undefined) {
    throw new EUnknownSchemaField(name);
  }

  this._isUpdated = true;
  delete this._fields[name];

  return this;
};

/**
 * Add a validation rule to the given field.
 *
 * @param {String} name The field name to add this rule to.
 * @param {String} rule The validation rule.
 * @param {Object} [options={}] Any options to apply to the rule.
 * @param {Integer} [weight=0] The weight to apply to the rule.
 * @return {Schema} Returns self.
 */
Schema.prototype.addFieldValidation = function (name, rule, options, weight) {
  'use strict';

  if (this._fields[name] === undefined) {
    throw new EUnknownSchemaField(name);
  }

  if (this.manager.core.validators.registered(rule) === false) {
    throw new EUnknownValidator(rule);
  }

  this._fields[name].validators.push({
    rule: rule,
    options: options || {},
    weight: weight || 0
  });

  sortBy(this._fields[name].validators, 'weight');
  this._isUpdated = true;
  return this;
};

/**
 * Add a sanitization rule to the given field.
 *
 * @param {String} name The field name to add this rule to.
 * @param {String} rule The sanitization rule.
 * @param {Object} [options={}] Any options to apply to the rule.
 * @param {Integer} [weight=0] The weight to apply to the rule.
 * @return {Schema} Returns self.
 */
Schema.prototype.addFieldSanitization = function (name, rule, options, weight) {
  'use strict';

  if (this._fields[name] === undefined) {
    throw new EUnknownSchemaField(name);
  }

  if (this.manager.core.sanitizers.registered(rule) === false) {
    throw new EUnknownSanitizer(rule);
  }

  this._fields[name].sanitizers.push({
    rule: rule,
    options: options || {},
    weight: weight || 0
  });

  sortBy(this._fields[name].sanitizers, 'weight');
  this._isUpdated = true;
  return this;
};

/**
 * Sanitizes the given field and value.
 *
 * @param {String} name The name of the field.
 * @param {Mixed} value The value to sanitize.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Mixed} done.value The sanitized value.
 */
Schema.prototype.sanitizeField = function (name, value, done) {
  'use strict';

  if (this._fields[name] === undefined) {
    return done(new EUnknownSchemaField(name));
  }

  var orig = value,
      me = this,
      queue = [];

  function san(rule, options) {
    return function (next) {
      me.manager.core.sanitizers.sanitize(function (err, o, val) {
        if (err) {
          return next(err);
        }

        value = val;
        next();
      }, rule, value, options);
    };
  }

  this._fields[name].sanitizers.forEach(function (item) {
    queue.push(san(item.rule, item.options));
  });

  async.series(queue, function (err) {
    done(err ? err : null, orig, value);
  });
};

/**
 * Validates the given field and value.
 *
 * @param {String} name The name of the field.
 * @param {Mixed} value The value to validate.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Mixed} done.value The validated value.
 */
Schema.prototype.validateField = function (name, value, done) {
  'use strict';

  if (this._fields[name] === undefined) {
    return done(new EUnknownSchemaField(name));
  }

  var me = this,
      queue = [];

  function val(rule, options) {
    return function (next) {
      me.manager.core.validators.validate(function (err, o, val) {
        if (err) {
          return next(err);
        }

        value = val;
        next();
      }, rule, value, options);
    };
  }

  this._fields[name].validators.forEach(function (item) {
    queue.push(val(item.rule, item.options));
  });

  async.series(queue, function (err) {
    done(err ? err : null, value);
  });
};

/**
 * Exports the Schema class.
 */
module.exports = Schema;
