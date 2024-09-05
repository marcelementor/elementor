import Widget from './widget';

const BaseWidgetView = require( 'elementor-elements/views/base-widget' );

const HeadingView = Widget.extend( {
	tagName() {
		return this.model.getSetting( 'header_size' ) ?? 'h2';
	},

	className() {
		var classes = BaseWidgetView.prototype.className.apply( this, arguments );
		
		classes += ' elementor-heading-title';

		return classes;
	},

	renderOnChange( settings ) {
		if ( settings.changed.header_size ) {
			// Because the entire element needs to be re-rendered if the HTML tag is to change.
			// Maybe we can re-render only the specific child?
			this.container.parent._renderChildren();
		}
	},
} );

module.exports = HeadingView;
