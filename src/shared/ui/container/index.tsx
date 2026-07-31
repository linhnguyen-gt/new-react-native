import React from 'react';

import ContainerBox from './container-box';

import type { BaseBoxProps } from '../box/base-box';
import type { View } from 'react-native';

type ContainerProps = BaseBoxProps & {
    isLoading?: boolean;
    safeArea?: boolean;
};

const Container = ({
    ref,
    safeArea = true,
    isLoading = false,
    ...restProps
}: ContainerProps & { ref?: React.Ref<React.ComponentRef<typeof View>> }) => {
    return <ContainerBox {...restProps} safeArea={safeArea} ref={ref} isLoading={isLoading} />;
};

export default Container;
