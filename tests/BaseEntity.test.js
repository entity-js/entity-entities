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

require('entity-core');
require('entity-database');
require('entity-sanitizers');
require('entity-validators');

var async = require('async'),
    test = require('unit.js'),
    loader = require('nsloader'),
    Database = loader('Entity/Database'),
    Entities = loader('Entity/Entities'),
    Validators = loader('Entity/Validators'),
    Sanitizers = loader('Entity/Sanitizers'),
    BaseEntity = loader('Entity/Entities/BaseEntity'),
    EMissingMachineName = loader(
      'Entity/Entities/Errors/EMissingMachineName'
    ),
    EMachineNameExists = loader(
      'Entity/Entities/Errors/EMachineNameExists'
    ),
    ECantFindEntity = loader(
      'Entity/Entities/Errors/ECantFindEntity'
    );

var database, entities, validators, sanitizers,
    collectionName = 'entity-test';

function createBaseEntity() {
  'use strict';

  var entity = new BaseEntity(entities);
  entity.collectionName = function () {
    return collectionName;
  };

  return entity;
}

describe('entity/Entities/BaseEntity', function () {

  'use strict';

  beforeEach(function (done) {

    database = new Database();
    database.connect('test', {
      name: 'test',
      host: '0.0.0.0'
    }, true);

    validators = new Validators();
    sanitizers = new Sanitizers();
    entities = new Entities({
      database: database,
      validators: validators,
      sanitizers: sanitizers
    });

    done();

  });

  afterEach(function (done) {

    var queue = [];

    queue.push(function (next) {
      database.collection(collectionName).drop(function () {
        next();
      });
    });

    queue.push(function (next) {
      entities.trashCollection.drop(function () {
        next();
      });
    });

    queue.push(function (next) {
      database.disconnect('test');
      next();
    });

    async.series(queue, done);

  });

  describe('BaseEntity.constructor()', function () {

    it('shouldHaveNullIdAndMachineName', function () {

      var entity = createBaseEntity();

      test.value(
        entity.id
      ).isNull();

      test.value(
        entity.machineName
      ).isNull();

    });

    it('shouldDefaultAsNew', function () {

      var entity = createBaseEntity();

      test.bool(
        entity.isNew
      ).isTrue();

    });

    it('shouldDefaultAsNotRenaming', function () {

      var entity = createBaseEntity();

      test.bool(
        entity._isRenaming
      ).isNotTrue();

    });

    it('shouldDefaultAsNotUpdated', function () {

      var entity = createBaseEntity();

      test.bool(
        entity.isUpdated
      ).isNotTrue();

    });

  });

  describe('BaseEntity.validate()', function () {

    it('shouldThrowAnErrorIfMachineNameIsMissing', function (done) {

      var entity = createBaseEntity();

      entity.validate(function (err) {

        test.object(
          err
        ).isInstanceOf(EMissingMachineName);

        done();

      });

    });

    it('shouldThrowAnErrorIfMachineNameIsInvalid', function (done) {

      var entity = createBaseEntity();
      entity.machineName = 'Not a valid machine name';

      entity.validate(function (err) {

        test.object(
          err
        ).isInstanceOf(Error).isNotInstanceOf(EMissingMachineName);

        done();

      });

    });

    it('shouldValidate', function (done) {

      var entity = createBaseEntity();
      entity.machineName = 'test-entity';

      entity.validate(function (err) {

        test.value(
          err
        ).isNull();

        done();

      });

    });

  });

  describe('BaseEntity.save()', function () {

    it('shouldThrowAnErrorIfValidationFails', function (done) {

      var entity = createBaseEntity();

      entity.save(function (err) {

        test.object(
          err
        ).isInstanceOf(Error);

        done();

      });

    });

    it('shouldSuccessfullySave', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      entity.machineName = 'test-entity';

      queue.push(function (next) {

        entity.save(next);

      });

      queue.push(function (next) {

        entity.collection.find({}, function (err, docs) {

          test.value(
            err
          ).isNull();

          test.array(
            docs
          ).hasLength(1);

          test.object(
            docs[0]
          ).hasKey('machineName', 'test-entity');

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldRenameEntity', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      entity.machineName = 'test-entity';

      queue.push(function (next) {

        entity.save(next);

      });

      queue.push(function (next) {

        entity.machineName = 'test-entity-2';
        entity.save(next);

      });

      queue.push(function (next) {

        entity.collection.find({}, function (err, docs) {

          test.value(
            err
          ).isNull();

          test.array(
            docs
          ).hasLength(1);

          test.object(
            docs[0]
          ).hasKey('machineName', 'test-entity-2');

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldFailToSaveIfMachineNameExistsAndNotRenaming', function (done) {

      var entity = createBaseEntity(),
          entity2 = createBaseEntity(),
          queue = [];

      entity.machineName = 'test-entity';
      entity2.machineName = 'test-entity';

      queue.push(function (next) {

        entity.save(next);

      });

      queue.push(function (next) {

        entity2.save(function (err) {

          test.object(
            err
          ).isInstanceOf(EMachineNameExists);

          next();

        });

      });

      queue.push(function (next) {

        entity.collection.find({}, function (err, docs) {

          test.value(
            err
          ).isNull();

          test.array(
            docs
          ).hasLength(1);

          test.object(
            docs[0]
          ).hasKey('machineName', 'test-entity');

          next();

        });

      });

      async.series(queue, done);

    });

  });

  describe('BaseEntity.load()', function () {

    it('shouldThrowAnErrorIfInvalidConditions', function (done) {

      var entity = createBaseEntity();

      entity.load(function (err) {

        test.object(
          err
        ).isInstanceOf(EMissingMachineName);

        done();

      });

    });

    it('shouldThrowAnErrorIfNoDocumentsMatch', function (done) {

      var entity = createBaseEntity();

      entity.load(function (err) {

        test.object(
          err
        ).isInstanceOf(ECantFindEntity);

        done();

      }, {
        machineName: 'test-entity'
      });

    });

    it('shouldLoadByConditions', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      queue.push(function (next) {

        entity.collection.save({
          machineName: 'test-entity'
        }, next);

      });

      queue.push(function (next) {

        entity.load(function (err) {

          test.value(
            err
          ).isNull();

          test.bool(
            entity.isNew
          ).isNotTrue();

          test.string(
            entity.machineName
          ).is('test-entity');

          done();

        }, 'test-entity');

      });

      async.series(queue, done);

    });

    it('shouldLoadByMachineName', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      entity.machineName = 'test-entity';

      queue.push(function (next) {

        entity.collection.save({
          machineName: 'test-entity'
        }, next);

      });

      queue.push(function (next) {

        entity.load(function (err) {

          test.value(
            err
          ).isNull();

          test.bool(
            entity.isNew
          ).isNotTrue();

          test.string(
            entity.machineName
          ).is('test-entity');

          done();

        });

      });

      async.series(queue, done);

    });

  });

  describe('BaseEntity.delete()', function () {

    it('shouldThrowAnErrorIfNoMachineName', function (done) {

      var entity = createBaseEntity();

      entity.delete(function (err) {

        test.object(
          err
        ).isInstanceOf(EMissingMachineName);

        done();

      });

    });

    it('shouldThrowAnErrorIfNoDocumentsMatch', function (done) {

      var entity = createBaseEntity();
      entity.machineName = 'test-entity';

      entity.delete(function (err) {

        test.object(
          err
        ).isInstanceOf(ECantFindEntity);

        done();

      });

    });

    it('shouldMoveToTrash', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      queue.push(function (next) {

        entity.collection.save({
          machineName: 'test-entity'
        }, next);

      });

      queue.push(function (next) {

        entity.machineName = 'test-entity';
        entity.delete(next);

      });

      queue.push(function (next) {

        entity.collection.find({}, function (err, docs) {

          if (err) {
            return next(err);
          }

          test.array(
            docs
          ).hasLength(0);

          next();

        });

      });

      queue.push(function (next) {

        entity.manager.trashCollection.find({}, function (err, docs) {

          if (err) {
            return next(err);
          }

          test.array(
            docs
          ).hasLength(1);

          test.object(docs[0])
            .hasKey('collection', 'entity-test')
            .hasKey('machineName', 'test-entity');

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldDeleteOnceTrashed', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      queue.push(function (next) {

        entity.collection.save({
          machineName: 'test-entity'
        }, next);

      });

      queue.push(function (next) {

        entity.machineName = 'test-entity';
        entity.delete(next);

      });

      queue.push(function (next) {

        entity.delete(next);

      });

      queue.push(function (next) {

        entity.manager.trashCollection.find({}, function (err, docs) {

          if (err) {
            return next(err);
          }

          test.array(
            docs
          ).hasLength(0);

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldDelete', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      queue.push(function (next) {

        entity.collection.save({
          machineName: 'test-entity'
        }, next);

      });

      queue.push(function (next) {

        entity.machineName = 'test-entity';
        entity.delete(next, null, true);

      });

      queue.push(function (next) {

        entity.collection.find({}, function (err, docs) {

          if (err) {
            return next(err);
          }

          test.array(
            docs
          ).hasLength(0);

          next();

        });

      });

      queue.push(function (next) {

        entity.manager.trashCollection.find({}, function (err, docs) {

          if (err) {
            return next(err);
          }

          test.array(
            docs
          ).hasLength(0);

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldLoadEntityFromTrash', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      queue.push(function (next) {

        entity.manager.trashCollection.save({
          collection: collectionName,
          machineName: 'test-entity',
          doc: {}
        }, next);

      });

      queue.push(function (next) {

        entity.load(next, 'test-entity');

      });

      queue.push(function (next) {

        test.bool(
          entity.isTrashed
        ).isTrue();

        test.string(
          entity.machineName
        ).is('test-entity');

        next();

      });

      async.series(queue, done);

    });

    it('shouldRestoreIfTheEntityIsSaved', function (done) {

      var entity = createBaseEntity(),
          queue = [];

      queue.push(function (next) {

        entity.manager.trashCollection.save({
          collection: collectionName,
          machineName: 'test-entity',
          doc: {}
        }, next);

      });

      queue.push(function (next) {

        entity.load(next, 'test-entity');

      });

      queue.push(function (next) {

        entity.save(next);

      });

      queue.push(function (next) {

        test.bool(
          entity.isTrashed
        ).isNotTrue();

        next();

      });

      queue.push(function (next) {

        entity.collection.find({}, function (err, docs) {

          if (err) {
            return next(err);
          }

          test.array(
            docs
          ).hasLength(1);

          test.object(
            docs[0]
          ).hasKey('machineName', 'test-entity');

          next();

        });

      });

      queue.push(function (next) {

        entity.manager.trashCollection.find({}, function (err, docs) {

          if (err) {
            return next(err);
          }

          test.array(
            docs
          ).hasLength(0);

          next();

        });

      });

      async.series(queue, done);

    });

  });

});

