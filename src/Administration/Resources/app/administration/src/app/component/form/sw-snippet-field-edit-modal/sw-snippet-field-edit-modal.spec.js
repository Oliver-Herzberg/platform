import { createLocalVue, shallowMount } from '@vue/test-utils';
import uuid from 'src/../test/_helper_/uuid';
import 'src/app/component/base/sw-icon';
import 'src/app/component/base/sw-modal';
import 'src/app/component/base/sw-button';
import 'src/app/component/form/sw-snippet-field';
import 'src/app/component/form/sw-field';
import 'src/app/component/form/sw-text-field';
import 'src/app/component/form/field-base/sw-contextual-field';
import 'src/app/component/form/field-base/sw-block-field';
import 'src/app/component/form/field-base/sw-base-field';
import 'src/app/component/form/field-base/sw-field-error';
import 'src/app/component/form/sw-snippet-field-edit-modal';

async function createWrapper(roles = [], customOptions = {}) {
    Shopware.State.get('session').currentUser = {
        username: 'testUser'
    };

    const localVue = createLocalVue();
    localVue.directive('tooltip', {});

    return shallowMount(await Shopware.Component.build('sw-snippet-field-edit-modal'), {
        localVue,
        sync: false,
        propsData: {
            translationKey: 'test.snippet',
            fieldType: 'text',
            snippets: [{
                author: 'testUser',
                id: null,
                value: 'english',
                origin: null,
                resetTo: 'english',
                translationKey: 'test.snippet',
                setId: uuid.get('en-GB')
            }, {
                author: 'testUser',
                id: null,
                value: 'deutsch',
                origin: null,
                resetTo: 'deutsch',
                translationKey: 'test.snippet',
                setId: uuid.get('de-DE')
            }],
            snippetSets: createEntityCollection([
                {
                    name: 'Base en-GB',
                    iso: 'en-GB',
                    id: uuid.get('en-GB')
                },
                {
                    name: 'Base de-DE',
                    iso: 'de-DE',
                    id: uuid.get('de-DE')
                }
            ])
        },
        stubs: {
            'sw-field': await Shopware.Component.build('sw-field'),
            'sw-text-field': await Shopware.Component.build('sw-text-field'),
            'sw-contextual-field': await Shopware.Component.build('sw-contextual-field'),
            'sw-block-field': await Shopware.Component.build('sw-block-field'),
            'sw-base-field': await Shopware.Component.build('sw-base-field'),
            'sw-field-error': await Shopware.Component.build('sw-field-error'),
            'sw-loader': true,
            'icons-regular-times-s': true,
            'sw-icon': await Shopware.Component.build('sw-icon'),
            'sw-modal': await Shopware.Component.build('sw-modal'),
            'sw-button': await Shopware.Component.build('sw-button')
        },
        provide: {
            validationService: {},
            acl: {
                can: (identifier) => {
                    return roles.includes(identifier);
                }
            },
            snippetService: {
                save: () => {}
            },
            shortcutService: {
                stopEventListener: () => {},
                startEventListener: () => {}
            }
        },
        ...customOptions
    });
}

function createEntityCollection(entities = []) {
    return new Shopware.Data.EntityCollection('collection', 'collection', {}, null, entities);
}

describe('src/app/component/form/sw-snippet-field-edit-modal', () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it('should be a Vue.JS component', async () => {
        wrapper = await createWrapper();
        expect(wrapper.vm).toBeTruthy();
    });

    it.each([
        ['disabled', 'snippet.viewer'],
        [undefined, 'snippet.viewer, snippet.editor'],
        [undefined, 'snippet.viewer, snippet.editor, snippet.creator'],
        [undefined, 'snippet.viewer, snippet.editor, snippet.deleter']
    ])('should only have disabled inputs', async (state, role) => {
        Shopware.State.get('session').currentUser = {
            username: 'testUser'
        };
        const roles = role.split(', ');
        wrapper = await createWrapper(roles);

        await wrapper.vm.$nextTick();

        const [firstInput, secondInput] = wrapper.findAll('input[name=sw-field--snippet-value]').wrappers;

        expect(firstInput.attributes('disabled')).toBe(state);
        expect(secondInput.attributes('disabled')).toBe(state);
    });

    it('should have a disabled save button', async () => {
        wrapper = await createWrapper('snippet.viewer');
        const saveButton = wrapper.find('.sw-snippet-field-edit-modal__save-action');

        expect(saveButton.attributes('disabled')).toContain('disabled');
    });
});
