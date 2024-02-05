const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

mongoose.connect('mongodb+srv://scsc13579113:Qaz13579113@hcweb.mwb3cmu.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

// Middleware to parse JSON requests
app.use(express.json());

// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define routes
app.post('/api/products', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const imageBuffer = req.file.buffer.toString('base64');

    const newProduct = new Product({ name, price, image: imageBuffer });
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 確保回傳的商品資訊包含 imageUrl
    const productWithImageUrl = {
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: `data:image/jpeg;base64,${product.image}`, // 使用商品圖片的 base64 字串
    };

    res.json(productWithImageUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});