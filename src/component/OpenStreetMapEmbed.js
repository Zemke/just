import React, {useState} from 'react';

export default React.memo(({geo}) => {

  const [openStreetMapSrc] = useState(`https://www.openstreetmap.org/export/embed.html?bbox=${(geo.longitude)},${(geo.latitude)},${(geo.longitude)},${(geo.latitude)}&layer=mapnik&marker=${(geo.latitude)},${(geo.longitude)}`);

  return (<>{!!openStreetMapSrc && (
    <iframe marginHeight="0" marginWidth="0" frameBorder="0"
            className="image" src={openStreetMapSrc}/>
  )}</>);
});
