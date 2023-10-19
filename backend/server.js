// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB (replace 'your-mongodb-uri' with your MongoDB connection string)
mongoose
  .connect(
    'mongodb+srv://tanvirimruet:6xnufM9XE6zKwKBq@cluster0.wkqfkge.mongodb.net/folders',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('database connected');
  });

app.use(cors());
app.use(bodyParser.json());

// Define the folder schema
const Folder = mongoose.model('Folder', {
  name: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
});

// Create a default root folder when the server starts
Folder.findOne({ name: 'Root' })
  .then((rootFolder) => {
    if (!rootFolder) {
      const root = new Folder({ name: 'Root' });
      return root.save();
    }
    return null;
  })
  .then(() => {
    console.log('Root folder created or already exists.');
  })
  .catch((err) => {
    console.error('Error creating or finding root folder:', err);
  });

app.post('/api/folders', async (req, res) => {
  const { name, parentId } = req.body;
  try {
    const folder = new Folder({ name, parent: parentId, children: [] });
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      parentFolder.children.push(folder._id);
      await parentFolder.save();
    }
    await folder.save();
    res.json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating folder' });
  }
});

app.get('/api/folders', async (req, res) => {
  try {
    const folders = await Folder.find().populate('children');
    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching folders' });
  }
});

app.put('/api/folders/:id', async (req, res) => {
  const { name } = req.body;
  const folderId = req.params.id;
  try {
    await Folder.findByIdAndUpdate(folderId, { name });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating folder' });
  }
});

app.delete('/api/folders/:id', async (req, res) => {
  try {
    const folderId = req.params.id;
    // Find the node to delete
    const nodeToDelete = await Folder.findById(folderId.trim()).exec();

    if (!nodeToDelete) {
      return res.status(404).send('Node not found');
    }

    // Function to recursively delete a branch and its descendants up to a certain depth
    async function deleteBranch(node, depth) {
      if (depth === 0) {
        // Stop at the specified depth and do not delete further descendants
        return;
      }
      const descendants = await Folder.find({ parent: node._id }).exec();
      for (const descendant of descendants) {
        await deleteBranch(descendant, depth - 1);
      }
      await node.deleteOne();
    }

    // Specify the desired depth (e.g., 1 for direct descendants)
    const depthToDelete = 10;

    // Start the recursive deletion for the branch
    await deleteBranch(nodeToDelete, depthToDelete);

    return res.status(200).send('Branch and descendants deleted');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error deleting branch and descendants');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
