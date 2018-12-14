const express = require('express')
const AccessControl = require('accesscontrol')
var mongoose = require('mongoose');

const app = express()
const port = 3000
mongoose.connect('mongodb://localhost:27017/test-acl', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('We are connected!');
});

var roleSchema = new mongoose.Schema({
    role: String,
    resource: String,
    action: String,
    possession: String,
    attributes: [String],
    bizId: 'ObjectId'
});

roleSchema.set('toObject', { getters: true, virtuals: true });

var Role = mongoose.model('Role', roleSchema);

// const grants = [
//     { role: 'admin', resource: 'video', action: 'create', possession: 'any', attributes: [ '*' ], bizId: 69 },
//     { role: 'admin', resource: 'video', action: 'read', possession: 'any', attributes: [ '*' ], bizId: 69 },
// ];

// const ac = new AccessControl(grants);

app.get('/admin', async (req, res) => {
    let roleAdmin = 'admin';
    const ac = new AccessControl();
    const grants = await Role.find({ bizId: '4edd40c86762e0fb12000003' }).lean();

    ac.setGrants(grants);

    const permission = ac.can(roleAdmin).readAny('video');
    res.json(permission.granted);
});

app.get('/user', async (req, res) => {
    let roleUser = 'user';
    const ac = new AccessControl();
    const grants = await Role.find({ bizId: '4edd40c86762e0fb12000004' }).lean();

    ac.setGrants(grants);

    const permission = ac.can(roleUser).readAny('video');
    res.json(permission.granted);
});

app.get('/add-role', function(req, res) { 
    let grant = { role: 'user', resource: 'video', action: 'read', possession: 'any', attributes: ['*'], bizId: '4edd40c86762e0fb12000004' };
    let role = new Role(grant);

    role.save();

    res.json(role);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))