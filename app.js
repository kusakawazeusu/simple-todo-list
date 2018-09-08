const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const listJsonPath = "lists.json";
const encoding = "utf8";

// Middleware for adding cors headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH");
  next();
});

app.get("/lists", function(req, res) {
  let lists = getLists();
  if (lists.error) {
    res.status(lists.errCode).json(lists.error);
    return;
  }
  res.json(lists);
});

app.get("/lists/:id", function(req, res) {
  let lists = getLists(req.params.id);
  if (lists.error) {
    res.status(lists.errCode).json(lists.error);
    return;
  }
  res.json(lists);
});

app.post("/lists", bodyParser.json(), function(req, res) {
  if (!req.body.todo) {
    res.status(400).json({
      message: "Bad input: todo"
    });
    return;
  }

  let lists = checkFileExists();

  lists.data.push({
    todo: req.body.todo,
    id: lists.next_index++,
    checked: false
  });

  fs.writeFileSync(listJsonPath, JSON.stringify(lists));
  res.send("OK");
});

app.patch("/lists/:id", function(req, res) {
  let lists = checkFileExists();
  checkedItemIndex = lists.data.findIndex(list => list.id == req.params.id);

  if (checkedItemIndex === -1) {
    res.status(400).json({
      message: "Item not found"
    });
    return;
  }

  lists.data[checkedItemIndex].checked = !lists.data[checkedItemIndex].checked;
  fs.writeFileSync(listJsonPath, JSON.stringify(lists));
  res.send("OK");
});

var server = app.listen(3000, function() {
  // console.log("Server started at ", new Date());
});

/*
Read json from file.
If id is specific, return a single list item.
Or return all list items.
*/
function getLists(id = false) {
  let lists = checkFileExists().data;

  if (id) {
    lists = lists.find(list => list.id == id);
  }

  if (!lists)
    return {
      errCode: 400,
      error: { message: "Item not found" }
    };

  return {
    result: lists,
    count: id ? 1 : lists.length
  };
}

function checkFileExists() {
  try {
    return JSON.parse(fs.readFileSync(listJsonPath, encoding));
  } catch (err) {
    return {
      errCode: 500,
      error: { message: "Error occurred while reading file." }
    };
  }
}

module.exports = server;
