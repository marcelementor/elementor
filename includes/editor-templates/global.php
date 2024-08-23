<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function echo_select_your_structure_title() {
	echo esc_html__( 'Select your structure', 'elementor' );
}

$script_templates = [
	'tmpl-elementor-empty-preview' => '
		<div class="elementor-first-add">
			<div class="elementor-icon eicon-plus"></div>
		</div>
	',
	'tmpl-elementor-add-section' => '
		<# if ( $e.components.get( "document/elements" ).utils.allowAddingWidgets() ) { #>
			<div class="elementor-add-section-inner">
				<div class="elementor-add-section-close elementor-wizard-icon">
					<i class="eicon-close" aria-hidden="true"></i>
					<span class="elementor-screen-only">' . esc_html__( 'Close', 'elementor' ) . '</span>
				</div>
				' . ( Plugin::$instance->experiments->is_feature_active( 'container_grid' ) ? '
				<div class="elementor-add-section-back elementor-wizard-icon">
					<i class="eicon-chevron-left" aria-hidden="true"></i>
					<span class="elementor-screen-only">' . esc_html__( 'Back', 'elementor' ) . '</span>
				</div>
				' : '' ) . '
				<div class="e-view elementor-add-new-section">
					<div class="elementor-add-section-area-button elementor-add-section-button" title="' . esc_attr( ( Plugin::$instance->experiments->is_feature_active( 'container' ) ? esc_html__( 'Add New Container', 'elementor' ) : esc_html__( 'Add New Section', 'elementor' ) ) ) . '">
						<i class="eicon-plus"></i>
					</div>
					<# if ( "loop-item" !== elementor.documents.getCurrent()?.config?.type || elementorCommon.config.experimentalFeatures[ "container" ] ) {
						const additionalClass = "loop-item" === elementor.documents.getCurrent()?.config?.type && elementor.documents.getCurrent()?.config?.settings?.settings?.source?.includes( "taxonomy" )
							? "elementor-edit-hidden"
							: ""; #>
						<div class="{{ additionalClass }} elementor-add-section-area-button elementor-add-template-button" title="' . esc_attr( 'Add Template', 'elementor' ) . '">
							<i class="eicon-folder"></i>
						</div>
					<# } #>
					<div class="elementor-add-section-drag-title">' . esc_html__( 'Drag widget here', 'elementor' ) . '</div>
				</div>
				<div class="e-view e-con-shared-styles e-con-select-type">
					<div class="e-con-select-type__title">' . esc_html__( 'Which layout would you like to use?', 'elementor' ) . '</div>
					<div class="e-con-select-type__icons">
						<div class="e-con-select-type__icons__icon flex-preset-button">
							<svg width="85" height="85" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect width="41.698" height="84.9997" fill="#D5DADE"/>
								<rect x="43.3018" width="41.698" height="41.6498" fill="#D5DADE"/>
								<rect x="43.3018" y="43.3506" width="41.698" height="41.6498" fill="#D5DADE"/>
							</svg>
							<div class="e-con-select-type__icons__icon__subtitle">' . esc_html__( 'Flexbox', 'elementor' ) . '</div>
						</div>
						<div class="e-con-select-type__icons__icon grid-preset-button">
							<svg width="85" height="85" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect x="0.5" y="0.5" width="83.9997" height="84" stroke="#9DA5AE" stroke-dasharray="2 2"/>
								<path d="M42.501 0.484375V84.6259" stroke="#9DA5AE" stroke-dasharray="1 1"/>
								<path d="M84.623 42.501L-0.00038953 42.501" stroke="#9DA5AE" stroke-dasharray="1 1"/>
							</svg>
							<div class="e-con-select-type__icons__icon__subtitle">' . esc_html__( 'Grid', 'elementor' ) . '</div>
						</div>
					</div>
				</div>
				<div class="e-view elementor-select-preset">
					<div class="elementor-select-preset-title">' . echo_select_your_structure_title() . '</div>
					<ul class="elementor-select-preset-list">
						<# const structures = [ 10, 20, 30, 40, 21, 22, 31, 32, 33, 50, 34, 60 ];
						structures.forEach( ( structure ) => {
							const preset = elementor.presetsFactory.getPresetByStructure( structure ); #>
							<li class="elementor-preset elementor-column elementor-col-16" data-structure="{{ structure }}">
								{{{ elementor.presetsFactory.getPresetSVG( preset.preset ).outerHTML }}}
							</li>
						<# } ); #>
					</ul>
				</div>
				<div class="e-view e-con-select-preset">
					<div class="e-con-select-preset__title">' . echo_select_your_structure_title() . '</div>
					<div class="e-con-select-preset__list">
						<# elementor.presetsFactory.getContainerPresets().forEach( ( preset ) => { #>
						<div class="e-con-preset" data-preset="{{ preset }}">
							{{{ elementor.presetsFactory.generateContainerPreset( preset ) }}}
						</div>
						<# } ); #>
					</div>
				</div>
				<div class="e-view e-con-shared-styles e-con-select-preset-grid">
					<div class="e-con-select-preset-grid__title">' . echo_select_your_structure_title() . '</div>
					<div class="e-con-select-preset-grid__list">
						<# elementor.presetsFactory.getContainerGridPresets().forEach( ( preset ) => { #>
						<div class="e-con-choose-grid-preset" data-structure="{{ preset }}">
							{{{ elementor.presetsFactory.generateContainerGridPreset( preset ) }}}
						</div>
						<# } ); #>
					</div>
				</div>
			</div>
		<# } #>
	',
	'tmpl-elementor-empty-preview' => esc_html__( 'This tag has no settings.', 'elementor' ),
];

foreach ( $script_templates as $tmpl_id => $tmpl_content ) {
	wp_print_inline_script_tag( $tmpl_content, [
		'id' => $tmpl_id,
		'type' => 'text/template',
	] );
}
