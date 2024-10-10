"use client";
import { createImage } from "@gluestack-ui/image";
import { tva } from "@gluestack-ui/nativewind-utils/tva";
import { cssInterop } from "nativewind";
import React from "react";
import { Image as RNImage, Platform } from "react-native";

import type { VariantProps } from "@gluestack-ui/nativewind-utils";

const imageStyle = tva({
    base: "max-w-full",
    variants: {
        size: {
            "2xs": "h-6 w-6",
            xs: "h-10 w-10",
            sm: "h-16 w-16",
            md: "h-20 w-20",
            lg: "h-24 w-24",
            xl: "h-32 w-32",
            "2xl": "h-64 w-64",
            full: "h-full w-full"
        }
    }
});

const UIImage = createImage({ Root: RNImage });
cssInterop(UIImage, { className: "style" });

type ImageProps = VariantProps<typeof imageStyle> & React.ComponentProps<typeof UIImage>;
const Image = React.forwardRef<React.ElementRef<typeof UIImage>, ImageProps & { className?: string }>(
    ({ size = "md", className, ...props }, ref) => {
        return (
            <UIImage
                className={imageStyle({ size, class: className })}
                {...props}
                ref={ref}
                //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-expect-error
                style={Platform.OS === "web" ? { height: "revert-layer", width: "revert-layer" } : undefined}
            />
        );
    }
);

Image.displayName = "Image";
export default Image;
