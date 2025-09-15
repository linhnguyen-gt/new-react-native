import React from 'react';
import { Provider } from 'react-redux';

import { Store } from '@/store';

import App from '@/App';

const Root = () => (
    <Provider store={Store}>
        <App />
    </Provider>
);

export default Root;
