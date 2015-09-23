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

var util = require('util'),
    test = require('unit.js'),
    loader = require('nsloader'),
    Validators = loader('Entity/Validators'),
    Entity = loader('Entity/Entities/Entity'),
    EntityRule = loader('Entity/Entities/Validators/Entity'),
    EInvalidEntity = loader(
      'Entity/Entities/Errors/EInvalidEntity'
    ),
    EFailedEntity = loader(
      'Entity/Entities/Errors/EFailedEntity'
    );

function TestEntity(type) {
  'use strict';

  TestEntity.super_.call(this, null);
  this._type = type || 'test';
}

util.inherits(TestEntity, Entity);

TestEntity.prototype.type = function () {
  'use strict';

  return this._type;
};

function createValidator() {
  'use strict';

  var validators = new Validators();
  validators.register('entity', EntityRule);

  return validators;
}

describe('entity/Entities/Validators/Entity', function () {

  'use strict';

  it('validatorShouldBeAvailable', function () {

    var validators = createValidator();

    test.bool(
      validators.registered('entity')
    ).isTrue();

  });

  it('shouldThrowAnInvalidEntity', function (done) {

    var validators = createValidator(),
        entity = {
          type: 'test'
        };

    validators.validate(function (err) {

      test.object(
        err
      ).isInstanceOf(EInvalidEntity);

      done();

    }, 'entity', entity, {
      type: 'test'
    });

  });

  it('shouldThrowFailedEntityError', function (done) {

    var validators = createValidator(),
        entity = new TestEntity('foo');

    validators.validate(function (err) {

      test.object(
        err
      ).isInstanceOf(EFailedEntity);

      done();

    }, 'entity', entity, {
      type: 'test'
    });

  });

  it('shouldValidateAsValid', function (done) {

    var validators = createValidator(),
        entity = new TestEntity();

    validators.validate(function (err) {

      test.value(
        err
      ).isNull();

      done();

    }, 'entity', entity);

  });

  it('shouldValidateAsValidWithEntityType', function (done) {

    var validators = createValidator(),
        entity = new TestEntity();

    validators.validate(function (err) {

      test.value(
        err
      ).isNull();

      done();

    }, 'entity', entity, {
      type: 'test'
    });

  });

});
