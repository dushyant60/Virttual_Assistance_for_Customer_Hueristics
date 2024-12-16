const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// MongoDB connection URI for Azure Cosmos DB
const uri = process.env.AZURE_COSMOSDB_CONN_STRING;

// Database and collection names
const dbName = process.env.AZURE_COSMOS_DBNAME;
const collectionName = process.env.AZURE_COLLECTION_NAME;

// Define schema for your documents
const dataSchema = new mongoose.Schema({
  call_sid: String,
  transcription: String,
  sentiment: String
});

// Define model
const DataModel = mongoose.model("Data", dataSchema);

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("Error connecting to MongoDB:", error));

// Define Express app
const app = express();
app.use(bodyParser.json());

// Store data API
app.post("/api/storeData", async (req, res) => {
  try {
    const { call_sid, transcription, sentiment } = req.body;

    // Create new document
    const newData = new DataModel({ call_sid, transcription, sentiment });

    // Save document to database
    await newData.save();

    console.log("Data stored successfully:", newData);
    res.status(201).json({ message: "Data stored successfully" });
  } catch (error) {
    console.error("Error storing data in MongoDB:", error);
    res.status(500).json({ error: "An error occurred while storing data" });
  }
});

// Retrieve data API
app.get("/api/getData", async (req, res) => {
  try {
    // Find all documents
    const documents = await DataModel.find();

    res.json(documents);
  } catch (error) {
    console.error("Error retrieving data from MongoDB:", error);
    res.status(500).json({ error: "An error occurred while retrieving data" });
  }
});

module.exports = app;
