require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const Contact = require("./models/contact");

const app = express();

app.use(express.json());
app.use(cors());
mongoose.set("strictQuery", false);

morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/info", (request, response) => {
  Contact.countDocuments({}).then((result) => {
    const totalEntries = result;
    const currentTime = new Date();
    response.send(`<p>Phonebook has info for ${totalEntries} people</p>                    
          <p>${currentTime}</p>`);
  });
});

app.get("/api/persons", (request, response) => {
  Contact.find({})
    .then((contacts) => response.json(contacts))
    .catch((error) =>
      response.status(500).json({ error: "Failed to fetch contacts" })
    );
});

app.get("/api/persons/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if (contact) {
        response.json(contact);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error));
});

app.post("/api/persons/", (request, response, next) => {
  const { name, number } = request.body; 
  console.log("Received data:", { name, number });
  if (!name || !number) {
    return response.status(400).json({ error: "name or number is missing" });
  }

  Contact
    .findOne({ name: name })
    .then( existingContact => {
            if (existingContact) {
              existingContact.number= number;

              existingContact
                  .save()
                  .then( updateContact =>{response.json(updateContact)})
                  .catch(error=> next(error))               
            } else {
                    const contact = new Contact({
                            name: name,
                            number: number,
                    });

              contact
                  .save()
                  .then((savedContact) => {
                          response.json(savedContact);
                  })
                  .catch((error) => next(error));       
              }
    })
    .catch(error=>next(error))
});

app.use((error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted ID" });
  }
  next(error);
});

app.use((error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted ID" });
  }
  response.status(500).send({ error: "Server error" });
});

app.use((request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
});

const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
