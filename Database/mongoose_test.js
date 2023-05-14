//import * as user from './User';
const user = require('./User');
const table = require('./Table');
const food = require('./Food');
const order = require('./Order');
const mongoose = require('mongoose');
  
// Set Up the Database connection
mongoose.connect(
    'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    let my_user = user.getModel().create({
        name: 'Fernando',
        email: 'fernando@gmail.com',
        password: '123456',
        role: 'waiter'
    }).then((waiter) => {
        let my_table = table.getModel().create({
            capacity: 4,
            status: 'free'
        }).then((table) => {
            let my_food = food.getModel().create({
                name: 'Pizza',
                price: 10,
                prepareTime: 10,
                notes: 'No notes',
                ingredients: ['tomato', 'cheese', 'ham']
            }).then((food) => {
                let my_order = order.getModel().create({
                    status: 'pending',
                    orders: food,
                    tables: table,
                    waiterId: waiter._id
                });
            });
        });
    });
})