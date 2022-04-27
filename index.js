const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express();
require('dotenv').config();

app.use(cors())
app.use(express.json())


// const uri = "mongodb+srv://independentServices:2S63ZLOKC7jbLxiA@cluster0.2x7as.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2x7as.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const servicesCollection = client.db('independentServices').collection('services')
        console.log('conncet');

        // Load all data
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor =  servicesCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        // Load single data
        app.get('/services/:id', async (req, res) => {
            const query = {_id: ObjectId(req.params.id)}
            const service = await servicesCollection.findOne(query)
            res.send(service)
        })

        // post service
        app.post('/services', async (req, res) => {
            const service = await servicesCollection.insertOne(req.body)
            res.send(service)
        })

        // delete service
        app.delete('/services/:id', async (req, res) => {
            const query= {_id: ObjectId(req.params.id)}
            const result = await servicesCollection.deleteOne(query)
            res.send(result)
            // if (result.deletedCount === 1) {
            // } else {
            //     res.send(result)
            //     console.log("No documents matched the query. Deleted 0 documents.");
            //   }
            
        })

    }
    finally {
        
    }
}
run().catch(console.dir)





app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(port, () => {
    console.log('listing', port);
})