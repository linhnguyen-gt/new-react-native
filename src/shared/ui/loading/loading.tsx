import React from 'react';

import { LoadingBox } from '..';

import type { LoadingBoxProps } from '../box/loading-box';

const Loading = (props: LoadingBoxProps) => {
    return <LoadingBox {...props} />;
};

export default Loading;
