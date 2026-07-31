import AntDesignIcon from '@react-native-vector-icons/ant-design';
import EntypoIcon from '@react-native-vector-icons/entypo';
import EvilIconsIcon from '@react-native-vector-icons/evil-icons';
import FeatherIcon from '@react-native-vector-icons/feather';
import IoniconsIcon from '@react-native-vector-icons/ionicons';
import MaterialIconsIcon from '@react-native-vector-icons/material-icons';
import React from 'react';

import { MyTouchable } from '../../touchable';

import type {
    AntDesignIconName,
    EntypoIconName,
    EvilIconsIconName,
    FeatherIconName,
    IconFont,
    IconName,
    IoniconsIconName,
    MaterialIconsIconName,
} from '@/types/icon';

import { getColor } from '@/hooks/useThemeColor';

interface IconProps {
    name: IconName;
    size?: number;
    className?: string;
    color?: string;
    focused?: boolean;
    font?: IconFont;
    onPress?: () => void;
    disabled?: boolean;
}

const IconComponent: React.FC<IconProps> = ({
    name,
    size = 16,
    className = '',
    color,
    focused = false,
    font = 'entypo',
    onPress,
    disabled = false,
}) => {
    // `color` accepts a design-system token as well as a literal, so it has to go through the
    // resolver too — passing `success-500` straight to the icon font yields black.
    const getIconColor = () => {
        if (color) return getColor(color) ?? color;
        if (focused) return getColor('yellow.500');
        return getColor('typography-500');
    };

    const renderIcon = () => {
        switch (font) {
            case 'ant-design':
                return (
                    <AntDesignIcon
                        name={name as AntDesignIconName}
                        size={size}
                        color={getIconColor()}
                        className={className}
                    />
                );
            case 'ionicons':
                return (
                    <IoniconsIcon
                        name={name as IoniconsIconName}
                        size={size}
                        color={getIconColor()}
                        className={className}
                    />
                );
            case 'feather':
                return (
                    <FeatherIcon
                        name={name as FeatherIconName}
                        size={size}
                        color={getIconColor()}
                        className={className}
                    />
                );
            case 'material-icons':
                return (
                    <MaterialIconsIcon
                        name={name as MaterialIconsIconName}
                        size={size}
                        color={getIconColor()}
                        className={className}
                    />
                );
            case 'evil-icons':
                return (
                    <EvilIconsIcon
                        name={name as EvilIconsIconName}
                        size={size}
                        color={getIconColor()}
                        className={className}
                    />
                );
            default:
                return (
                    <EntypoIcon
                        name={name as EntypoIconName}
                        size={size}
                        color={getIconColor()}
                        className={className}
                    />
                );
        }
    };

    return (
        <MyTouchable onPress={onPress} disabled={disabled || !onPress}>
            {renderIcon()}
        </MyTouchable>
    );
};

export default IconComponent;
