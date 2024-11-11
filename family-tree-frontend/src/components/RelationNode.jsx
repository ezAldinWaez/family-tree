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
        width: '35px',
        height: '60px',
        position: 'relative',  
        color: '#ff559d ',  
        display: 'flex',
        alignItems: 'center',  
        justifyContent: 'center', 
      }}  
    >  
      <FontAwesomeIcon icon={data.isContinuance ? faHeart : faHeartCrack} />  
 
      <Handle  
        type="target"  
        position="left"  
        id= 'left'
        style={{top: '50%', left: '0',visibility: 'hidden', }}
      />  
      <Handle  
        type="target"  
        position="right"  
        id= 'right'
        style={{top: '50%', right: '0',visibility: 'hidden', }}
      />  
      <Handle  
        type="source"  
        position="bottom"  
        style={{visibility: 'hidden',}}
      />  
    </div>  
  );  
};  

export default RelationNode;