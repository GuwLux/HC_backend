const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

mongoose.connect('mongodb+srv://scsc13579113:Qaz13579113@hcweb.mwb3cmu.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to parse JSON requests
app.use(express.json());

// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define routes
app.post('/api/products', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, price, type, description } = req.body;
    const imageBuffer = req.file.buffer.toString('base64');

    const newProduct = new productSchema({ name, price, image: imageBuffer, type, description });
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await productSchema.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productSchema.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 確保回傳的商品資訊包含 imageUrl
    const productWithImageUrl = {
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: `data:image/jpeg;base64,${product.image}`, // 使用商品圖片的 base64 字串
      type: product.type,
      description: product.description,
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
    await productSchema.findByIdAndDelete(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/test", (req, res) => {
  res.json({
    message:"test work!!",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
