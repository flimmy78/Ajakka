var chai = require('chai');
var expect = chai.expect;
var userController = require('../controllers/userController');
const assert = require('assert');
var mysql = require('mysql');
var config = require('../config/ajakkaConfiguration');

describe('User', function() {
    describe('#create()', function() {
        beforeEach(function(done){ 
            var connection = createConnection();
            
            connection.query('delete from users', function (err, result, fields) {
                if (err){ 
                    throw err;
                }
                connection.end();
                done();
            });
           
        });
        
        it('should create user', function(done) {
            userController.createUser('name','password')
            .then(function(user){
                assert.equal(user.name, 'name');
                assert.ok(user.pwdHash);
                assert.ok(user.id);
                var connection = createConnection();
                connection.query('select id,name,pwdHash from users', function (err, result, fields) {
                    
                    connection.end();
                    
                    assert.equal(user.name, result[0].name);
                    assert.equal(user.pwdHash, result[0].pwdHash);
                    assert.equal(user.id, result[0].id);
                    done();
                });
               
            })
            .catch((reason)=>{done(reason);});
        });

        it('should not set passwordHash to test (sql injection attack)', function(done) {
            userController.createUser('test\',\'test\')--','password')
            .then(function(user){;
                var connection = createConnection();
                connection.query('select id,name,pwdHash from users', function (err, result, fields) {
                    
                    connection.end();
                    assert.notEqual(result[0],'test');
                    assert.equal(user.name, result[0].name);
                    assert.equal(user.pwdHash, result[0].pwdHash);
                    assert.equal(user.id, result[0].id);
                    done();
                });
               
            })
            .catch((reason)=>{done(reason);});
        });
    });
});



function createConnection(){
    return mysql.createConnection(config.getMySqlUrl());

}