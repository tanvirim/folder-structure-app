/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import axios from 'axios';
import Folder from './components/Folder';

function App() {
  const [rootFolder, setRootFolder] = useState(null);

  const getFolder = () => {
    axios
      .get('http://localhost:5000/api/folders')
      .then((response) => {
        setRootFolder(response.data[0]); // Assuming you have a single root folder
      })
      .catch((error) => {
        console.error('Error fetching folders:', error);
      });
  };

  useEffect(() => {
    getFolder();
  }, []);

  const deleteFolder = (folderId) => {
    if (folderId === rootFolder._id) {
      // Prevent deleting the root folder
      alert('Cannot delete the root folder.');
      return;
    }

    axios
      .delete(`http://localhost:5000/api/folders/${folderId}`)
      .then(() => {
        getFolder();
      })
      .catch((error) => {
        console.error('Error deleting folder:', error);
        // Handle the error as needed
      });
  };

  return (
    <div className='App'>
      <h1>Folder Management</h1>
      {rootFolder && <Folder folder={rootFolder} onDelete={deleteFolder} />}
    </div>
  );
}

export default App;
