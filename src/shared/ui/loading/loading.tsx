import React from 'react';

import { LoadingBox } from '..';

import type { LoadingBoxProps } from '../box/loading-box';

const Loading: React.FC<LoadingBoxProps> = (props) => {
    return <LoadingBox {...props} />;
};

export default Loading;
