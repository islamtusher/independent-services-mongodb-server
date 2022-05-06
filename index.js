const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const app = express();
require('dotenv').config();

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2x7as.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verigyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({message: 'unAuthorize access'})
    }
    const token = authHeader.split(' ')[1]
    console.log({token});
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({message: 'Worng Info'})
        } else {
            console.log('decoded', decoded);
        }
      });
    next()
}

async function run() {
    try {
        await client.connect()
        const servicesCollection = client.db('independentServices').collection('services')
        console.log('conncet');
        const orderCollection = client.db('independentServices').collection('orders')
       
        // JWT Auth
        app.post('/login', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({token})
        })
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

        // delete single service
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

        // order collection
        // store order
        app.post('/order', async(req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

        // load order
        app.get('/userorders', verigyJWT, async (req, res) => {
            
            const email = req.query.email
            const query = { userEmail: email }
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)

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