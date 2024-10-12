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
        <FontAwesomeIcon icon={data.isContinuance ? faHeart : faHeartCrack} size="2x" />

      {/* Add handles for connecting edges */}
      <Handle
        type="source"
        position="bottom"
        style={{ background: '#555', bottom: '-8px', left: 'calc(50% + 7px)', borderRadius: '50%' }}
      />
      <Handle
        type="target"
        position="top"
        style={{ background: '#555', top: '0px', left: 'calc(50% + 7px)', borderRadius: '50%' }}
      />
    </div>
  );
};

export default RelationNode;
