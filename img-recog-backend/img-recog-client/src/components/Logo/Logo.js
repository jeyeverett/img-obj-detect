import React from 'react';
import Tilt from 'react-tilt';
import './Logo.css';
import learning from './learning.png';


const Logo = () => {
    return (
        <div className='mh4 logo'>
            <Tilt className="Tilt br2 shadow-2" options={{ max : 55 }} style={{ height: 150, width: 150 }} >
                <div className="Tilt-inner pa4">
                    <img src={learning} alt='Logo' />
                </div>
            </Tilt>
        </div>
    );
}
export default Logo;