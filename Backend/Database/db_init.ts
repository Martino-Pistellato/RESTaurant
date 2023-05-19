//N.B. change this js file to the relative ts file
//here we close all connections to the db. Maybe we could keep a connection open (singleton like) and use it through the whole application

const {MongoClient} = require('mongodb');
import * as user from './User';
const table = require('./Table');
const food = require('./Food');
const order = require('./Order');
const mongoose = require('mongoose');

//first, we connect to the cluster
//Use MongoClient because mongoose gave problem getting the list of databases in the cluster. even if it's possible to use it for this purpose
const clusterURI = 'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(clusterURI);

client.connect()
.then(() => {
    searchDB(client)
})

//we collect the databases present in the cluster and search for RESTaurant_db. If is not present, we create it and its collections
function searchDB(client){
    client.db().admin().listDatabases()
    .then((list) => {
        let isDBPresent = false
        list.databases.forEach(db => {
            if(db.name === 'RESTaurant_db')
                isDBPresent = true
        });
        if(!isDBPresent)
            createDB()
        else
            console.log("DB already initialized")
    }).then(() => {
        client.close()
    });
}

function createDB(){
    console.log("DB not found, let's create it")

    let dbURI = 'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority'
    
    //by simply connecting to the db, we create it
    mongoose.connect(dbURI)
    .then(() => {
        user.userModel.createCollection()
        .then(() => {
            console.log("Collection Users created")
            let my_user = user.newUser({
              email: 'pippo@gmail',
              name: 'pippo',
              role: 'admin'
            });
            my_user.setPassword('123456');
            my_user.save().then(() => {
                table.getModel().createCollection()
                .then(() => {
                    console.log("Collection Tables created")
                })
                .then(() => {
                    food.getModel().createCollection()
                    .then(() => {
                        console.log("Collection Foods created")
                    })
                    .then(() => {
                        order.getModel().createCollection()
                        .then(() => {
                            console.log("Collection Orders created")
                        })
                        .then(() => {
                            mongoose.connection.close()
                        })
                    })

                })
            });
        })
    })
}