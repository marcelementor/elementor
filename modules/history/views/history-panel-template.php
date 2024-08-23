<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$script_templates = [
	'tmpl-elementor-panel-history-page' => '
		 <div id="elementor-panel-elements-navigation" class="elementor-panel-navigation">
			<button class="elementor-component-tab elementor-panel-navigation-tab" data-tab="actions">' .
			esc_html__('Actions', 'elementor') .
			'</button>
			<button class="elementor-component-tab elementor-panel-navigation-tab" data-tab="revisions">' .
			esc_html__('Revisions', 'elementor') .
			'</button>
		</div>
		<div id="elementor-panel-history-content"></div>
	',
	'tmpl-elementor-panel-history-tab' => '
		<div id="elementor-history-list"></div>
		<div class="elementor-history-revisions-message">' .
		esc_html__('Switch to Revisions tab for older versions', 'elementor') .
		'</div>
	',
	'tmpl-elementor-panel-history-no-items' => '
		<img class="elementor-nerd-box-icon" src="' . esc_url(ELEMENTOR_ASSETS_URL . 'images/information.svg') . '" loading="lazy" alt="' . esc_attr__('Elementor', 'elementor') . '" />
		<div class="elementor-nerd-box-title">' . esc_html__('No History Yet', 'elementor') . '</div>
		<div class="elementor-nerd-box-message">' . esc_html__('Once you start working, you\'ll be able to redo / undo any action you make in the editor.', 'elementor') . '</div>
	',
	'tmpl-elementor-panel-history-item' => '
		<div class="elementor-history-item__details">
			<span class="elementor-history-item__title">{{{ title }}}</span>
			<span class="elementor-history-item__subtitle">{{{ subTitle }}}</span>
			<span class="elementor-history-item__action">{{{ action }}}</span>
		</div>
		<div class="elementor-history-item__icon">
			<span class="eicon" aria-hidden="true"></span>
		</div>
	',
];

foreach ( $script_templates as $tmpl_id => $tmpl_content ) {
	wp_print_inline_script_tag( $tmpl_content, [
		'id' => $tmpl_id,
		'type' => 'text/template',
	] );
}
