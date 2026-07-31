import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import HStack from '..';

describe('HStack', () => {
    // The regression: HStack always rendered a TouchableOpacity, which TouchableComponent marks
    // disabled when there is no onPress — so every layout row was announced "dimmed, button".
    it('is not a button when it has no onPress', async () => {
        await render(
            <HStack>
                <Text>row</Text>
            </HStack>
        );

        expect(screen.queryByRole('button')).toBeNull();
        expect(screen.getByText('row')).toBeTruthy();
    });

    it('is pressable when given onPress', async () => {
        const onPress = jest.fn();

        await render(
            <HStack onPress={onPress} testID="pressable-row">
                <Text>row</Text>
            </HStack>
        );

        fireEvent.press(screen.getByTestId('pressable-row'));

        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
