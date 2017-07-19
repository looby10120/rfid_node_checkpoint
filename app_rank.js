var app = require('express')();
var port = process.env.PORT || 7777;
var mysql =  require('mysql');
var path = require('path');
var dateFormat = require('dateformat');
var Promise = require('promise');
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
                //res.send('Data Update Successful');
                console.log("Update Success");
            } else {
                res.status(404);
                //res.send('Error');
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
                //res.send('Data Create Successful');
                console.log("Insert new data Success");
            } else {
                res.status(404);
                //res.send('Not Found');
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
                //res.send('Data Create Successful');
                console.log("Insert new reader Success");
            } else {
                res.status(404);
                //res.send('Not Found');
                console.log("Insert new reader Failed");
            }
        });
}

function test_select(obj,tag,callback){
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

function test_insert_last(num,obj){
    var sql = 'INSERT INTO users_events_checkpoint SET ?'
    //console.log(obj[num-1])
    var data = {
                    "Tagdata" : obj[num-1].Tag_id, 
                    "time_lapse" : obj[num-1].last_time,
                    "Reader_id" : obj[num-1].Reader
                }
        con.query(sql, data, function(err, result){
            if(!err && res.statusCode == 200) {
                //res.status(201);
                //res.send('Data Create Successful');
                console.log("Insert new reader Success");
            } else {
                //res.status(404);
                //res.send('Not Found');
                console.log("Insert new reader Failed");
            }
        });
}

function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs;
}

function test_rank(obj){
    var name = obj[0].Tag_id;
    var sql =   "SELECT users_events_all.running_type_id,"+
                "s_running_type.running_type,prefix_running_number, "+
                "users_events_tag.Tagdata, "+
                "users_events_checkpoint.time_lapse,Reader_id "+
                "FROM users_events_all "+
                "LEFT JOIN s_running_type ON users_events_all.running_type_id = s_running_type.running_type_id "+
                "LEFT JOIN users_events_tag ON users_events_all.txt_running_no = users_events_tag.running_no "+
                "LEFT JOIN users_events_checkpoint ON users_events_checkpoint.Tagdata = users_events_tag.Tagdata "+
                "WHERE users_events_tag.Tagdata LiKE '%"+ name + "%'"
        con.query(sql, function(err, result){
            if (!err){ 
                console.log("ok")
                //console.log(result)
                var date1 = new Date(result[0].time_lapse);
                var date2 = new Date(result[(result.length)-1].time_lapse);
                console.log(date1,date2)
                if (date2 < date1) {
                    date2.setDate(date2.getDate() + 1);
                }
                var diff = date2 - date1
                var new_time = msToTime(diff)
                //console.log(new_time,result[0].event_id,name)
                var sql = 'INSERT INTO result SET ?'
                //console.log(obj[num-1])
                var data = {
                    "Tagdata" : name, 
                    "running_type_id" : result[0].running_type_id,
                    "total_time" : new_time
                }
                console.log(data)
                    con.query(sql, data, function(err, result){
                        if(!err && res.statusCode == 200) {
                            //res.status(201);
                            //res.send('Data Create Successful');
                            console.log("Insert Rank Success");
                        } else {
                            //res.status(404);
                            //res.send('Not Found');
                            console.log("Insert Rank Failed");
                        }
                    });
            }else{
                console.log("error")
            }
        });
}

    var fs = require('fs');
    //var length = []
    var obj = JSON.parse(fs.readFileSync(__dirname + '/logger.json', 'utf8'));//req.body.slice()
    //var jsondata = JSON.parse(fs.readFileSync(__dirname + '/logger.json', 'utf8'));

    var interval = 500; // 2 seconds;
    var num = 0;
    for(var i=0; i< obj.length; i++){
        //var tag = obj[i].Tag_id;
        //console.log(tag);
            //var sql = "SELECT * FROM users_events_checkpoint WHERE Tagdata='"+tag[i]+"'";
        //test_select(i,obj,tag);
        setTimeout(function(i) { test_select(i,obj[i].Tag_id, function(err,data){
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
                    test_rank(obj)
                    //test_update(num,obj)
                }else{
                    if(obj[num-1].Reader == "Reader4"){
                        console.log("last reader")
                        console.log("insert new reader")
                        //test_insert_last(num,obj)
                        console.log("Starting ranking")
                        test_rank(obj)
                    }else{
                    console.log("new reader")
                    //test_insert_reader(num,obj)
                    }
                }
            }else{
                console.log("new",num)
                //test_insert(num,obj)
            }});}, interval * i, i);
    }  
    res.json(obj);
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

app.post('/select_rank', function(req, res) {

function overall_rank(tag, callback) {
    var sql =   "SET @rank=0;"
    return new Promise((resolve, reject) => {
        con.query(sql, function(err, result) {
            if (!err && res.statusCode == 200){
                //res.status(200);
                sql =   "SELECT @rank:=@rank+1 AS rank, Tagdata, running_type_id, total_time "+
                        "FROM result "+
                        "WHERE running_type_id > 1 "+
                        "ORDER BY total_time ASC";
                //console.log(sql)
                con.query(sql, function(err, result) {
                    if (!err && res.statusCode == 200){
                        console.log("ok")
                        //console.log(result)
                        for(var i=0; i< result.length; i++){
                            if(result[i].Tagdata == tag){
                                //console.log(result[i])
                                callback(null, result[i])
                            }
                        }
                        res.json(result)
                    }else{
                        console.log("error")
                    }
                });
            }
            else {
                //throw err
                //res.status(404);
                res.send('Not Found');
            }
            //res.send('OK');
            console.log(res.statusCode,res.statusMessage,"Finish overall_rank")
        });
    });
}

function gender_rank(tag, running_id, callback) {
    if(running_id >= 2 && running_id <= 8){
        console.log("boy")
        sql =   "SET @rank=0;"
            con.query(sql, function(err, result) {
                if (!err && res.statusCode == 200){
                    //res.status(200);
                    sql =   "SELECT @rank:=@rank+1 AS rank, Tagdata, running_type_id, total_time "+
                            "FROM result "+
                            "WHERE running_type_id >= 2 && running_type_id <= 8 "+
                            "ORDER BY total_time ASC";
                    con.query(sql, function(err, result) {
                        if (!err && res.statusCode == 200){
                            console.log("ok")
                            //console.log(result)
                            for(var i=0; i< result.length; i++){
                                if(result[i].Tagdata == tag){
                                    //console.log(result[i])
                                    callback(null, result[i])
                                }
                            }
                            //res.json(result)
                        }else{
                            console.log("error")
                        }
                    });
                } else {
                    //throw err
                    //res.status(404);
                    res.send('Not Found');
                }
            });
    }else if(running_id >= 9 && running_id <= 14){
        console.log("girl")
        sql =   "SET @rank=0;"
            con.query(sql, function(err, result) {
                if (!err && res.statusCode == 200){
                    //res.status(200);
                    sql =   "SELECT @rank:=@rank+1 AS rank, Tagdata, running_type_id, total_time "+
                            "FROM result "+
                            "WHERE running_type_id >= 9 && running_type_id <= 14 "+
                            "ORDER BY total_time ASC";
                    con.query(sql, function(err, result) {
                        if (!err && res.statusCode == 200){
                            console.log("ok")
                            //console.log(result)
                            //res.json(result)
                            for(var i=0; i< result.length; i++){
                                if(result[i].Tagdata == tag){
                                    //console.log(result[i])
                                    callback(null, result[i])
                                }
                            }
                        }else{
                            console.log("error")
                        }
                    });
                } else {
                    //throw err
                    //res.status(404);
                    res.send('Not Found');
                }
            });
    }
    console.log(res.statusCode,res.statusMessage,"Finish gender_rank")
}

function age_rank(tag, running_id, callback) {
    var sql =   "SET @rank=0;"
        con.query(sql, function(err, result) {
            if (!err && res.statusCode == 200){
                //res.status(200);
                console.log(running_id)
                sql =   "SELECT @rank:=@rank+1 AS rank, Tagdata, running_type_id, total_time "+
                        "FROM result "+
                        "WHERE running_type_id = '"+ running_id +"' "+
                        "ORDER BY total_time ASC";
                console.log(sql)
                con.query(sql, function(err, result) {
                    if (!err && res.statusCode == 200){
                        console.log("ok")
                        //console.log(result)
                        for(var i=0; i< result.length; i++){
                            if(result[i].Tagdata == tag){
                                //console.log(result[i])
                                callback(null, result[i])
                            }
                        }
                        //res.json(result)
                    }else{
                        console.log("error")
                    }
                });
            }
            else {
                //throw err
                //res.status(404);
                res.send('Not Found');
            }
            //res.send('OK');
            //console.log(res.statusCode,res.statusMessage)
        });
}

function get_running_id(tag,callback) {
    var sql = "SELECT running_type_id FROM result WHERE Tagdata='"+tag+"'";
        con.query(sql, function(err, result) {
            if(err){
                callback(err, null);
            }else{
                //console.log(result[0].running_type_id)
                callback(null, result[0].running_type_id);
            }
        })
}

function get_runner_data(tag,callback) {
    var sql =   "SELECT users_events_all.user_name,"+
                "s_running_type.running_type,prefix_running_number, "+
                "s_running_categories.running_cat_desc, "+
                "users_events_tag.Tagdata, "+
                "result.total_time "+
                "FROM users_events_all "+
                "LEFT JOIN s_running_type ON users_events_all.running_type_id = s_running_type.running_type_id "+
                "LEFT JOIN s_running_categories ON users_events_all.running_cat_id = s_running_categories.running_cat_id "+
                "LEFT JOIN users_events_tag ON users_events_all.txt_running_no = users_events_tag.running_no "+
                "LEFT JOIN result ON result.Tagdata = users_events_tag.Tagdata "+
                "WHERE users_events_tag.Tagdata LiKE '%"+ tag + "%'"
        con.query(sql, function(err, result) {
            if(err){
                console.log("Error")
                callback(err, null);
            }else{
                console.log(result)
                callback(null, result[0]);
            }
        })
}

    var tag = req.body.Tagdata;
    var rank = []
    //console.log(running_id)
    var running_id = get_running_id(tag, function(err, result){
        var rank = []
        var id = result
        console.log(tag,id)
        overall_rank(tag, function(err, result){
            rank.push("Overall Rank : " + result.rank)
            //console.log(rank, tag, id)
            gender_rank(tag, id, function(err, result){
                rank.push("Gender Overall Rank : " + result.rank)
                //console.log(rank)
                age_rank(tag, id, function(err, result){
                    rank.push("Age Group Rank : " + result.rank)
                    //console.log(rank)
                    get_runner_data(tag, function(err, result){
                        var runner_name = "Name : " + result.user_name
                        if(result.running_type == "M"){
                            var runner_gender = "Gender : Male"
                        }else if(result.running_type == "F"){
                            var runner_gender = "Gender : Female"
                        }
                        var age_group = "Age Group : " + result.prefix_running_number
                        var race = "Race : " + result.running_cat_desc
                        var officail_time = "Officail Time : " + result.total_time
                        console.log(runner_name)
                        console.log(runner_gender)
                        console.log(age_group)
                        console.log(race)
                        console.log(officail_time)
                        console.log(rank[0])
                        console.log(rank[1])
                        console.log(rank[2])
                    });
                });
            });
        });
    });

    //console.log(running_id)
    //overall_rank(tag);
    //gender_rank(tag);
    //age_rank(tag);
    /*var gen_rank = gender_rank(tag,function(err,data){
        if(!err){
            return data
        }else{
            return "Error"
        }
    });
    console.log()*/

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