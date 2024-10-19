import React from 'react';
import { Handle } from '@xyflow/react';

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
        src={data.img}
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
        type="source"
        position="bottom"
        style={{ background: '#555', bottom: '-8px', left: '50%', borderRadius: '50%' }}
      />
      <Handle
        type="target"
        position="top"
        style={{ background: '#555', top: '-8px', left: '50%', borderRadius: '50%' }}
      />
    </div>
  );
};

export default PersonNode;
