var Client = require('mongodb').MongoClient;

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended : true}));

app.get('/', function(req,res){
    res.redirect('http://sodeok.xyz');
});

app.get('/cnt', function(req, res, next) {
    res.redirect('/index.html');
});

app.post('/count', function(req, res){
    var gte = Number(req.body.gte);
    var lt = Number(req.body.lt);

    Client.connect('mongodb://localhost:27017/yagall', function(error, db) {
        if(error) console.log(error);
        else {
            db.collection('drop').find({num:{'$gte':gte,'$lt':lt}}).count(function(err, cnt){
                if(err) console.log(err);
                res.send(String(cnt));
            });
            db.close();
        }
    });
});

app.post('/keyword', function(req, res){
    var gte = Number(req.body.gte);
    var lt = Number(req.body.lt);

    Client.connect('mongodb://localhost:27017/yagall', function(error, db) {
        if(error) console.log(error);
        else {
            var wordList = new Array() ;
            var flag=0;
            var cursor = db.collection('word').aggregate({$match:{'num':{$gte:gte,$lt:lt}}},{$group:{_id:"$word",count:{$sum:1}}},{$sort:{"count":-1}},{$limit:50})
            cursor.each(function(err, doc){
                if(doc!=null){
                    flag++;
                    var data = new Object();
                    data.word=doc['_id'];
                    data.cnt=doc['count'];
                    console.log(data);
                    wordList.push(data);
                    if(flag==50) res.send(wordList);
                }
            })
            db.close();
        }
    });  
});

app.use((req, res, next) => {
    res.status(404).redirect('http://sodeok.xyz');
});
app.listen(8000);