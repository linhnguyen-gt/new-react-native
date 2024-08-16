import { Box } from "@gluestack-ui/themed";
import React from "react";
import { ActivityIndicator } from "react-native";

type LoadingFooterProps = {
    isLoading?: boolean;
};

const LoadingFooter: React.FC<LoadingFooterProps> = ({ isLoading }) => {
    if (!isLoading) return null;
    return (
        <Box>
            <ActivityIndicator size="small" color="black" />
        </Box>
    );
};

export default LoadingFooter;
