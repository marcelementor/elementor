<?php
namespace Elementor\Modules\Apps;

use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Pointer {

	const RELEASE_VERSION = '3.15.0';

	const CURRENT_POINTER_SLUG = 'e-apps';

	public static function add_hooks() {
		add_action( 'admin_print_footer_scripts-index.php', [ __CLASS__, 'admin_print_script' ] );
	}

	public static function admin_print_script() {
		if ( static::is_dismissed() || static::is_new_installation() ) {
			return;
		}

		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );

		$pointer_content = '<h3>' . esc_html__( 'New! Popular Add-ons', 'elementor' ) . '</h3>';
		$pointer_content .= '<p>' . esc_html__( 'Discover our collection of plugins and add-ons carefully selected to enhance your Elementor website and unleash your creativity.', 'elementor' ) . '</p>';

		$pointer_content .= sprintf(
			'<p><a class="button button-primary" href="%s">%s</a></p>',
			admin_url( 'admin.php?page=' . Module::PAGE_ID ),
			esc_html__( 'Explore Add-ons', 'elementor' )
		);

		wp_print_inline_script_tag( "
			jQuery( document ).ready( function( $ ) {
				$( '#toplevel_page_elementor' ).pointer( {
					content: '" . $pointer_content . "',
					position: {
						edge: " . ( is_rtl() ? "'right'" : "'left'" ) . ",
						align: 'center'
					},
					close: function() {
						elementorCommon.ajax.addRequest( 'introduction_viewed', {
							data: {
								introductionKey: '" . esc_attr( static::CURRENT_POINTER_SLUG ) . "',
							},
						} );
					}
				} ).pointer( 'open' );
			} );
		");
	}

	private static function is_dismissed() {
		return User::get_introduction_meta( static::CURRENT_POINTER_SLUG );
	}

	private static function is_new_installation() {
		return Upgrade_Manager::install_compare( static::RELEASE_VERSION, '>=' );
	}
}
