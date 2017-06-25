var app = require('express')();
var port = process.env.PORT || 7777;
var mysql =  require('mysql');
var path = require('path');
var fs = require('fs');
var con = mysql.createConnection({
	    host: "localhost",
	    user: "root",
	    password: "",
	    database: "kmutnb_running"
	});
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
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
        console.log(res.statusCode,res.statusMessage);
    });
});

app.get('/:id', function(req, res) {
	var id = req.params.id;
    var sql = "SELECT * FROM users_events_checkpoint WHERE Tagdata='" + id + "'";
    con.query(sql, function(err, result) {
        if (!err && res.statusCode == 200){
            //res.json(result);
            res.status(200);
            res.json(result);
        } else {
            //throw err
            res.status(404);
            res.send('Not Found');
        }
        console.log(res.statusCode, res.statusMessage);
    });
});

app.post('/', function(req, res) {
	var list_req = JSON.parse(fs.readFileSync(__dirname + '/logger.json', 'utf8'));
	var list_select = JSON.parse(fs.readFileSync(__dirname + '/logger.json', 'utf8'));
	len = list_req.length;
	for (var i = 0; i < len; i++) {
	    sql = "SELECT * FROM users_events_checkpoint WHERE Tagdata='"+ list_req[0].Tag_id +"'";
	    con.query(sql, function (err, result) {
			if(result.length > 0){
		    	var send_data = {
		    		"Tagdata" : list_select[0].Tag_id,
					"time_lapse" : list_select[0].time,
					"Reader_id" : list_select[0].Reader,
					// "update_on" : dateFormat(now, "yyyy-mm-dd HH:MM:ss")
				};
				sql = "UPDATE users_events_checkpoint SET ? WHERE Tagdata=?";
		        con.query(sql, [send_data, list_select[0].Tag_id], function (err, result) {
					if (!err && res.statusCode == 200){
				        console.log("Success");
				    } else {
				        console.log("Failed");
				    }
				});
		    } else {
		    	console.log('INSERT');
		    	console.log(list_select[0]);
		    	var send_data = {
					"Tagdata" : list_select[0].Tag_id,
					"time_lapse" : list_select[0].time,
					"Reader_id" : list_select[0].Reader,
					// "create_on" : dateFormat(now, "yyyy-mm-dd HH:MM:ss"),
					// "update_on" : dateFormat(now, "yyyy-mm-dd HH:MM:ss")
				};
				sql = 'INSERT INTO users_events_checkpoint SET ?'
		        con.query(sql, send_data, function (err, result) {
				    if (!err && res.statusCode == 200){
				        console.log("Success");
				    } else {
				        console.log("Failed");
				    }
				});
		    }
		    list_select.shift();
		});
		list_req.shift();
	}
	res.send("Complete\n");
});

app.listen(port, function() {
    console.log('Starting node.js on port ' + port);
});