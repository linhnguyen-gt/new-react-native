import { H1, H2, H3, H4, H5, H6 } from "@expo/html-elements";
import { createStyle } from "@gluestack-style/react";

export const Heading = createStyle({
    color: "$textLight900",
    letterSpacing: "$sm",
    fontWeight: "$bold",
    fontFamily: "$heading",

    // Overrides expo-html default styling
    marginVertical: 0,
    _dark: {
        color: "$textDark50"
    },
    variants: {
        isTruncated: {
            true: {
                props: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    numberOfLines: 1,
                    ellipsizeMode: "tail"
                }
            }
        },
        bold: {
            true: {
                fontWeight: "$bold"
            }
        },
        underline: {
            true: {
                textDecorationLine: "underline"
            }
        },
        strikeThrough: {
            true: {
                textDecorationLine: "line-through"
            }
        },
        sub: {
            true: {
                fontSize: "$xs",
                lineHeight: "$xs"
            }
        },
        italic: {
            true: {
                fontStyle: "italic"
            }
        },
        highlight: {
            true: {
                bg: "$yellow500"
            }
        },
        size: {
            "5xl": {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H1 },
                fontSize: "$6xl",
                lineHeight: "$7xl"
            },
            "4xl": {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H1 },
                fontSize: "$5xl",
                lineHeight: "$6xl"
            },

            "3xl": {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H1 },
                fontSize: "$4xl",
                lineHeight: "$5xl"
            },

            "2xl": {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H2 },
                fontSize: "$3xl",
                lineHeight: "$3xl"
            },

            xl: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H3 },
                fontSize: "$2xl",
                lineHeight: "$3xl"
            },

            lg: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H4 },
                fontSize: "$xl",
                lineHeight: "$2xl"
            },

            md: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H5 },
                fontSize: "$lg",
                lineHeight: "$lg"
            },

            sm: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H6 },
                fontSize: "$md",
                lineHeight: "$lg"
            },

            xs: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                props: { as: H6 },
                fontSize: "$sm",
                lineHeight: "$xs"
            }
        }
    },

    defaultProps: {
        size: "lg"
    }
});
