<?php
namespace Elementor;

use Elementor\Modules\FloatingButtons\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$script_content = "
    <div id=\"elementor-new-floating-elements__description\">
        <div id=\"elementor-new-floating-elements__description__title\">" . sprintf(
            /* translators: %1$s Span open tag, %2$s: Span close tag. */
            esc_html__( 'Floating Elements Help You %1$sWork Efficiently%2$s', 'elementor' ),
            '<span>',
            '</span>'
        ) . "</div>
        <div id=\"elementor-new-floating-elements__description__content\">" . esc_html__( 'Use floating elements to engage your visitors and increase conversions.', 'elementor' ) . "</div>
    </div>
    <form id=\"elementor-new-floating-elements__form\" action=\"" . esc_url( admin_url( '/edit.php' ) ) . "\">
        <input type=\"hidden\" name=\"post_type\" value=\"" . esc_attr( Module::CPT_FLOATING_BUTTONS ) . "\">
        <input type=\"hidden\" name=\"template_type\" value=\"" . esc_attr( Module::FLOATING_BUTTONS_DOCUMENT_TYPE ) . "\">
        <input type=\"hidden\" name=\"action\" value=\"elementor_new_post\">
        <input type=\"hidden\" name=\"_wpnonce\" value=\"" . wp_create_nonce( 'elementor_action_new_post' ) . "\">
        <div id=\"elementor-new-template__form___elementor_source__wrapper\" class=\"elementor-form-field\">
            <label for=\"elementor-new-template__form___elementor_source\" class=\"elementor-form-field__label\">" . esc_html__( 'Choose Floating Element', 'elementor' ) . "</label>
            <div class=\"elementor-form-field__select__wrapper\">
                <select id=\"elementor-new-template__form___elementor_source\" class=\"elementor-form-field__select\" name=\"meta[" . esc_attr( Module::FLOATING_ELEMENTS_TYPE_META_KEY ) . "]\">
                    " . implode("\n", array_map(function($key, $value) {
                        return '<option value="' . esc_attr($key) . '">' . esc_html($value) . '</option>';
                    }, array_keys(Module::get_floating_elements_types()), Module::get_floating_elements_types())) . "
                </select>
            </div>
        </div>
        <div id=\"elementor-new-floating-elements__form__post-title__wrapper\" class=\"elementor-form-field\">
            <label for=\"elementor-new-floating-elements__form__post-title\" class=\"elementor-form-field__label\">" . esc_html__( 'Name your template', 'elementor' ) . "</label>
            <div class=\"elementor-form-field__text__wrapper\">
                <input type=\"text\" placeholder=\"" . esc_attr__( 'Enter template name (optional)', 'elementor' ) . "\" id=\"elementor-new-floating-elements__form__post-title\" class=\"elementor-form-field__text\" name=\"post_data[post_title]\">
            </div>
        </div>
        <button id=\"elementor-new-floating-elements__form__submit\" class=\"elementor-button e-primary\">" . esc_html__( 'Create Floating Element', 'elementor' ) . "</button>
    </form>
";

wp_print_inline_script_tag( $script_content, [
    'type' => 'text/template',
    'id' => 'tmpl-elementor-new-floating-elements',
] );
