var Client = require('mongodb').MongoClient;

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended : true}));

app.post('/Gallery', function(req, res){
    var cnt = Number(req.body.count);
    var list = new Array();
    var process=0;

    Client.connect('mongodb://localhost:27017/yagall', function(error, db) {
        if(error) console.log(error);
        else {
            var cursor = db.collection('img').find().sort({num:-1}).skip(cnt).limit(30);
            var stop=0;
            db.collection('img').find().sort({num:-1}).skip(cnt).limit(30).count(function(err, cnt){
                if(err) console.log(err);
                stop=Number(cnt);
            });
            cursor.each(function(err, doc){
                if(err) console.log(err);
                else{
                        process++;
                        if(doc!=null) list.push(doc['_id']);
                        if(process==stop) res.send(list);
                    }
            });
            db.close();
        }
    });
});

app.use((req, res, next) => {
    res.status(404).redirect('http://sodeok.xyz');
});
app.listen(8001);