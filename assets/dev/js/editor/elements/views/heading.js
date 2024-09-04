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
} );

module.exports = HeadingView;
