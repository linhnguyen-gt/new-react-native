import React from "react";
import { TouchableOpacity } from "react-native";

import type { TouchableComponentProps } from "@/components/touchable/TouchableComponent";

import TouchableComponent from "@/components/touchable/TouchableComponent";

const Touchable = React.forwardRef<React.ComponentRef<typeof TouchableOpacity>, TouchableComponentProps>(
    (props, ref) => {
        return <TouchableComponent {...props} ref={ref} />;
    }
);

Touchable.displayName = "Touchable";

export default Touchable;
