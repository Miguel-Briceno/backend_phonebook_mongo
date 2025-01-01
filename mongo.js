const mongoose = require('mongoose');
const password = process.argv[2];
const uri = `mongodb+srv://bricenomigueles:${password}@cluster0.dkwcx.mongodb.net/PhonebookApp?retryWrites=true&w=majority&appName=Cluster0`;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
async function run() {
  try {    
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);    
    const contactSchema = new mongoose.Schema(
        {
            name: String,
            number: String
        }
    )
    const Contact = mongoose.model('Contact', contactSchema);
    if(process.argv.length === 3){
        Contact
            .find({})
            .then(contacts =>{
                contacts.forEach(contact => {
                    console.log(`${contact.name} ${contact.number}`);
                });                              
            })
            .finally(() => mongoose.connection.close());
        return;
    }
    const contact = new Contact(
        {
            name: process.argv[3],
            number: process.argv[4]
        }
    )

    contact.save().then(result =>{
        console.log(`added ${contact.name} number ${contact.number} to phonebook`); 
        mongoose.connection.close()       
    });

  }catch (error) {
    console.error('Error:', error.message); 
    mongoose.connection.close()
  }
}
run();
