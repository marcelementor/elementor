import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';

test( 'Accordion', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addWidget( 'accordion' );

	// Assert
	await editor.togglePreviewMode();
	expect.soft( await editor.getPreviewFrame()
		.locator( '.elementor-widget-wrap > .elementor-background-overlay' )
		.screenshot( { type: 'jpeg', quality: 90 } ) )
		.toMatchSnapshot( 'accordion.jpeg' );
} );
