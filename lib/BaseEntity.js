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
 * Provides the BaseEntity class.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var async = require('async'),
    loader = require('nsloader'),
    EMissingMachineName = loader(
      'Entity/Entities/Errors/EMissingMachineName'
    ),
    EMachineNameExists = loader(
      'Entity/Entities/Errors/EMachineNameExists'
    ),
    ECantFindEntity = loader(
      'Entity/Entities/Errors/ECantFindEntity'
    );

/**
 * The base entity class.
 *
 * @class {BaseEntity}
 * @param {Entities} manager The entity manager.
 */
function BaseEntity (manager) {
  'use strict';

  var id = null,
      isNew = true,
      isUpdated = false,
      isTrashed = false,
      isRenaming = false,
      machineName = null,
      on = Date.now(),
      createdOn = on,
      createdBy = null,
      updatedOn = on,
      updatedBy = null;

  Object.defineProperties(this, {
    /**
     * Get the entity manager.
     *
     * @type {Entities}
     */
    manager: {
      value: manager
    },
    /**
     * Get the database collection.
     *
     * @type {MongoDB#Collection}
     */
    collection: {
      get: function () {
        var collectionName = this.collectionName();
        return manager.core.database.collection(collectionName);
      }
    },
    /**
     * Get the MongoDB document ID.
     *
     * @type {String}
     */
    id: {
      get: function () {
        return id;
      }
    },
    /**
     * Get the MongoDB document ID.
     *
     * @type {String}
     * @private
     */
    _id: {
      get: function () {
        return id;
      },
      set: function (value) {
        id = value;
      }
    },
    /**
     * Determine if this is new.
     *
     * @type {Boolean}
     * @private
     */
    _isNew: {
      get: function () {
        return isNew;
      },
      set: function (value) {
        isNew = value === true;
      }
    },
    /**
     * Determine if this is new.
     *
     * @type {Boolean}
     */
    isNew: {
      get: function () {
        return isNew;
      }
    },
    /**
     * Determine if this has been updated but not yet saved.
     *
     * @type {Boolean}
     * @private
     */
    _isUpdated: {
      get: function () {
        return isUpdated;
      },
      set: function (value) {
        isUpdated = value === true;
      }
    },
    /**
     * Determine if this has been updated but not yet saved.
     *
     * @type {Boolean}
     */
    isUpdated: {
      get: function () {
        return isUpdated;
      }
    },
    /**
     * Determine if this has been trashed (ie. in the trash can).
     *
     * @type {Boolean}
     * @private
     */
    _isTrashed: {
      get: function () {
        return isTrashed;
      },
      set: function (value) {
        isTrashed = value === true;
      }
    },
    /**
     * Determine if this has been trashed (ie. in the trash can).
     *
     * @type {Boolean}
     */
    isTrashed: {
      get: function () {
        return isTrashed;
      }
    },
    /**
     * Determine if this will be renamed upon saving.
     *
     * @type {Boolean}
     * @private
     */
    _isRenaming: {
      get: function () {
        return isRenaming;
      },
      set: function (value) {
        isRenaming = value === true;
      }
    },
    /**
     * Get the machine name.
     *
     * @type {String}
     */
    machineName: {
      get: function () {
        return machineName;
      },
      set: function (value) {
        if (machineName !== value) {
          isUpdated = true;
          machineName = value;
        }
      }
    },
    /**
     * The created details of the entity.
     *
     * @type {Object}
     * @private
     */
    _created: {
      get: function () {
        return {
          on: createdOn,
          by: createdBy
        };
      },
      set: function (value) {
        createdOn = value.on;
        createdBy = value.by;
      }
    },
    /**
     * When this was created.
     *
     * @type {Date}
     */
    createdOn: {
      get: function () {
        return createdOn;
      }
    },
    /**
     * Who created this.
     *
     * @type {String}
     */
    createdBy: {
      get: function () {
        return createdBy;
      }
    },
    /**
     * The updated details of the entity.
     *
     * @type {Object}
     * @private
     */
    _updated: {
      get: function () {
        return {
          on: updatedOn,
          by: updatedBy
        };
      },
      set: function (value) {
        updatedOn = value.on;
        updatedBy = value.by;
      }
    },
    /**
     * When this was updated.
     *
     * @type {Date}
     */
    updatedOn: {
      get: function () {
        return updatedOn;
      }
    },
    /**
     * Who updated this.
     *
     * @type {String}
     */
    updatedBy: {
      get: function () {
        return updatedBy;
      }
    }
  });
}

/**
 * Get the database collection name.
 *
 * @return {String} The collection name.
 */
BaseEntity.prototype.collectionName = function () {
  'use strict';

  throw new Error(); // @todo
};

/**
 * Set the base entity values from a loaded doc object.
 *
 * @param {Object} doc The MongoDB document.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @private
 */
BaseEntity.prototype._docToEntity = function (doc, done) {
  'use strict';

  this._id = doc._id;
  this.machineName = doc.machineName;
  this._created = {
    on: doc.createdOn,
    by: doc.createdBy
  };

  this._updated = {
    on: doc.updatedOn,
    by: doc.updatedBy
  };

  done();
};

/**
 * Create a MongoDB document from this base entity.
 *
 * @param {String} [by='system'] Who/What is performing this action.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Object} done.doc A generated MongoDB document.
 * @private
 */
BaseEntity.prototype._entityToDoc = function (by, done) {
  'use strict';

  var doc = {},
      on = Date.now();

  by = by || 'system';

  if (this.id) {
    doc._id = this.id;
  }

  doc.machineName = this.machineName;
  doc.created = {
    on: this.createdOn || on,
    by: this.createdBy || by
  };

  doc.updated = {
    on: on,
    by: by
  };

  done(null, doc);
};

/**
 * Private helper to set the entity from a doc and set other properties.
 *
 * @param {Object} doc The MongoDB document.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @private
 */
BaseEntity.prototype._setDoc = function (doc, done) {
  'use strict';

  this._isNew = false;
  this._isUpdated = false;
  this._docToEntity(doc, done);
};

/**
 * Sanitizes the values prior to saving.
 *
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @private
 */
BaseEntity.prototype._sanitize = function (done) {
  'use strict';

  var me = this;
  this.manager.core.sanitizers.sanitize(function (err, orig, value) {
    if (err) {
      return done(err);
    }

    me.machineName = value;
    done();
  }, 'trim', this.machineName);
};

/**
 * Validates the properties of this base entity before saving.
 *
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 */
BaseEntity.prototype.validate = function (done) {
  'use strict';

  if (!this.machineName || this.machineName === '') {
    return done(new EMissingMachineName());
  }

  this.manager.core.validators.validate(function (err) {
    done(err);
  }, 'machine-name', this.machineName);
};

/**
 * Save the entity to the database.
 *
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {String} [by='system'] Who is saving the entity.
 */
BaseEntity.prototype.save = function (done, by) {
  'use strict';

  var me = this,
      doc,
      queue = [];

  queue.push(function (next) {
    me._sanitize(next);
  });

  queue.push(function (next) {
    me.validate(next);
  });

  queue.push(function (next) {
    me._entityToDoc(by, function (err, d) {
      if (err) {
        return next(err);
      }

      doc = d;
      next();
    });
  });

  queue.push(function (next) {
    me.collection.count({
      machineName: me.machineName
    }, function (err, count) {
      if (err) {
        return next(err);
      }

      next(count > 0 ? new EMachineNameExists(me.machineName) : null);
    });
  });

  queue.push(function (next) {
    me.collection.save(doc, function (err, d) {
      if (err) {
        return next(err);
      }

      doc = d;
      next();
    });
  });

  if (this.isTrashed) {
    queue.push(function (next) {
      me.manager.trashCollection.remove({
        machineName: me.machineName
      }, function (err) {
        if (err) {
          return next(err);
        }

        me._isTrashed = false;
        next();
      });
    });
  }

  async.series(queue, function (err) {
    if (err) {
      return done(err);
    }

    me._isRenaming = false;
    me._isNew = false;
    me._isUpdated = false;
    me._id = doc._id;

    done(null);
  });
};

/**
 * Load the base entity from the database.
 *
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Object} [conditions] Any conditions for loading, if not provided
 *   then the machine name is used (if available).
 * @throws {Error} Thrown if the conditions is empty and a machine name is not
 *   available.
 */
BaseEntity.prototype.load = function (done, machineName) {
  'use strict';

  machineName = machineName || this.machineName;
  if (!machineName) {
    return done(new EMissingMachineName());
  }

  var me = this,
      doc = null,
      queue = [];

  queue.push(function (next) {
    me.collection.findOne({
      machineName: machineName
    }, function (err, d) {
      if (err) {
        return next(err);
      }

      doc = d || null;
      next();
    });
  });

  queue.push(function (next) {
    if (doc) {
      return next();
    }

    me.manager.trashCollection.findOne({
      collection: me.collectionName(),
      machineName: machineName
    }, function (err, d) {
      if (err) {
        return next(err);
      }

      doc = d || null;
      me._isTrashed = doc !== null;

      next();
    });
  });

  queue.push(function (next) {
    if (!doc) {
      return next(new ECantFindEntity(me.collectionName(), machineName));
    }

    me._setDoc(doc, next);
  });

  async.series(queue, function (err) {
    done(err ? err : null);
  });
};

/**
 * Trash or delete the entity.
 *
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @parma {String] [by='system'] Who is deleting the entity.
 * @param {Boolean} [permanently=false] Set to true to not trash but to
 *   permanently delete the entity.
 */
BaseEntity.prototype.delete = function (done, by, permanently) {
  'use strict';

  if (!this.machineName) {
    return done(new EMissingMachineName());
  }

  var me = this,
      trashed = this.isTrashed === true,
      queue = [];

  permanently = trashed ? true : permanently || false;
  if (permanently !== true) {
    var doc = null;

    if (this.isNew || this.isUpdated) {
      queue.push(function (next) {
        me.load(next);
      });
    }

    queue.push(function (next) {
      me._entityToDoc(by, function (err, d) {
        if (err) {
          return next(err);
        }

        delete d._id;
        delete d.machineName;

        doc = {
          collection: me.collectionName(),
          machineName: me.machineName,
          doc: d
        };

        next();
      });
    });

    queue.push(function (next) {
      me.manager.trashCollection.save(doc, function (err, d) {
        if (err) {
          return next(err);
        }

        me._isTrashed = true;
        me._id = d._id;

        next(null);
      });
    });
  }

  if (trashed === true) {
    queue.push(function (next) {
      me.manager.trashCollection.remove({
        collection: me.collectionName(),
        machineName: me.machineName
      }, next);
    });
  } else {
    queue.push(function (next) {
      me.collection.remove({
        machineName: me.machineName
      }, next);
    });
  }

  async.series(queue, function (err) {
    done(err ? err : null);
  });
};

/**
 * Exports the BaseEntity class.
 */
module.exports = BaseEntity;
