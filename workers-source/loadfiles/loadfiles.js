var http = require('http');
var url = require('url');
var sys = require('sys');
var fs = require('fs');
var workerLib = require('../../lib/workerlib');

var couchdb = workerLib.couchdb;

workerLib.initialize('loadfiles', function() {
  var eventStream = workerLib.openEventStream();
  eventStream.on('event', function(event) {
    execute(event);
  });
  eventStream.on('end', function() {
    process.exit(0);
  });
});
var execute = function(event) {
  var folderPath = event.parameters.folderpath;
  var filePath = event.parameters.filepath;
  var docId = event.parameters.docid;
  var dbName = event.parameters.db;
  var client = workerLib.client;
  var db = client.db(dbName);
  db.getDoc(docId, function(er, doc) {
    if(doc) {
      if(folderPath) {
        loadFolder(folderPath, db, docId, doc._rev);
      }
      if(filePath) {
        loadFile(filePath, db, docId, doc._rev);
      }
    } else {
      db.saveDoc(docId, {}, function(err, newDoc) {
        if(!newDoc)
          return execute(data);
        if(folderPath) {
          loadFolder(folderPath, db, docId, newDoc.rev);
        }
        if(filePath) {
          loadFile(filePath, db, docId, newDoc.rev);
        }
      })
    }
  });
}
var loadFolder = function(folderPath, db, docId, rev1) {
  var files = fs.readdirSync(folderPath);
  var loadFile = function(fileNames, rev) {
    var filePath = folderPath + '/' + fileNames[fileNames.length-1];
    db.saveAttachment(filePath, docId, {rev: rev}, function(err, data) {
      if(fileNames.length > 0) {
        fileNames.pop();
        loadFile(fileNames, data.rev);
      } else {
        workerLib.emitLivelyEvent('folder_loaded', {folderpath: folderPath, docid: docId});
      }
    });
  };
  loadFile(files, rev1);
}
var loadFile = function(filePath, db, docId, rev) {
  db.saveAttachment(filePath, docId, {rev: rev}, function(err, data) {
    if(err) {
      if(err.error == 'conflict') {
        db.getDoc(docId, function(er, doc) {
          loadFile(filePath, db, docId, doc._rev);
        })
      }
    }
    workerLib.emitLivelyEvent('file_loaded', {filepath: filePath, docid: docId});
  })
}