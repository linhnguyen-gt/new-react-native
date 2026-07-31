import React from 'react';

import BaseBox, { type BaseBoxProps } from '../box/base-box';
import LoadingBox from '../box/loading-box';

import type { View } from 'react-native';

type ContainerBoxProps = BaseBoxProps & {
    isLoading?: boolean;
    safeArea?: boolean;
};

const ContainerBox = ({
    ref,
    backgroundColor = 'white',
    safeArea,
    ...props
}: ContainerBoxProps & { ref?: React.Ref<React.ComponentRef<typeof View>> }) => {
    return (
        <BaseBox safeArea={safeArea} flex={1} backgroundColor={backgroundColor}>
            <BaseBox flex={1} backgroundColor={backgroundColor} {...props} ref={ref}>
                {props.children}
            </BaseBox>
            <LoadingBox isLoading={props.isLoading} />
        </BaseBox>
    );
};

export default ContainerBox;
