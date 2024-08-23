<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
$user = wp_get_current_user();

$ajax = Plugin::$instance->common->get_component( 'ajax' );

$beta_tester_email = $user->user_email;

/**
 * Print beta tester dialog.
 *
 * Display a dialog box to suggest the user to opt-in to the beta testers newsletter.
 *
 * Fired by `admin_footer` filter.
 *
 * @since  2.6.0
 * @access public
 */
$form_content = "
        <form id=\"elementor-beta-tester-form\" method=\"post\">
            <input type=\"hidden\" name=\"_nonce\" value=\"" . esc_attr( $ajax->create_nonce() ) . "\" />
            <input type=\"hidden\" name=\"action\" value=\"elementor_beta_tester_signup\" />
            <div id=\"elementor-beta-tester-form__caption\">" . esc_html__( 'Get Beta Updates', 'elementor' ) . "</div>
            <div id=\"elementor-beta-tester-form__description\">" . esc_html__( 'As a beta tester, you’ll receive an update that includes a testing version of Elementor and its content directly to your Email', 'elementor' ) . "</div>
            <div id=\"elementor-beta-tester-form__input-wrapper\">
                <input id=\"elementor-beta-tester-form__email\" name=\"beta_tester_email\" type=\"email\" placeholder=\"" . esc_attr__( 'Your Email', 'elementor' ) . "\" required value=\"" . esc_attr( $beta_tester_email ) . "\" />
                <button id=\"elementor-beta-tester-form__submit\" class=\"elementor-button\">
                    <span class=\"elementor-state-icon\">
                        <i class=\"eicon-loading eicon-animation-spin\" aria-hidden=\"true\"></i>
                    </span>
                    " . esc_html__( 'Sign Up', 'elementor' ) . "
                </button>
            </div>
            <div id=\"elementor-beta-tester-form__terms\">
                " . sprintf(
                    esc_html__( 'By clicking Sign Up, you agree to Elementor\'s %1$s and %2$s', 'elementor' ),
                    sprintf(
                        '<a href="%1$s" target="_blank">%2$s</a>',
                        esc_url( Beta_Testers::NEWSLETTER_TERMS_URL ),
                        esc_html__( 'Terms of Service', 'elementor' )
                    ),
                    sprintf(
                        '<a href="%1$s" target="_blank">%2$s</a>',
                        esc_url( Beta_Testers::NEWSLETTER_PRIVACY_URL ),
                        esc_html__( 'Privacy Policy', 'elementor' )
                    )
                ) . "
            </div>
        </form>
    ";

wp_print_inline_script_tag( $form_content, [
	'type' => 'text/template',
	'id' => 'tmpl-elementor-beta-tester',
] );
