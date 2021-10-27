import React from 'react';
import * as _ from 'lodash';


const ProgressBar = ({ stage }) => {
    const generateProgressBar = () => {
        return _.range(6).map(index => {
            const inactive = stage > index ? 'active' : 'inactive';
            return <div className={`progress-bar-segment ${inactive}`}/>
        });
    };
    return (
        <div className="progress-bar">
            {generateProgressBar()}
        </div>
    );
};

export default ProgressBar;