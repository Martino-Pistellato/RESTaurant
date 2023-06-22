import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';

import * as user from './User';
import * as food from './Food';
import * as table from './Table';
import * as order from './Order';

//This file is used to check if the database already exists in the MongoDB cluster. If not, it is created and populated with some data.

//first, we connect to the cluster (use MongoClient because mongoose gave problem getting the list of databases in the cluster. even if it's possible to use it for this purpose)
//const clusterURI = 'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/?retryWrites=true&w=majority';
//const dbURI = 'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority';

const result = require('dotenv').config();
if( result.error ) {
    console.log("Unable to load \".env\" file. Please provide one");
    process.exit(-1);
}
if( !process.env.DB_URI || !process.env.CLUSTER_URI ) {
    console.log("\".env\" file loaded but connections URI were not found");
    process.exit(-1);
}

const client = new MongoClient(process.env.CLUSTER_URI);

client.connect()
.then(() => {
    searchDB(client)
})

//We collect the databases present in the cluster and search for RESTaurant_db.
function searchDB(client: any){
    client.db().admin().listDatabases()
    .then((list: any) => {
        let isDBPresent = false;
        list.databases.forEach((db: any) => {
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

    //By simply connecting to the database URI, we create the database
    mongoose.connect(process.env.DB_URI)
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
                        //Populate collections with some data
                        populateUsers().then(() => {
                            populateTables().then(() => {
                                populateFoods().then(() => {
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

function populateUsers() : Promise<void>{
    return new Promise(function(resolve, reject){
        let my_admin = user.newUser({
            email: 'admin@admin.RESTaurant.it',
            name: 'admin',
            role: user.roleTypes.ADMIN
        });
        my_admin.setPassword('123456');

        let my_waiter = user.newUser({
            email: 'alfredo@waiter.RESTaurant.it',
            name: 'Alfredo Comencini',
            role: user.roleTypes.WAITER
        });
        my_waiter.setPassword('123456');

        let my_waiter2 = user.newUser({
            email: 'rita@waiter.RESTaurant.it',
            name: 'Rita Tebani',
            role: user.roleTypes.WAITER
        });
        my_waiter2.setPassword('123456');

        let my_cook = user.newUser({
            email: 'vincenzo@cook.RESTaurant.it',
            name: 'Vincenzo Succulenti',
            role: user.roleTypes.COOK
        });
        my_cook.setPassword('123456');

        let my_cook2 = user.newUser({
            email: 'anna@cook.RESTaurant.it',
            name: 'Anna Pigna',
            role: user.roleTypes.COOK
        });
        my_cook2.setPassword('123456');

        let my_bartender = user.newUser({
            email: 'federico@bar.RESTaurant.it',
            name: 'Federico La Rossi',
            role: user.roleTypes.BARMAN
        });
        my_bartender.setPassword('123456');

        let my_bartender2 = user.newUser({
            email: 'susanna@bar.RESTaurant.it',
            name: 'Susanna Stretti',
            role: user.roleTypes.BARMAN
        });
        my_bartender2.setPassword('123456');

        let my_cashier1 = user.newUser({
            email: 'laura@cash.RESTaurant.it',
            name: 'Laura Frimi',
            role: user.roleTypes.CASHIER
        });
        my_cashier1.setPassword('123456');

        let my_cashier2 = user.newUser({
            email: 'cosimo@cash.RESTaurant.it',
            name: 'Cosimo Berni',
            role: user.roleTypes.CASHIER
        });
        my_cashier2.setPassword('123456');

        my_admin.save()
        .then(() => {
            my_waiter.save()
            .then(() => {
                my_waiter2.save()
                .then(() => {
                    my_cook.save()
                    .then(() => {
                        my_cook2.save()
                        .then(() => {
                            my_bartender.save()
                            .then(() => {
                                my_bartender2.save()
                                .then(() => {
                                    my_cashier1.save().
                                    then(() => {
                                        my_cashier2.save().
                                        then(() => {
                                            console.log("Users populated")
                                            return resolve();
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
}

function populateTables() : Promise<void>{
    return new Promise(function(resolve, reject){
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
                                return resolve();
                            });
                        });
                    });
                });
            });
        });
    });
}


function populateFoods() : Promise<void>{
    return new Promise(function(resolve, reject){
        let my_food1 = food.newFood({
            name: "Olive Ascolane",
            price: 3,
            type: food.foodTypes.APPETIZER,
            ingredients: ["olives", "meat", "bread", "cheese", "eggs"],
            prepare_time: 7
        });
        let my_food2 = food.newFood({
            name: "Bruschette",
            price: 3,
            type: food.foodTypes.APPETIZER,
            ingredients: ["olives", "tomatoes", "bread", "olive oil"],
            prepare_time: 5
        });
        let my_food3 = food.newFood({
            name: "Pizza Margherita",
            price: 5,
            type: food.foodTypes.FIRST_COURSE,
            ingredients: ["tomato sauce", "mozzarella"],
            prepare_time: 10
        });
        let my_food4 = food.newFood({
            name: "Pasta with Pesto",
            price: 5,
            type: food.foodTypes.FIRST_COURSE,
            ingredients: ["pasta", "pesto"],
            prepare_time: 10
        });
        let my_food5 = food.newFood({
            name: "Cotoletta alla Milanese",
            price: 8,
            type: food.foodTypes.SECOND_COURSE,
            ingredients: ["eggs", "chicken", "flour", "breadcrumbs", "lemon"],
            prepare_time: 10
        });
        let my_food6 = food.newFood({
            name: "Parmigiana",
            price: 7,
            type: food.foodTypes.SECOND_COURSE,
            ingredients: ["eggplants", "mozzarella", "tomato sauce", "olive oil", "basil", "parmisan cheese"],
            prepare_time: 10
        });
        let my_food7 = food.newFood({
            name: "French Fries",
            price: 4,
            type: food.foodTypes.SIDE_DISH,
            ingredients: ["potatoes"],
            prepare_time: 5
        });
        let my_food8 = food.newFood({
            name: "Salad",
            price: 4,
            type: food.foodTypes.SIDE_DISH,
            ingredients: ["salad", "tomatoes", "carrots"],
            prepare_time: 5
        });
        let my_food9 = food.newFood({
            name: "Crème Brûlée",
            price: 5,
            type: food.foodTypes.DESSERT,
            ingredients: ["fresh cream", "milk", "sugar", "eggs", "vanilla"],
            prepare_time: 6
        });
        let my_food10 = food.newFood({
            name: "Tiramisù",
            price: 5,
            type: food.foodTypes.DESSERT,
            ingredients: ["mascarpone", "coffee", "eggs", "biscuits"],
            prepare_time: 5
        });
        let my_food11 = food.newFood({
            name: "Beer 1lt",
            price: 5,
            type: food.foodTypes.DRINK,
            ingredients: ["hops", "wheat"],
            prepare_time: 0
        });
        let my_food12 = food.newFood({
            name: "Water 1lt",
            price: 3,
            type: food.foodTypes.DRINK,
            ingredients: ["water"],
            prepare_time: 0
        });
        let my_food13 = food.newFood({
            name: "Americano",
            price: 5,
            type: food.foodTypes.DRINK,
            ingredients: ["campari", "vermouth", "seltz", "orange"],
            prepare_time: 5
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
                                                    my_food12.save().
                                                    then(() => {
                                                        my_food13.save()
                                                        .then(() => {
                                                            console.log("Foods populated")
                                                            return resolve();

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
    });
}