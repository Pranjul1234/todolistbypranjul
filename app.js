const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Pranjul1447:Pranjul%40123@abhimongo.o5iq8su.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item!"
});

const item3 = new Item({
    name: "<-- Hit this to delete a item!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    Item.find({})
        .then((foundItems) => {

            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => {
                        // console.log("successfully inseted");
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                res.redirect("/");
            }

            else {
                res.render("list", { listTittle: "Today", newListItems: foundItems });
            }
        })
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
        List.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
    }


});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId)
            .then(() => {
                // console.log("Successfull Deleted");
                res.redirect("/");
            })
    } else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkedItemId } } }

        )
            .then(() => {
                //   console.log("Successfully deleted items");
                res.redirect("/" + listName);
            })
            .catch((error) => {
                console.log(error);
            });
    }
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then((foundList) => {
            if (!foundList) {
                // console.log("Doest Exit");
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                // console.log("Exits!");
                res.render("list", { listTittle: foundList.name, newListItems: foundList.items })
            }
        })


});

app.get("/about", function (req, res) {
    res.render("about");
})

app.listen(process.env.PORT || 3000, function () {

    console.log("The servr has started on port 3000");
});



// mongodb+srv://Pranjul1447:Pranjul%40123@abhimongo.o5iq8su.mongodb.net