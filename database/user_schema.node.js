/**
 * 
 * User Schema 객체 모듈화
 */

var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
    // 스키마를 정의 한다.
    var UserSchema = mongoose.Schema({
	    id: {type: String, required: true, unique: true, 'default':''},
	    hashed_password: {type: String, required: true, 'default':''},
	    salt: {type:String, required:true},
	    name: {type: String, index: 'hashed', 'default':''},
	    age: {type: Number, 'default': -1},
	    created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	    updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
	});

    UserSchema
        .virtual('password')
        .set(function(password) {
            this._password = password;
            this.salt = this.makeSalt();
	        this.hashed_password = this.encryptPassword(password);
	        console.log('virtual password 호출됨 : ' + this.hashed_password);
        });
    // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
    // 비밀 번호 암호화 (솔트값)
    UserSchema.method('encryptPassword', function(plainText, inSalt) {
		if (inSalt) {
			return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
		} else {
			return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
		}
	});    

    UserSchema.method('makeSalt', function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    UserSchema.method('authenticate', function(plainText, inSalt, hashed_password) {
		if (inSalt) {
			console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
			return this.encryptPassword(plainText, inSalt) === hashed_password;
		} else {
			console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.hashed_password);
			return this.encryptPassword(plainText) === this.hashed_password;
		}
	});

    UserSchema.path('id').validate(function(id) {
        return id.length;
    }, 'id컬럼값이 없습니다');

    UserSchema.path('name').validate(function (name) {
		return name.length;
	}, 'name 칼럼의 값이 없습니다.');
	
	UserSchema.path('hashed_password').validate(function (hashed_password) {
		return hashed_password.length;
	}, 'hashed_password 칼럼의 값이 없습니다.');

    UserSchema.static('findById', function(id,callback) {
        return this.find({id:id}, callback);
    });

    UserSchema.static('findAll', function(callback) {
		return this.find({}, callback);
	});

    return UserSchema;
};

module.exports = Schema;