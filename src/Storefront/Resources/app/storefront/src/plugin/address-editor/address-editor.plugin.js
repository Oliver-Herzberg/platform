import Plugin from 'src/plugin-system/plugin.class';
import HttpClient from 'src/service/http-client.service';
import PageLoadingIndicatorUtil from 'src/utility/loading-indicator/page-loading-indicator.util';
import PseudoModalUtil from 'src/utility/modal-extension/pseudo-modal.util';
import DomAccess from 'src/helper/dom-access.helper';
import Iterator from 'src/helper/iterator.helper';
import PluginManager from 'src/plugin-system/plugin.manager';
import Feature from 'src/helper/feature.helper';

/**
 * this plugins opens a modal
 * where an address can be edited or created
 */
export default class AddressEditorPlugin extends Plugin {

    static options = {
        url: window.router['frontend.account.addressbook'],
        addressId: false,
        changeShipping: false,
        changeBilling: false,
        editorModalClass: 'address-editor-modal',
        closeEditorClass: 'js-close-address-editor',
        csrfToken: '',
    };

    init() {
        if (!this.options.changeShipping && !this.options.changeBilling) {
            throw new Error('One or both of the options "changeShipping" or "changeShipping" has to be true!');
        }

        this._client = new HttpClient();
        this._registerEvents();
    }

    /**
     * registers all needed event listeners
     *
     * @private
     */
    _registerEvents() {
        const onClick = this._getModal.bind(this);

        this.el.removeEventListener('click', onClick);
        this.el.addEventListener('click', onClick);
    }

    /**
     * callback when element is clicked
     *
     * @param {Event} event
     *
     * @private
     */
    _getModal(event) {
        event.preventDefault();
        PageLoadingIndicatorUtil.create();

        const data = this._getRequestData();

        this.$emitter.publish('beforeGetModal');

        this._client.abort();
        this._client.post(this.options.url, JSON.stringify(data), content => this._openModal(content));
    }

    /**
     * returns the request data
     *
     * @returns {*}
     *
     * @private
     */
    _getRequestData() {
        const data = {
            id: this.options.addressId,
            changeableAddresses: {
                changeShipping: this.options.changeShipping,
                changeBilling: this.options.changeBilling,
            },
        };

        if (window.csrf.enabled && window.csrf.mode === 'twig') {
            data['_csrf_token'] = this.options.csrfToken;
        }

        return data;
    }

    /**
     * opens the address edit modal with the
     * ajax call content
     *
     * @param {string} response
     *
     * @private
     */
    _openModal(response) {
        const pseudoModal = new PseudoModalUtil(response);

        PageLoadingIndicatorUtil.remove();
        pseudoModal.open(this._onOpen.bind(this, pseudoModal));

        const modal = pseudoModal.getModal();

        modal.classList.add(this.options.editorModalClass);
    }

    /**
     * callback after the modal is opened
     *
     * @param {PseudoModalUtil} pseudoModal
     *
     * @private
     */
    _onOpen(pseudoModal) {
        window.PluginManager.initializePlugins();

        this._registerModalEvents(pseudoModal);

        this.$emitter.publish('onOpen', { pseudoModal });
    }

    /**
     * register all needed events
     * after the modal content is set
     *
     * @param {PseudoModalUtil} pseudoModal
     *
     * @private
     */
    _registerModalEvents(pseudoModal) {
        this._registerCollapseCallback(pseudoModal);
        this._registerAjaxSubmitCallback(pseudoModal);

        this.$emitter.publish('registerModalEvents', { pseudoModal });
    }

    /**
     * callback to update the modal position
     * after the collapses have changed
     *
     * @param {PseudoModalUtil} pseudoModal
     *
     * @private
     */
    _registerCollapseCallback(pseudoModal) {
        const modal = pseudoModal.getModal();

        /**
         * @deprecated tag:v6.5.0 - Bootstrap v5 renames `data-toggle` attribute to `data-bs-toggle`
         * Replace variable `dataBsToggleSelector` with string `[data-bs-toggle="collapse"]`.
         */
        const dataBsToggleSelector = Feature.isActive('v6.5.0.0') ? '[data-bs-toggle="collapse"]' : '[data-toggle="collapse"]';

        /**
         * @deprecated tag:v6.5.0 - Bootstrap v5 renames `data-target` attribute to `data-bs-target`
         * Replace variable `dataBsTargetAttr` with string `data-bs-target`.
         */
        const dataBsTargetAttr = Feature.isActive('v6.5.0.0') ? 'data-bs-target' : 'data-target';

        const collapseTriggers = DomAccess.querySelectorAll(modal, dataBsToggleSelector, false);

        if (collapseTriggers) {
            Iterator.iterate(collapseTriggers, collapseTrigger => {
                const targetSelector = DomAccess.getDataAttribute(collapseTrigger, dataBsTargetAttr);
                const target = DomAccess.querySelector(modal, targetSelector);
                const parentSelector = DomAccess.getDataAttribute(target, 'data-parent');
                const parent = DomAccess.querySelector(modal, parentSelector);

                /** @deprecated tag:v6.5.0 - Bootstrap v5 uses native HTML elements and events to subscribe to Collapse plugin events */
                if (Feature.isActive('v6.5.0.0')) {
                    parent.addEventListener('hidden.bs.collapse', () => {
                        pseudoModal.updatePosition();

                        this.$emitter.publish('collapseHidden', { pseudoModal });
                    });
                } else {
                    $(parent).on('hidden.bs.collapse', () => {
                        pseudoModal.updatePosition();

                        this.$emitter.publish('collapseHidden', { pseudoModal });
                    });
                }
            });
        }

        this.$emitter.publish('registerCollapseCallback', { pseudoModal });
    }

    /**
     * callback to close the modal after address selection
     * callback to register the modal events after ajax submit
     *
     * @param {PseudoModalUtil} pseudoModal
     *
     * @private
     */
    _registerAjaxSubmitCallback(pseudoModal) {
        const modal = pseudoModal.getModal();
        const ajaxForms = DomAccess.querySelectorAll(modal, '[data-form-ajax-submit]', false);

        if (ajaxForms) {
            Iterator.iterate(ajaxForms, ajaxForm => {

                /** @type FormAjaxSubmitPlugin **/
                const FormAjaxSubmitInstance = PluginManager.getPluginInstanceFromElement(ajaxForm, 'FormAjaxSubmit');

                if (FormAjaxSubmitInstance) {
                    FormAjaxSubmitInstance.addCallback(() => {
                        this._registerAjaxSubmitCallback(pseudoModal);

                        const shouldBeClosed = ajaxForm.classList.contains(this.options.closeEditorClass);
                        if (shouldBeClosed) {
                            pseudoModal.close();
                            PageLoadingIndicatorUtil.create();

                            // dirty hack, because chromium cache is weird
                            // basically a window.location.reload() but chrome reloads
                            // with ?redirected=1 which is not the wanted behaviour
                            // this replaces the redirected=1 to a redirected=0
                            if (typeof URL === "function") {
                                const url = new URL(window.location.href);
                                url.searchParams.delete('redirected');
                                window.location.assign(url.toString());
                            } else {
                                window.location.reload();
                            }
                        }
                    });
                }

            });
        }
        this.$emitter.publish('registerAjaxSubmitCallback', { pseudoModal });
    }
}
