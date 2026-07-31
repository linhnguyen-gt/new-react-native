import React from 'react';
import { useController } from 'react-hook-form';

import Input from './input';

import type { InputProps } from './input';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface ControlledInputProps<T extends FieldValues> extends Omit<
    InputProps,
    'value' | 'onChangeValue' | 'fieldName'
> {
    name: Path<T>;
    control: Control<T>;
    error?: string;
    rules?: Record<string, any>;
    testID?: string;
    shouldUseFieldError?: boolean;
}

const ControlledInput = <T extends FieldValues>({
    name,
    control,
    error,
    rules,
    shouldUseFieldError = false,
    ...restProps
}: ControlledInputProps<T>) => {
    const {
        field: { onChange, value, onBlur },
        fieldState: { error: fieldError },
    } = useController({
        name,
        control,
        rules,
    });

    const displayError = shouldUseFieldError && fieldError ? fieldError.message : error;

    return (
        <Input
            {...restProps}
            value={value}
            error={displayError}
            onChangeText={onChange}
            onBlur={onBlur}
            testID={restProps.testID}
        />
    );
};

export default ControlledInput;
