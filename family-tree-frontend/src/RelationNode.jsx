import React from 'react';
import { Handle } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';  
import { faHeartCrack, faHeart } from '@fortawesome/free-solid-svg-icons'; // Import specific icons  

const RelationNode = ({ data }) => {
  return (
    <div
      style={{
        justifyContent: 'center',
        textAlign: 'center',
        width: '20px',
        height: '20px',
        position: 'relative',
        color: '#ff559d '
      }}
    >
        <FontAwesomeIcon icon={data.isContinuance ? faHeart : faHeartCrack}  />

      {/* Add handles for connecting edges */}
      <Handle
        type="source"
        position="bottom"
        style={{ background: '#555', left: '0px', top: 'calc(50% - 7px)', borderRadius: '50%' }}
      />
      <Handle
        type="target"
        position="top"
        style={{ background: '#555', right: '-10px', top: 'calc(50%)', borderRadius: '50%' }}
      />
    </div>
  );
};

export default RelationNode;
