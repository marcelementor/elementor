<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$script_templates = [
	'tmpl-elementor-panel-revisions' => '
		<div class="elementor-panel-box">
			<div class="elementor-panel-revisions-buttons">
				<button class="elementor-button e-btn-txt e-revision-discard" disabled>
					' . esc_html__('Discard', 'elementor') . '
				</button>
				<button class="elementor-button e-revision-save" disabled>
					' . esc_html__('Apply', 'elementor') . '
				</button>
			</div>
		</div>

		<div class="elementor-panel-box">
			<div id="elementor-revisions-list" class="elementor-panel-box-content"></div>
		</div>
	',
	'tmpl-elementor-panel-revisions-no-revisions' => '
		<# 
		var no_revisions_1 = "' . esc_html__('Revision history lets you save your previous versions of your work, and restore them any time.', 'elementor') . '",
			no_revisions_2 = "' . esc_html__('Start designing your page and you will be able to see the entire revision history here.', 'elementor') . '",
			revisions_disabled_1 = "' . esc_html__('It looks like the post revision feature is unavailable in your website.', 'elementor') . '",
			revisions_disabled_2 = "' . sprintf(
				/* translators: %1$s Link open tag, %2$s: Link close tag. */
				esc_html__('Learn more about %1$sWordPress revisions%2$s', 'elementor'),
				'<a target="_blank" href="https://go.elementor.com/wordpress-revisions/">',
				'</a>'
			) . '";
		#>
		<img class="elementor-nerd-box-icon" src="' . ELEMENTOR_ASSETS_URL . 'images/information.svg" loading="lazy" alt="' . esc_attr__('Elementor', 'elementor') . '" />
		<div class="elementor-nerd-box-title">' . esc_html__('No Revisions Saved Yet', 'elementor') . '</div>
		<div class="elementor-nerd-box-message">{{{ elementor.config.document.revisions.enabled ? no_revisions_1 : revisions_disabled_1 }}}</div>
		<div class="elementor-nerd-box-message">{{{ elementor.config.document.revisions.enabled ? no_revisions_2 : revisions_disabled_2 }}}</div>
	',
	'tmpl-elementor-panel-revisions-loading' => '
		<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
	',
	'tmpl-elementor-panel-revisions-revision-item' => '
		<button class="elementor-revision-item__wrapper {{ type }}">
			<div class="elementor-revision-item__gravatar">{{{ gravatar }}}</div>
			<div class="elementor-revision-item__details">
				<div class="elementor-revision-date" title="{{{ new Date( timestamp * 1000 ) }}}">{{{ date }}}</div>
				<div class="elementor-revision-meta">
					<span>{{{ typeLabel }}}</span>
					' . esc_html__( 'By', 'elementor' ) . ' {{{ author }}}
					<span>(#{{{ id }}})</span>&nbsp;
				</div>
			</div>
			<div class="elementor-revision-item__tools">
				<i class="elementor-revision-item__tools-spinner eicon-loading eicon-animation-spin" aria-hidden="true"></i>

				<# if ( "current" === type ) { #>
					<i class="elementor-revision-item__tools-current eicon-check" aria-hidden="true"></i>
					<span class="elementor-screen-only">' . esc_html__( 'Published', 'elementor' ) . '</span>
				<# } #>

				<!--
				<# if ( "revision" === type ) { #>
					<i class="eicon-undo" aria-hidden="true"></i>
					<span class="elementor-screen-only">' . esc_html__( 'Restore', 'elementor' ) . '</span>
				<# } #>
				-->
			</div>
		</button>
	',
];

foreach ( $script_templates as $tmpl_id => $tmpl_content ) {
	wp_print_inline_script_tag( $tmpl_content, [
		'id' => $tmpl_id,
		'type' => 'text/template',
	] );
}
