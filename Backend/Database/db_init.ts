//here we close all connections to the db. Maybe we could keep a connection open (singleton like) and use it through the whole application

const {MongoClient} = require('mongodb');
import * as user from './User';
import * as food from './Food';
import * as table from './Table';
import * as order from './Order';
import * as mongoose from 'mongoose';

//first, we connect to the cluster
//Use MongoClient because mongoose gave problem getting the list of databases in the cluster. even if it's possible to use it for this purpose
const clusterURI = 'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(clusterURI);
const dbURI = 'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority';

client.connect()
.then(() => {
    searchDB(client)
})

//we collect the databases present in the cluster and search for RESTaurant_db. If is not present, we create it and its collections
function searchDB(client){
    client.db().admin().listDatabases()
    .then((list) => {
        let isDBPresent = false;
        list.databases.forEach(db => {
            if(db.name === 'RESTaurant_db')
                isDBPresent = true;
        });
        if(!isDBPresent)
            createDB();
        else
            console.log("DB already initialized");
     }).then(() => { client.close(); });
}

function createDB(){
    console.log("DB not found, let's create it");

    //by simply connecting to the db, we create it
    mongoose.connect(dbURI)
    .then(() => {
        user.userModel.createCollection()
        .then(() => {
            console.log("Collection Users created")
            table.tableModel.createCollection()
            .then(() => {
                console.log("Collection Tables created");
                food.foodModel.createCollection()
                .then(() => {
                    console.log("Collection Foods created");
                    order.orderModel.createCollection()
                    .then(() => {
                        console.log("Collection Orders created");
                        populateUsers.then(() => {
                            populateTables.then(() => {
                                populateFoods.then(() => {
                                    mongoose.connection.close();
                                    console.log("Connection closed")
                                })
                            });
                        });
                    });
                });
            });
        });
    });
}    

let populateUsers = new Promise(function(resolve, reject){
    let my_user = user.newUser({
        email: 'pippo@gmail',
        name: 'pippo',
        role: user.roleTypes.ADMIN
      });
      my_user.setPassword('123456');
      my_user.save();
      console.log("Users populated")
});

let populateTables = new Promise(function(resolve, reject){
    let my_table1 = table.newTable({
        number: 1,
        capacity: 2,
    });
    let my_table2 = table.newTable({
        number: 2,
        capacity: 2,
    });
    let my_table3 = table.newTable({
        number: 3,
        capacity: 4
    });
    let my_table4 = table.newTable({
        number: 4,
        capacity: 4
    });
    let my_table5 = table.newTable({
        number: 5,
        capacity: 4
    });
    let my_table6 = table.newTable({
        number: 6,
        capacity: 8
    });
    my_table1.save()
    .then(() => {
        my_table2.save()
        .then(() => {
            my_table3.save()
            .then(() => {
                my_table4.save()
                .then(() => {
                    my_table5.save()
                    .then(() => {
                        my_table6.save()
                        .then(() => {
                            console.log("Tables populated")
                        });
                    });
                });
            });
        });
    });
});

let populateFoods = new Promise(function(resolve, reject){
    let my_food1 = food.newFood({
        name: "Olive Ascolane",
        price: 3,
        type: food.foodTypes.APPETIZER,
        ingredients: ["olives", "meat", "bread", "cheese", "eggs"],
        prepareTime: 7
    });
    let my_food2 = food.newFood({
        name: "Bruschette",
        price: 3,
        type: food.foodTypes.APPETIZER,
        ingredients: ["olives", "tomatoes", "bread", "olive oil"],
        prepareTime: 5
    });
    let my_food3 = food.newFood({
        name: "Pizza Margherita",
        price: 5,
        type: food.foodTypes.FIRST_COURSE,
        ingredients: ["tomato sauce", "mozzarella"],
        prepareTime: 10
    });
    let my_food4 = food.newFood({
        name: "Pasta al Pesto",
        price: 5,
        type: food.foodTypes.FIRST_COURSE,
        ingredients: ["pasta", "pesto"],
        prepareTime: 10
    });
    let my_food5 = food.newFood({
        name: "Cotoletta alla Milanese",
        price: 8,
        type: food.foodTypes.SECOND_COURSE,
        ingredients: ["eggs", "chicken", "flour", "breadcrumbs", "lemon"],
        prepareTime: 10
    });
    let my_food6 = food.newFood({
        name: "Parmigiana",
        price: 7,
        type: food.foodTypes.SECOND_COURSE,
        ingredients: ["eggplants", "mozzarella", "tomato sauce", "olive oil", "basil", "parmisan cheese"],
        prepareTime: 10
    });
    let my_food7 = food.newFood({
        name: "French Fries",
        price: 4,
        type: food.foodTypes.SIDE_DISH,
        ingredients: ["potatoes"],
        prepareTime: 5
    });
    let my_food8 = food.newFood({
        name: "Salad",
        price: 4,
        type: food.foodTypes.SIDE_DISH,
        ingredients: ["salad", "tomatoes", "carrots"],
        prepareTime: 5
    });
    let my_food9 = food.newFood({
        name: "Crème Brûlée",
        price: 5,
        type: food.foodTypes.DESSERT,
        ingredients: ["fresh cream", "milk", "sugar", "eggs", "vanilla"],
        prepareTime: 6
    });
    let my_food10 = food.newFood({
        name: "Tiramisù",
        price: 5,
        type: food.foodTypes.DESSERT,
        ingredients: ["mascarpone", "coffee", "eggs", "biscuits"],
        prepareTime: 5
    });
    let my_food11 = food.newFood({
        name: "Beer",
        price: 5,
        type: food.foodTypes.DRINK,
        ingredients: ["hops", "wheat"],
        prepareTime: 0
    });
    let my_food12 = food.newFood({
        name: "Water",
        price: 3,
        type: food.foodTypes.DRINK,
        ingredients: ["water"],
        prepareTime: 0
    });

    my_food1.save()
    .then(() => {
        my_food2.save()
        .then(() => {
            my_food3.save()
            .then(() => {
                my_food4.save()
                .then(() => {
                    my_food5.save()
                    .then(() => {
                        my_food6.save()
                        .then(() => {
                            my_food7.save()
                            .then(() => {
                                my_food8.save()
                                .then(() => {
                                    my_food9.save()
                                    .then(() => {
                                        my_food10.save()
                                        .then(() => {
                                            my_food11.save()
                                            .then(() => {
                                                my_food12.save()
                                                .then(() => {
                                                    console.log("Foods populated")
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

