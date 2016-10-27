/**
 * 
 * node Application config.js 
 * 
 */

module.exports = {
    server_port: 3000,
    db_url: 'mongodb://localhost:27017/shopping',

    db_schemas: [
        {file:'./user_schema.node', collection: 'users3', schemaName: 'UserSchema', modelName: 'UserModel'}
    ]
};