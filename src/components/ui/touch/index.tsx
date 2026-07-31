import React from 'react';

import TouchableComponent from '../../touchable/TouchableComponent';

import type { TouchableComponentProps } from '../../touchable/TouchableComponent';
import type { TouchableOpacity } from 'react-native';

const Touchable = React.forwardRef<React.ComponentRef<typeof TouchableOpacity>, TouchableComponentProps>(
    (props, ref) => {
        return <TouchableComponent {...props} ref={ref} />;
    }
);

Touchable.displayName = 'Touchable';

export default Touchable;
