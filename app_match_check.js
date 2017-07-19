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

app.get('/check_connect', function(req, res) {
    res.send();
});

app.post('/select_run', function(req, res) {
    var running_no = req.body.txt_running_no;
    console.log(running_no)
    if(running_no == undefined){
        res.status(404)
        res.send("Error")
    }else{
    var sql = "SELECT user_name, txt_running_no, event_id FROM users_events_all WHERE txt_running_no LIKE '%"+ running_no + "%'"
    console.log(sql)
    con.query(sql, function(err, result) {
        if (!err && res.statusCode == 200) {
            res.status(200);
            res.json(result);
        } else {
            res.status(404);
            res.send('not found');
        }
        console.log(res.statusCode, res.statusMessage);
    });
    }
});

app.post('/insert', function(req, res) {
    var id = req.body.event_id;
    var run_no = req.body.running_no;
    var tag = req.body.Tagdata;
    var sql = "SELECT * FROM users_events_tag WHERE Tagdata='" + tag + "' || running_no ='" + run_no + "'";
    //console.log(sql)
    console.log(id,run_no,tag)
    if(run_no == undefined || tag == undefined || id == undefined){
        res.status(404)
        res.send("Missing Data")
    } else {
    con.query(sql, function(err, result) {
        console.log(result)
        if (run_no.length == 0 || tag.length == 0 || id.length == 0) {
            res.status(204);
            res.send('No Content');

        } else if (result.length > 0) {
            //console.log(result)
            res.status(409);
            res.send('Same Tagdata Found');

        } else if (!err && res.statusCode == 200){
            console.log("Insert")
            var data = { "event_id": id, "running_no": run_no, "Tagdata": tag }
            sql = "INSERT INTO users_events_tag SET ?"
            con.query(sql, data, function(err, result){
                if (!err && res.statusCode == 200) {
                    res.status(201);
                    res.send('Data Create Successful');
                } else {
                    res.status(404);
                    res.send('Data Create Failed');
                    // throw err;
                }
            });
        } else {
            res.status(404);
            res.send('System Error');
            //throw err;
        }
        console.log(res.statusCode, res.statusMessage);
    });
    }
});

app.post('/update', function(req, res) {
    var id = req.body.event_id;
    var run_no = req.body.running_no;
    var tag = req.body.Tagdata;
    var sql = "SELECT * FROM users_events_tag WHERE running_no='" + run_no + "'";
    //console.log(sql)
    console.log(id,run_no,tag,"update")
    if(run_no == undefined || tag == undefined || id == undefined){
        res.status(404)
        res.send("Missing Data")
    } else {
    con.query(sql, function(err, result) {
        console.log(result)
        if (run_no.length == 0 || tag.length == 0 || id.length == 0) {
            res.status(204);
            res.send('No Content');

        } else if (result.length == 0) {
            //console.log(result)
            res.status(409);
            res.send('No Content');

        } else if (!err && res.statusCode == 200){
            console.log("Update")
            var data = { "event_id": id, "Tagdata" : tag }
            sql = "UPDATE users_events_tag SET ? WHERE running_no=?"
            con.query(sql, [data, run_no], function(err, result){
                if (!err && res.statusCode == 200) {
                    res.status(201);
                    res.send('Data Update Successful');
                } else {
                    res.status(404);
                    res.send('Data Update Failed');
                    // throw err;
                }
            });
        } else {
            res.status(404);
            res.send('System Error');
            //throw err;
        }
        console.log(res.statusCode, res.statusMessage);
    });
    }
});

/*app.post('/update', function(req, res) {
    var id = req.body.event_id;
    var run_no = req.body.running_no;
    var tag = req.body.Tagdata;
    console.log(id,run_no,tag,"Update")
    if(run_no == undefined || tag == undefined || id == undefined){
        res.status(404)
        res.send("Missing Data")
    } else {

        if (run_no.length == 0 || tag.length == 0 || id.length == 0) {
            res.status(204);
            res.send('No Content');

        } else {
            var sql = "UPDATE users_events_tag SET ? WHERE running_no=?"
            var data = { "event_id": id, "Tagdata" : tag }
            con.query(sql, [data, run_no], function(err, result){
                if (!err && res.statusCode == 200) {
                    res.status(200);
                    res.send('Data Update Successful');
                } else {
                    res.status(404);
                    res.send('Data Update Not Successful');
                    // throw err;
                }
            });
        }
        console.log(res.statusCode, res.statusMessage);
    }
});*/

app.delete('/delete_match', function(req, res) {
    var tag = req.body.Tagdata;
    var sql = "SELECT * FROM users_events_tag WHERE Tagdata LIKE '%"+ tag + "%'";
    console.log(sql)
    if(tag == undefined){
        res.status(404)
        res.send("Error")
    }else{
    con.query(sql, function(err, result) {
        console.log(result,err)
        if (result.length == 0) {
            //throw err
            res.status(404);
            res.send('Not Found');
        }
        else if (!err && res.statusCode == 200){
            //res.json(result);
            sql = "DELETE FROM users_events_tag WHERE Tagdata LIKE '%"+ tag + "%'";
            con.query(sql, function(err, result){
                if (!err && res.statusCode == 200) {
                    res.status(200);
                    res.send('Data Delete Successful');
                } else {
                    res.status(404);
                    res.send('Data Delete Not Successful');
                }
            });
        }
        console.log(res.statusCode,res.statusMessage)
    });
    }
});

app.get('/select_event', function(req, res) {
var sql = "SELECT event_name FROM events";
    con.query(sql, function(err, result) {
        if (!err && res.statusCode == 200) {
            res.status(200);
            res.json(result);
        } else {
            res.status(404);
            res.send('not found');
        }
        console.log(res.statusCode, res.statusMessage);
    });
});

app.get('/select_all', function(req, res) {
    var sql = "SELECT running_no, Tagdata FROM users_events_tag";
    con.query(sql, function(err, result) {
        if (!err && res.statusCode == 200) {
            res.status(200);
            res.json(result);
        } else {
            res.status(404);
            res.send('not found');
        }
        console.log(res.statusCode, res.statusMessage);
    });
});

app.get('/join/:txt_running_no', function(req, res) {

function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs;
}
    var running_no = req.params.txt_running_no;
    var sql =   "SELECT users_events_all.user_name,"+
                "s_running_type.running_type,prefix_running_number, "+
                "s_running_categories.running_cat_desc, "+
                "users_events_tag.Tagdata, "+
                "users_events_checkpoint.time_lapse "+
                "FROM users_events_all "+
                "LEFT JOIN s_running_type ON users_events_all.running_type_id = s_running_type.running_type_id "+
                "LEFT JOIN s_running_categories ON users_events_all.running_cat_id = s_running_categories.running_cat_id "+
                "LEFT JOIN users_events_tag ON users_events_all.txt_running_no = users_events_tag.running_no "+
                "LEFT JOIN users_events_checkpoint ON users_events_checkpoint.Tagdata = users_events_tag.Tagdata "+
                "WHERE users_events_all.txt_running_no LiKE '%"+ running_no + "%'"
    //console.log(sql)
    con.query(sql, function(err, result) {
        if (!err && res.statusCode == 200) {
            res.status(200);
            res.json(result);
            var date1 = new Date(result[0].time_lapse);
            var date2 = new Date(result[(result.length)-1].time_lapse);
            if (date2 < date1) {
                date2.setDate(date2.getDate() + 1);
            }
            var diff = date2 - date1
            var new_time = msToTime(diff)
            console.log(new_time)
            /*if(result.length > 0){
                for(var i=0; i< result.length; i++){
                    var date = new Date(result[i].time_lapse);//.toLocaleString();
                    var h = date.getHours();
                    var m = date.getMinutes();
                    var s = date.getSeconds();
                    console.log(h,m,s)
                }
            }*/
        } else {
            res.status(404);
            res.send('not found');
        }
        console.log(res.statusCode, res.statusMessage);
    });
});

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
    console.log(sql)
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

    var interval = 500; // 0.5 seconds;
    var num = 0;
    for(var i=0; i< obj.length; i++){
        var tag = obj[i].Tag_id;
        console.log(tag);
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
                    if(obj[num-1].Reader == "Reader4"){
                        console.log("last reader")
                    }else{
                    console.log("new reader")
                    test_insert_reader(num,obj)
                    }
                }
            }else{
                console.log("new",num)
                test_insert(num,obj)
            }});}, interval * i, i);
    }  
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

app.get('/select_all_check', function(req, res) {
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