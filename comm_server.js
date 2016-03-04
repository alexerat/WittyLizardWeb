var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PHPUnserialize = require('php-unserialize');
var parseCookie = require('cookie-parser');
var mysql      = require('mysql');

var my_sql_pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'nevermore!123',
  database : 'Online_Comms'
});

var txt_io = io.of('/text');
var med_io = io.of('/media');
var bor_io = io.of('/board');

app.use(parseCookie('7e501ffeb426888ea59e63aa15b931a7f9d28d24'));

//Media signalling server
med_io.on('connection', function(socket)
{
    var params = socket.handshake.query;

    var extra = {};
    var isPublic = false;

    var sessData;
    var dataStr;
    var userID;
    var username;
    var roomID;
    var sessID;
    var isConnected = false;
    var ScalableBroadcast;

    console.log('MEDIA: User Connecting.....');
    sessID = socket.handshake.headers.cookie.split("PHPSESSID=")[1].split(";")[0];

    //Disconnect if no room join is attempted within a minute. Prevent spamming.
    joinTimeout = setTimeout(function()
    {
        console.log('MEDIA: Connection Timeout.');
        socket.disconnect();
    }, 60000);

    my_sql_pool.getConnection(function(err, connection)
    {
        connection.query('USE Users');
        connection.query('SELECT Session_Data FROM User_Sessions WHERE Session_ID = ?', [sessID], function(err, rows)
        {
            if (!err)
            {
                if (rows[0])
                {
                    sessBuff = new Buffer(rows[0].Session_Data);
                    sessData = sessBuff.toString('utf-8');
                    sessData = sessData.slice(sessData.indexOf('userId";i:') + 10, -1);
                    sessData = sessData.slice(0, sessData.indexOf(';'));
                    userID = parseInt(sessData);

                    connection.query('SELECT Username FROM User_Table WHERE User_ID = ?', [userID], function(err, rows)
                    {
                        if (!err)
                        {
                            if (rows[0])
                            {
                                username = rows[0].Username;

                                connection.query('USE Online_Comms');
                                connection.query('UPDATE Room_Participants SET Socket_ID = ?, Username = ? WHERE User_ID = ?', [socket.id, username, userID], function(err, rows)
                                {
                                    if (!err)
                                    {
                                        socket.emit('READY');
                                        connection.release();
                                        console.log('MEDIA: User ' + userID + ' passed initial connection.');
                                    }
                                    else
                                    {
                                        connection.release();
                                        socket.disconnect();
                                        console.log('MEDIA: Error setting socket ID in database.');
                                        return;
                                    }
                                });
                            }
                            else
                            {
                                connection.release();
                                socket.disconnect();
                                console.log('MEDIA: User ' + connection.escape(userID) +  ' not found.');
                                return;
                            }
                        }
                        else
                        {
                            connection.release();
                            socket.disconnect();
                            console.log('MEDIA: Error while performing user Query. ' + err);
                            return;
                        }
                    });

                    socket.userid = userID;
                }
                else
                {
                    connection.release();
                    socket.disconnect();
                    console.log('MEDIA: Session ' + connection.escape(sessData) +  ' not found.');
                    return;
                }
            }
            else
            {
                connection.release();
                socket.disconnect();
                console.log('MEDIA: Error while performing session Query. ' + err);
                return;
            }


        });
    });

    if (params.enableScalableBroadcast)
    {
        if (!ScalableBroadcast)
        {
            ScalableBroadcast = require('./Scalable-Broadcast.js');
        }
        var singleBroadcastAttendees = params.singleBroadcastAttendees;
        ScalableBroadcast(socket, singleBroadcastAttendees);
    }

    socket.on('disconnect', function ()
    {
        try
        {

        }
        catch (e)
        {

        }
        finally
        {

        }
    });

    socket.on('GETID', function(extra)
    {
        try
        {
            console.log('Notifying user ' + userID + ' of their ID.');
            socket.emit('USERID', userID);
        }
        catch (e)
        {

        }
    });

    socket.on('JOIN-ROOM', function(roomToken)
    {
        var startTime;
        var sessLength;

        try
        {
            console.log('MEDIA: User ' + userID + ' joining room ' + roomToken + '.......');

            my_sql_pool.getConnection(function(err, connection)
            {
                processJoinMed = function()
                {
                    socket.on('LEAVE', function()
                    {
                        try
                        {
                            var clients = io.sockets.adapter.rooms[roomID];
                            for (var clientId in clients)
                            {
                                var clientSocket = io.sockets.connected[clientId];

                                //Tell the new user about everyone else
                                clientSocket.emit('LEAVE', userID);
                            }

                            socket.leave(roomID);
                        }
                        catch (e)
                        {

                        }
                        finally
                        {
                            my_sql_conn.end();
                        }
                    });

                    socket.on('RTC-Message', function(message, callback)
                    {
                        try
                        {
                            console.log(socket.id + ' Fowarding message to ' + message.remoteId + " User ID: " + message.payload.userId);
                            socket.broadcast.to(message.remoteId).emit(message.type, message.payload);
                        }
                        catch (e)
                        {

                        }
                    });


                    //Tell all those in the room that a new user joined
                    med_io.to(roomID).emit('JOIN', userID, username, socket.id);

                    if(med_io.adapter.rooms[roomID])
                    {
                        var clients = med_io.adapter.rooms[roomID].sockets;
                        console.log('Clients: ' + clients);
                        for (client in clients)
                        {
                            console.log('Querying ' + client);
                            // Tell the new user about everyone else
                            connection.query('SELECT User_Id, Username, Socket_ID FROM Room_Participants WHERE Socket_ID = ?', [client], function(err, rows)
                            {
                                if (!err)
                                {
                                    if(rows[0])
                                    {
                                        socket.emit('JOIN', rows[0].User_Id, rows[0].Username, rows[0].Socket_ID);
                                    }
                                    else
                                    {
                                        console.log('MEDIA: HERE. Error querying session participants.');
                                        return;
                                    }
                                }
                                else
                                {
                                    console.log('MEDIA: Error querying session participants.' + err);
                                    return;
                                }
                            });
                        }
                    }

                    //New user joins the specified room
                    socket.join(roomID);

                    var currTime = new Date();

                    setTimeout(function()
                    {
                        console.log('Session ending. Start time: ' + startTime + ', Length: ' + sessLength + ', Current Time: ' + currTime);
                        console.log('Expected end: ' + ((startTime.getTime() + sessLength + 600000) - currTime.getTime()));
                        socket.emit('SESSEND');
                        socket.disconnect();
                    }, (startTime.getTime() + sessLength + 600000) - currTime.getTime());
                    setTimeout(function()
                    {
                        socket.emit('SESSWARN', 'Session ending in 5 minutes.');
                    }, (startTime + sessLength + 300000) - currTime);
                    setTimeout(function()
                    {
                        socket.emit('SESSEND', 'Session ending in 1 minute.');
                    }, (startTime + sessLength + 540000) - currTime);

                    socket.emit('CONNOK');
                    clearTimeout(joinTimeout);

                    console.log('MEDIA: User ' + userID + ' successfully joined room ' + roomID + '.');
                };

                chkSessionMed = function(err, rows, fields)
                {
                    if (!err)
                    {
                        if (rows[0])
                        {

                            if (rows[0].Start_Time && rows[0].Session_Length)
                            {
                                startTime = rows[0].Start_Time;
                                sessLength = rows[0].Session_Length;

                                // TODO: Add time checks.

                                if (rows[0].Host_Join_Time)
                                {
                                    processJoinMed();
                                }
                            }
                            else
                            {
                                socket.emit('ERROR', 'Session failed to start.');
                                console.log('MEDIA: Session failed to start.');
                                socket.disconnect();
                            }
                        }
                        else
                        {
                            socket.emit('ERROR', 'DATABASE ERROR: Unexpected Result.');
                            console.log('MEDIA: Session time produced an unexpected result.');
                            socket.disconnect();
                        }
                    }
                    else
                    {
                        socket.emit('ERROR', 'DATABASE ERROR: Session Check. ' + err);
                        console.log('MEDIA: Error while performing session query. ' + err);
                        socket.disconnect();
                    }
                };

                chkParticipantMed = function(err, rows, fields)
                {
                    if (!err)
                    {
                        if (rows[0])
                        {
                            connection.query('SELECT Start_Time, Session_Length, Host_Join_Time FROM Tutorial_Room_Table WHERE Room_ID = ?', [roomID], chkSessionMed);
                        }
                        else
                        {
                            socket.emit('ERROR', 'User not allowed.');
                            console.log('MEDIA: User not permitted to this session.');
                            socket.disconnect();
                        }
                    }
                    else
                    {
                        socket.emit('ERROR', 'DATABASE ERROR: Participant Check. ' + err);
                        console.log('MEDIA: Error while performing participant query. ' + err);
                        socket.disconnect();
                    }

                };

                findRoomMed = function(err, rows, fields)
                {
                    if (!err)
                    {
                        if (rows[0])
                        {
                            roomID = rows[0].Room_ID;
                            connection.query('SELECT * FROM Room_Participants WHERE Room_ID = ? AND User_ID = ?', [roomID, userID], chkParticipantMed);
                        }
                        else
                        {
                            socket.emit('ERROR', 'Room does not exist.');
                            console.log('MEDIA: Room ' + connection.escape(roomToken) + ' does not exist.');
                            socket.disconnect();
                        }
                    }
                    else
                    {
                        socket.emit('ERROR', 'DATABASE ERROR: Room Check. ' + err);
                        console.log('MEDIA: Error while performing room query. ' + err);
                        socket.disconnect();
                    }
                };

                connection.query('USE Online_Comms');
                connection.query('SELECT Room_ID FROM Tutorial_Room_Table WHERE Access_Token = ?', [roomToken], findRoomMed);
                connection.release();
            });
        }
        catch (e)
        {
            socket.emit('ERROR');
            socket.disconnect();
            console.log('MEDIA: Error while attempting join-room, Details: ' + e);
        }
        finally
        {

        }
    });
});

txt_io.on('connection', function(socket)
{
    var params = socket.handshake.query;

    if(roomID && userID)
    {

        //New user joins the specified room
        socket.join(roomID);

        //Get Username
        my_sql_pool.getConnection(function(err, connection)
        {
            connection.query('USE Users');
            connection.query('SELECT Username FROM User_Table WHERE User_ID = ?', [Room_ID, userID, data], function(err, rows, fields)
            {
                if (!err)
                {
                    if (rows[0])
                    {
                        //Tell all those in the room that a new user joined
                        socket.broadcast.to(roomID).emit('user-joined', username);

                        connection.query('USE Online_Comms');
                        connection.query('SELECT Chat_Data FROM Chat_Space WHERE Room_ID = ?', [Room_ID], function(err, rows, fields)
                        {
                            for (var i in rows)
                            {
                                socket.emit('new-message', rows[i].Chat_Data);
                            }
                        });
                    }
                    else
                    {
                        socket.emit('ERROR', 'Failed to establish connection.')
                        socket.disconnect();
                        console.log('ERROR: Failed to find data to connect to text.');
                    }
                }
                else
                {
                    socket.emit('ERROR', 'Failed to establish connection.')
                    socket.disconnect();
                    console.log('ERROR: Failed to find data to connect to text.');
                }
            });
            connection.release();
        });

        //Listens for a new chat message
        socket.on('new-message', function(data)
        {
            my_sql_pool.getConnection(function(err, connection)
            {
                connection.query('INSERT INTO Chat_Space(Room_ID, User_ID, Post_Time, Chat_Data) VALUES(?, ?, CURRENT_TIMESTAMP, ?)', [Room_ID, userID, data], function(err, rows, fields)
                {
                    if (err)
                    {
                        console.log('Error while performing Query.');
                    }
                });

                connection.release();
            });

            //Send message to those connected in the room
            socket.to(roomID).emit('message-created', data);
        });
    }
    else
    {
        socket.emit('ERROR', 'Failed to establish connection.')
        socket.disconnect();
        console.log('ERROR: Failed to find data to connect to text.');
    }
});

bor_io.on('connection', function(socket)
{
    var params = socket.handshake.query;
    var sessData;
    var dataStr;
    var userID;
    var username;
    var roomID;
    var sessID;
    var isConnected = false;
    var startTime;
    var sessLength;
    var msgTimeouts = [];
    var recievedPoints = [];
    var numRecieved = [];
    var numPoints = [];
    var currId;
    var self = this;


    console.log('BOARD: User Connecting.....');
    sessID = socket.handshake.headers.cookie.split("PHPSESSID=")[1].split(";")[0];

    //Disconnect if no room join is attempted within a minute. Prevent spamming.
    joinTimeout = setTimeout(function()
    {
        console.log('BOARD: Connection Timeout.');
        socket.disconnect();
    }, 60000);

    my_sql_pool.getConnection(function(err, connection)
    {
        connection.query('USE Users');
        connection.query('SELECT Session_Data FROM User_Sessions WHERE Session_ID = ?', [sessID], function(err, rows)
        {
            if (!err)
            {
                if (rows[0])
                {
                    sessBuff = new Buffer(rows[0].Session_Data);
                    sessData = sessBuff.toString('utf-8');
                    sessData = sessData.slice(sessData.indexOf('userId";i:') + 10, -1);
                    sessData = sessData.slice(0, sessData.indexOf(';'));
                    userID = parseInt(sessData);

                    connection.query('SELECT Username FROM User_Table WHERE User_ID = ?', [userID], function(err, rows)
                    {
                        if (!err)
                        {
                            if (rows[0])
                            {
                                username = rows[0].Username;
                                socket.emit('READY');
                                console.log('BOARD: User ' + userID + ' passed initial connection.');
                            }
                            else
                            {
                                connection.disconnect();
                                console.log('BOARD: User ' + connection.escape(userID) +  ' not found.');
                                return;
                            }
                        }
                        else
                        {
                            connection.disconnect();
                            console.log('BOARD: Error while performing user Query. ' + err);
                        }
                    });

                    socket.userid = userID;
                }
                else
                {
                    connection.disconnect();
                    console.log('BOARD: Session ' + connection.escape(sessData) +  ' not found.');
                    return;
                }
            }
            else
            {
                connection.disconnect();
                console.log('BOARD: Error while performing session Query. ' + err);
            }
        });

        connection.release();
    });

    socket.on('disconnect', function ()
    {
        try
        {

        }
        catch (e)
        {

        }
        finally
        {

        }
    });

    socket.on('JOIN-ROOM', function(roomToken)
    {
        try
        {
            console.log('BOARD: User ' + userID + ' joining room ' + roomToken + '.......');

            my_sql_pool.getConnection(function(err, connection)
            {
                sendDataBor = function(err, rows, fields)
                {
                    if (err)
                    {
                        console.log('BOARD: Error while performing Query.');
                    }
                    else
                    {
                        my_sql_pool.getConnection(function(err2, connection2)
                        {
                            // Send connecting user all data to date.
                            var i;
                            var data = rows;
                            for(i = 0; i < rows.length; i++)
                            {
                                socket.emit('CURVE', {id: data[i].Local_ID, num_points: data[i].Num_Control_Points, colour: data[i].Colour, serverId: data[i].Entry_ID, userId: data[i].User_ID});

                                connection2.query('SELECT * FROM Control_Points WHERE Entry_ID = ?', [data[i].Entry_ID], function(perr, prows, pfields)
                                {
                                    if (perr)
                                    {
                                        console.log('BOARD: Error while performing Query.');
                                    }
                                    else
                                    {
                                        var j;
                                        for(j = 0; j < prows.length; j++)
                                        {
                                            socket.emit('POINT', {id: prows[j].Entry_ID, num: prows[j].Seq_Num, x: prows[j].X_Loc, y: prows[j].Y_Loc});
                                        }
                                    }
                                });
                            }
                            connection2.release();
                        });
                        connection.release();
                    }
                }

                processJoinBor = function()
                {
                    connection.query('SELECT * FROM Whiteboard_Space WHERE Room_ID = ?', [roomID], sendDataBor);

                    socket.on('LEAVE', function()
                    {
                        try
                        {
                            socket.leave(roomID);
                        }
                        catch (e)
                        {

                        }
                        finally
                        {
                            my_sql_conn.end();
                        }
                    });

                    // Listens for a new curve, tells user which ID to assign it to and makes sure everyhting is set to recieve the full curve.
                    // 'Points' are dealt with as curves with only a single control point.
                    socket.on('CURVE', function(data)
                    {
                        my_sql_pool.getConnection(function(err2, connection2)
                        {
                            if(typeof(data.id) != 'undefined' && data.num_points && data.colour)
                            {
                                connection2.query('USE Online_Comms');
                                connection2.query('INSERT INTO Whiteboard_Space(Room_ID, User_ID, Local_ID, Edit_Time, Num_Control_Points, Colour) VALUES(?, ?, ?, CURRENT_TIMESTAMP, ?, ?)', [roomID, userID, data.id, data.num_points, data.colour], function(err, result)
                                {
                                    if (err)
                                    {
                                        console.log('BOARD: Error while performing Query.');
                                    }
                                    else
                                    {
                                        numRecieved[result.insertId] = 0;
                                        numPoints[result.insertId] = data.num_points;
                                        currId = result.insertId;
                                        recievedPoints[result.insertId] = [];

                                        // Tell the user the ID to assign points to.
                                        socket.emit('CURVEID', {serverId: result.insertId, localId: data.id});

                                        data.serverId = result.insertId;
                                        data.userId = userID;

                                        socket.broadcast.to(roomID).emit('CURVE', data);

                                        // Set a 1 min timeout to inform the client of missing points.
                                        msgTimeouts[result.insertId] = setInterval(function()
                                        {
                                            var i;
                                            for(i = 0; i < numPoints[result.insertId]; i++)
                                            {
                                                if(!recievedPoints[result.insertId][i])
                                                {
                                                    socket.emit('MISSED', {curve: currId, point: i});
                                                }
                                            }
                                        }, 60000);
                                    }
                                });
                            }
                            connection2.release();
                        });
                    });

                    //Listens for points as part of a curve, must recive a funn let from the initiation.
                    socket.on('POINT', function(data)
                    {
                        my_sql_pool.getConnection(function(err2, connection2)
                        {
                            if(!recievedPoints[data.id][data.num])
                            {
                                connection2.query('USE Online_Comms');
                                connection2.query('INSERT INTO Control_Points(Entry_ID, Seq_Num, X_Loc, Y_Loc) VALUES(?, ?, ?, ?)', [data.id, data.num, data.x, data.y], function(err, rows, fields)
                                {
                                    if (err)
                                    {
                                        console.log('ID: ' + data.id);
                                        console.log('BOARD: Error while performing Query. ' + err);
                                    }
                                    else
                                    {
                                        socket.to(roomID).emit('POINT', data);
                                        recievedPoints[data.id][data.num] = true;
                                        numRecieved[data.id]++;

                                        if(numRecieved[data.id] == numPoints[data.id])
                                        {
                                            // We recived eveything so clear the timeout and give client the OK.
                                            clearInterval(msgTimeouts[data.id]);
                                        }
                                    }
                                    connection2.release();
                                });
                            }
                        });
                    });

                    // Listen for cliets requesting missing data.
                    socket.on('MISSING', function(data)
                    {
                        my_sql_pool.getConnection(function(err2, connection2)
                        {
                            connection2.query('USE Online_Comms');
                            connection2.query('SELECT X_Loc, Y_Loc FROM Control_Points WHERE Entry_ID = ? AND Seq_Num = ?', [data.id, data.seq_num],  function(err, rows, fields)
                            {
                                if (err)
                                {
                                    console.log('BOARD: Error while performing Query.');
                                }
                                else
                                {
                                    if(rows[0])
                                    {
                                        var retData = {id: data.id, num: data.seq_num, x: rows[0].X_Loc, y: rows[0].Y_Loc};
                                        socket.emit('POINT', retData);
                                    }
                                }
                                connection2.release();
                            });
                        });
                    });

                    // Listen for cliets recieving points without curve.
                    socket.on('UNKNOWN', function(curveId)
                    {
                        my_sql_pool.getConnection(function(err2, connection2)
                        {
                            connection2.query('USE Online_Comms');
                            // Send client curve data if available, client may then request missing points.
                            connection2.query('SELECT Room_ID, User_ID, Local_ID, Num_Control_Points, Colour FROM Whiteboard_Space WHERE Entry_ID = ? AND Room_ID = ?', [curveId, roomID],  function(err, rows, fields)
                            {
                                if (err)
                                {
                                    console.log('BOARD: Error while performing Query.');
                                }
                                else
                                {
                                    if(rows[0])
                                    {
                                        var retData = {serverId: curveId, userId: rows[0].User_ID, id: rows[0].Local_ID, num_points: rows[0].Num_Control_Points, colour: rows[0].Colour};
                                        socket.emit('CURVE', retData);
                                    }
                                }
                                connection2.release();
                            });
                        });
                    });

                    //New user joins the specified room
                    socket.join(roomID);

                    var currTime = new Date();
                    setTimeout(function()
                    {
                        socket.disconnect();
                    }, (startTime.getTime() + sessLength + 600000) - currTime.getTime());

                    socket.emit('CONNOK');
                    clearTimeout(joinTimeout);

                    console.log('BOARD: User ' + userID + ' successfully joined room ' + roomID + '.');
                };

                chkSessionBor = function(err, rows, fields)
                {
                    if (!err)
                    {
                        if (rows[0])
                        {

                            if (rows[0].Start_Time && rows[0].Session_Length)
                            {
                                startTime = rows[0].Start_Time;
                                sessLength = rows[0].Session_Length;

                                // TODO: Add time checks.

                                if (rows[0].Host_Join_Time)
                                {
                                    processJoinBor();
                                }
                            }
                            else
                            {
                                socket.emit('ERROR', 'Session failed to start.');
                                console.log('BOARD: Session failed to start.');
                                socket.disconnect();
                            }
                        }
                        else
                        {
                            socket.emit('ERROR', 'DATABASE ERROR: Unexpected Result.');
                            console.log('BOARD: Session time produced an unexpected result.');
                            socket.disconnect();
                        }
                    }
                    else
                    {
                        socket.emit('ERROR', 'DATABASE ERROR: Session Check. ' + err);
                        console.log('BOARD: Error while performing session query. ' + err);
                        socket.disconnect();
                    }
                };

                chkParticipantBor = function(err, rows, fields)
                {
                    if (!err)
                    {
                        if (rows[0])
                        {
                            connection.query('SELECT Start_Time, Session_Length, Host_Join_Time FROM Tutorial_Room_Table WHERE Room_ID = ?', [roomID], chkSessionBor);
                        }
                        else
                        {
                            socket.emit('ERROR', 'User not allowed.');
                            console.log('BOARD: User not permitted to this session.');
                            socket.disconnect();
                        }
                    }
                    else
                    {
                        socket.emit('ERROR', 'DATABASE ERROR: Participant Check. ' + err);
                        console.log('BOARD: Error while performing participant query. ' + err);
                        socket.disconnect();
                    }

                };

                findRoomBor = function(err, rows, fields)
                {
                    if (!err)
                    {
                        if (rows[0])
                        {
                            roomID = rows[0].Room_ID;
                            connection.query('SELECT * FROM Room_Participants WHERE Room_ID = ? AND User_ID = ?', [roomID, userID], chkParticipantBor);
                        }
                        else
                        {
                            socket.emit('ERROR', 'Room does not exist.');
                            console.log('BOARD: Room ' + connection.escape(roomToken) + ' does not exist.');
                            socket.disconnect();
                        }
                    }
                    else
                    {
                        socket.emit('ERROR', 'DATABASE ERROR: Room Check. ' + err);
                        console.log('BOARD: Error while performing room query. ' + err);
                        socket.disconnect();
                    }
                };

                connection.query('USE Online_Comms');
                connection.query('SELECT Room_ID FROM Tutorial_Room_Table WHERE Access_Token = ?', [roomToken], findRoomBor);
            });
        }
        catch (e)
        {
            socket.emit('ERROR');
            socket.disconnect();
            console.log('BOARD: Error while attempting join-room, Details: ' + e);
        }
        finally
        {

        }
    });

});

http.listen(9001, function()
{
    console.log("Server listening at", "*:" + 9001);
});
