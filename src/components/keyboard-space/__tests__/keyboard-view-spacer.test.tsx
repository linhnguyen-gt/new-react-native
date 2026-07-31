import { render } from '@testing-library/react-native';
import React from 'react';
import { Keyboard, Platform, Text } from 'react-native';

import KeyboardViewSpacer from '../keyboard-view-spacer';

const renderOn = async (os: 'ios' | 'android', remove: () => void = jest.fn()) => {
    Platform.OS = os;

    const addListener = jest
        .spyOn(Keyboard, 'addListener')
        .mockImplementation(() => ({ remove }) as unknown as ReturnType<typeof Keyboard.addListener>);

    const view = await render(
        <KeyboardViewSpacer>
            <Text>child</Text>
        </KeyboardViewSpacer>
    );

    return { addListener, view };
};

describe('KeyboardViewSpacer', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
        Platform.OS = originalOS;
        jest.restoreAllMocks();
    });

    it('subscribes to the iOS-only will* events on iOS', async () => {
        const { addListener } = await renderOn('ios');

        expect(addListener).toHaveBeenCalledWith('keyboardWillShow', expect.any(Function));
        expect(addListener).toHaveBeenCalledWith('keyboardWillHide', expect.any(Function));
    });

    // The regression: Android never emits will*, so keyboard avoidance did nothing there.
    it('subscribes to the did* events on Android', async () => {
        const { addListener } = await renderOn('android');

        expect(addListener).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));
        expect(addListener).toHaveBeenCalledWith('keyboardDidHide', expect.any(Function));
    });

    it('removes both listeners on unmount', async () => {
        const remove = jest.fn();

        const { view } = await renderOn('android', remove);
        await view.unmount();

        expect(remove).toHaveBeenCalledTimes(2);
    });
});
