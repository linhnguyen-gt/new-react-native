import { StyledComponentProps } from "@gluestack-style/react/lib/typescript/types";
import { Box } from "@gluestack-ui/themed";
import React from "react";
import { ActivityIndicator, StyleProp, View, ViewProps, ViewStyle } from "react-native";

type LoadingProps = StyledComponentProps<StyleProp<ViewStyle>, unknown, ViewProps, "Box", typeof View> & {
    isLoading?: boolean;
};

const Loading: React.FC<LoadingProps> = ({ isLoading, ...rest }) => {
    if (!isLoading) return null;

    return (
        <Box
            {...rest}
            bg="rgb(44, 51, 51)"
            opacity={0.7}
            position="absolute"
            zIndex={10}
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="center"
            alignItems="center">
            <Box w={100} h={100} borderRadius={10} bg="black" justifyContent="center" alignItems="center">
                <ActivityIndicator size="small" color="white" />
            </Box>
        </Box>
    );
};

export default Loading;
