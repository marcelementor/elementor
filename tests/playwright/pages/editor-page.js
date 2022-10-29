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

	/**
	 * Close the navigator if open.
	 *
	 * @return {Promise<void>}
	 */
	async closeNavigatorIfOpen() {
		const isOpen = await this.previewFrame.evaluate( () => elementor.navigator.isOpen() );

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
	 * @return {Promise<void>}
	 */
	async useCanvasTemplate() {
		await this.page.click( '#elementor-panel-footer-settings' );
		await this.page.selectOption( '.elementor-control-template >> select', 'elementor_canvas' );
		await this.getPreviewFrame().waitForSelector( '.elementor-template-canvas' );
	}

	/**
	 * Select an element inside the editor.
	 *
	 * @param {string} elementId - Element ID;
	 *
	 * @return {Promise<void>}
	 */
	async selectElement( elementId ) {
		await this.getPreviewFrame().waitForSelector( '.elementor-element-' + elementId );

		if ( await this.getPreviewFrame().$( '.elementor-element-' + elementId + ':not( .elementor-sticky__spacer ).elementor-element-editable' ) ) {
			return;
		}

		const element = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.hover();
		const elementEditButton = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId + ' > .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
		await elementEditButton.click();
		await this.getPreviewFrame().waitForSelector( '.elementor-element-' + elementId + ':not( .elementor-sticky__spacer ).elementor-element-editable' );
	}

	/**
	 * Activate a tab inside the panel editor.
	 *
	 * @param {string} panelName - The name of the panel;
	 *
	 * @return {Promise<void>}
	 */
	async activatePanelTab( panelName ) {
		await this.page.waitForSelector( '.elementor-tab-control-' + panelName + ' a' );

		// Check if panel has been activated already.
		if ( await this.page.$( '.elementor-tab-control-' + panelName + '.elementor-active' ) ) {
			return;
		}

		await this.page.locator( '.elementor-tab-control-' + panelName + ' a' ).click();
		await this.page.waitForSelector( '.elementor-tab-control-' + panelName + '.elementor-active' );
	}

	/**
	 * Set a custom width value to a widget.
	 *
	 * @param {string} width - The custom width value (as a percentage);
	 *
	 * @return {Promise<void>}
	 */
	async setWidgetCustomWidth( width = '100' ) {
		await this.activatePanelTab( 'advanced' );
		await this.page.selectOption( '.elementor-control-_element_width >> select', 'initial' );
		await this.page.locator( '.elementor-control-_element_custom_width .elementor-control-input-wrapper input' ).fill( width );
	}

	/**
	 * Set a widget to `flew grow`.
	 *
	 * @return {Promise<void>}
	 */
	async setWidgetToFlexGrow() {
		await this.page.locator( '.elementor-control-_flex_size .elementor-control-input-wrapper .eicon-grow' ).click();
	}

	/**
	 * Set a widget mask.
	 *
	 * @return {Promise<void>}
	 */
	async setWidgetMask() {
		await this.page.locator( '.elementor-control-_section_masking' ).click();
		await this.page.locator( '.elementor-control-_mask_switch .elementor-control-input-wrapper .elementor-switch .elementor-switch-label' ).click();
		await this.page.selectOption( '.elementor-control-_mask_size >> select', 'custom' );
		await this.page.locator( '.elementor-control-_mask_size_scale .elementor-control-input-wrapper input' ).fill( '30' );
		await this.page.selectOption( '.elementor-control-_mask_position >> select', 'top right' );
	}

	/**
	 * Autopopulate the Image Carousel.
	 *
	 * @return {Promise<void>}
	 */
	async populateImageCarousel() {
		await this.activatePanelTab( 'content' );
		await this.page.locator( '[aria-label="Add Images"]' ).click();

		// Open Media Library
		await this.page.click( 'text=Media Library' );

		// Upload the images to WP media library
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/A.jpg' );
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/B.jpg' );
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/C.jpg' );
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/D.jpg' );
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/E.jpg' );

		// Create a new gallery
		await this.page.locator( 'text=Create a new gallery' ).click();

		// Insert gallery
		await this.page.locator( 'text=Insert gallery' ).click();

		// Open The Additional options Section
		await this.page.click( '#elementor-controls >> :nth-match(div:has-text("Additional Options"), 3)' );

		// Disable AutoPlay
		await this.page.selectOption( 'select', 'no' );
	}

	/**
	 * Set a background color to an element.
	 *
	 * @param {string}  color     - The background color code;
	 * @param {string}  elementId - The ID of targeted element;
	 * @param {boolean} isWidget  - Indicate whether the element is a widget or not; the default value is 'widget';
	 *
	 * @return {Promise<void>}
	 */
	async setBackgroundColor( color, elementId, isWidget = true ) {
		const panelTab = isWidget ? 'advanced' : 'style',
			backgroundSelector = isWidget ? '.elementor-control-_background_background ' : '.elementor-control-background_background ',
			backgroundColorSelector = isWidget ? '.elementor-control-_background_color ' : '.elementor-control-background_color ';

		await this.selectElement( elementId );
		await this.activatePanelTab( panelTab );

		if ( isWidget ) {
			await this.page.locator( '.elementor-control-_section_background .elementor-panel-heading-title' ).click();
		}

		await this.page.locator( backgroundSelector + '.eicon-paint-brush' ).click();
		await this.page.locator( backgroundColorSelector + '.pcr-button' ).click();
		await this.page.locator( '.pcr-app.visible .pcr-interaction input.pcr-result' ).fill( color );
	}

	/**
	 * Remove the focus from the test elements by creating two new elements.
	 *
	 * @return {Promise<void>}
	 */
	async removeFocus() {
		await this.getPreviewFrame().locator( '#elementor-add-new-section' ).click( { button: 'right' } );
	}

	/**
	 * Hide all editor elements from the screenshots.
	 *
	 * @return {Promise<void>}
	 */
	async hideEditorElements() {
		const css = '<style>.elementor-element-overlay,.elementor-empty-view,.elementor-widget-empty,.e-view{opacity: 0;}.elementor-widget,.elementor-widget:hover{box-shadow:none!important;}.elementor-add-section-inner {border: none !important;background-color: #cccccc !important;}</style>';

		await this.addWidget( 'html' );
		await this.getPreviewFrame().waitForSelector( '.elementor-widget-html' );
		await this.page.locator( '.elementor-control-type-code textarea' ).fill( css );
	}

	/**
	 * Hide controls from the video widgets.
	 *
	 * @return {Promise<void>}
	 */
	async hideVideoControls() {
		await this.getPreviewFrame().waitForSelector( '.elementor-video' );

		const videoFrame = this.getPreviewFrame().frameLocator( '.elementor-video' ),
			videoButton = videoFrame.locator( 'button.ytp-large-play-button.ytp-button.ytp-large-play-button-red-bg' ),
			videoGradient = videoFrame.locator( '.ytp-gradient-top' ),
			videoTitle = videoFrame.locator( '.ytp-show-cards-title' ),
			videoBottom = videoFrame.locator( '.ytp-impression-link' );

		await videoButton.evaluate( ( element ) => element.style.opacity = 0 );
		await videoGradient.evaluate( ( element ) => element.style.opacity = 0 );
		await videoTitle.evaluate( ( element ) => element.style.opacity = 0 );
		await videoBottom.evaluate( ( element ) => element.style.opacity = 0 );
	}

	/**
	 * Hide controls and overlays on map widgets.
	 *
	 * @return {Promise<void>}
	 */
	async hideMapControls() {
		await this.getPreviewFrame().waitForSelector( '.elementor-widget-google_maps iframe' );

		const mapFrame = this.getPreviewFrame().frameLocator( '.elementor-widget-google_maps iframe' ),
			mapText = mapFrame.locator( '.gm-style iframe + div + div' ),
			mapInset = mapFrame.locator( 'button.gm-inset-map.gm-inset-light' ),
			mapControls = mapFrame.locator( '.gmnoprint.gm-bundled-control.gm-bundled-control-on-bottom' );

		await mapText.evaluate( ( element ) => element.style.opacity = 0 );
		await mapInset.evaluate( ( element ) => element.style.opacity = 0 );
		await mapControls.evaluate( ( element ) => element.style.opacity = 0 );
	}
};
