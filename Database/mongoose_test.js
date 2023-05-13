const mongoose = require('mongoose');
  
// Set Up the Database connection
mongoose.connect(
    'mongodb+srv://Furellato:XV5Nbg3sRBz5flZN@restaurant.bqyjdfs.mongodb.net/RESTaurant_db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
  
// Defining User schema
const userSchema = new mongoose.Schema(
    { name: String, age: Number }
)
  
// Defining User model
const User = mongoose.model('User', userSchema);
  
const Cat = mongoose.model('Cat', { name: String });


// Create collection of Model
User.createCollection().then(function (collection) {
    console.log('Collection is created!');
});

Cat.createCollection().then(function (collection) {
    console.log('Collection is created!');
});
