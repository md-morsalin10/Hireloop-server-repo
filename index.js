const express = require('express');
const app = express();
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const companyCollection = database.collection("companies");
    const usersCollection = database.collection("user");
    const jobApplicationCollection = database.collection("jobApplications")
   
    app.get("/api/users", async(req,res)=>{
        const cursor = usersCollection.find().skip(7)
        const users = await cursor.toArray();
        res.send(users)
    })
  
   app.get("/api/companies", async(req,res)=>{
    const cursor = companyCollection.find().skip(6)
    const companies = await cursor.toArray();
    res.send(companies)
   })

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

  app.get("/api/jobs/:id", async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const job = await jobCollection.findOne(query);
    res.send(job)
  })

  app.get("/api/applications", async(req,res)=>{
    const query = {};
    if(req.query.applicantId){
      query.applicantId = req.query.applicantId
    }
    if(req.query.jobId){
      query.jobId = req.query.jobId
    }
    const applications = await jobApplicationCollection.find(query).toArray();
    res.send(applications)
  })  

   app.post("/api/applications", async(req,res)=>{
    const application = req.body;
    const newApplication = {
      ...application,
      createdAt: new Date()
    }
    const result = await jobApplicationCollection.insertOne(newApplication)
    res.send(result)
   })

    app.post("/api/jobs", async(req,res)=>{
      const job = req.body;
      const newJob = {
        ...job,
        createdAt: new Date()
      }
      const result = await jobCollection.insertOne(newJob)
      res.send(result)
    })



    // company related api

    app.get("/api/my/companies", async(req,res)=>{
      const query = {};
      if(req.query.recruiterId){
        query.recruiterId = req.query.recruiterId
      }
      const result = await companyCollection.findOne(query);
      console.log(result)
      res.send(result || {})
    })

    app.post("/api/companies", async(req,res)=>{
      const company = req.body;
      const newCompany ={
        ...company,
        createdAt: new Date()
      }
      const result = await companyCollection.insertOne(newCompany)
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