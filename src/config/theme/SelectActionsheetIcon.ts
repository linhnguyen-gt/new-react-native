import { createStyle } from "@gluestack-style/react";

export const SelectActionsheetIcon = createStyle({
    w: "$4",
    h: "$4",
    mr: "$2",
    color: "$backgroundLight500",
    _dark: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        color: "$backgroundDark400"
    },
    props: {
        size: "md"
    }
});
