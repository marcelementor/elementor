<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$script_templates = [
	'tmpl-elementor-templates-modal__header' => '
		<div class="elementor-templates-modal__header__logo-area"></div>
		<div class="elementor-templates-modal__header__menu-area"></div>
		<div class="elementor-templates-modal__header__items-area">
			<# if ( closeType ) { #>
				<div class="elementor-templates-modal__header__close elementor-templates-modal__header__close--{{{ closeType }}} elementor-templates-modal__header__item">
					<# if ( \'skip\' === closeType ) { #>
					<span><?php echo esc_html__( \'Skip\', \'elementor\' ); ?></span>
					<# } #>
					<i class="eicon-close"
					aria-hidden="true"
					title="{{{ $e.components?.get( \'document/elements\' )?.utils?.getTitleForLibraryClose() }}}"></i>
					<span class="elementor-screen-only">{{{ $e.components?.get( \'document/elements\' )?.utils?.getTitleForLibraryClose() }}}</span>
				</div>
			<# } #>
			<div id="elementor-template-library-header-tools"></div>
		</div>
	',
	'tmpl-elementor-templates-modal__header__logo' => '
		<span class="elementor-templates-modal__header__logo__icon-wrapper e-logo-wrapper">
			<i class="eicon-elementor"></i>
		</span>
		<span class="elementor-templates-modal__header__logo__title">{{{ title }}}</span>
	',
];

foreach ( $script_templates as $tmpl_id => $tmpl_content ) {
	wp_print_inline_script_tag( $tmpl_content, [
		'id' => $tmpl_id,
		'type' => 'text/template',
	] );
}

