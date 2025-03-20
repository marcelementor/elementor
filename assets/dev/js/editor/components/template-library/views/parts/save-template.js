const TemplateLibraryTemplateModel = require( 'elementor-templates/models/template' );
const TemplateLibraryCollection = require( 'elementor-templates/collections/templates' );
const FolderCollectionView = require( './folders/folders-list' );

const LOAD_MORE_ID = 0;

import { SAVE_CONTEXTS } from './../../constants';

const TemplateLibrarySaveTemplateView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-save-template',

	template: '#tmpl-elementor-template-library-save-template',

	ui: {
		form: '#elementor-template-library-save-template-form',
		submitButton: '#elementor-template-library-save-template-submit',
		ellipsisIcon: '.cloud-library-form-inputs .eicon-ellipsis-h',
		foldersList: '.cloud-folder-selection-dropdown ul',
		foldersDropdown: '.cloud-folder-selection-dropdown',
		foldersListContainer: '.cloud-folder-selection-dropdown-list',
		removeFolderSelection: '.source-selections .selected-folder i',
		selectedFolder: '.selected-folder',
		selectedFolderText: '.selected-folder-text',
		hiddenInputSelectedFolder: '#parentId',
		templateNameInput: '#elementor-template-library-save-template-name',
		localInput: '.source-selections-input.local',
		cloudInput: '.source-selections-input.cloud',
		sourceSelectionCheckboxes: '.source-selections-input input[type="checkbox"]',
	},

	events: {
		'submit @ui.form': 'onFormSubmit',
		'click @ui.ellipsisIcon': 'onEllipsisIconClick',
		'click @ui.foldersList': 'onFoldersListClick',
		'click @ui.removeFolderSelection': 'onRemoveFolderSelectionClick',
		'click @ui.selectedFolderText': 'onSelectedFolderTextClick',
		'change @ui.sourceSelectionCheckboxes': 'onCheckboxChange',
	},

	onRender() {
		const context = this.getOption( 'context' );

		if ( SAVE_CONTEXTS.SAVE === context ) {
			this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
		}

		if ( SAVE_CONTEXTS.MOVE === context ) {
			this.handleMoveContextUiState();
		}

		if ( SAVE_CONTEXTS.BULK_MOVE === context ) {
			this.handleBulkMoveContextUiState();
		}
	},

	handleMoveContextUiState() {
		this.ui.templateNameInput.val( this.model.get( 'title' ) );
		this.handleContextUiStateChecboxes();
	},

	handleBulkMoveContextUiState() {
		this.ui.templateNameInput.remove();
		this.handleContextUiStateChecboxes();
	},

	handleContextUiStateChecboxes() {
		const fromSource = elementor.templates.getFilter( 'source' );

		if ( 'local' === fromSource ) {
			this.$( '.source-selections-input #cloud' ).prop( 'checked', true );
			this.ui.localInput.addClass( 'disabled' );
		}
	},

	getSaveType() {
		let type;

		if ( SAVE_CONTEXTS.MOVE === this.getOption( 'context' ) ) {
			type = this.model.get( 'type' );
		} else if ( this.model ) {
			type = this.model.get( 'elType' );
		} else if ( elementor.config.document.library && elementor.config.document.library.save_as_same_type ) {
			type = elementor.config.document.type;
		} else {
			type = 'page';
		}

		return type;
	},

	templateHelpers() {
		const saveType = this.getSaveType(),
			templateType = elementor.templates.getTemplateTypes( saveType ),
			saveContext = this.getOption( 'context' );

		return templateType[ `${ saveContext }Dialog` ];
	},

	onFormSubmit( event ) {
		event.preventDefault();

		var formData = this.ui.form.elementorSerializeObject(),
			JSONParams = { remove: [ 'default' ] };

		formData.content = this.model ? [ this.model.toJSON( JSONParams ) ] : elementor.elements.toJSON( JSONParams );

		this.updateSourceSelections( formData );

		if ( ! formData?.source && this.templateHelpers()?.canSaveToCloud ) {
			this.showEmptySourceErrorDialog();

			return;
		}

		this.ui.submitButton.addClass( 'elementor-button-state' );

		this.updateSaveContext( formData );

		elementor.templates.saveTemplate( this.getSaveType(), formData );
	},

	updateSourceSelections( formData ) {
		const selectedSources = [ 'cloud', 'local' ].filter( ( type ) => formData[ type ] );

		if ( ! selectedSources.length ) {
			return;
		}

		formData.source = selectedSources;

		[ 'cloud', 'local' ].forEach( ( type ) => delete formData[ type ] );
	},

	showEmptySourceErrorDialog() {
		elementorCommon.dialogsManager.createWidget( 'alert', {
			id: 'elementor-template-library-error-dialog',
			headerMessage: __( 'An error occured.', 'elementor' ),
			message: __( 'Please select at least one location.', 'elementor' ),
		} ).show();
	},

	updateSaveContext( formData ) {
		const saveContext = this.getOption( 'context' ) ?? SAVE_CONTEXTS.SAVE;

		formData.save_context = saveContext;

		if ( [ SAVE_CONTEXTS.MOVE, SAVE_CONTEXTS.BULK_MOVE ].includes( saveContext ) ) {
			formData.from_source = elementor.templates.getFilter( 'source' );
			formData.from_template_id = SAVE_CONTEXTS.MOVE === saveContext
				? this.model.get( 'template_id' )
				: Array.from( elementor.templates.getBulkSelectionItems() );

			this.updateSourceState( formData );
		}
	},

	updateSourceState( formData ) {
		if ( ! formData.source.length ) {
			return;
		}

		const lastSource = formData.source.at( -1 );
		elementor.templates.setSourceSelection( lastSource );
		elementor.templates.setFilter( 'source', lastSource, true );
	},

	onSelectedFolderTextClick() {
		if ( ! this.folderCollectionView ) {
			this.onEllipsisIconClick();

			return;
		}

		if ( ! this.ui.foldersDropdown.is( ':visible' ) ) {
			this.ui.foldersDropdown.show();
		}
	},

	async onEllipsisIconClick() {
		if ( this.ui.foldersDropdown.is( ':visible' ) ) {
			this.ui.foldersDropdown.hide();

			return;
		}

		this.ui.foldersDropdown.show();

		if ( ! this.folderCollectionView ) {
			this.folderCollectionView = new FolderCollectionView( {
				collection: new TemplateLibraryCollection(),
			} );

			this.addSpinner();
			this.renderFolderDropdown();

			try {
				await this.fetchFolders();
			} finally {
				this.removeSpinner();
				this.disableSelectedFolder();
			}
		}
	},

	renderFolderDropdown() {
		this.ui.foldersListContainer.html( this.folderCollectionView.render()?.el );
	},

	addSpinner() {
		const spinner = new TemplateLibraryTemplateModel( {
			template_id: LOAD_MORE_ID,
			title: '<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>',
		} );

		this.folderCollectionView.collection.add( spinner );
	},

	removeSpinner() {
		const spinner = this.folderCollectionView.collection.findWhere( { template_id: LOAD_MORE_ID } );

		if ( spinner ) {
			this.folderCollectionView.collection.remove( spinner );
		}
	},

	fetchFolders() {
		return new Promise( ( resolve ) => {
			const offset = this.folderCollectionView.collection.length - 1;

			const ajaxOptions = {
				data: {
					source: 'cloud',
					offset,
				},
				success: ( response ) => {
					this.folderCollectionView.collection.add( response?.templates );

					if ( this.shouldAddLoadMoreItem( response ) ) {
						this.addLoadMoreItem();
					}

					resolve( response );
				},
				error: ( error ) => {
					elementor.templates.showErrorDialog( error );

					resolve();
				},
			};

			elementorCommon.ajax.addRequest( 'get_folders', ajaxOptions );
		} );
	},

	disableSelectedFolder() {
		if ( ! SAVE_CONTEXTS.MOVE === this.getOption( 'context' ) ) {
			return;
		}

		if ( ! Number.isInteger( this.model.get( 'parentId' ) ) ) {
			return;
		}

		this.$( `.folder-list li[data-id="${ this.model.get( 'parentId' ) }"]` ).addClass( 'disabled' );
	},

	onFoldersListClick( event ) {
		const { id, value } = event.target.dataset;

		if ( ! id || ! value ) {
			return;
		}

		if ( this.clickedOnLoadMore( id ) ) {
			this.loadMoreFolders();

			return;
		}

		this.handleFolderSelected( id, value );
	},

	clickedOnLoadMore( templateId ) {
		return LOAD_MORE_ID === +templateId;
	},

	handleFolderSelected( id, value ) {
		this.highlightSelectedFolder( id );
		this.ui.foldersDropdown.hide();
		this.ui.ellipsisIcon.hide();
		this.ui.selectedFolderText.html( value );
		this.ui.selectedFolder.show();
		this.ui.hiddenInputSelectedFolder.val( id );
	},

	highlightSelectedFolder( id ) {
		this.clearSelectedFolder();
		this.$( `.folder-list li[data-id="${ id }"]` ).addClass( 'selected' );
	},

	clearSelectedFolder() {
		this.$( '.folder-list li.selected' ).removeClass( 'selected' );
	},

	onRemoveFolderSelectionClick() {
		this.clearSelectedFolder();
		this.ui.selectedFolderText.html( '' );
		this.ui.selectedFolder.hide();
		this.ui.ellipsisIcon.show();
		this.ui.hiddenInputSelectedFolder.val( '' );
		this.ui.foldersDropdown.hide();
	},

	async loadMoreFolders() {
		this.removeLoadMoreItem();
		this.addSpinner();

		try {
			await this.fetchFolders();
		} finally {
			this.removeSpinner();
			this.disableSelectedFolder();
		}
	},

	shouldAddLoadMoreItem( response ) {
		return this.folderCollectionView.collection.length < response?.total;
	},

	addLoadMoreItem() {
		this.folderCollectionView.collection.add( {
			template_id: LOAD_MORE_ID,
			title: __( 'Load More', 'elementor' ),
		} );
	},

	removeLoadMoreItem() {
		const loadMore = this.folderCollectionView.collection.findWhere( { template_id: LOAD_MORE_ID } );

		if ( loadMore ) {
			this.folderCollectionView.collection.remove( loadMore );
		}
	},

	onCheckboxChange( event ) {
		if ( SAVE_CONTEXTS.SAVE === this.getOption( 'context' ) || 'cloud' !== elementor.templates.getFilter( 'source' ) ) {
			return;
		}
		
		const selectedCheckbox = event.currentTarget;
		
		this.ui.sourceSelectionCheckboxes.each( ( _, checkbox ) => {
			const wrapper = this.$( checkbox ).closest( '.source-selections-input' );
			
			if ( checkbox !== selectedCheckbox ) {
				if ( selectedCheckbox.checked ) {
					wrapper.addClass( 'disabled' );
					checkbox.checked = false;
				} else {
					wrapper.removeClass( 'disabled' );
				}
			}
		} );
	},
} );

module.exports = TemplateLibrarySaveTemplateView;
