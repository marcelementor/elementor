import Base from '../../../../../../assets/dev/js/frontend/handlers/base';

export default class NestedTabs extends Base {
	/**
	 * @param {string|number} tabIndex
	 *
	 * @return {string}
	 */
	getTabTitleFilterSelector( tabIndex ) {
		return `[data-tab="${ tabIndex }"]`;
	}

	/**
	 * @param {string|number} tabIndex
	 *
	 * @return {string}
	 */
	getTabContentFilterSelector( tabIndex ) {
		// Double by 2, since each `e-con` should have 'e-collapse'.
		return `*:nth-child(${ tabIndex * 2 })`;
	}

	/**
	 * @param {HTMLElement} tabTitleElement
	 *
	 * @return {string}
	 */
	getTabIndex( tabTitleElement ) {
		return tabTitleElement.getAttribute( 'data-tab' );
	}

	getDefaultSettings() {
		return {
			selectors: {
				tablist: '[role="tablist"]',
				tabTitle: '.e-n-tab-title',
				tabContent: '.e-con',
				widgetWrapper: '.e-n-tabs',
				activeTabContentContainers: '.e-con.e-active',
				mobileTabTitle: '.e-n-tab-title',  // To be updated.
			},
			classes: {
				active: 'e-active',
			},
			showTabFn: 'show',
			hideTabFn: 'hide',
			toggleSelf: false,
			hidePrevious: true,
			autoExpand: true,
			keyDirection: {
				ArrowLeft: elementorFrontendConfig.is_rtl ? 1 : -1,
				ArrowUp: -1,
				ArrowRight: elementorFrontendConfig.is_rtl ? -1 : 1,
				ArrowDown: 1,
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$tabTitles: this.findElement( selectors.tabTitle ),
			$tabContents: this.findElement( selectors.tabContent ),
			$mobileTabTitles: this.findElement( selectors.mobileTabTitle ), // To be updated.
			$widgetWrapper: this.findElement( selectors.widgetWrapper ),
		};
	}

	activateDefaultTab() {
		const settings = this.getSettings();

		const defaultActiveTab = this.getEditSettings( 'activeItemIndex' ) || 1,
			originalToggleMethods = {
				showTabFn: settings.showTabFn,
				hideTabFn: settings.hideTabFn,
			};

		// Toggle tabs without animation to avoid jumping
		this.setSettings( {
			showTabFn: 'show',
			hideTabFn: 'hide',
		} );

		this.changeActiveTab( defaultActiveTab );

		// Return back original toggle effects
		this.setSettings( originalToggleMethods );
	}

	handleKeyboardNavigation( event ) {
		const tab = event.currentTarget,
			$tabList = jQuery( tab.closest( this.getSettings( 'selectors' ).tablist ) ),
			// eslint-disable-next-line @wordpress/no-unused-vars-before-return
			$tabs = $tabList.find( this.getSettings( 'selectors' ).tabTitle ),
			isVertical = 'vertical' === $tabList.attr( 'aria-orientation' );

		switch ( event.key ) {
			case 'ArrowLeft':
			case 'ArrowRight':
				if ( isVertical ) {
					return;
				}
				break;
			case 'ArrowUp':
			case 'ArrowDown':
				if ( ! isVertical ) {
					return;
				}
				event.preventDefault();
				break;
			case 'Home':
				event.preventDefault();
				$tabs.first().trigger( 'focus' );
				return;
			case 'End':
				event.preventDefault();
				$tabs.last().trigger( 'focus' );
				return;
			default:
				return;
		}

		const tabIndex = tab.getAttribute( 'data-tab' ) - 1,
			direction = this.getSettings( 'keyDirection' )[ event.key ],
			nextTab = $tabs[ tabIndex + direction ];

		if ( nextTab ) {
			nextTab.focus();
		} else if ( -1 === tabIndex + direction ) {
			$tabs.last().trigger( 'focus' );
		} else {
			$tabs.first().trigger( 'focus' );
		}
	}

	deactivateActiveTab( tabIndex ) {
		const settings = this.getSettings(),
			$activeTitle = this.getActiveTabObject().tabTitle,
			$activeContent = this.getActiveTabObject().tabContent;

		$activeTitle.attr( this.getTitleDeactivationAttributes() );

		$activeContent[ settings.hideTabFn ]( 0, () => this.onHideTabContent( $activeContent ) );
		$activeContent.attr( 'hidden', 'hidden' ); // I am not sure what this is used for...
	}

	getActiveTabObject( tabIndex ) {
		const settings = this.getSettings(),
			activeTitleFilter = tabIndex ? this.getTabTitleFilterSelector( tabIndex ) : '[aria-selected="true"]';

		return {
			tabTitle: this.elements.$tabTitles.filter( activeTitleFilter ),
			tabContent: this.elements.$tabTitles.filter( activeTitleFilter ).next(),
		};
	}

	getTitleDeactivationAttributes() {
		return {
			'aria-selected': 'false',
		};
	}

	onHideTabContent() {}

	activateTab( tabIndex ) {
		const settings = this.getSettings(),
			animationDuration = 'show' === settings.showTabFn ? 0 : 400;

		let $requestedTitle = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( tabIndex ) ),
			$requestedContent = this.elements.$tabContents.filter( this.getTabContentFilterSelector( tabIndex ) );

		// Check if the tabIndex exists.
		if ( ! $requestedTitle.length ) {
			// Activate the previous tab and ensure that the tab index is not less than 1.
			const previousTabIndex = Math.max( ( tabIndex - 1 ), 1 );

			$requestedTitle = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( previousTabIndex ) );
			$requestedContent = this.elements.$tabContents.filter( this.getTabContentFilterSelector( previousTabIndex ) );
		}

		$requestedTitle.attr( {
			'aria-selected': 'true',
		} );

		$requestedContent[ settings.showTabFn ](
			animationDuration,
			() => this.onShowTabContent( $requestedContent ),
		);
		$requestedContent.removeAttr( 'hidden' ); // I am not sure what this is used for.
	}

	onShowTabContent( $requestedContent ) {
		elementorFrontend.elements.$window.trigger( 'elementor-pro/motion-fx/recalc' );

		/* To be updated */
		/* Study */
		elementorFrontend.elements.$window.trigger( 'elementor/nested-tabs/activate', $requestedContent );
	}

	isActiveTab( tabIndex ) {
		return this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ).hasClass( this.getSettings( 'classes.active' ) );
	}

	onTabClick( event ) {
		event.preventDefault();
		this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ), true );
	}

	onTabKeyDown( event ) {
		this.preventDefaultLinkBehaviourForTabTitle( event );
		this.onKeydownAvoidUndesiredPageScrolling( event );
	}

	onTabKeyUp( event ) {
		switch ( event.code ) {
			case 'ArrowLeft':
			case 'ArrowRight':
				this.handleKeyboardNavigation( event );
				break;
			case 'Enter':
			case 'Space':
				event.preventDefault();
				this.changeActiveTab( event.currentTarget.getAttribute( 'data-tab' ), true );
				break;
		}
	}

	getTabEvents() {
		return {
			keydown: this.onTabKeyDown.bind( this ),
			keyup: this.onTabKeyUp.bind( this ),
			click: this.onTabClick.bind( this ),
		};
	}

	bindEvents() {
		this.elements.$tabTitles.on( this.getTabEvents() );
		elementorFrontend.elements.$window.on( 'resize', this.resizeListenerNestedTabs.bind( this ) );
		elementorFrontend.elements.$window.on( 'elementor/nested-tabs/activate', this.reInitSwipers );
	}

	unbindEvents() {
		this.elements.$tabTitles.off();
		elementorFrontend.elements.$window.off( 'resize' );
		elementorFrontend.elements.$window.off( 'elementor/nested-tabs/activate' );
	}

	resizeListenerNestedTabs() {
		// this.setTabTitleWidth();
	}

	preventDefaultLinkBehaviourForTabTitle( event ) {
		// Support for old markup that includes an `<a>` tag in the tab
		if ( jQuery( event.target ).is( 'a' ) && `Enter` === event.key ) {
			event.preventDefault();
		}
	}

	onKeydownAvoidUndesiredPageScrolling( event ) {
		// We listen to keydowon event for these keys in order to prevent undesired page scrolling
		if ( [ 'End', 'Home', 'ArrowUp', 'ArrowDown' ].includes( event.key ) ) {
			this.handleKeyboardNavigation( event );
		}
	}

	/**
	 * Fixes issues where Swipers that have been initialized while a tab is not visible are not properly rendered
	 * and when switching to the tab the swiper will not respect any of the chosen `autoplay` related settings.
	 *
	 * This is triggered when switching to a nested tab, looks for Swipers in the tab content and reinitializes them.
	 *
	 * @param {Object} event   - Incoming event.
	 * @param {Object} content - Active nested tab dom element.
	 */
	reInitSwipers( event, content ) {
		const swiperElements = content.querySelectorAll( `.${ elementorFrontend.config.swiperClass }` );
		for ( const element of swiperElements ) {
			if ( ! element.swiper ) {
				return;
			}
			element.swiper.initialized = false;
			element.swiper.init();
		}
	}

	onInit( ...args ) {
		this.createMobileTabs( args );

		super.onInit( ...args );

		if ( this.getSettings( 'autoExpand' ) ) {
			this.activateDefaultTab();
		}

		// this.setTabTitleWidth( 'initialisation' );
	}

	onEditSettingsChange( propertyName, value ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.changeActiveTab( value, false );
		}
	}

	/**
	 * @param {string}  tabIndex
	 * @param {boolean} fromUser - Whether the call is caused by the user or internal.
	 */
	changeActiveTab( tabIndex, fromUser = false ) {
		// `document/repeater/select` is used only in the editor, only when the element
		// is in the currently-edited document, and only when its not internal call,
		if ( fromUser && this.isEdit && this.isElementInTheCurrentDocument() ) {
			return window.top.$e.run( 'document/repeater/select', {
				container: elementor.getContainer( this.$element.attr( 'data-id' ) ),
				index: parseInt( tabIndex ),
			} );
		}

		const isActiveTab = this.isActiveTab( tabIndex ),
			settings = this.getSettings();

		if ( ( settings.toggleSelf || ! isActiveTab ) && settings.hidePrevious ) {
			this.deactivateActiveTab();
		}

		if ( ! settings.hidePrevious && isActiveTab ) {
			this.deactivateActiveTab( tabIndex );
		}

		if ( ! isActiveTab ) {
			const isMobileVersion = 'none' === this.elements.$widgetWrapper.css( 'display' );

			if ( isMobileVersion ) {
				/* To be updated */
				/* Still relevant?? */
				this.activateMobileTab( tabIndex );
				return;
			}

			this.activateTab( tabIndex );
		}
	}

	activateMobileTab( tabIndex ) {
		// Timeout time added to ensure that opening of the active tab starts after closing the other tab on Apple devices.
		setTimeout( () => {
			this.activateTab( tabIndex );
			this.forceActiveTabToBeInViewport( tabIndex );
		}, 10 );
	}

	forceActiveTabToBeInViewport( tabIndex ) {
		if ( ! elementorFrontend.isEditMode() ) {
			return;
		}

		/* To be updated */
		/* Study */
		const $activeTitle = this.elements.$mobileTabTitles.filter( this.getTabTitleFilterSelector( tabIndex ) );

		if ( ! elementor.helpers.isInViewport( $activeTitle[ 0 ] ) ) {
			$activeTitle[ 0 ].scrollIntoView( { block: 'center' } );
		}
	}

	createMobileTabs( args ) {
		if ( ! elementorFrontend.isEditMode() ) {
			return;
		}

		const settings = this.getSettings(),
			$widget = this.$element;

		let index = 0;

		this.findElement( '.e-con' ).each( function() {
			const $currentContainer = jQuery( this ),
				$tabTitle = $widget.find( settings.selectors.tabTitle )[ index ];

			$currentContainer.insertAfter( $tabTitle );

			++index;
		} );
	}

	getActiveClass() {
		const settings = this.getSettings();

		return settings.classes.active;
	}

	/* To be updated */
	/* Can be removed? */
	getVisibleTabTitle( tabTitleFilter ) {
		const $tabTitle = this.elements.$tabTitles.filter( tabTitleFilter ),
			isTabTitleDesktopVisible = null !== $tabTitle[ 0 ]?.offsetParent;

		return isTabTitleDesktopVisible ? $tabTitle[ 0 ] : $tabTitle[ 1 ];
	}

	/* To be updated */
	/* Study new behaviour */
	/* To be removed? */
	getKeyPressed( event ) {
		const keyTab = 9,
			keyEscape = 27,
			isTabPressed = keyTab === event?.which,
			isShiftPressed = event?.shiftKey,
			isShiftAndTabPressed = !! isTabPressed && isShiftPressed,
			isOnlyTabPressed = !! isTabPressed && ! isShiftPressed,
			isEscapePressed = keyEscape === event?.which;

		if ( isShiftAndTabPressed ) {
			return 'ShiftTab';
		} else if ( isOnlyTabPressed ) {
			return 'Tab';
		} else if ( isEscapePressed ) {
			return 'Escape';
		}
	}

	/* To be updated */
	/* Study */
	/* To be removed? */
	changeFocusFromContentContainerItemBackToTabTitle( event ) {
		if ( this.hasDropdownLayout() ) {
			return;
		}

		const isShiftAndTabPressed = 'ShiftTab' === this.getKeyPressed( event ),
			isOnlyTabPressed = 'Tab' === this.getKeyPressed( event ),
			isEscapePressed = 'Escape' === this.getKeyPressed( event ),
			firstItemIsInFocus = this.itemInsideContentContainerHasFocus( 0 ),
			lastItemIsInFocus = this.itemInsideContentContainerHasFocus( 'last' ),
			activeTabTitleFilter = `.${ this.getActiveClass() }`,
			activeTabTitleVisible = this.getVisibleTabTitle( activeTabTitleFilter ),
			activeTabTitleIndex = parseInt( activeTabTitleVisible?.getAttribute( 'data-tab' ) ),
			nextTabTitleFilter = this.getTabTitleFilterSelector( activeTabTitleIndex + 1 ),
			nextTabTitleVisible = this.getVisibleTabTitle( nextTabTitleFilter ),
			pressShiftTabOnFirstFocusableItem = isShiftAndTabPressed && firstItemIsInFocus && !! activeTabTitleVisible,
			pressTabOnLastFocusableItem = isOnlyTabPressed && lastItemIsInFocus && !! nextTabTitleVisible;

		if ( pressShiftTabOnFirstFocusableItem || isEscapePressed ) {
			event.preventDefault();

			activeTabTitleVisible?.focus();
		} else if ( pressTabOnLastFocusableItem ) {
			event.preventDefault();

			this.setTabindexOfActiveContainerItems( '-1' );

			nextTabTitleVisible?.focus();
		}
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	changeFocusFromActiveTabTitleToContentContainer( event ) {
		const isOnlyTabPressed = 'Tab' === this.getKeyPressed( event ),
			$focusableItems = this.getFocusableItemsInsideActiveContentContainer(),
			$firstFocusableItem = $focusableItems[ 0 ],
			currentTabTitle = elementorFrontend.elements.window.document.activeElement,
			currentTabTitleIndex = parseInt( currentTabTitle.getAttribute( 'data-tab' ) );

		if ( isOnlyTabPressed && this.tabTitleHasActiveContentContainer( currentTabTitleIndex ) && !! $firstFocusableItem ) {
			event.preventDefault();
			$firstFocusableItem.trigger( 'focus' );
		}
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	itemInsideContentContainerHasFocus( position ) {
		const currentItem = elementorFrontend.elements.window.document.activeElement,
			$focusableItems = this.getFocusableItemsInsideActiveContentContainer(),
			itemIndex = 'last' === position ? $focusableItems.length - 1 : position;

		return $focusableItems[ itemIndex ] === currentItem;
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	getFocusableItemsInsideActiveContentContainer() {
		const settings = this.getSettings();

		return this.$element.find( settings.selectors.activeTabContentContainers ).find( ':focusable' );
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	setTabindexOfActiveContainerItems( tabIndex ) {
		const $focusableItems = this.getFocusableItemsInsideActiveContentContainer();

		$focusableItems.attr( 'tabindex', tabIndex );
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	setActiveCurrentContainerItemsToFocusable() {
		const currentTabTitle = elementorFrontend.elements.window.document.activeElement,
			currentTabTitleIndex = parseInt( currentTabTitle?.getAttribute( 'data-tab' ) );

		if ( this.tabTitleHasActiveContentContainer( currentTabTitleIndex ) ) {
			this.setTabindexOfActiveContainerItems( '0' );
		}
	}

	/* To be updated */
	/* Study */
	/* To be removed? */
	tabTitleHasActiveContentContainer( index ) {
		const $tabTitleElement = this.elements.$tabTitles.filter( this.getTabTitleFilterSelector( index ) ),
			isTabTitleActive = $tabTitleElement[ 0 ]?.classList.contains( `${ this.getActiveClass() }` ),
			$tabTitleContainerElement = this.elements.$tabContents.filter( this.getTabContentFilterSelector( index ) );

		return !! $tabTitleContainerElement && isTabTitleActive ? true : false;
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	setWidgetHeight( tabIndex, trigger ) {
		const settings = this.getSettings(),
			$widget = this.$element,
			activeClass = settings.classes.active,
			activeContentFilter = tabIndex ? this.getTabContentFilterSelector( tabIndex ) : '.' + activeClass,
			$activeContent = this.elements.$tabContents.filter( activeContentFilter ),
			$widgetInner = $widget.find( '.e-n-tabs' );

		// Check widget height without the active content container.
		$widgetInner.css( '--n-tabs-height-calculated', '' );
		$activeContent.css( 'height', '0px' );
		$activeContent.css( 'overflow', 'hidden' );
		const widgetHeightWithoutContent = $widgetInner.height();

		// Check content container height.
		$activeContent.css( 'height', '' );
		$activeContent.css( 'overflow', '' );
		const contentContainerHeight = $activeContent.outerHeight();

		// Set the highest height value.
		const widgetHeight = contentContainerHeight > widgetHeightWithoutContent ? contentContainerHeight : widgetHeightWithoutContent;
		$widgetInner.css( '--n-tabs-height-calculated', widgetHeight + 'px' );
		// $widget.css( '--n-tabs-opacity', 'initial' );

		if ( 'initialisation' === trigger ) {
			setTimeout( () => {
				this.$element.css( '--n-tabs-opacity', 'initial' );
			}, 100 );
		}
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	getControlValue( controlKey ) {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), controlKey, '', currentDevice );
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	getPropsThatTriggerTabTitleWidthChange() {
		return [
			'tabs_direction',
			'tabs_width',
		];
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	onElementChange( propertyName ) {
		const currentDevice = elementorFrontend.getCurrentDeviceMode(),
			responsivePropertyName = 'desktop' === currentDevice
				? propertyName
				: `${ propertyName }_${ currentDevice }`;

		if ( this.getPropsThatTriggerTabTitleWidthChange().includes( responsivePropertyName ) ) {
			// this.setTabTitleWidth();
		}
	}


	/* To be updated */
	/* Study */
	/* To be removed? */
	setTabTitleWidth( trigger ) {
		const horizontalTabDirections = [ '', 'top', 'bottom' ],
			tabsDirection = this.getControlValue( 'tabs_direction' );

		if ( horizontalTabDirections.includes( tabsDirection ) || !! this.getControlValue( 'tabs_width' ) ) {
			this.$element.css( '--n-tabs-title-width-container', '' );
			return;
		}

		const $activeTitle = this.getActiveTabObject().tabTitle;
		let previousWidth = 0;

		this.observedContainer = new ResizeObserver( ( $observedTitle ) => {
			const currentWidth = $observedTitle[ 0 ].borderBoxSize?.[ 0 ].inlineSize;

			if ( !! currentWidth && currentWidth !== previousWidth ) {
				previousWidth = currentWidth;

				if ( 0 !== previousWidth ) {
					this.$element.css( '--n-tabs-title-width-container', `${ currentWidth }px` );

					setTimeout( () => {
						this.setWidgetHeight( null, trigger );
					} );
				}
			}
		} );

		this.observedContainer.observe( $activeTitle[ 0 ] );
	}
}
