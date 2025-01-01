
const mongoose = require('mongoose');

mongoose.set("strictQuery", false);

const uri =process.env.MONGODB_URI

if (!uri) {
    console.error("MONGODB_URI is not defined in environment variables.");
    process.exit(1);
}

console.log("connecting to uri");

mongoose
    .connect(uri)
    .then((result) => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connecting to MongoDB:", error.message);
        process.exit(1);
    });

const contactSchema = new mongoose.Schema({
        name: String,
        number: String
    });

contactSchema
    .set("toJSON", 
        {
            transform: (document, returnedObject) => {
                returnedObject.id = returnedObject._id.toString();
                delete returnedObject._id;
                delete returnedObject.__v;
            },
        });

module.exports = mongoose.model("Contact", contactSchema);
