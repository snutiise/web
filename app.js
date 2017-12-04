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
            db.collection('word').aggregate([{$match:{'num':{$gte:gte,$lt:lt}}},{$group:{_id:"$word",count:{$sum:1}}},{$sort:{"count":-1}},{$limit:100}],function(err,doc){
                if(err) console.log(err);
                if(doc){
                    doc.forEach(function(tag){
                        if(flag<20&&String(tag['_id']).length>1){
                            var filter=String(tag['_id']);
                            if(filter!="존나"&&filter!="시발"&&filter!="씨발"&&filter!="새끼"&&filter!="진짜"&&filter!="지금"&&filter!="오늘"&&filter!="본인"&&filter!="요즘"){
                                var data = new Object();
                                data.word=tag['_id'];
                                data.cnt=tag['count'];
                                wordList.push(data);
                                flag++;
                            }
                        }
                    });
                    var jsonData = JSON.stringify(wordList) ;
                    res.send(jsonData);
                    db.close();
                }
            });
        }
    });  
});

app.use((req, res, next) => {
    res.status(404).redirect('http://sodeok.xyz');
});
app.listen(8000);