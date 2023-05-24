//N.B. change this js file to the relative ts file
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
            let my_user = user.newUser({
              email: 'pippo@gmail',
              name: 'pippo',
              role: user.roleTypes.ADMIN
            });
            my_user.setPassword('123456');
            my_user.save().then(() => {
                table.tableModel.createCollection()
                .then(() => {
                    console.log("Collection Tables created");

                    let my_table1 = table.newTable({
                        number: 1,
                        capacity: 4,
                        isFree: true,
                        waiterID: null
                    });
                    my_table1.save().then(() => {
                        console.log("prima tabella creata");
                        let my_table2 = table.newTable({
                            number: 2,
                            capacity: 2,
                            isFree: true,
                            waiterID: null
                        });
                        my_table2.save().then(() => {
                        console.log("seconda tabella creata");
                            food.foodModel.createCollection()
                            .then(() => {
                                console.log("Collection Foods created");
        
                                let my_food1 = food.newFood({
                                    name: "Pizza",
                                    price: 5,
                                    type: food.foodTypes.FIRST_COURSE,
                                    ingredients: ["tomato", "mozzarella", "ham"],
                                    prepareTime: 10});
                                my_food1.save().then(() => {
                                    console.log("prima pietanza creata");
                                    let my_food2 = food.newFood({
                                        name: "Pasta",
                                        price: 4,
                                        type: food.foodTypes.FIRST_COURSE,
                                        ingredients: ["pesto"],
                                        prepareTime: 5});
                                    my_food2.save().then(() => {
                                        console.log("seconda pietanza creata");
                                        order.orderModel.createCollection()
                                        .then(() => {
                                            console.log("Collection Orders created");
                                            
                                            mongoose.connection.close();                        
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