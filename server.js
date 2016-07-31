var express = require("express");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'jade');


app.get('/', function(req, res){
  //TODO: index.htmlをメインファイルに書きかえる
  res.sendfile('index.html');
});

//カウンター。happyとかsadとかをカウントする
//すべてのクライアントが、websocketを介してこのカウンターを共有するようにする
var counts = {
  happy: 0,
  sad: 0,
  //...etc
}

io.on('connection', function(socket){
  socket.on('fetch', function(){
    socket.emit("fetch", JSON.stringify(counts));
  });
  
  socket.on('update', function(emotion){
    //emotionとして、テキストで"sad"などのデータを送る
    //emotionは、countsの中に値がないといけない（上例だと、happyかsad）
    //emotionとして送られてきたもののカウントを増やす
    counts[emotion]++;
    //何のカウントがいくつになったのかをnextCountsとして送る
    var nextCounts = {};
    nextCounts[emotion] = counts[emotion];
    io.emit("update", JSON.stringify(nextCounts));
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
