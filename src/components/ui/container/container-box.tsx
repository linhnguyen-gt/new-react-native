import React from 'react';

import BaseBox, { type BaseBoxProps } from '../box/base-box';
import LoadingBox from '../box/loading-box';

import type { View } from 'react-native';

type ContainerBoxProps = BaseBoxProps & {
    isLoading?: boolean;
    safeArea?: boolean;
};

const ContainerBox = React.forwardRef<React.ComponentRef<typeof View>, ContainerBoxProps>(
    ({ backgroundColor = 'white', safeArea, ...props }, ref) => {
        return (
            <BaseBox safeArea={safeArea} flex={1} backgroundColor={backgroundColor}>
                <BaseBox flex={1} backgroundColor={backgroundColor} {...props} ref={ref}>
                    {props.children}
                </BaseBox>
                <LoadingBox isLoading={props.isLoading} />
            </BaseBox>
        );
    }
);

ContainerBox.displayName = 'ContainerBox';
export default ContainerBox;
