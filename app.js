import express from 'express'
import mysql from 'mysql'
import multer from 'multer'

const app = express()
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'botik'
})

const upload = multer({ dest: './public/uploads/'})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))


app.get('/add-item', (req, res) => {
    res.render('add-item')
})

app.post('/add-item', upload.array('product-image', 5), (req, res) => {
    let filenames = []
    req.files.forEach(file => filenames.push(file.filename))
    const product = {
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        filenames: filenames
    }
    connection.query(
        'INSERT INTO products (name, description, price, imageURLs) VALUES (?,?,?,JSON_ARRAY(?))',
        [product.name, product.description, product.price, product.filenames],
        (error, results) => {
            if(!error) {
                console.log('product added successfully')
            } else {
                console.log(error)
            }
        }
    )
    
})

app.get('/item/:id', (req, res) => {
    connection.query(
        'SELECT * FROM products WHERE id = ?', [parseInt(req.params.id)],
        (error, results) => {
            const product = {
                name: results[0].name,
                description: results[0].description,
                price: results[0].price,
                imageURLs: JSON.parse(results[0].imageURLs),
                datePosted: results[0].datePosted
            }
            console.log(JSON.parse(results[0].imageURLs))
            console.log(results[0].imageURLs)
            res.render('item', {product: product})
        }
    )
})


app.listen(3001, ()=> {
    console.log('app is running')
})