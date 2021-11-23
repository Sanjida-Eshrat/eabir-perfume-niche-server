const express = require('express');
const app = express();
const cors =  require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdjyv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log('connect to database');
        const database = client.db('nicheWebsite');
        const productsCollection = database.collection('products');
        const productOrderCollection = database.collection("productOrder");
        const reviewsCollection = database.collection("reviews");
        const usersCollection = database.collection('users');

         //GET Single Product 
        app.get('/products/:id', async (req,res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const product = await productsCollection.findOne(query);
            res.json(product);
          });   
        
        // GET API products
        app.get('/products', async (req,res) => {
            const cursor = productsCollection.find();
            const products = await cursor.toArray();
            res.send(products);
        });  
        
        //get 6 products api
        app.get('/homeProducts', async(req,res)=>{
            const cursor = productsCollection.find({});
            const products = await cursor.limit(6).toArray();
            res.send({products});
          })
        
        //POST API products 
        app.post('/products', async (req,res) => {
            const product = req.body;
            console.log('hitting the post api',product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        // DELETE PRODUCT
        app.delete('/products/:id', async (req,res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.json(result);
          });
        

        //Add product order
       app.post('/productOrder', async (req,res) =>{
        const productOrder = req.body;
        console.log('hitting the post api',productOrder);
        const result = await productOrderCollection.insertOne(productOrder);

        console.log(result);
        res.json(result);
      });

        // GET product order
       app.get('/productOrder', async (req,res) => {
        const cursor = productOrderCollection.find();
        const productOrder = await cursor.toArray();
        res.send(productOrder);
       });

       //GET Single user order
       app.get('/productOrder/:email', async (req,res) => {
        const result = await productOrderCollection.find({
            email: req.params.email,
        }).toArray();
        res.json(result);
      });

       //DELETE API product Order
       app.delete('/productOrder/:id', async (req,res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id)};
        const result = await productOrderCollection.deleteOne(query);
        res.json(result);
      });
      
      //update status
      app.put("/productOrder/:id", async (req, res)=>{
        const id = req.params.id;
        const query = { _id: ObjectId(id)};
        const option = {upsert: true};
        const updateDoc = {$set:{
           status: "Shipped"
        }}
        const result = await productOrderCollection.updateOne(query, updateDoc, option)
        res.send(result);
      });

        //Reviews API
        // GET API reviews
        app.get('/reviews', async (req,res) => {
            const cursor = reviewsCollection.find();
            const reviews = await cursor.toArray();
            res.send(reviews);
        });   
        
        //POST API reviews 
        app.post('/reviews', async (req,res) => {
            const review = req.body;
            console.log('hitting the post api',review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });

        // users api

         // find-out admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
           const user = await usersCollection.findOne(query);
           let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
           res.json({ admin: isAdmin });
          });

        app.post('/users', async(req,res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        app.put('/users', async(req,res) =>{
            const user = req.body;
            const filter = {email: user.email};
            const options ={ upsert: true};
            const updateDoc ={ $set: user};
            const result = await usersCollection.updateOne(filter,updateDoc,options);
            res.json(result);
        })
        //make admin
        app.put('/users/admin', async(req,res) =>{
            const user = req.body;
            console.log('put', user);
            const filter = {email: user.email};
            const updateDoc ={ $set:{ role: 'admin'} };
            const result = await usersCollection.updateOne(filter,updateDoc);
            res.json(result);

        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Niche Website!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})