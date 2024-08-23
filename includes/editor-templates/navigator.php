<?php
namespace Elementor;

use Elementor\Modules\EditorAppBar\Module as App_Bar_Module;
use Elementor\Utils;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$is_app_bar_active = Plugin::$instance->experiments->is_feature_active( App_Bar_Module::EXPERIMENT_NAME );

$has_pro = Utils::has_pro();
$elements_list_class = '';

if ( ! $has_pro ) {
	$promotion_data = [
		'text' => esc_html__( 'Access all Pro widgets', 'elementor' ),
		'url_label' => esc_html__( 'Upgrade Now', 'elementor' ),
		'url' => 'https://go.elementor.com/go-pro-structure-panel/',
	];

	$promotion_data = Filtered_Promotions_Manager::get_filtered_promotion_data(
		$promotion_data,
		'elementor/navigator/custom_promotion',
		'url'
	);
	$elements_list_class = 'elementor-navigator-list__promotion';
}

$script_templates = [
	'tmpl-elementor-navigator' => '
		<div id="elementor-navigator__header">
			<button id="elementor-navigator__toggle-all" data-elementor-action="expand">
				<i class="eicon-expand" aria-hidden="true"></i>
				<span class="elementor-screen-only">' . esc_html__( 'Expand all elements', 'elementor' ) . '</span>
			</button>
			<button id="elementor-navigator__ai-titles">
				<i class="eicon-ai"></i>
			</button>
			<h2 id="elementor-navigator__header__title">' . (
				$is_app_bar_active
					? esc_html__( 'Structure', 'elementor' )
					: esc_html__( 'Navigator', 'elementor' )
			) . '</h2>
			<button id="elementor-navigator__close">
				<i class="eicon-close" aria-hidden="true"></i>
				<span class="elementor-screen-only">' . (
					$is_app_bar_active
						? esc_html__( 'Close structure', 'elementor' )
						: esc_html__( 'Close navigator', 'elementor' )
				) . '</span>
			</button>
		</div>
		<div id="elementor-navigator__elements" ' . (
			! empty( $elements_list_class )
				? 'class="' . esc_attr( $elements_list_class ) . '"'
				: ''
		) . '>
		</div>
		<div id="elementor-navigator__footer">
			' . (
				! $has_pro && ! empty( $promotion_data )
					? '<div id="elementor-navigator__footer__promotion">
							<div class="elementor-navigator__promotion-text">
								' . esc_attr( $promotion_data['text'] ) . '.
								<a href="' . esc_url( $promotion_data['url'] ) . '" target="_blank" class="e-link-promotion">' . esc_attr( $promotion_data['url_label'] ) . '</a>
							</div>
						</div>'
					: ''
			) . '
			<div id="elementor-navigator__footer__resize-bar">
				<i class="eicon-ellipsis-h" aria-hidden="true"></i>
				<span class="elementor-screen-only">' . (
					$is_app_bar_active
						? esc_html__( 'Resize structure', 'elementor' )
						: esc_html__( 'Resize navigator', 'elementor' )
				) . '</span>
			</div>
		</div>
	',
	'tmpl-elementor-navigator__elements' => '
		<# if ( obj.elType ) { #>
			<div class="elementor-navigator__item" data-locked="{{ obj.isLocked ? \'true\' : \'false\' }}" tabindex="0">
				<div class="elementor-navigator__element__list-toggle">
					<i class="eicon-sort-down" aria-hidden="true"></i>
					<span class="elementor-screen-only">' . esc_html__( 'Show/hide inner elements', 'elementor' ) . '</span>
				</div>
				<# if ( icon ) { #>
					<div class="elementor-navigator__element__element-type">
						<i class="{{{ icon }}}" aria-hidden="true"></i>
					</div>
				<# } #>
				<div class="elementor-navigator__element__title">
					<span class="elementor-navigator__element__title__text">{{{ title }}}</span>
				</div>
				<div class="elementor-navigator__element__toggle">
					<i class="eicon-preview-medium" aria-hidden="true"></i>
					<span class="elementor-screen-only">' . esc_html__( 'Show/hide Element', 'elementor' ) . '</span>
				</div>
				<div class="elementor-navigator__element__indicators"></div>
			</div>
		<# } #>
		<div class="elementor-navigator__elements"></div>
	',
	'tmpl-elementor-navigator__elements--empty' => '
		<div class="elementor-empty-view__title">' . esc_html__( 'Empty', 'elementor' ) . '</div>
	',
	'tmpl-elementor-navigator__root--empty' => '
		<img class="elementor-nerd-box-icon" src="' . esc_url( ELEMENTOR_ASSETS_URL . 'images/information.svg' ) . '" loading="lazy" alt="' . esc_attr__( 'Elementor', 'elementor' ) . '" />
		<div class="elementor-nerd-box-title">' . esc_html__( 'Easy Navigation is Here!', 'elementor' ) . '</div>
		<div class="elementor-nerd-box-message">' . esc_html__( 'Once you fill your page with content, this window will give you an overview display of all the page elements. This way, you can easily move around any section, column, or widget.', 'elementor' ) . '</div>
	',
];

foreach ( $script_templates as $tmpl_id => $tmpl_content ) {
	wp_print_inline_script_tag( $tmpl_content, [
		'id' => $tmpl_id,
		'type' => 'text/template',
	] );
}
