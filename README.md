## Install and dependencies

Requires node.js installed, run

```
npm install
```

## Quick overview

In this assignment, we are asked to build a clock API that supports the basic CRUD commands (create, read, update and delete) for time data, using HTTP requests.
Personnally, I had never used JavaScript before and my prior knowledge of apps was limited to Django, which handles pretty much all of the dirty job of HTTP requests. I then gained some knowledge by working on this assignment!

Because of time constraints, I focused on shipping a functional architecture that handles every potential request. I am aware a bunch of improvements are possible - I discuss them in the next steps section.
 
Hence, I chose as a storage a simple, local dictionary. For scalability, it will be most necessary to upgrade to a mongoDB database, that is well-suited to this kind of time data and does not have all the structural constraints of SQL databases. 

### API reference

- `PUT /time/:id` -> store current time in dictionnary in UTC format at the given id
- `PUT /time/:id/:utctime` -> store time provided by the user (in format YYYY-MM-DD_HH:MM:SS*) at the given id
- `GET /time/:id/:utctime` -> return time corresponding to the id requested, in the appropriate timezone 
- `DELETE /time/:id` -> delete the time associated with the given id 



### Design choices

- The required time format to give the server in the PUT method is **YYYY-MM-DD_HH:MM:SS**. 
It is important to ask for the hour, as the current date may be DAY+1 or DAY-1 depending on the time zone. 
However, the date is stored by default in UTC time and one can request the server to give it in any time zone format.

- By default, I chose to store the time in UTC format as it is the most general format.

- The required format for the timezone in the GET method is a string representation (such as America/Los_Angeles for instance)


## Next steps

- Improve storage so it scales to large datasets. The current storage will increase the memory of the app when adding a date in hash, which is not sustainable. From what I read, I think switching to MongoDB will handle scale and fast access nicely. It might also be a great design decision since it stores data in JSON format. [Mongoose](http://mongoosejs.com/) should be a relevant choice of interface in node.js .

- Put more structure in general. As I was not too familiar with REST, I am not sure my solution %100 fits the REST philosophy/rules, in particular in error handling.

- I manually tested each route with `curl` command to make sure that my solution was functional. However, I don't think this is a reliable way to operate if we had to continue this project. Adding unittests using a node.js framework such as [Mocha](https://mochajs.org/), pairing it with the test library [Chai](http://chaijs.com/) would probably be useful and allow more contributors to understand and touch my code (FIND REST API node library)

- Deploy this clock API online! (And manage concurrent requests, secure access, etc...)



