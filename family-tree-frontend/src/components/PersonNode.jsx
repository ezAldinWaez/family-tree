import React from 'react';
import { Handle } from '@xyflow/react';

import man from '../assets/imgs/man.jpg';
import woman from '../assets/imgs/woman.jpg';

const PersonNode = ({ data }) => {
  return (
    <div
      style={{
        border: `5px solid ${data.isAlive ? '#248b9a' : '#ddd'}`,
        borderRadius: '50%',
        justifyContent: 'center',
        textAlign: 'center',
        width: '50px',
        height: '50px',
        position: 'relative',
      }}
    >
      <img
        src={data.sex == 'male' ? man : woman}
        alt={data.label}
        style={{
          width: '100%',
          maxHeight: '50px',
          borderRadius: '50%',
          filter: `${data.isAlive ? 'grayscale(0%)' : 'grayscale(100%)'}`          
        }}
      />

      <p
        style={{
          position: 'absolute',
          bottom: '-55px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
        }}
      
      >
        {data.name}
      </p>

      {/* Add handles for connecting edges */}
      <Handle
        type="target"
        position="top"
        style={{ visibility: 'hidden', }}
      />
      <Handle
        type="source"
        position=  {`${data.sex === 'male'? 'right' : 'left'}`}
        style={{ visibility: 'hidden', }}
      />
    </div>
  );
};

export default PersonNode;
