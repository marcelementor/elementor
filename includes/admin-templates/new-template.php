<?php
namespace Elementor;

use Elementor\Core\Base\Document;
use Elementor\TemplateLibrary\Forms\New_Template_Form;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
$new_template_control_form = new New_Template_Form( [ 'id' => 'form' ] );
$document_types = Plugin::$instance->documents->get_document_types();

$types = [];
$lock_configs = [];

$selected = get_query_var( 'elementor_library_type' );

foreach ( $document_types as $document_type ) {
	if ( $document_type::get_property( 'show_in_library' ) ) {
		/**
		 * @var Document $instance
		 */
		$instance = new $document_type();
		$lock_behavior = $document_type::get_lock_behavior_v2();

		$types[ $instance->get_name() ] = $document_type::get_title();
		$lock_configs[ $instance->get_name() ] = empty( $lock_behavior )
			? (object) []
			: $lock_behavior->get_config();
	}
}

/**
 * Create new template library dialog types.
 *
 * Filters the dialog types when printing new template dialog.
 *
 * @since 2.0.0
 *
 * @param array    $types          Types data.
 * @param Document $document_types Document types.
 */
$types = apply_filters( 'elementor/template-library/create_new_dialog_types', $types, $document_types );
ksort( $types );

$script_content = '
    <div id="elementor-new-template__description">
        <div id="elementor-new-template__description__title">' . sprintf(
            /* translators: %1$s Span open tag, %2$s: Span close tag. */
            esc_html__( 'Templates Help You %1$sWork Efficiently%2$s', 'elementor' ),
            '<span>',
            '</span>'
        ) . '</div>
        <div id="elementor-new-template__description__content">' . esc_html__( 'Use templates to create the different pieces of your site, and reuse them with one click whenever needed.', 'elementor' ) . '</div>
    </div>
    <form id="elementor-new-template__form" action="' . esc_url( admin_url( '/edit.php' ) ) . '">
        <input type="hidden" name="post_type" value="elementor_library">
        <input type="hidden" name="action" value="elementor_new_post">
        <input type="hidden" name="_wpnonce" value="' . wp_create_nonce( 'elementor_action_new_post' ) . '">
        <div id="elementor-new-template__form__title">' . esc_html__( 'Choose Template Type', 'elementor' ) . '</div>
        <div id="elementor-new-template__form__template-type__wrapper" class="elementor-form-field">
            <label for="elementor-new-template__form__template-type" class="elementor-form-field__label">' . esc_html__( 'Select the type of template you want to work on', 'elementor' ) . '</label>
            <div class="elementor-form-field__select__wrapper">
                <span id="elementor-new-template__form__template-type-badge" class="e-hidden">
                    <i id="elementor-new-template__form__template-type-badge__icon"></i>
                    <span id="elementor-new-template__form__template-type-badge__text"></span>
                </span>
                <select id="elementor-new-template__form__template-type" class="elementor-form-field__select" name="template_type" required>
                    <option value="">' . esc_html__( 'Select', 'elementor' ) . '...</option>
                    ' . implode("\n", array_map(function($value, $type_title) use ($selected, $lock_configs) {
                        return '<option value="' . esc_attr($value) . '" data-lock=\'' . wp_json_encode($lock_configs[$value] ?? (object) []) . '\' ' . selected($selected, $value, false) . '>' . esc_html($type_title) . '</option>';
                    }, array_keys($types), $types)) . '
                </select>
            </div>
        </div>
        ';

do_action( 'elementor/template-library/create_new_dialog_fields', $new_template_control_form );

$additional_controls = $new_template_control_form->get_controls();
if ( $additional_controls ) {
    wp_add_inline_script( 'elementor-admin', 'const elementor_new_template_form_controls = ' . wp_json_encode( $additional_controls ) . ';' );
    ob_start();
    $new_template_control_form->render();
    $additional_controls_html = ob_get_clean();
    $script_content .= $additional_controls_html;
}

$script_content .= '
        <div id="elementor-new-template__form__post-title__wrapper" class="elementor-form-field">
            <label for="elementor-new-template__form__post-title" class="elementor-form-field__label">
                ' . esc_html__( 'Name your template', 'elementor' ) . '
            </label>
            <div class="elementor-form-field__text__wrapper">
                <input type="text" placeholder="' . esc_attr__( 'Enter template name (optional)', 'elementor' ) . '" id="elementor-new-template__form__post-title" class="elementor-form-field__text" name="post_data[post_title]">
            </div>
        </div>
        <button id="elementor-new-template__form__submit" class="elementor-button e-primary">' . esc_html__( 'Create Template', 'elementor' ) . '</button>
        <a id="elementor-new-template__form__lock_button" class="elementor-button e-accent e-hidden" target="_blank"></a>
    </form>
';

wp_print_inline_script_tag( $script_content, [
    'type' => 'text/template',
    'id' => 'tmpl-elementor-new-template',
] );
