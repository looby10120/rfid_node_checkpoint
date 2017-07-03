var app = require('express')();
var port = process.env.PORT || 7777;
var mysql =  require('mysql');
var path = require('path');
var dateFormat = require('dateformat');
var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "kmutnb_running"
    });

// localhost:7777/command
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/', function(req, res) {

function test_update(num,obj){
    //console.log(obj[num-1]);
    var sql = "UPDATE users_events_checkpoint SET time_lapse = ? WHERE Tagdata = ?";
        con.query(sql, [obj[num-1].last_time,obj[num-1].Tag_id], function(err, result){
            if (!err && res.statusCode == 200){
                res.status(200);
                res.send('Data Update Successful');
                console.log("Update Success");
            } else {
                res.status(404);
                res.send('Error');
                console.log("Update Failed");
            }
        });
}

function test_insert(num,obj){
    var sql = 'INSERT INTO users_events_checkpoint SET ?'
    var data = {
                    "Tagdata" : obj[num-1].Tag_id, 
                    "time_lapse" : obj[num-1].last_time,
                    "Reader_id" : obj[num-1].Reader
                }
        con.query(sql, data, function(err, result){
            if(!err && res.statusCode == 200) {
                res.status(201);
                res.send('Data Create Successful');
                console.log("Insert new data Success");
            } else {
                res.status(404);
                res.send('Not Found');
                console.log("Insert new data Failed");
            }
        });
}

function test_insert_reader(num,obj){
    var sql = 'INSERT INTO users_events_checkpoint SET ?'
    //console.log(obj[num-1])
    var data = {
                    "Tagdata" : obj[num-1].Tag_id, 
                    "time_lapse" : obj[num-1].last_time,
                    "Reader_id" : obj[num-1].Reader
                }
        con.query(sql, data, function(err, result){
            if(!err && res.statusCode == 200) {
                res.status(201);
                res.send('Data Create Successful');
                console.log("Insert new reader Success");
            } else {
                res.status(404);
                res.send('Not Found');
                console.log("Insert new reader Failed");
            }
        });
}

function test_select(num,obj,tag,callback){
    var sql = "SELECT * FROM users_events_checkpoint WHERE Tagdata='"+tag+"'";
    //console.log(sql)
        con.query(sql, function(err, result){
            if (err) 
                callback(err,null);
            else
                callback(null,result);
        });
        //return 0
}

    var fs = require('fs');
    //var length = []
    var obj = req.body.slice()
    //var jsondata = JSON.parse(fs.readFileSync(__dirname + '/logger.json', 'utf8'));

    var interval = 500; // 2 seconds;
    var num = 0;
    for(var i=0; i< obj.length; i++){
        //var tag = obj[i].Tag_id;
        //console.log(tag);
            //var sql = "SELECT * FROM users_events_checkpoint WHERE Tagdata='"+tag[i]+"'";
        //test_select(i,obj,tag);
        setTimeout(function(i) { test_select(i,obj,obj[i].Tag_id, function(err,data){
            num = num+1
            if(data.length > 0){
                var same = 0;
                var new_tag = 0;
                for(var i=0; i< data.length; i++){
                    if(data[i].Reader_id == obj[num-1].Reader){
                        same = same+1;
                        //console.log("same");
                    }else{
                        //console.log("new tag");
                        new_tag = new_tag+1;
                    }
                }
                console.log(same,new_tag)
                if(same == 1){
                    console.log("same reader")
                    test_update(num,obj)
                }else{
                    console.log("new reader")
                    test_insert_reader(num,obj)
                }
            }else{
                console.log("new",num)
                test_insert(num,obj)
            }});}, interval * i, i);
            /*con.query(sql, function(err, result) {
                console.log(result);
                num = num+1;
                if(result.length == 0){
                    //console.log("insert_new")
                    //setTimeout(function() { alert(“Test”); }, 1000);
                    setTimeout(function() { test_insert(num,obj);}, 1000);
                }else{
                    console.log("same")
                }*/
                //console.log(num,result.length);
                /*if(result.length > 0){
                    var same = 0;
                    var new_tag = 0;
                    for(var i=0; i< result.length; i++){
                        if(result[i].Reader_id == obj[num-1].Reader){
                                same = same+1;
                                //console.log("same");
                            }else{
                                //console.log("new tag");
                                new_tag = new_tag+1;
                            }
                    }
                    console.log(same,new_tag);
                }else{
                    console.log("new");
                    //console.log("insert_new")
                    //test_insert(num)
                    /*sql = 'INSERT INTO users_events_checkpoint SET ?'
                    var data = {
                                    "Tagdata" : obj[num-1].Tag_id, 
                                    "time_lapse" : obj[num-1].last_time,
                                    "Reader_id" : obj[num-1].Reader
                                }
                        con.query(sql, data, function(err, result){
                            if(!err && res.statusCode == 200) {
                                //res.status(201);
                                //res.send('Data Create Successful');
                                console.log("Insert new data Success");
                            } else {
                                //res.status(404);
                                //res.send('Not Found');
                                console.log("Insert new data Failed");
                            }
                        });
                }*/
            //});
    }  
        //var sql = "SELECT * FROM users_events_checkpoint WHERE Tagdata='"+tag+"'";
        //console.log(obj[i].Tag_id)
            /*con.query(sql, function(err, result) {
                var same = 0;
                var new_tag = 0;
                //console.log(result);
                num = num+1;
                console.log(result.length);
                if(result.length > 0){
                    //console.log(result.length);
                    for(var i=0; i< result.length; i++){
                        if(result[i].Reader_id == obj[num-1].Reader){
                            same = same+1;
                            //break
                            //console.log("same");
                        }else{
                            //console.log("new tag");
                            new_tag = new_tag+1;
                            //break
                        }
                        /*if(same == 1){
                            console.log("update");
                        }else if(new_tag == 1){
                            console.log("insert");
                        }
                    }
                    //console.log(same,new_tag)
                    if(same == 1 || same == new_tag){
                        //console.log("update");
                        /*sql = "UPDATE users_events_checkpoint SET time_lapse = ? WHERE Tagdata = ?";
                            con.query(sql, [obj[num-1].last_time,obj[num-1].Tag_id], function(err, result){
                                if (!err && res.statusCode == 200){
                                    //res.status(200);
                                    //res.send('Data Update Successful');
                                    console.log("Update Success");
                                } else {
                                    //res.status(404);
                                    //res.send('Error');
                                    console.log("Update Failed");
                                }
                            });
                    }else if(new_tag == 1){
                        //console.log("insert");
                        /*sql = 'INSERT INTO users_events_checkpoint SET ?'
                        var data = {
                                        "Tagdata" : obj[num-1].Tag_id, 
                                        "time_lapse" : obj[num-1].last_time,
                                        "Reader_id" : obj[num-1].Reader
                                    }
                            con.query(sql, data, function(err, result){
                                if(!err && res.statusCode == 200) {
                                    //res.status(201);
                                    //res.send('Data Create Successful');
                                    console.log("Insert new tag Success");
                                } else {
                                    //res.status(404);
                                    //res.send('Not Found');
                                    console.log("Insert new tag Failed");
                                }
                            });
                    }

                }else{
                    //console.log("insert_new")
                    //test_insert(num)
                    /*sql = 'INSERT INTO users_events_checkpoint SET ?'
                    var data = {
                                    "Tagdata" : obj[num-1].Tag_id, 
                                    "time_lapse" : obj[num-1].last_time,
                                    "Reader_id" : obj[num-1].Reader
                                }
                        con.query(sql, data, function(err, result){
                            if(!err && res.statusCode == 200) {
                                //res.status(201);
                                //res.send('Data Create Successful');
                                console.log("Insert new data Success");
                            } else {
                                //res.status(404);
                                //res.send('Not Found');
                                console.log("Insert new data Failed");
                            }
                        });
                //console.log(data);
                }
            });*/
    //}
    //console.log(update_check);
    //res.json(obj);
});

app.get('/select/:Tagdata', function(req, res) {
    var tag = req.params.Tagdata;
    var sql = "SELECT * FROM users_events_checkpoint WHERE Tagdata='"+tag+"'";
    con.query(sql, function(err, result) {
        //console.log(result)
        if (result.length == 0) {
            res.status(404);
            res.send('Not Found');
        }
        else if (!err && res.statusCode == 200){
            res.status(200);
            res.json(result);
        }
        
        console.log(res.statusCode,res.statusMessage)
    });
});

app.get('/select_all', function(req, res) {
    var sql = "SELECT * FROM users_events_checkpoint";
    con.query(sql, function(err, result) {
        if (!err && res.statusCode == 200){
            res.status(200);
            res.json(result);
        }
        else {
            //throw err
            res.status(404);
            res.send('Not Found');
        }
        //res.send('OK');
        console.log(res.statusCode,res.statusMessage)
    });
});

app.delete('/delete/:Tagdata', function(req, res) {
    var tag = req.params.Tagdata;
    var sql = "SELECT * FROM users_events_checkpoint WHERE Tagdata='"+tag+"'";
    con.query(sql, function(err, result) {
        console.log(result,err)
        if (result.length == 0) {
            //throw err
            res.status(404);
            res.send('Not Found');
        }
        else if (!err && res.statusCode == 200){
            //res.json(result);
            sql = "DELETE FROM users_events_checkpoint WHERE Tagdata='"+tag+"'";
            con.query(sql, function(err, result){
                res.status(200);
                res.send('Data Delete Successful');
            });
        }

        console.log(res.statusCode,res.statusMessage)
    });
});

app.listen(port, function() {
    console.log('Starting node.js on port ' + port);
});