const express = require('express');
const app = express();
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

const uri =process.env.MONGO_URL;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("hireloop");
    const jobCollection = database.collection("jobs");
   
  app.get("/api/jobs", async(req,res)=>{
    const query = {};
    if(req.query.companyId){
      query.companyId = req.query.companyId
    }
    if(req.query.strict){
      query.status = req.query.status
    }
    const jobs = await jobCollection.find(query).toArray();
    res.send(jobs)
  })

    app.post("/api/jobs", async(req,res)=>{
      const job = req.body;
      const result = await jobCollection.insertOne(job)
      res.send(result)
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});