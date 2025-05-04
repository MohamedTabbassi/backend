const mongoose = require('mongoose');
const boom = require('boom');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://0.0.0.0:27017/automotive-services', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    const boomError = boom.boomify(error, { statusCode: 500 });
    console.error(boomError);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;