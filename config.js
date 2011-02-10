var couchdb = require('./lib-external/couchdb');
var client = couchdb.createClient(5984, '127.0.0.1', 'lively', 'lively');
exports.couchdb = couchdb;
exports.client = client;

exports.livelyEventsDbName = 'lively_events';
exports.livelyWorkersDbName = 'lively_workers';
exports.livelyLogsDbName = 'lively_logs';


exports.livelyEventsDb = client.db(exports.livelyEventsDbName);
exports.livelyWorkersDb = client.db(exports.livelyWorkersDbName);
exports.livelyLogsDb = client.db(exports.livelyLogsDbName);