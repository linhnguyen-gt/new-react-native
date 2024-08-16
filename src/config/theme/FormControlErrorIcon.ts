import { createStyle } from "@gluestack-style/react";

export const FormControlErrorIcon = createStyle({
    color: "$error700",
    _dark: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        color: "$error400"
    },
    props: {
        size: "sm"
    }
});
