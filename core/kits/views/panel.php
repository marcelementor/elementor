<?php
$script_templates = [
	'tmpl-elementor-kit-panel' => '
		<main id="elementor-kit__panel-content__wrapper" class="elementor-panel-content-wrapper"></main>
	',
	'tmpl-elementor-kit-panel-content' => '
		<div id="elementor-kit-panel-content-controls"></div>
		<#
		const tabConfig = $e.components.get( "panel/global" ).getActiveTabConfig();
		if ( tabConfig.helpUrl ) { #>
			<div id="elementor-panel__editor__help">
				<a id="elementor-panel__editor__help__link" href="{{ tabConfig.helpUrl }}" target="_blank">
					' . esc_html__( 'Need Help', 'elementor' ) . '
					<i class="eicon-help-o"></i>
				</a>
			</div>
		<#
		}
		
		if ( tabConfig.additionalContent ) {
			#> {{{ tabConfig.additionalContent }}} <#
		}
		#>
	',
	'tmpl-elementor-global-style-repeater-row' => '
		<# let removeClass = "remove",
			removeIcon = "eicon-trash-o";

		if ( ! itemActions.remove ) {
			removeClass += "--disabled";
			removeIcon = "eicon-disable-trash-o";
		}
		#>
		<# if ( itemActions.sort ) { #>
			<button class="elementor-repeater-row-tool elementor-repeater-row-tools elementor-repeater-tool-sort">
				<i class="eicon-cursor-move" aria-hidden="true"></i>
				<span class="elementor-screen-only">' . esc_html__( 'Reorder', 'elementor' ) . '</span>
			</button>
		<# } #>
		<button class="elementor-repeater-row-tool elementor-repeater-tool-{{{ removeClass }}}">
			<i class="{{{ removeIcon }}}" aria-hidden="true"></i>
			<# if ( itemActions.remove ) { #>
				<span class="elementor-screen-only">' . esc_html__( 'Remove', 'elementor' ) . '</span>
			<# } #>
		</button>
		<div class="elementor-repeater-row-controls"></div>
	',
];

foreach ( $script_templates as $tmpl_id => $tmpl_content ) {
	wp_print_inline_script_tag( $tmpl_content, [
		'id' => $tmpl_id,
		'type' => 'text/template',
	] );
}
