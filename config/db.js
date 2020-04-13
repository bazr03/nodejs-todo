const mongoose = require("mongoose");
require("dotenv").config({ path: "variables.env" });

const DBconnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
    process.exit(1); // Detiene la app
  }
};

module.exports = DBconnection;
