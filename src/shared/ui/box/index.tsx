import React from 'react';

import BaseBox, { type BaseBoxProps } from './base-box';

import type { View } from 'react-native';

export type IBoxProps = BaseBoxProps & {
    isLoading?: boolean;
};

const Box = ({
    ref,
    isLoading: _isLoading,
    ...props
}: IBoxProps & { ref?: React.Ref<React.ComponentRef<typeof View>> }) => {
    return <BaseBox {...props} ref={ref} />;
};

export default Box;
