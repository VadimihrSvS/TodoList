//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const serverless = require("serverless-http");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vadimirsvs:10012015aq@cluster0.y2f6gkt.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Items", itemsSchema);

const item1 = new Item({
  name: "Buy food"
});

const item2 = new Item({
  name: "Cook food"
});

const item3 = new Item({
  name: "Eat food"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function (req, res) {

  Item.find({}).then((result) => {
    if (result.length === 0) {
      Item.insertMany(defaultItems).then(
        (result) => {
          
        }
      ).catch(
        (err) => {
          console.log(err)
        }
      );
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  }).catch((err) => {
    console.log(err);
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  
  const list = new List({
    name: customListName,
    items: defaultItems
  });

  List.findOne({ name: list.name }).then((result) => {
    var resultName = "";
    if (result != null) {
      resultName = result.name;
    }
    if (list.name !== resultName) {
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: result.name, newListItems: result.items });
    }
  }).catch((err) => console.log(err));





});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((result) => {
      console.log(result.items);
      result.items.push(item);
      result.save();
      res.redirect("/" + listName);
    })
  }



});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(
      (result) => {
        res.redirect("/");
      }
      
    ).catch((err) => {
      console.log(err)
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then((result) => {
      
    });
    res.redirect("/" + listName);
  }

})



app.get("/about", function (req, res) {
  res.render("about");
});

app.use("/.netlify/functions/api", router);

module.exports = app;
module.exports.handler = serverless(app);

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
