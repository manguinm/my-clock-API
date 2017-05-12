var restify = require('restify');
var plugins = require('restify-plugins');
// Moment library for dates in javascript https://momentjs.com/
// Also the same handling timezones https://momentjs.com/timezone/
var moment = require('moment-timezone');

// Simple storage that is a dictionnary now and should be improved by migrating to a mongoDB database or equivalent
var times = {};

var timeZones = new Set(moment.tz.names());

var server = restify.createServer({ // difference between var and const ?
  name: 'myclockapp',
  version: '1.0.0'
});
server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
server.use(plugins.bodyParser());

// GET request at localhost:port/echo/:name
// For the arguments we have:
// req = the request you received
// res = the result you want to send back to your user
// next = the function to call when it's done
server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return  next();
});

server.put('/time/:id', function(req, res, next) {

    // Verify that the id is valid e.g. is a number
  // Return Error see REST API Error 200
  //if (typeof req.params.id == 'number') {
  var id = req.params.id;
  if (isNaN(id)== false) {  

    // Verify that id not already used in storage
    if (times[id] != undefined) {

      // Return error : id already used
      return next(new restify.errors.ConflictError('This id is already used in storage. Try another id. If you want to replace the time associated with, you should delete it before.'));
    
    } else {
      // Add the current date with the id in the storage
      //var date = moment.tz(moment.now(), "America/Los_Angeles").format();
      var date = moment.utc().format();
      times[id] = date;

      // Tell user it worked
      res.send('Added time (default now) with success!');
      return next();
    }

  } else {
    return next(new restify.errors.InvalidArgumentError('The ID must be a number.'));
  }  
    
});

server.put('/time/:id/:utctime', function(req, res, next) {

  // Verify that the id is valid, e.g. is a number AND NOT ALREADY IN THE SET
  var id = req.params.id;
  // Verify that id not already used in storage
  if (times[id] == undefined) {

    if (isNaN(id)== false) {  
  
      // Verify that the date format is ok, e.g. must be in YYYY-MM-JJ_HH:MM:SS format.
      var regextime = /^[0-9]{4}[\-]{1}[0-9]{2}[\-]{1}[0-9]{2}[\_]{1}[0-9]{2}[\:]{1}[0-9]{2}[\:]{1}[0-9]{2}$/g
      var utctime = req.params.utctime;
      if (regextime.test(utctime) == true) {

        // Add the given utc date to the storage
        // By default, add it in the UTC format timezone
        var date = utctime.replace('_', ' '); 
        times[id] = moment.tz(date, 'UTC').format();;
  
        // Tell user it worked
        res.send('Added your custom time with success!');
        return next();

      } else {
        // Return format error if incorrect date
        return next(new restify.errors.InvalidContentError('Format error : Your date should be in YYYY-MM-JJ format.'));
      } 

    // Return id is not valid  
    } else {
      return next(new restify.errors.InvalidArgumentError('The ID must be a number.'));
    } 

  // Return id already in storage
  } else {
    return next(new restify.errors.ConflictError('This id is already used in storage. Try another id. If you want to replace the time associated with, you should delete it before.'));
  }    

});  

  
server.get(/time\/([0-9]*)\/(.*)/, function(req, res, next) {

  if (Object.keys(req.params) < 2) { // missing timezone
    return next(new restify.errors.MissingParameterError('There are not enough arguments, I need both an ID and a timezone to answer you.'));

  } else {
    var id = req.params[0]; 
    var zone = req.params[1];

    // Check if id is valid
    if (isNaN(id) == false) {

      // Check if id in storage
      if (times[id] !== undefined){



        if (timeZones.has(zone)){
        // Get the date for the given id (if id exists)
        var UTCdate = times[id];
        var zoneDate = moment.tz(UTCdate, zone).format(); 

        // Send result to user
        res.send({time: zoneDate});
        return next();
        
        } else {
          // timezone does not exist
          return next(new restify.errors.InvalidContentError('This timezone does not exist. Try one of the following from http://en.wikipedia.org/wiki/List_of_tz_database_time_zones'));

        }
      
      } else {

        // id not in storage
        return next(new restify.errors.NotFoundError('This ID does not exist.'));

      }  
      

    } else {
      //res.send('The ID must be a number.');
      return next(new restify.errors.InvalidArgumentError('The ID must be a number.'));
    }
  }

});

// server.get('/time/:id/:zone', function(req, res, next) {
//   var id = req.params.id;
//   var zone = req.params.zone;

//   // var regex_zone = /^[a-zA-Z]+[\/][a-zA-Z_]+(?:[\/][a-zA-Z_]+)?$/


//   // Verify that the zone format is the one you ways-segments
//   if (timeZones.has(zone)){
//     // Get the date for the given id (if id exists)
//     var UTCdate = times[id];
//     var zoneDate = moment.tz(UTCdate, zone).format(); 

//     // Send result to user
//     res.send({time: zoneDate});
//     return next();
//   }
//   else {
//     res.send('This is not a valid existing timezone.')
//     // choose between this list:
//     return next();

//   }

// });

server.del('/time/:id', function(req, res, next) {
  var id = req.params.id;
  // Check if id is valid
  if (isNaN(id) == false) {

    // Check if id in storage
    if (times[id] !== undefined){

      // Remove from dictionnary storage
      delete times[id];
      // Tell user it worked
      res.send('Deleted successfully the time object with ' + id);
      return next();

    } else {

      return next(new restify.errors.NotFoundError('This ID does not exist.'));
    }

  } else  {
    return next(new restify.errors.InvalidArgumentError('The ID must be a number.'));
  }  

});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
