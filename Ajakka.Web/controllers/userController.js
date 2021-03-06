const User = require('../model/user');
const uuidv1 = require('uuid/v1');
var passwordHash = require('password-hash');
var mysql = require('mysql');
var config = require('../config/ajakkaConfiguration');

function _validateLogin(name, password, resolve, reject){
    setTimeout(function(){
        var connection = createConnection();
        var query = 'select * from users where name=?';
        connection.query(query, name, function(err,result,fields){
            if(err){
                reject(err);
                return;
            }
            connection.end();
            if(result.length == 0){
                reject({message:'User name or password is not valid'});
                return;
            }
            var user = new User(result[0].id,result[0].name,'');
            
            if(result[0].pwdHash == null || passwordHash.verify(password, result[0].pwdHash))
            {
                resolve(user);
                return;
            }
            
            reject({message:'User name or password is not valid'});
        });
    },
    2000);
    
}

function _createUser(name, password, resolve, reject){
    var id = uuidv1();
    var pwdHash = passwordHash.generate(password);
    var user = new User(id, name, pwdHash);
    
    var connection = createConnection();
    
    var values = [[user.id, user.name, user.pwdHash]];
    
    connection.query('insert into users (id, name, pwdHash) values (?)', values, function (err, result, fields) {
        connection.end();
        if(err){
            reject(err);
            return;
        }
        
        resolve(user);
    });

}


function _findAll(pageSize, pageNumber, resolve, reject){
    var connection = createConnection();
    var offset = pageSize * pageNumber;
    var query = 'select * from users order by name limit '+ pageSize + ' offset ' + offset;
   
    connection.query(query, function(err,result,fields){
        if(err){
            reject(err);
            return;
        }
        connection.end();
        var users = new Array();
        result.forEach(function(item){
            var user = new User(item.id, item.name, '');
            users.push(user);
        });
        resolve(users);
    });
}

function _getPageCount(pageSize, resolve, reject){
    var connection = createConnection();
    var query = 'select count(id) as c from users';
   
    connection.query(query, function(err,result,fields){
        if(err){
            reject(err);
            return;
        }
        var pageCount = Math.ceil(result[0].c/pageSize);
        
        connection.end();
        resolve(pageCount);
    });
}

function _findById(id, resolve, reject){
    var connection = createConnection();
    var query = 'select * from users where id=?';
    connection.query(query, id, function(err,result,fields){
        if(err){
            reject(err);
            return;
        }
        connection.end();
        if(result.length == 0){
            resolve(null);
            return;
        }
        var user = new User(result[0].id,result[0].name,'');
        resolve(user);
    });
}

function _findByName(name, resolve, reject){
    var connection = createConnection();
    var query = 'select * from users where name=?';
    connection.query(query, name, function(err,result,fields){
        if(err){
            reject(err);
            return;
        }
        connection.end();
        if(result.length == 0){
            resolve(null);
            return;
        }
        var user = new User(result[0].id,result[0].name,'');
        resolve(user);
    });
}

function _deleteUser(id, resolve, reject){
    var connection = createConnection();
    var query = 'delete from users where id=?';
    var q = connection.query(query, id, function(err,result,fields){
        connection.end();
        if(err){
            reject(err);
            return;
        }
        if(result.affectedRows == 0){
            reject({message:'User with this id does not exist'});
            return;
        }
        resolve(id);
    });
}

function _changeUserPassword(name, oldPassword, newPassword, resolve, reject){
    validateLogin(name,oldPassword).then(function(user){
        var connection = createConnection();
        var newHash = passwordHash.generate(newPassword);
        var query = 'update users set pwdHash=? where name=?';
        var q = connection.query(query, [newHash,name], function(err,result,fields){
            if(err){
                reject(err);
                return;
            }
            connection.end();
            resolve(name);
        });
    }).catch(function(err){
        reject(err);
    });
}

function _setSettingsValue(key, userid, value, resolve, reject){
    var connection = createConnectionMultilineQueries();
    var query = 'start transaction;'+
                'delete from usersettings where settingskey=? and userid=?;'+
                'insert into usersettings (settingskey, userid, settingsvalue) values(?,?,?);'+
                'commit;';
    var q = connection.query(query, [key, userid, key, userid, value], function(err, result, fields){
        if(err){
            console.log(err);
            reject(err);
            return;
        }
        connection.end();
        resolve();
    });
}

function _getSettingsValue(key, userId, resolve, reject){
    var connection = createConnection();
    var query = 'select settingsvalue from usersettings where settingskey=? and userid=?';
    var q = connection.query(query, [key, userId], function(err, result, fields){
        if(err){
            reject(err);
            return;
        }
        connection.end();
        if(result[0]){
            resolve(result[0].settingsvalue);
            return;
        }
        resolve(null);
    });
}

function validateLogin(name, password){
    return new Promise(function(resolve, reject){
        _validateLogin(name, password, resolve, reject);
      });
}

function createUser(name, password){
    return new Promise(function(resolve, reject){
        _createUser(name, password, resolve, reject);
    })
}

function findAll(pageSize, pageNumber){
    return new Promise(function(resolve, reject){
        _findAll(pageSize, pageNumber, resolve, reject);
    })
}

function findById(id){
    return new Promise(function(resolve, reject){
        _findById(id, resolve, reject);
    })
}

function findByName(name){
    return new Promise(function(resolve, reject){
        _findByName(name, resolve, reject);
    });
}

function deleteUser(id){
    return new Promise(function(resolve, reject){
        _deleteUser(id, resolve, reject);
    })
}

function getPageCount(pageSize){
    return new Promise(function(resolve, reject){
        _getPageCount(pageSize, resolve, reject);
    })
}

function changeUserPassword(name, oldPassword, newPassword){
    return new Promise(function(resolve, reject){
        _changeUserPassword(name, oldPassword, newPassword, resolve, reject);
    });
}

function createConnection(){
    return mysql.createConnection(config.getMySqlUrl());

}

function createConnectionMultilineQueries(){
    var url = config.getMySqlUrl();
    if(url.indexOf('?') >= 0){
        url = url + '&multipleStatements=true';
    }
    else{
        url = url + '?multipleStatements=true';
    }
    return mysql.createConnection(url);
}

function setSettingsValue(key, userId, value){
    return new Promise(function(resolve, reject){
        _setSettingsValue(key,userId,value,resolve, reject);
    });
}

function getSettingsValue(key, userId){
    return new Promise(function(resolve, reject){
        _getSettingsValue(key, userId, resolve, reject);
    });
}

module.exports.validateLogin = validateLogin;
module.exports.createUser = createUser;
module.exports.findAll = findAll;
module.exports.findById = findById;
module.exports.deleteUser = deleteUser;
module.exports.changeUserPassword = changeUserPassword;
module.exports.findByName = findByName;
module.exports.getPageCount = getPageCount;
module.exports.setSettingsValue = setSettingsValue;
module.exports.getSettingsValue = getSettingsValue;