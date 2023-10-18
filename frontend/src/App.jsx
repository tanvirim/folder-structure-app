/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AiOutlineDelete, AiOutlinePlus } from 'react-icons/ai';
import { FcOpenedFolder } from 'react-icons/fc';
function Folder({ folder, onEdit, onDelete, onAddChild }) {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const inputRef = useRef(null);

  const createChildFolder = () => {
    axios
      .post('http://localhost:5000/api/folders', {
        name: newFolderName,
        parentId: folder._id,
      })
      .then((response) => {
        folder.children.push(response.data);
        setNewFolderName('');
        setIsCreatingChild(false);
      })
      .catch((error) => {
        console.error('Error creating folder:', error);
      });
  };

  return (
    <div className='m-10'>
      <div className='flex gap-5'>
        <div className='flex justify-center items-center gap-2'>
          <div>
            <FcOpenedFolder size={40} className='self-centered' />
          </div>
          <div className='text-2xl font-bold'>{folder.name}</div>
        </div>

        <button
          className=' text-xl py-1 px-3 text-white bg-red-500  rounded-md ring-2  hover:bg-white  hover:text-red-500'
          onClick={() => onDelete(folder._id)}
        >
          <AiOutlineDelete />
        </button>
        {isCreatingChild ? (
          <div>
            <input
              type='text'
              autoFocus
              ref={inputRef}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder='Folder Name'
            />
            <button onClick={createChildFolder}>Create</button>
          </div>
        ) : (
          <button onClick={() => setIsCreatingChild(true)}>
            <div className='flex justify-center align-middle gap-2 rounded-md ring-2  text-white  bg-green-500 p-2  hover:bg-white  hover:text-black'>
              <AiOutlinePlus className='self-center' />
              <span>New</span>
            </div>
          </button>
        )}
      </div>
      <ul>
        {folder?.children?.map((child) => (
          <li key={child._id}>
            <Folder
              folder={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [rootFolder, setRootFolder] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);

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

  const handleEdit = (folder) => {
    setEditingFolder(folder);
  };

  const cancelEdit = () => {
    setEditingFolder(null);
  };

  const saveEdit = () => {
    axios
      .put(`http://localhost:5000/api/folders/${editingFolder._id}`, {
        name: editingFolder.name,
      })
      .then(() => {
        setEditingFolder(null); // Exit edit mode
      })
      .catch((error) => {
        console.error('Error updating folder:', error);
        // Handle the error as needed
      });
  };

  const deleteFolder = (folderId) => {
    if (folderId === rootFolder._id) {
      // Prevent deleting the root folder
      alert('Cannot delete the root folder.');
      return;
    }

    axios
      .delete(`http://localhost:5000/api/folders/${folderId}`)
      .then(() => {
        removeFolder(rootFolder, folderId);
        setEditingFolder(null); // Exit edit mode after deletion
        getFolder();
      })
      .catch((error) => {
        console.error('Error deleting folder:', error);
        // Handle the error as needed
      });
  };

  const removeFolder = (node, folderId) => {
    // Recursively remove the folder from the tree
    node.children = node?.children?.filter((child) => child._id !== folderId);
    node.children.forEach((child) => {
      removeFolder(child, folderId);
    });
  };

  return (
    <div className='App'>
      <h1>Folder Management</h1>

      {rootFolder && (
        <Folder
          folder={rootFolder}
          onEdit={handleEdit}
          onDelete={deleteFolder}
          onAddChild={setEditingFolder}
        />
      )}

      {editingFolder && (
        <div>
          <input
            type='text'
            value={editingFolder.name}
            onChange={(e) => (editingFolder.name = e.target.value)}
          />
          <button onClick={cancelEdit}>Cancel</button>
          <button onClick={saveEdit}>Save</button>
        </div>
      )}
    </div>
  );
}

export default App;
