/* eslint-disable react/prop-types */
import { useState, useRef } from 'react';
import axios from 'axios';
import { AiOutlineDelete, AiOutlinePlus } from 'react-icons/ai';
import { FcOpenedFolder } from 'react-icons/fc';

function Folder({ folder, onDelete, onAddChild }) {
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
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Folder;
