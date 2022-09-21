const { addElement, getElementSelector } = require( '../assets/elements-utils' );
const BasePage = require( './base-page.js' );

module.exports = class EditorPage extends BasePage {
	isPanelLoaded = false;

	constructor( page, testInfo, cleanPostId = null ) {
		super( page, testInfo );

		this.previewFrame = this.page.frame( { name: 'elementor-preview-iframe' } );

		this.postId = cleanPostId;
	}

	async openNavigator() {
		const isOpen = await this.previewFrame.evaluate( () =>
			elementor.navigator.isOpen(),
		);

		if ( ! isOpen ) {
			await this.page.click( '#elementor-panel-footer-navigator' );
		}
	}

	async closeNavigator() {
		const isOpen = await this.previewFrame.evaluate( () =>
			elementor.navigator.isOpen(),
		);

		if ( isOpen ) {
			await this.page.click( '#elementor-navigator__close' );
		}
	}

	/**
	 * Reload the editor page.
	 *
	 * @return {Promise<void>}
	 */
	async reload() {
		await this.page.reload();

		this.previewFrame = this.page.frame( { name: 'elementor-preview-iframe' } );
	}

    getFrame() {
		return this.page.frame( { name: 'elementor-preview-iframe' } );
    }

	/**
	 * Make sure that the elements panel is loaded.
	 *
	 * @return {Promise<void>}
	 */
	async ensurePanelLoaded() {
		if ( this.isPanelLoaded ) {
			return;
		}

		await this.page.waitForSelector( '#elementor-panel-header-title' );
		await this.page.waitForSelector( 'iframe#elementor-preview-iframe' );

		this.isPanelLoaded = true;
	}

	/**
	 * Add element to the page using a model.
	 *
	 * @param {Object} model     - Model definition.
	 * @param {string} container - Optional Container to create the element in.
	 *
	 * @return {Promise<*>} Element ID
	 */
	async addElement( model, container = null ) {
		return await this.page.evaluate( addElement, { model, container } );
	}

	/**
	 * Add a widget by `widgetType`.
	 *
	 * @param {string} widgetType
	 * @param {string} container  - Optional Container to create the element in.
	 */
	async addWidget( widgetType, container = null ) {
		return await this.addElement( { widgetType, elType: 'widget' }, container );
	}

	/**
	 * @typedef {import('@playwright/test').ElementHandle} ElementHandle
	 */
	/**
	 * Get element handle from the preview frame using its Container ID.
	 *
	 * @param {string} id - Container ID.
	 *
	 * @return {Promise<ElementHandle<SVGElement | HTMLElement> | null>} element handle
	 */
	async getElementHandle( id ) {
		return this.getPreviewFrame().$( getElementSelector( id ) );
	}

	getPreviewFrame() {
		return this.page.frame( { name: 'elementor-preview-iframe' } );
	}

	/**
	 * Use the Canvas post template.
	 *
	 * @param {String} templateName - The name of the template;
	 *
	 * @return {Promise<void>}
	 */
	 async pageLayoutTemplate( templateName = 'canvas' ) {
		await this.page.click( '#elementor-panel-footer-settings' );
		await this.page.selectOption( '.elementor-control-template >> select', 'elementor_canvas' );
		await this.getPreviewFrame().waitForSelector( '.elementor-template-canvas' );
	}
	
	/**
	 * Select an element inside the editor.
	 *
	 * @param {String} element - Element ID;
	 *
	 * @return {Promise<void>}
	 */
	 async selectElement( container ) {
		const containerElement = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + container );
		await containerElement.hover();
		const containerEditButton = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + container + ' > .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
		await containerEditButton.click();
	}
};
