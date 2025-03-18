const TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' );
const TemplateLibraryTemplateRemoteView = require( 'elementor-templates/views/template/remote' );
const TemplateLibraryTemplateCloudView = require( 'elementor-templates/views/template/cloud' );

import Select2 from 'elementor-editor-utils/select2.js';

const TemplateLibraryCollectionView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-template-library-templates',

	id: 'elementor-template-library-templates',

	childViewContainer: '#elementor-template-library-templates-container',

	reorderOnSort: true,

	emptyView() {
		var EmptyView = require( 'elementor-templates/views/parts/templates-empty' );

		return new EmptyView();
	},

	ui: {
		textFilter: '#elementor-template-library-filter-text',
		selectFilter: '.elementor-template-library-filter-select',
		myFavoritesFilter: '#elementor-template-library-filter-my-favorites',
		orderInputs: '.elementor-template-library-order-input',
		orderLabels: 'label.elementor-template-library-order-label',
		searchInputIcon: '#elementor-template-library-filter-text-wrapper i',
		loadMoreAnchor: '#elementor-template-library-load-more-anchor',
		selectSourceFilter: '.elementor-template-library-filter-select-source',
		addNewFolder: '#elementor-template-library-add-new-folder',
		selectGridView: '#elementor-template-library-view-grid',
		selectListView: '#elementor-template-library-view-list',
		bulkSelectionItemCheckbox: '.bulk-selection-item-checkbox',
		bulkSelectionActionBar: '.bulk-selection-action-bar',
		bulkSelectedCount: '.bulk-selection-action-bar .selected-count',
		bulkSelectAllCheckbox: '#bulk-select-all',
		clearBulkSelections: '.bulk-selection-action-bar .clear-bulk-selections'
	},

	events: {
		'input @ui.textFilter': 'onTextFilterInput',
		'change @ui.selectFilter': 'onSelectFilterChange',
		'change @ui.myFavoritesFilter': 'onMyFavoritesFilterChange',
		'mousedown @ui.orderLabels': 'onOrderLabelsClick',
		'change @ui.selectSourceFilter': 'onSelectSourceFilterChange',
		'click @ui.addNewFolder': 'onCreateNewFolderClick',
		'click @ui.selectGridView': 'onSelectGridViewClick',
		'click @ui.selectListView': 'onSelectListViewClick',
		'change @ui.bulkSelectionItemCheckbox': 'onSelectBulkSelectionItemCheckbox',
		'change @ui.bulkSelectAllCheckbox': 'onBulkSelectAllCheckbox',
		'click @ui.clearBulkSelections': 'onClearBulkSelections',
	},

	className: 'no-bulk-selections',

	onClearBulkSelections() {
		elementor.templates.clearBulkSelectionItems();
		elementor.templates.layout.handleBulkActionBar();
		elementor.templates.layout.selectAllCheckboxNormal();
		this.deselectAllBulkItems();
	},

	deselectAllBulkItems() {
		if ( 'list' === elementor.templates.getViewSelection() ) {
			this.ui.bulkSelectAllCheckbox.prop( 'checked', false ).trigger( 'change' );
		} else {

			document.querySelectorAll( '.bulk-selected-item' ).forEach( function( item ) {
				item.classList.remove( 'bulk-selected-item' );
			} );
		}
	},

	onSelectBulkSelectionItemCheckbox( event ) {
		if ( event?.target?.checked ) {
			elementor.templates.addBulkSelectionItem( event.target.dataset.template_id );
		} else {
			elementor.templates.removeBulkSelectionItem( event.target.dataset.template_id );
		}
		
		this.handleBulkActionBarUi();
	},

	onBulkSelectAllCheckbox() {
		const isChecked = this.$( '#bulk-select-all:checked' ).length > 0;

		if ( isChecked ) {
			elementor.templates.layout.selectAllCheckboxNormal();
		}

		this.updateBulkSelectedItems( isChecked );
		this.handleBulkActionBarUi();
	},

	updateBulkSelectedItems( isChecked ) {
		document.querySelectorAll( '.bulk-selection-item-checkbox' ).forEach( function( checkbox ) {
			checkbox.checked = isChecked;
			const templateId = checkbox.dataset.template_id;
	
			if ( isChecked ) {
				elementor.templates.addBulkSelectionItem( templateId );
			} else {
				elementor.templates.removeBulkSelectionItem( templateId );
			}
		} );
	},

	handleBulkActionBarUi() {
		if ( 0 === this.$( '.bulk-selection-item-checkbox:checked' ).length ) {
			this.$el.addClass( 'no-bulk-selections' );
			this.$el.removeClass( 'has-bulk-selections' );
		} else {
			this.$el.addClass( 'has-bulk-selections' );
			this.$el.removeClass( 'no-bulk-selections' );
		}

		elementor.templates.layout.handleBulkActionBar();
	},

	comparators: {
		title( model ) {
			return model.get( 'title' ).toLowerCase();
		},
		popularityIndex( model ) {
			var popularityIndex = model.get( 'popularityIndex' );

			if ( ! popularityIndex ) {
				popularityIndex = model.get( 'date' );
			}

			return -popularityIndex;
		},
		trendIndex( model ) {
			var trendIndex = model.get( 'trendIndex' );

			if ( ! trendIndex ) {
				trendIndex = model.get( 'date' );
			}

			return -trendIndex;
		},
	},

	getChildView( childModel ) {
		const sourceMappings = {
			local: TemplateLibraryTemplateLocalView,
			remote: TemplateLibraryTemplateRemoteView,
			cloud: TemplateLibraryTemplateCloudView,
		};

		const activeSource = childModel.get( 'source' ) ? childModel.get( 'source' ) : 'local';

		/**
		 * Filter template source.
		 *
		 * @param bool   isRemote     - If `true` the source is a remote source.
		 * @param string activeSource - The current template source.
		 */
		const isRemote = elementor.hooks.applyFilters( 'templates/source/is-remote', 'remote' === activeSource, activeSource );

		return isRemote
			? TemplateLibraryTemplateRemoteView
			: sourceMappings[ activeSource ] || TemplateLibraryTemplateLocalView;
	},

	initialize() {
		this.listenTo( elementor.channels.templates, 'filter:change', this._renderChildren );
		this.debouncedSearchTemplates = _.debounce( this.searchTemplates, 300 );
	},

	filter( childModel ) {
		const activeSource = elementor.templates.getFilter( 'source' );

		if ( 'cloud' === activeSource ) {
			return true; // Filtering happens on the backend.
		}

		var filterTerms = elementor.templates.getFilterTerms(),
			passingFilter = true;

		jQuery.each( filterTerms, function( filterTermName ) {
			var filterValue = elementor.templates.getFilter( filterTermName );

			if ( ! filterValue ) {
				return;
			}

			if ( this.callback ) {
				var callbackResult = this.callback.call( childModel, filterValue );

				if ( ! callbackResult ) {
					passingFilter = false;
				}

				return callbackResult;
			}

			var filterResult = filterValue === childModel.get( filterTermName );

			if ( ! filterResult ) {
				passingFilter = false;
			}

			return filterResult;
		} );

		return passingFilter;
	},

	order( by, reverseOrder ) {
		var comparator = this.comparators[ by ] || by;

		if ( reverseOrder ) {
			comparator = this.reverseOrder( comparator );
		}

		this.collection.comparator = comparator;

		this.collection.sort();
	},

	reverseOrder( comparator ) {
		if ( 'function' !== typeof comparator ) {
			var comparatorValue = comparator;

			comparator = function( model ) {
				return model.get( comparatorValue );
			};
		}

		return function( left, right ) {
			const l = comparator( left );

			if ( undefined === l ) {
				return -1;
			}

			const r = comparator( right );
			if ( undefined === r ) {
				return 1;
			}

			if ( l < r ) {
				return 1;
			}
			if ( l > r ) {
				return -1;
			}
			return 0;
		};
	},

	addSourceData() {
		var isEmpty = this.children.isEmpty();

		this.$el.attr( 'data-template-source', isEmpty ? 'empty' : elementor.templates.getFilter( 'source' ) );
	},

	addViewData() {
		const view = elementor.templates.getViewSelection();

		this.$el.attr( 'data-template-view', view );
	},

	setFiltersUI() {
		if ( ! this.select2Instance && this.$( this.ui.selectFilter ).length ) {
			const $filters = this.$( this.ui.selectFilter ),
				select2Options = {
					placeholder: __( 'Category', 'elementor' ),
					allowClear: true,
					width: 150,
					dropdownParent: this.$el,
				};

			this.select2Instance = new Select2( {
				$element: $filters,
				options: select2Options,
			} );
		}
	},

	setMasonrySkin() {
		var masonry = new elementorModules.utils.Masonry( {
			container: this.$childViewContainer,
			items: this.$childViewContainer.children(),
		} );

		this.$childViewContainer.imagesLoaded( masonry.run.bind( masonry ) );
	},

	toggleFilterClass() {
		this.$el.toggleClass( 'elementor-templates-filter-active', ! ! ( elementor.templates.getFilter( 'text' ) || elementor.templates.getFilter( 'favorite' ) ) );
	},

	isPageOrLandingPageTemplates() {
		const templatesType = elementor.templates.getFilter( 'type' );

		return 'page' === templatesType || 'lp' === templatesType;
	},

	onDestroy() {
		if ( this.removeScrollListener ) {
			this.removeScrollListener();
		}
	},

	onRender() {
		const activeSource = elementor.templates.getFilter( 'source' );
		const templateType = elementor.templates.getFilter( 'type' );

		if ( 'remote' === activeSource && 'page' !== templateType && 'lb' !== templateType ) {
			this.setFiltersUI();
		}
	},

	onRenderCollection() {
		this.addSourceData();

		this.toggleFilterClass();

		const activeSource = elementor.templates.getFilter( 'source' );

		if ( 'remote' === activeSource && ! this.isPageOrLandingPageTemplates() ) {
			this.setMasonrySkin();
		}

		if ( 'cloud' === activeSource ) {
			this.handleLoadMore();

			this.addViewData();
		}
	},

	onBeforeRenderEmpty() {
		this.addSourceData();
	},

	onTextFilterInput() {
		const activeSource = elementor.templates.getFilter( 'source' );

		if ( 'cloud' === activeSource ) {
			this.debouncedSearchTemplates( activeSource );
			return;
		}

		elementor.templates.setFilter( 'text', this.ui.textFilter.val() );
	},

	async searchTemplates( source ) {
		this.showLoadingSpinner();

		try {
			await elementor.templates.searchTemplates( {
				source,
				search: this.ui.textFilter.val(),
			} );
		} finally {
			this.showSearchIcon();
		}
	},

	showLoadingSpinner() {
		this.ui.searchInputIcon.removeClass( 'eicon-search' ).addClass( 'eicon-loading eicon-animation-spin' );
	},

	showSearchIcon() {
		this.ui.searchInputIcon.removeClass( 'eicon-loading eicon-animation-spin' ).addClass( 'eicon-search' );
	},

	onSelectFilterChange( event ) {
		var $select = jQuery( event.currentTarget ),
			filterName = $select.data( 'elementor-filter' );

		elementor.templates.setFilter( filterName, $select.val() );
	},

	onSelectSourceFilterChange( event ) {
		elementor.templates.onSelectSourceFilterChange( event );
	},

	onSelectGridViewClick() {
		elementor.templates.onSelectViewChange( 'grid' );
	},

	onSelectListViewClick() {
		elementor.templates.onSelectViewChange( 'list' );
	},

	onMyFavoritesFilterChange() {
		elementor.templates.setFilter( 'favorite', this.ui.myFavoritesFilter[ 0 ].checked );
	},

	onOrderLabelsClick( event ) {
		var $clickedInput = jQuery( event.currentTarget.control ),
			toggle;

		if ( ! $clickedInput[ 0 ].checked ) {
			toggle = 'asc' !== $clickedInput.data( 'default-ordering-direction' );
		}

		$clickedInput.toggleClass( 'elementor-template-library-order-reverse', toggle );

		this.order( $clickedInput.val(), $clickedInput.hasClass( 'elementor-template-library-order-reverse' ) );
	},

	handleLoadMore() {
		const scrollableContainer = elementor?.templates?.layout?.modal.getElements( 'message' );

		const listener = () => {
			const scrollTop = scrollableContainer.scrollTop();
			const scrollHeight = scrollableContainer[ 0 ].scrollHeight;
			const clientHeight = scrollableContainer.outerHeight();

			const scrollPercentage = ( scrollTop / ( scrollHeight - clientHeight ) ) * 100;

			const canLoadMore = elementor.templates.canLoadMore() && ! elementor.templates.isLoading();

			if ( scrollPercentage < 90 || ! canLoadMore ) {
				return;
			}

			this.ui.loadMoreAnchor.toggleClass( 'elementor-visibility-hidden' );
			elementor.templates.layout.selectAllCheckboxMinus();

			elementor.templates.loadMore( {
				onUpdate: () => {
					this.ui.loadMoreAnchor.toggleClass( 'elementor-visibility-hidden' );
				},
				search: this.ui.textFilter.val(),
			} );
		};

		scrollableContainer.on( 'scroll', listener );

		this.removeScrollListener = () => scrollableContainer.off( 'scroll', listener );
	},

	onCreateNewFolderClick() {
		const activeSource = elementor.templates.getFilter( 'source' );

		if ( 'cloud' !== activeSource ) {
			return;
		}

		elementor.templates.createFolder( {
			source: activeSource,
		},
		{
			onSuccess: () => {
				$e.routes.refreshContainer( 'library' );
			},
		} );
	},
} );

module.exports = TemplateLibraryCollectionView;
