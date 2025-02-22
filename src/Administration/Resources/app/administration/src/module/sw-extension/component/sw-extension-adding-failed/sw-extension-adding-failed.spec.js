import { shallowMount } from '@vue/test-utils';
import 'src/module/sw-extension/component/sw-extension-adding-failed';
import 'src/app/component/base/sw-button';
import 'src/app/component/base/sw-circle-icon';
import 'src/app/component/base/sw-label';
import extensionStore from 'src/module/sw-extension/store/extensions.store';
import ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';

Shopware.State.registerModule('shopwareExtensions', extensionStore);

async function createWrapper() {
    const shopwareExtensionService = new ShopwareExtensionService();

    return shallowMount(await Shopware.Component.build('sw-extension-adding-failed'), {
        stubs: {
            'sw-button': await Shopware.Component.build('sw-button'),
            'sw-circle-icon': await Shopware.Component.build('sw-circle-icon'),
            'sw-label': await Shopware.Component.build('sw-label'),
            'sw-icon': true,
            i18n: true
        },
        propsData: {
            extensionName: 'test-app'
        },
        provide: {
            shopwareExtensionService
        }
    });
}

describe('src/module/sw-extension-component/sw-extension-adding-failed', () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it('passes correct props to sw-circle-icon', async () => {
        wrapper = await createWrapper();

        expect(wrapper.get('.sw-circle-icon').props('variant')).toBe('danger');
        expect(wrapper.get('.sw-circle-icon').props('size')).toBe(72);
        expect(wrapper.get('.sw-circle-icon').props('iconName')).toBe('regular-times-circle-s');
    });

    it('has a primary block button', async () => {
        Shopware.State.commit('shopwareExtensions/myExtensions', []);

        wrapper = await createWrapper();

        const closeButton = wrapper.get('button.sw-button');

        expect(closeButton.props('variant')).toBe('primary');
        expect(closeButton.props('block')).toBe(true);
    });

    it('emits close if close button is clicked', async () => {
        Shopware.State.commit('shopwareExtensions/myExtensions', []);

        wrapper = await createWrapper();

        await wrapper.get('button.sw-button').trigger('click');

        expect(wrapper.emitted().close).toBeTruthy();
    });

    it('it renders all information if extension is rent', async () => {
        Shopware.State.commit('shopwareExtensions/myExtensions', [{
            name: 'test-app',
            storeLicense: {
                variant: 'rent'
            }
        }]);

        wrapper = await createWrapper(true);

        wrapper.get('.sw-extension-adding-failed__text-licence-cancellation');
    });

    it('does not render additional information if the license is not a subscription', async () => {
        Shopware.State.commit('shopwareExtensions/myExtensions', [{
            name: 'test-app',
            storeLicense: {
                variant: 'buy'
            }
        }]);

        wrapper = await createWrapper();

        expect(wrapper.find('.sw-extension-installation-failed__text-licence-cancellation')
            .exists())
            .toBe(false);
        expect(wrapper.find('h3').text())
            .toEqual(
                'sw-extension-store.component.sw-extension-adding-failed.installationFailed.titleFailure'
            );
        expect(wrapper.find('p').text())
            .toEqual(
                'sw-extension-store.component.sw-extension-adding-failed.installationFailed.textProblem'
            );
    });

    // eslint-disable-next-line max-len
    it('does not render additional information about licenses and uses general failure text if extension is not licensed', async () => {
        Shopware.State.commit('shopwareExtensions/myExtensions', []);

        wrapper = await createWrapper(true);

        expect(wrapper.find('.sw-extension-installation-failed__text-licence-cancellation')
            .exists()).toBe(false);
        expect(wrapper.find('h3')
            .text()).toEqual('sw-extension-store.component.sw-extension-adding-failed.titleFailure');
        expect(wrapper.find('p')
            .text()).toEqual('sw-extension-store.component.sw-extension-adding-failed.textProblem');
    });
});
