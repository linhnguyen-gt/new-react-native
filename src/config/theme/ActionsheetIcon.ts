import { createStyle } from "@gluestack-style/react";

export const ActionsheetIcon = createStyle({
    props: {
        size: "sm"
    },
    color: "$backgroundLight500",
    _dark: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        color: "$backgroundDark400"
    }
});
