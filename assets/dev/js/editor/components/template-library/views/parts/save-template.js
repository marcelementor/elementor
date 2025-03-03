const TemplateLibraryTemplateModel = require( 'elementor-templates/models/template' );
const TemplateLibraryCollection = require( 'elementor-templates/collections/templates' );
const FolderCollectionView = require('./folders/folders-list')

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
	},

	events: {
		'submit @ui.form': 'onFormSubmit',
		'click @ui.ellipsisIcon': 'onEllipsisIconClick',
		'click @ui.foldersList': 'onFoldersListClick',
		'click @ui.removeFolderSelection': 'onRemoveFolderSelectionClick',
	},

	getSaveType() {
		let type;
		if ( this.model ) {
			type = this.model.get( 'elType' );
		} else if ( elementor.config.document.library && elementor.config.document.library.save_as_same_type ) {
			type = elementor.config.document.type;
		} else {
			type = 'page';
		}

		return type;
	},

	templateHelpers() {
		var saveType = this.getSaveType(),
			templateType = elementor.templates.getTemplateTypes( saveType );

		return templateType.saveDialog;
	},

	onFormSubmit( event ) {
		event.preventDefault();

		var formData = this.ui.form.elementorSerializeObject(),
			saveType = this.getSaveType(),
			JSONParams = { remove: [ 'default' ] };

		formData.content = this.model ? [ this.model.toJSON( JSONParams ) ] : elementor.elements.toJSON( JSONParams );

		this.ui.submitButton.addClass( 'elementor-button-state' );

		if ( this.isCloudOrSiteLibraryCheckboxChecked( formData ) ) {
			this.addSourceSelections( formData );
		}

		elementor.templates.saveTemplate( saveType, formData );
	},

	isCloudOrSiteLibraryCheckboxChecked( formData ) {
		return formData.cloud || formData.local;
	},

	addSourceSelections( formData ) {
		formData.source = [];
	
		if ( formData.cloud ) {
			formData.source.push( 'cloud' );
			delete formData.cloud;
		}
	
		if ( formData.local ) {
			formData.source.push( 'local' );
			delete formData.local;
		}
	},

	onEllipsisIconClick() {	
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
			this.ui.foldersListContainer.html( this.folderCollectionView.render()?.el );
			this.fetchFolders();
		}
	},

	addSpinner() {
		const spinner = new TemplateLibraryTemplateModel( {
			template_id: 0,
			title: '<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>',
		} );

		this.folderCollectionView.collection.add( spinner );
	},

	removeSpinner() {
		const spinner = this.folderCollectionView.collection.findWhere( { template_id: 0 } );

		if ( spinner ) {
			this.folderCollectionView.collection.remove( spinner );
		}
	},

	fetchFolders() {
		const self = this,
			offset = self.folderCollectionView.collection.length - 1;

		elementorCommon.ajax.addRequest( 'get_folders', {
			data: {
				source: 'cloud',
				offset,
			},
			success( response ) {
				self.removeSpinner();

				self.folderCollectionView.collection.add( response?.templates );

				if ( self.shouldaddLoadMoreItemItem( response ) ) {
					self.addLoadMoreItem();
				}
			}
		});
	},

	onFoldersListClick( event ) {
		const { id, value } = event.target.dataset;
		
		if ( this.clickedOnLoadMore( id ) ) {
			this.loadMoreFolders();
			
			return;
		}
		
		this.ui.foldersDropdown.hide();
		this.ui.ellipsisIcon.hide();
		this.ui.selectedFolderText.html( value );
		this.ui.selectedFolder.show();
		this.ui.hiddenInputSelectedFolder.val( id );
	},
	
	clickedOnLoadMore( templateId ) {
		return 0 === +templateId;
	},

	onRemoveFolderSelectionClick() {
		this.ui.selectedFolderText.html( '' );
		this.ui.selectedFolder.hide();
		this.ui.ellipsisIcon.show();
		this.ui.hiddenInputSelectedFolder.val( '' );
	},

	loadMoreFolders() {
		this.removeLoadMoreItem();
		this.addSpinner();
		this.fetchFolders();
	},

	shouldaddLoadMoreItemItem( response ) {
		return this.folderCollectionView.collection.length < response?.total;
	},

	addLoadMoreItem() {
		this.folderCollectionView.collection.add( {
			template_id: 0,
			title: 'Load More',
		} );
	},

	removeLoadMoreItem() {
		const loadMore = this.folderCollectionView.collection.findWhere( { template_id: 0 } );

		if ( loadMore ) {
			this.folderCollectionView.collection.remove( loadMore );
		}
	},
} );

module.exports = TemplateLibrarySaveTemplateView;
